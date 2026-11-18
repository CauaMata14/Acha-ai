import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { EstadoErro } from '@/components/EstadoErro';
import { EstadoVazio } from '@/components/EstadoVazio';
import { Loading } from '@/components/Loading';
import { MinhaPublicacao } from '@/components/MinhaPublicacao';
import { cores } from '@/constants/cores';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { mensagemErroFirestore, ouvirMeusItens } from '@/services/itens';
import { Item } from '@/types/item';
import { iniciais } from '@/utils/formatacao';

type EstadoLista =
  | { fase: 'carregando' }
  | { fase: 'erro'; mensagem: string }
  | { fase: 'pronto'; itens: Item[] };

// Aba Perfil: dados do usuário, "Minhas publicações" (#16) com editar, remover e
// marcar como devolvido, e o botão de sair.
export default function Perfil() {
  const { usuario, sair } = useAuth();
  const toast = useToast();

  const nome = usuario?.displayName || 'Usuário';

  const [saindo, setSaindo] = useState(false);
  const [lista, setLista] = useState<EstadoLista>({ fase: 'carregando' });
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    if (!usuario) return;
    setLista({ fase: 'carregando' });
    return ouvirMeusItens(
      usuario.uid,
      (itens) => setLista({ fase: 'pronto', itens }),
      (erro) => setLista({ fase: 'erro', mensagem: mensagemErroFirestore(erro) })
    );
  }, [usuario, tentativa]);

  async function sairDaConta() {
    setSaindo(true);
    try {
      await sair();
      toast.info('Você saiu da sua conta.');
      // O layout das abas percebe que não há mais usuário e redireciona para o login.
    } catch {
      toast.erro('Não foi possível sair. Tente novamente.');
      setSaindo(false);
    }
  }

  function handleSair() {
    Alert.alert('Sair da conta?', 'Você vai precisar entrar de novo para publicar ou ver os itens.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: sairDaConta },
    ]);
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <View style={styles.cabecalho}>
        <View style={styles.avatar} accessibilityElementsHidden importantForAccessibility="no">
          <Text style={styles.avatarTexto}>{iniciais(nome)}</Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.nome} numberOfLines={1}>
            {nome}
          </Text>
          <Text style={styles.email} numberOfLines={1}>
            {usuario?.email}
          </Text>
        </View>
      </View>

      <View style={styles.tituloSecao}>
        <Text style={styles.secao}>Minhas publicações</Text>
        {lista.fase === 'pronto' && lista.itens.length > 0 && (
          <Text style={styles.contagem}>{resumoPublicacoes(lista.itens)}</Text>
        )}
      </View>

      {lista.fase === 'carregando' && (
        <Loading mensagem="Carregando suas publicações..." telaCheia={false} />
      )}
      {lista.fase === 'erro' && (
        <EstadoErro mensagem={lista.mensagem} onTentarNovamente={() => setTentativa((n) => n + 1)} />
      )}
      {lista.fase === 'pronto' &&
        (lista.itens.length === 0 ? (
          <EstadoVazio
            icone="albums-outline"
            titulo="Você ainda não publicou nada"
            mensagem="Achou ou perdeu algo no campus? Publique e ele aparece aqui para você editar, remover ou marcar como devolvido."
            acao={{
              titulo: 'Publicar item',
              icone: 'add-circle-outline',
              onPress: () => router.navigate('/publicar'),
            }}
          />
        ) : (
          <View style={styles.lista}>
            {lista.itens.map((item) => (
              <MinhaPublicacao key={item.id} item={item} />
            ))}
          </View>
        ))}

      <View style={styles.acoes}>
        <Button
          titulo="Sair"
          variante="secundario"
          icone="log-out-outline"
          onPress={handleSair}
          carregando={saindo}
        />
      </View>
    </ScrollView>
  );
}

/** Ex.: "3 publicações · 1 devolvida". */
function resumoPublicacoes(itens: Item[]): string {
  const total = itens.length === 1 ? '1 publicação' : `${itens.length} publicações`;
  const devolvidos = itens.filter((item) => item.status === 'devolvido').length;
  if (devolvidos === 0) return total;
  return `${total} · ${devolvidos === 1 ? '1 devolvida' : `${devolvidos} devolvidas`}`;
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    gap: 16,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.primariaFundo,
  },
  avatarTexto: {
    fontSize: 20,
    fontWeight: '800',
    color: cores.primariaEscura,
  },
  nome: {
    fontSize: 19,
    fontWeight: '800',
    color: cores.texto,
  },
  email: {
    fontSize: 14,
    color: cores.textoSuave,
  },
  tituloSecao: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 8,
  },
  secao: {
    fontSize: 16,
    fontWeight: '800',
    color: cores.texto,
  },
  contagem: {
    fontSize: 13,
    color: cores.textoSuave,
  },
  lista: {
    gap: 16,
  },
  acoes: {
    marginTop: 'auto',
  },
});
