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
  Timestamp,
  Unsubscribe,
} from 'firebase/firestore';

import { db } from './firebase';
import { Categoria, Item } from '@/types/item';

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
