import { FirebaseError } from 'firebase/app';
import {
  addDoc,
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
  const dados = snap.data() ?? {};
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
    },
  };
}

/**
 * Escuta um item em tempo real (a tela atualiza sozinha se o item for editado ou marcado como devolvido).
 * Chama `aoMudar(null)` se o item não existir. Retorna a função para parar de escutar.
 */
export function ouvirItem(
  id: string,
  aoMudar: (item: Item | null) => void,
  aoErro: (erro: Error) => void
): Unsubscribe {
  return onSnapshot(
    doc(db, COLECAO_ITENS, id),
    (snap) => aoMudar(snap.exists() ? converterItem(snap) : null),
    aoErro
  );
}

/** Escuta as publicações mais recentes em tempo real. */
export function ouvirUltimosItens(
  quantidade: number,
  aoMudar: (itens: Item[]) => void,
  aoErro: (erro: Error) => void
): Unsubscribe {
  const consulta = query(
    collection(db, COLECAO_ITENS),
    orderBy('criadoEm', 'desc'),
    limit(quantidade)
  );
  return onSnapshot(consulta, (snap) => aoMudar(snap.docs.map(converterItem)), aoErro);
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

/** Grava uma nova publicação na coleção `itens` e devolve o id do documento criado. */
export async function publicarItem(dados: NovoItem, autor: AutorItem): Promise<string> {
  const referencia = await addDoc(collection(db, COLECAO_ITENS), {
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
    },
  });
  return referencia.id;
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
  if (erro instanceof FirebaseError) {
    if (erro.code === 'permission-denied') return 'Você não tem permissão para publicar. Faça login novamente.';
    if (MENSAGENS[erro.code]) return MENSAGENS[erro.code];
  }
  return 'Não foi possível publicar o item. Tente novamente.';
}
