import * as Location from 'expo-location';

/** Coordenadas obtidas pelo GPS. */
export type Coordenadas = {
  latitude: number;
  longitude: number;
  /** Raio de incerteza em metros, quando o aparelho informa. */
  precisao: number | null;
};

/**
 * Resultado de uma tentativa de pegar a localização atual.
 * - `ok`: coordenadas obtidas. `endereco` é um texto curto (rua, bairro) ou null se não deu para traduzir.
 * - `semPermissao`: o usuário negou o acesso. `podePerguntarDeNovo` diz se dá para pedir outra vez
 *   ou se ele precisa liberar nas Configurações do aparelho.
 * - `gpsDesligado`: a localização do aparelho está desativada.
 */
export type ResultadoLocalizacao =
  | { status: 'ok'; coordenadas: Coordenadas; endereco: string | null }
  | { status: 'semPermissao'; podePerguntarDeNovo: boolean }
  | { status: 'gpsDesligado' };

/** Tempo máximo esperando o GPS responder. */
const TEMPO_LIMITE_GPS_MS = 15_000;

/** Posição salva há no máximo 2 minutos pode ser usada enquanto o GPS ainda não respondeu. */
const IDADE_MAXIMA_ULTIMA_POSICAO_MS = 2 * 60 * 1000;

function comTempoLimite<T>(promessa: Promise<T>, ms: number): Promise<T> {
  let temporizador: ReturnType<typeof setTimeout> | undefined;
  const limite = new Promise<never>((_, rejeitar) => {
    temporizador = setTimeout(() => rejeitar(new Error('gps-tempo-esgotado')), ms);
  });
  return Promise.race([promessa, limite]).finally(() => clearTimeout(temporizador));
}

/** Monta um texto curto a partir do endereço do GPS, ex.: "Rua das Flores, 120 – Asa Sul". */
function formatarEndereco(endereco: Location.LocationGeocodedAddress): string | null {
  const rua = [endereco.street, endereco.streetNumber].filter(Boolean).join(', ');
  const partes = [rua || endereco.name, endereco.district ?? endereco.city].filter(
    (parte): parte is string => !!parte
  );
  // Evita repetir quando o nome e o bairro vêm iguais
  const unicas = partes.filter((parte, i) => partes.indexOf(parte) === i);
  return unicas.length > 0 ? unicas.join(' – ') : null;
}

/** Tenta traduzir as coordenadas em endereço. Se falhar (ex.: sem internet), devolve null. */
async function buscarEndereco(latitude: number, longitude: number): Promise<string | null> {
  try {
    const [endereco] = await Location.reverseGeocodeAsync({ latitude, longitude });
    return endereco ? formatarEndereco(endereco) : null;
  } catch {
    return null;
  }
}

async function lerPosicao(): Promise<Location.LocationObject> {
  try {
    return await comTempoLimite(
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      TEMPO_LIMITE_GPS_MS
    );
  } catch (erro) {
    // Em lugares fechados o GPS pode demorar: usa a última posição recente, se houver
    const ultima = await Location.getLastKnownPositionAsync({
      maxAge: IDADE_MAXIMA_ULTIMA_POSICAO_MS,
    });
    if (ultima) return ultima;
    throw erro;
  }
}

/**
 * Pede a permissão de localização, lê a posição atual e tenta traduzi-la em endereço.
 * Lança erro apenas se o GPS não responder ou falhar.
 */
export async function obterLocalizacaoAtual(): Promise<ResultadoLocalizacao> {
  const permissao = await Location.requestForegroundPermissionsAsync();
  if (!permissao.granted) {
    return { status: 'semPermissao', podePerguntarDeNovo: permissao.canAskAgain };
  }

  if (!(await Location.hasServicesEnabledAsync())) {
    return { status: 'gpsDesligado' };
  }

  const posicao = await lerPosicao();
  const { latitude, longitude, accuracy } = posicao.coords;
  const endereco = await buscarEndereco(latitude, longitude);

  return {
    status: 'ok',
    coordenadas: { latitude, longitude, precisao: accuracy ?? null },
    endereco,
  };
}

/** Mensagem amigável para erros ao ler a localização. */
export function mensagemErroLocalizacao(erro: unknown): string {
  if (erro instanceof Error && erro.message === 'gps-tempo-esgotado') {
    return 'O GPS demorou para responder. Vá para um lugar aberto e tente de novo.';
  }
  return 'Não foi possível pegar sua localização. Tente novamente ou escolha um ponto do campus.';
}
