import Ionicons from '@expo/vector-icons/Ionicons';
import { ComponentProps } from 'react';

import { Categoria, StatusItem, TipoItem } from '@/types/item';

export type NomeIcone = ComponentProps<typeof Ionicons>['name'];

type InfoCategoria = { valor: Categoria; rotulo: string; icone: NomeIcone };

/** Lista usada no formulário de publicação (#8) e nos filtros (#13). */
export const CATEGORIAS: InfoCategoria[] = [
  { valor: 'documentos', rotulo: 'Documentos', icone: 'card-outline' },
  { valor: 'eletronicos', rotulo: 'Eletrônicos', icone: 'phone-portrait-outline' },
  { valor: 'chaves', rotulo: 'Chaves', icone: 'key-outline' },
  { valor: 'carteiras', rotulo: 'Carteiras e bolsas', icone: 'wallet-outline' },
  { valor: 'garrafas', rotulo: 'Garrafas', icone: 'water-outline' },
  { valor: 'roupas', rotulo: 'Roupas e acessórios', icone: 'shirt-outline' },
  { valor: 'materiais', rotulo: 'Material escolar', icone: 'book-outline' },
  { valor: 'outros', rotulo: 'Outros', icone: 'cube-outline' },
];

export function infoCategoria(categoria: Categoria | string): InfoCategoria {
  return CATEGORIAS.find((c) => c.valor === categoria) ?? CATEGORIAS[CATEGORIAS.length - 1];
}

export const ROTULO_TIPO: Record<TipoItem, string> = {
  achado: 'Achado',
  perdido: 'Perdido',
};

export const ROTULO_STATUS: Record<StatusItem, string> = {
  aberto: 'Em aberto',
  devolvido: 'Devolvido',
};
