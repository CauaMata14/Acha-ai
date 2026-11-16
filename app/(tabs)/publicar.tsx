import { Redirect, router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ScrollViewInstance,
  StyleSheet,
  Text,
  TextInputInstance,
  View,
} from 'react-native';

import { Alerta } from '@/components/Alerta';
import { Button } from '@/components/Button';
import { CampoData } from '@/components/CampoData';
import { Input } from '@/components/Input';
import { SeletorCategoria } from '@/components/SeletorCategoria';
import { SeletorTipo } from '@/components/SeletorTipo';
import { cores } from '@/constants/cores';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { mensagemErroAoSalvar, publicarItem } from '@/services/itens';
import { Categoria, TipoItem } from '@/types/item';
import {
  DESCRICAO_MAXIMA,
  DIAS_MAXIMOS_OCORRENCIA,
  LOCAL_MAXIMO,
  TITULO_MAXIMO,
  validarItem,
} from '@/utils/validacao';

// Aba "Publicar" (#8). Formulário de publicação de item.
// Foto (câmera/galeria) e localização por GPS entram nas próximas issues.
export default function Publicar() {
  const { usuario } = useAuth();
  const toast = useToast();

  const [tipo, setTipo] = useState<TipoItem | null>(null);
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [descricao, setDescricao] = useState('');
  const [local, setLocal] = useState('');
  const [dataOcorrencia, setDataOcorrencia] = useState<Date | null>(() => new Date());
  const [tentouEnviar, setTentouEnviar] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const scrollRef = useRef<ScrollViewInstance>(null);
  const descricaoRef = useRef<TextInputInstance>(null);
  const localRef = useRef<TextInputInstance>(null);

  const hoje = useMemo(() => new Date(), []);
  const dataMinima = useMemo(() => {
    const d = new Date(hoje);
    d.setDate(d.getDate() - DIAS_MAXIMOS_OCORRENCIA);
    return d;
  }, [hoje]);

  // Os erros só aparecem depois da primeira tentativa de publicar e somem conforme o usuário corrige
  const todosErros = validarItem({ tipo, titulo, categoria, descricao, local, dataOcorrencia });
  const erros = tentouEnviar ? todosErros : {};
  const quantidadeErros = Object.keys(erros).length;

  if (!usuario) {
    return <Redirect href="/login" />;
  }

  function limparFormulario() {
    setTipo(null);
    setTitulo('');
    setCategoria(null);
    setDescricao('');
    setLocal('');
    setDataOcorrencia(new Date());
    setTentouEnviar(false);
    setErroGeral(null);
  }

  async function handlePublicar() {
    setTentouEnviar(true);
    setErroGeral(null);

    if (Object.keys(todosErros).length > 0 || !tipo || !categoria || !dataOcorrencia || !usuario) {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    setEnviando(true);
    try {
      const id = await publicarItem(
        {
          tipo,
          titulo,
          categoria,
          descricao,
          local: { descricao: local },
          dataOcorrencia,
        },
        {
          uid: usuario.uid,
          nome: usuario.displayName || usuario.email || 'Usuário',
          email: usuario.email,
        }
      );
      toast.sucesso('Item publicado com sucesso!');
      limparFormulario();
      // push (e não replace): o "voltar" dos detalhes retorna para as abas
      router.push({ pathname: '/item/[id]', params: { id } });
    } catch (erro) {
      setErroGeral(mensagemErroAoSalvar(erro));
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.intro}>Achou ou perdeu algo? Conte pra comunidade.</Text>

        {erroGeral && (
          <Alerta tipo="erro" mensagem={erroGeral} onFechar={() => setErroGeral(null)} />
        )}
        {!erroGeral && quantidadeErros > 0 && (
          <Alerta
            tipo="erro"
            mensagem={
              quantidadeErros === 1
                ? 'Corrija o campo destacado para publicar.'
                : `Corrija os ${quantidadeErros} campos destacados para publicar.`
            }
          />
        )}

        <SeletorTipo valor={tipo} onChange={setTipo} erro={erros.tipo} desabilitado={enviando} />

        <Input
          label="Título"
          obrigatorio
          placeholder="Ex.: Garrafa térmica azul"
          value={titulo}
          onChangeText={setTitulo}
          erro={erros.titulo}
          dica={`${titulo.trim().length}/${TITULO_MAXIMO} caracteres`}
          maxLength={TITULO_MAXIMO}
          autoCapitalize="sentences"
          returnKeyType="next"
          onSubmitEditing={() => descricaoRef.current?.focus()}
          editable={!enviando}
        />

        <SeletorCategoria
          label="Categoria"
          obrigatorio
          valor={categoria}
          onChange={setCategoria}
          erro={erros.categoria}
          desabilitado={enviando}
        />

        <Input
          ref={descricaoRef}
          label="Descrição"
          obrigatorio
          placeholder="Detalhes que ajudem o dono a reconhecer (cor, marca, adesivos...)"
          value={descricao}
          onChangeText={setDescricao}
          erro={erros.descricao}
          dica={`${descricao.trim().length}/${DESCRICAO_MAXIMA} caracteres`}
          maxLength={DESCRICAO_MAXIMA}
          multiline
          autoCapitalize="sentences"
          editable={!enviando}
        />

        <Input
          ref={localRef}
          label="Onde foi?"
          obrigatorio
          placeholder="Ex.: Biblioteca – 2º andar"
          value={local}
          onChangeText={setLocal}
          erro={erros.local}
          maxLength={LOCAL_MAXIMO}
          autoCapitalize="sentences"
          returnKeyType="done"
          editable={!enviando}
        />

        <CampoData
          label={tipo === 'perdido' ? 'Quando você perdeu?' : 'Quando você achou?'}
          obrigatorio
          valor={dataOcorrencia}
          onChange={setDataOcorrencia}
          erro={erros.dataOcorrencia}
          dica="Toque para escolher a data no calendário."
          dataMinima={dataMinima}
          dataMaxima={hoje}
          desabilitado={enviando}
        />

        <Text style={styles.legenda}>
          <Text style={styles.asterisco}>*</Text> Campos obrigatórios
        </Text>

        <View style={styles.acoes}>
          <Button
            titulo="Publicar"
            icone="paper-plane-outline"
            onPress={handlePublicar}
            carregando={enviando}
          />
          <Button
            titulo="Cancelar"
            variante="secundario"
            onPress={() => {
              limparFormulario();
              router.navigate('/feed');
            }}
            desabilitado={enviando}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  container: {
    flexGrow: 1,
    padding: 24,
  },
  intro: {
    marginBottom: 20,
    fontSize: 15,
    color: cores.textoSuave,
  },
  legenda: {
    marginBottom: 16,
    fontSize: 13,
    color: cores.textoSuave,
  },
  asterisco: {
    color: cores.erro,
  },
  acoes: {
    gap: 12,
  },
});
