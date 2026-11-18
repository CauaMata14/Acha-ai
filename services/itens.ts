import { FirebaseError } from 'firebase/app';
import {
  collection,
  doc,
  DocumentData,
  DocumentSnapshot,
  limit,
  onSnapshot,
  orderBy,
  query,
  QueryDocumentSnapshot,
  serverTimestamp,
  setDoc,
  Timestamp,
  Unsubscribe,
} from 'firebase/firestore';

import { db } from './firebase';
import { AutorItem, Categoria, Item, LocalItem, TipoItem } from '@/types/item';

export const COLECAO_ITENS = 'itens';

/** Aceita Timestamp do Firestore, Date, texto ou número e devolve um Date. */
function paraData(valor: unknown): Date {
  if (valor instanceof Timestamp) return valor.toDate();
  if (valor instanceof Date) return valor;
  if (typeof valor === 'string' || typeof valor === 'number') {
    const data = new Date(valor);
    if (!Number.isNaN(data.getTime())) return data;
  }
  return new Date();
}

/** Converte um documento do Firestore no tipo Item, com valores padrão para campos ausentes. */
export function converterItem(
  snap: DocumentSnapshot<DocumentData> | QueryDocumentSnapshot<DocumentData>
): Item {
  // 'estimate': enquanto o servidor não confirma a gravação, criadoEm vem com a hora local em vez de null
  const dados = snap.data({ serverTimestamps: 'estimate' }) ?? {};
  const local = dados.local ?? {};
  const autor = dados.autor ?? {};

  return {
    id: snap.id,
    tipo: dados.tipo === 'perdido' ? 'perdido' : 'achado',
    titulo: dados.titulo ?? 'Item sem título',
    descricao: dados.descricao ?? '',
    categoria: (dados.categoria ?? 'outros') as Categoria,
    local: {
      descricao: local.descricao ?? '',
      latitude: typeof local.latitude === 'number' ? local.latitude : null,
      longitude: typeof local.longitude === 'number' ? local.longitude : null,
    },
    fotoUrl: dados.fotoUrl ?? null,
    dataOcorrencia: paraData(dados.dataOcorrencia ?? dados.criadoEm),
    criadoEm: paraData(dados.criadoEm),
    status: dados.status === 'devolvido' ? 'devolvido' : 'aberto',
    autor: {
      uid: autor.uid ?? '',
      nome: autor.nome ?? 'Usuário',
      email: autor.email ?? null,
      telefone: typeof autor.telefone === 'string' && autor.telefone ? autor.telefone : null,
    },
  };
}

// includeMetadataChanges: avisa também quando os dados deixam de vir só do cache (a internet voltou)
const OPCOES_ESCUTA = { includeMetadataChanges: true };

/**
 * Escuta um item em tempo real (a tela atualiza sozinha se o item for editado ou marcado como devolvido).
 * Chama `aoMudar(null)` se o item não existir. Retorna a função para parar de escutar.
 *
 * `semConexao` é true quando o Firestore respondeu só com o que tem salvo no aparelho, sem confirmar com o
 * servidor. Nesse caso `null` pode significar "não está no cache" e não "o item não existe".
 */
export function ouvirItem(
  id: string,
  aoMudar: (item: Item | null, semConexao: boolean) => void,
  aoErro: (erro: Error) => void
): Unsubscribe {
  return onSnapshot(
    doc(db, COLECAO_ITENS, id),
    OPCOES_ESCUTA,
    (snap) => aoMudar(snap.exists() ? converterItem(snap) : null, snap.metadata.fromCache),
    aoErro
  );
}

/**
 * Escuta as publicações mais recentes em tempo real.
 * `semConexao` é true quando a lista veio só do cache do aparelho (pode estar desatualizada ou vazia).
 */
export function ouvirUltimosItens(
  quantidade: number,
  aoMudar: (itens: Item[], semConexao: boolean) => void,
  aoErro: (erro: Error) => void
): Unsubscribe {
  const consulta = query(
    collection(db, COLECAO_ITENS),
    orderBy('criadoEm', 'desc'),
    limit(quantidade)
  );
  return onSnapshot(
    consulta,
    OPCOES_ESCUTA,
    (snap) => aoMudar(snap.docs.map((d) => converterItem(d)), snap.metadata.fromCache),
    aoErro
  );
}

export type NovoItem = {
  tipo: TipoItem;
  titulo: string;
  descricao: string;
  categoria: Categoria;
  local: LocalItem;
  dataOcorrencia: Date;
  fotoUrl?: string | null;
};

