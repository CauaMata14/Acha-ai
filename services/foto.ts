import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

/** De onde a foto vem: câmera do aparelho ou galeria de fotos. */
export type OrigemFoto = 'camera' | 'galeria';

/**
 * Resultado de uma tentativa de escolher foto.
 * - `ok`: a foto foi escolhida e comprimida (`uri` é um data URI pronto para o <Image> e para o Firestore).
 * - `cancelado`: o usuário fechou a câmera/galeria sem escolher.
 * - `semPermissao`: o usuário negou o acesso. `podePerguntarDeNovo` diz se dá para pedir outra vez
 *   ou se ele precisa liberar nas Configurações do aparelho.
 */
export type ResultadoFoto =
  | { status: 'ok'; uri: string }
  | { status: 'cancelado' }
  | { status: 'semPermissao'; podePerguntarDeNovo: boolean };

// A foto é guardada no próprio documento do item no Firestore (limite de 1 MB por documento),
// então ela é reduzida e comprimida antes. Com esses valores fica em torno de 100–200 KB.
const LARGURA_MAXIMA = 1024;
const QUALIDADE_JPEG = 0.5;
const TAMANHO_MAXIMO_BYTES = 700 * 1024;

const OPCOES_PICKER: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [4, 3],
  quality: 1,
};

async function pedirPermissao(origem: OrigemFoto) {
  return origem === 'camera'
    ? ImagePicker.requestCameraPermissionsAsync()
    : ImagePicker.requestMediaLibraryPermissionsAsync();
}

/** Reduz a imagem para no máximo LARGURA_MAXIMA de largura e devolve um data URI JPEG em base64. */
async function comprimir(uri: string, largura: number): Promise<string> {
  const contexto = ImageManipulator.manipulate(uri);
  if (largura > LARGURA_MAXIMA) {
    contexto.resize({ width: LARGURA_MAXIMA });
  }
  const imagem = await contexto.renderAsync();
  const resultado = await imagem.saveAsync({
    compress: QUALIDADE_JPEG,
    format: SaveFormat.JPEG,
    base64: true,
  });

  if (!resultado.base64) {
    throw new Error('Não foi possível processar a foto.');
  }
  // Cada 4 caracteres de base64 equivalem a 3 bytes
  if ((resultado.base64.length * 3) / 4 > TAMANHO_MAXIMO_BYTES) {
    throw new Error('A foto ficou muito grande. Tente outra imagem.');
  }
  return `data:image/jpeg;base64,${resultado.base64}`;
}

/**
 * Pede a permissão necessária, abre a câmera ou a galeria e devolve a foto já comprimida.
 * Lança erro apenas se algo falhar ao abrir ou processar a imagem.
 */
export async function escolherFoto(origem: OrigemFoto): Promise<ResultadoFoto> {
  const permissao = await pedirPermissao(origem);
  if (!permissao.granted) {
    return { status: 'semPermissao', podePerguntarDeNovo: permissao.canAskAgain };
  }

  const resultado =
    origem === 'camera'
      ? await ImagePicker.launchCameraAsync(OPCOES_PICKER)
      : await ImagePicker.launchImageLibraryAsync(OPCOES_PICKER);

  if (resultado.canceled || !resultado.assets?.length) {
    return { status: 'cancelado' };
  }

  const [foto] = resultado.assets;
  return { status: 'ok', uri: await comprimir(foto.uri, foto.width) };
}

/** Mensagem amigável para erros ao abrir a câmera/galeria ou processar a foto. */
export function mensagemErroFoto(erro: unknown): string {
  if (erro instanceof Error && erro.message.startsWith('A foto ficou muito grande')) {
    return erro.message;
  }
  return 'Não foi possível carregar a foto. Tente novamente.';
}
