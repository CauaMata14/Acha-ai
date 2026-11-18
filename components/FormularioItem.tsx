import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useRef, useState } from 'react';
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
import { CampoLocal, Coordenadas } from '@/components/CampoLocal';
import { Input } from '@/components/Input';
import { SeletorCategoria } from '@/components/SeletorCategoria';
import { SeletorFoto } from '@/components/SeletorFoto';
import { SeletorTipo } from '@/components/SeletorTipo';
import { NomeIcone } from '@/constants/categorias';
import { cores } from '@/constants/cores';
import { Categoria, TipoItem } from '@/types/item';
import { formatarTelefone } from '@/utils/formatacao';
import {
  DESCRICAO_MAXIMA,
  DIAS_MAXIMOS_OCORRENCIA,
  LOCAL_MAXIMO,
  TITULO_MAXIMO,
  validarItem,
} from '@/utils/validacao';

/** Onde o app guarda, só neste aparelho, o último WhatsApp informado (#15). */
const CHAVE_TELEFONE = 'achaai:telefoneContato';

/** Valores do formulário já validados, entregues para quem vai gravar (publicar ou editar). */
export type ValoresItem = {
  tipo: TipoItem;
  titulo: string;
  categoria: Categoria;
  descricao: string;
  local: string;
  coordenadas: Coordenadas | null;
  dataOcorrencia: Date;
  foto: string | null;
  /** Só os dígitos do WhatsApp, ou '' se ficou em branco. */
  telefone: string;
};

type Props = {
  /** Valores para começar o formulário (na edição, os dados atuais do item). */
  valoresIniciais?: Partial<ValoresItem>;
  intro: string;
  textoBotao: string;
  iconeBotao: NomeIcone;
  /** Mensagem mostrada enquanto grava (ex.: "Publicando seu item..."). */
  textoEnviando: string;
  /** Verbo usado no aviso de erros (ex.: "publicar" → "Corrija o campo destacado para publicar."). */
  verbo: string;
  /** Grava os dados. Se lançar erro, a mensagem de `mensagemErro` aparece no topo do formulário. */
  onEnviar: (valores: ValoresItem) => Promise<void>;
  mensagemErro: (erro: unknown) => string;
  onCancelar: () => void;
  /** Limpa os campos depois de gravar e ao cancelar (usado no Publicar). */
  limparAoTerminar?: boolean;
  /** Preenche o WhatsApp com o último número usado neste aparelho, se o campo começar vazio. */
  lembrarTelefone?: boolean;
};

/**
 * Formulário de um item achado/perdido, usado na aba Publicar (#8) e na tela de editar (#16).
 * Os erros só aparecem depois da primeira tentativa de enviar e somem conforme o usuário corrige.
 */