/** Tempo máximo esperando o servidor confirmar a publicação. */
export const TEMPO_LIMITE_PUBLICAR_MS = 15_000;

/** Erro lançado quando o servidor não confirma a gravação a tempo (ex.: celular sem internet). */
export class ErroTempoEsgotado extends Error {
  constructor() {
    super('tempo-esgotado');
    this.name = 'ErroTempoEsgotado';
  }
}

/**
 * Gera o id de uma nova publicação sem gravar nada.
 * A tela guarda esse id e o reutiliza se o usuário tentar publicar de novo depois de um erro,
 * assim a nova tentativa sobrescreve o mesmo documento em vez de criar um item duplicado.
 */
export function novoIdItem(): string {
  return doc(collection(db, COLECAO_ITENS)).id;
}

/** Rejeita com ErroTempoEsgotado se a promessa não terminar em `ms` milissegundos. */
function comTempoLimite<T>(promessa: Promise<T>, ms: number): Promise<T> {
  let temporizador: ReturnType<typeof setTimeout> | undefined;
  const limite = new Promise<never>((_, rejeitar) => {
    temporizador = setTimeout(() => rejeitar(new ErroTempoEsgotado()), ms);
  });
  return Promise.race([promessa, limite]).finally(() => clearTimeout(temporizador));
}

/**
 * Grava uma publicação na coleção `itens` com o id informado (ver `novoIdItem`) e devolve esse id.
 *
 * Documento gravado: dados do formulário (com textos sem espaços nas pontas), foto (data URI ou null),
 * local (texto + coordenadas opcionais), autor, `status: 'aberto'` e `criadoEm` com a hora do servidor.
 *
 * Sem internet, o Firestore guarda a gravação no aparelho e só a envia quando a conexão volta; por isso a
 * espera é limitada a TEMPO_LIMITE_PUBLICAR_MS e, depois disso, lança ErroTempoEsgotado.
 */
export async function publicarItem(
  id: string,
  dados: NovoItem,
  autor: AutorItem
): Promise<string> {
  const gravacao = setDoc(doc(db, COLECAO_ITENS, id), {
    tipo: dados.tipo,
    titulo: dados.titulo.trim(),
    descricao: dados.descricao.trim(),
    categoria: dados.categoria,
    local: {
      descricao: dados.local.descricao.trim(),
      latitude: dados.local.latitude ?? null,
      longitude: dados.local.longitude ?? null,
    },
    fotoUrl: dados.fotoUrl ?? null,
    dataOcorrencia: Timestamp.fromDate(dados.dataOcorrencia),
    criadoEm: serverTimestamp(),
    status: 'aberto',
    autor: {
      uid: autor.uid,
      nome: autor.nome,
      email: autor.email ?? null,
      telefone: autor.telefone || null,
    },
  });
  await comTempoLimite(gravacao, TEMPO_LIMITE_PUBLICAR_MS);
  return id;
}

const MENSAGENS: Record<string, string> = {
  'permission-denied': 'Você não tem permissão para ver este conteúdo. Faça login novamente.',
  unavailable: 'Sem conexão com o servidor. Verifique sua internet.',
  'deadline-exceeded': 'O servidor demorou para responder. Tente novamente.',
  'not-found': 'Este item não foi encontrado.',
  unauthenticated: 'Sua sessão expirou. Faça login novamente.',
};

/** Converte erros do Firestore em mensagens em português para o usuário. */
export function mensagemErroFirestore(erro: unknown): string {
  if (erro instanceof FirebaseError && MENSAGENS[erro.code]) {
    return MENSAGENS[erro.code];
  }
  return 'Não foi possível carregar as informações. Tente novamente.';
}

/** Mensagem de erro ao gravar (publicar, editar) em português. */
export function mensagemErroAoSalvar(erro: unknown): string {
  if (erro instanceof ErroTempoEsgotado) {
    return 'O servidor não respondeu. Verifique sua internet e toque em Publicar de novo (o item não será duplicado).';
  }
  if (erro instanceof FirebaseError) {
    if (erro.code === 'permission-denied') return 'Você não tem permissão para publicar. Faça login novamente.';
    // Documento acima de 1 MB (na prática, uma foto grande demais)
    if (erro.code === 'invalid-argument' || erro.code === 'resource-exhausted') {
      return 'A publicação ficou grande demais. Tente uma foto menor.';
    }
    if (MENSAGENS[erro.code]) return MENSAGENS[erro.code];
  }
  return 'Não foi possível publicar o item. Tente novamente.';
}
