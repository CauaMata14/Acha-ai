/**
 * Modelo de um item publicado no AchaAí.
 *
 * No Firestore, cada item é um documento da coleção `itens` com os campos abaixo
 * (o `id` é o próprio id do documento). As datas são gravadas como Timestamp.
 *
 *   tipo: 'achado' | 'perdido'
 *   titulo: string
 *   descricao: string
 *   categoria: Categoria (ver constants/categorias.ts)
 *   local: { descricao: string, latitude?: number, longitude?: number }
 *   fotoUrl?: string
 *   dataOcorrencia: Timestamp   → dia em que o objeto foi achado/perdido
 *   criadoEm: Timestamp         → quando a publicação foi feita
 *   status: 'aberto' | 'devolvido'
 *   autor: { uid: string, nome: string, email?: string }
 */

export type TipoItem = 'achado' | 'perdido';

export type StatusItem = 'aberto' | 'devolvido';

export type Categoria =
  | 'documentos'
  | 'eletronicos'
  | 'chaves'
  | 'carteiras'
  | 'garrafas'
  | 'roupas'
  | 'materiais'
  | 'outros';

export type LocalItem = {
  /** Texto do local (ex.: "Bloco B – 2º andar" ou o endereço do GPS). */
  descricao: string;
  latitude?: number | null;
  longitude?: number | null;
};

export type AutorItem = {
  uid: string;
  nome: string;
  email?: string | null;
};

export type Item = {
  id: string;
  tipo: TipoItem;
  titulo: string;
  descricao: string;
  categoria: Categoria;
  local: LocalItem;
  fotoUrl?: string | null;
  dataOcorrencia: Date;
  criadoEm: Date;
  status: StatusItem;
  autor: AutorItem;
};