export function FormularioItem({
  valoresIniciais,
  intro,
  textoBotao,
  iconeBotao,
  textoEnviando,
  verbo,
  onEnviar,
  mensagemErro,
  onCancelar,
  limparAoTerminar = false,
  lembrarTelefone = false,
}: Props) {
  const inicial = valoresIniciais ?? {};

  const [tipo, setTipo] = useState<TipoItem | null>(inicial.tipo ?? null);
  const [titulo, setTitulo] = useState(inicial.titulo ?? '');
  const [categoria, setCategoria] = useState<Categoria | null>(inicial.categoria ?? null);
  const [descricao, setDescricao] = useState(inicial.descricao ?? '');
  const [local, setLocal] = useState(inicial.local ?? '');
  const [coordenadas, setCoordenadas] = useState<Coordenadas | null>(inicial.coordenadas ?? null);
  const [dataOcorrencia, setDataOcorrencia] = useState<Date | null>(
    () => inicial.dataOcorrencia ?? new Date()
  );
  const [foto, setFoto] = useState<string | null>(inicial.foto ?? null);
  const [telefone, setTelefone] = useState(formatarTelefone(inicial.telefone ?? ''));
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

  useEffect(() => {
    if (!lembrarTelefone) return;
    AsyncStorage.getItem(CHAVE_TELEFONE)
      .then((salvo) => {
        if (salvo) setTelefone((atual) => atual || formatarTelefone(salvo));
      })
      .catch(() => {});
  }, [lembrarTelefone]);

  const todosErros = validarItem({
    tipo,
    titulo,
    categoria,
    descricao,
    local,
    dataOcorrencia,
    telefone,
  });
  const erros = tentouEnviar ? todosErros : {};
  const quantidadeErros = Object.keys(erros).length;

  function limparFormulario() {
    setTipo(null);
    setTitulo('');
    setCategoria(null);
    setDescricao('');
    setLocal('');
    setCoordenadas(null);
    setDataOcorrencia(new Date());
    setFoto(null);
    setTentouEnviar(false);
    setErroGeral(null);
  }

  async function handleEnviar() {
    if (enviando) return;
    setTentouEnviar(true);
    setErroGeral(null);

    if (Object.keys(todosErros).length > 0 || !tipo || !categoria || !dataOcorrencia) {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    setEnviando(true);
    const digitosTelefone = telefone.replace(/\D/g, '');
    try {
      await onEnviar({
        tipo,
        titulo,
        categoria,
        descricao,
        local,
        coordenadas,
        dataOcorrencia,
        foto,
        telefone: digitosTelefone,
      });
      if (lembrarTelefone) {
        // Lembra o número para a próxima publicação (ou esquece, se o campo ficou vazio)
        (digitosTelefone
          ? AsyncStorage.setItem(CHAVE_TELEFONE, digitosTelefone)
          : AsyncStorage.removeItem(CHAVE_TELEFONE)
        ).catch(() => {});
      }
      if (limparAoTerminar) limparFormulario();
    } catch (erro) {
      setErroGeral(mensagemErro(erro));
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } finally {
      setEnviando(false);
    }
  }

  function handleCancelar() {
    if (limparAoTerminar) limparFormulario();
    onCancelar();
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
        <Text style={styles.intro}>{intro}</Text>

        {erroGeral && (
          <Alerta tipo="erro" mensagem={erroGeral} onFechar={() => setErroGeral(null)} />
        )}
        {!erroGeral && quantidadeErros > 0 && (
          <Alerta
            tipo="erro"
            mensagem={
              quantidadeErros === 1
                ? `Corrija o campo destacado para ${verbo}.`
                : `Corrija os ${quantidadeErros} campos destacados para ${verbo}.`
            }
          />
        )}

        <SeletorTipo valor={tipo} onChange={setTipo} erro={erros.tipo} desabilitado={enviando} />

        <SeletorFoto
          label="Foto do item"
          valor={foto}
          onChange={setFoto}
          dica="Fotografe o objeto ou escolha uma imagem da galeria."
          desabilitado={enviando}
        />

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

        <CampoLocal
          ref={localRef}
          label="Onde foi?"
          obrigatorio
          valor={local}
          onChangeValor={setLocal}
          coordenadas={coordenadas}
          onChangeCoordenadas={setCoordenadas}
          erro={erros.local}
          maxLength={LOCAL_MAXIMO}
          desabilitado={enviando}
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

        <Input
          label="WhatsApp para contato (opcional)"
          placeholder="(61) 99999-0000"
          value={telefone}
          onChangeText={(texto) => setTelefone(formatarTelefone(texto))}
          erro={erros.telefone}
          dica="Aparece para quem estiver logado no AchaAí. Sem ele, o contato é só pelo seu e-mail."
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          maxLength={15}
          editable={!enviando}
        />

        <Text style={styles.legenda}>
          <Text style={styles.asterisco}>*</Text> Campos obrigatórios
        </Text>

        {enviando && <Alerta tipo="info" mensagem={textoEnviando} style={styles.enviando} />}

        <View style={styles.acoes}>
          <Button
            titulo={textoBotao}
            icone={iconeBotao}
            onPress={handleEnviar}
            carregando={enviando}
          />
          <Button
            titulo="Cancelar"
            variante="secundario"
            onPress={handleCancelar}
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
  enviando: {
    marginBottom: 12,
  },
  acoes: {
    gap: 12,
  },
});
