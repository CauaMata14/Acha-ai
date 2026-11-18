import { infoCategoria } from '@/constants/categorias';
import { Categoria, Item, TipoItem } from '@/types/item';

/** Filtros do Feed. `null` significa "todos". */
export type FiltrosFeed = {
  busca: string;
  tipo: TipoItem | null;
  categoria: Categoria | null;
};

export const FILTROS_VAZIOS: FiltrosFeed = { busca: '', tipo: null, categoria: null };

/** Deixa o texto em minúsculas e sem acentos, para "Eletrônico" achar "eletronico". */
export function normalizarTexto(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

/** Diz se algum filtro está ativo (usado para mostrar o "Limpar filtros"). */
export function temFiltroAtivo(filtros: FiltrosFeed): boolean {
  return !!filtros.busca.trim() || filtros.tipo !== null || filtros.categoria !== null;
}

/** Junta os textos do item onde a busca procura: título, descrição, local e nome da categoria. */
function textoPesquisavel(item: Item): string {
  return normalizarTexto(
    [item.titulo, item.descricao, item.local.descricao, infoCategoria(item.categoria).rotulo].join(' ')
  );
}

/**
 * Aplica a busca por texto e os filtros de tipo e categoria.
 * A busca separa as palavras e exige que todas apareçam no item, em qualquer ordem
 * (ex.: "garrafa azul" acha "Garrafa térmica azul").
 */
export function filtrarItens(itens: Item[], filtros: FiltrosFeed): Item[] {
  const palavras = normalizarTexto(filtros.busca).split(/\s+/).filter(Boolean);

  return itens.filter((item) => {
    if (filtros.tipo && item.tipo !== filtros.tipo) return false;
    if (filtros.categoria && item.categoria !== filtros.categoria) return false;
    if (palavras.length === 0) return true;
    const texto = textoPesquisavel(item);
    return palavras.every((palavra) => texto.includes(palavra));
  });
}
