import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { EstadoErro } from '@/components/EstadoErro';
import { EstadoVazio } from '@/components/EstadoVazio';
import { FormularioItem, ValoresItem } from '@/components/FormularioItem';
import { Loading } from '@/components/Loading';
import { cores } from '@/constants/cores';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { editarItem, mensagemErroAoAlterar, mensagemErroFirestore, ouvirItem } from '@/services/itens';
import { Item } from '@/types/item';

type Estado =
  | { fase: 'carregando' }
  | { fase: 'erro'; mensagem: string }
  | { fase: 'pronto'; item: Item | null };

/** Tela "Editar publicação" (#16): o mesmo formulário do Publicar, já preenchido com o item. */
export default function EditarItem() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { usuario } = useAuth();
  const toast = useToast();

  const [estado, setEstado] = useState<Estado>({ fase: 'carregando' });
  const [tentativa, setTentativa] = useState(0);

  // Lê o item uma vez para preencher o formulário. Não fica escutando, senão uma atualização
  // vinda do servidor apagaria o que o usuário está digitando.
  useEffect(() => {
    if (!id) {
      setEstado({ fase: 'pronto', item: null });
      return;
    }
    setEstado({ fase: 'carregando' });
    // O Firestore sempre chama o callback depois, então `cancelar` já existe quando ele roda
    const cancelar = ouvirItem(
      id,
      (item, semConexao) => {
        // Sem o item no cache e sem conexão: espera a resposta do servidor
        if (!item && semConexao) return;
        setEstado({ fase: 'pronto', item });
        cancelar();
      },
      (erro) => setEstado({ fase: 'erro', mensagem: mensagemErroFirestore(erro) })
    );
    return cancelar;
  }, [id, tentativa]);

  if (estado.fase === 'carregando') {
    return <Loading mensagem="Carregando publicação..." />;
  }

  if (estado.fase === 'erro') {
    return (
      <View style={styles.tela}>
        <EstadoErro mensagem={estado.mensagem} onTentarNovamente={() => setTentativa((n) => n + 1)} />
      </View>
    );
  }

  const { item } = estado;

  if (!item) {
    return (
      <View style={styles.tela}>
        <EstadoVazio
          icone="help-circle-outline"
          titulo="Item não encontrado"
          mensagem="Esta publicação pode ter sido removida."
          acao={{ titulo: 'Voltar', icone: 'arrow-back', onPress: () => router.back() }}
        />
      </View>
    );
  }

  if (!usuario || usuario.uid !== item.autor.uid) {
    return (
      <View style={styles.tela}>
        <EstadoVazio
          icone="lock-closed-outline"
          corIcone={cores.aviso}
          titulo="Você não pode editar este item"
          mensagem="Só quem publicou pode editar a publicação."
          acao={{ titulo: 'Voltar', icone: 'arrow-back', onPress: () => router.back() }}
        />
      </View>
    );
  }

  const itemAtual = item;

  async function salvar(valores: ValoresItem) {
    await editarItem(
      itemAtual.id,
      {
        tipo: valores.tipo,
        titulo: valores.titulo,
        categoria: valores.categoria,
        descricao: valores.descricao,
        local: {
          descricao: valores.local,
          latitude: valores.coordenadas?.latitude ?? null,
          longitude: valores.coordenadas?.longitude ?? null,
        },
        dataOcorrencia: valores.dataOcorrencia,
        fotoUrl: valores.foto,
      },
      valores.telefone || null
    );
    toast.sucesso('Publicação atualizada!');
    router.back();
  }

  const temCoordenadas = itemAtual.local.latitude != null && itemAtual.local.longitude != null;

  return (
    <FormularioItem
      valoresIniciais={{
        tipo: itemAtual.tipo,
        titulo: itemAtual.titulo,
        categoria: itemAtual.categoria,
        descricao: itemAtual.descricao,
        local: itemAtual.local.descricao,
        coordenadas: temCoordenadas
          ? { latitude: itemAtual.local.latitude!, longitude: itemAtual.local.longitude!, precisao: null }
          : null,
        dataOcorrencia: itemAtual.dataOcorrencia,
        foto: itemAtual.fotoUrl ?? null,
        telefone: itemAtual.autor.telefone ?? '',
      }}
      intro="Corrija o que precisar e toque em Salvar."
      textoBotao="Salvar alterações"
      iconeBotao="checkmark-outline"
      textoEnviando="Salvando as alterações..."
      verbo="salvar"
      onEnviar={salvar}
      mensagemErro={mensagemErroAoAlterar}
      onCancelar={() => router.back()}
    />
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
});
