export const SENHA_MINIMA = 6;

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validarNome(nome: string): string | null {
  const limpo = nome.trim();
  if (!limpo) return 'Informe seu nome.';
  if (limpo.length < 2) return 'O nome deve ter pelo menos 2 letras.';
  return null;
}

export function validarEmail(email: string): string | null {
  const limpo = email.trim();
  if (!limpo) return 'Informe seu e-mail.';
  if (!REGEX_EMAIL.test(limpo)) return 'Digite um e-mail válido (ex.: nome@iesb.edu.br).';
  return null;
}

export function validarSenha(senha: string): string | null {
  if (!senha) return 'Informe sua senha.';
  if (senha.length < SENHA_MINIMA) return `A senha deve ter pelo menos ${SENHA_MINIMA} caracteres.`;
  return null;
}

export function validarConfirmacao(senha: string, confirmacao: string): string | null {
  if (!confirmacao) return 'Confirme sua senha.';
  if (senha !== confirmacao) return 'As senhas não coincidem.';
  return null;
}

// ---------- Publicação de item (#8) ----------

export const TITULO_MINIMO = 3;
export const TITULO_MAXIMO = 60;
export const DESCRICAO_MINIMA = 10;
export const DESCRICAO_MAXIMA = 500;
export const LOCAL_MAXIMO = 80;
/** Não aceita publicações de objetos achados/perdidos há mais de 1 ano. */
export const DIAS_MAXIMOS_OCORRENCIA = 365;

export function validarTitulo(titulo: string): string | null {
  const limpo = titulo.trim();
  if (!limpo) return 'Informe o título.';
  if (limpo.length < TITULO_MINIMO) return `O título deve ter pelo menos ${TITULO_MINIMO} letras.`;
  if (limpo.length > TITULO_MAXIMO) return `O título pode ter no máximo ${TITULO_MAXIMO} caracteres.`;
  return null;
}

export function validarTipo(tipo: string | null): string | null {
  if (tipo !== 'achado' && tipo !== 'perdido') return 'Diga se você achou ou perdeu o objeto.';
  return null;
}

export function validarCategoria(categoria: string | null): string | null {
  if (!categoria) return 'Escolha uma categoria.';
  return null;
}

export function validarDescricao(descricao: string): string | null {
  const limpo = descricao.trim();
  if (!limpo) return 'Descreva o objeto.';
  if (limpo.length < DESCRICAO_MINIMA)
    return `Escreva pelo menos ${DESCRICAO_MINIMA} caracteres para ajudar a reconhecer o objeto.`;
  if (limpo.length > DESCRICAO_MAXIMA)
    return `A descrição pode ter no máximo ${DESCRICAO_MAXIMA} caracteres.`;
  return null;
}

export function validarLocal(local: string): string | null {
  const limpo = local.trim();
  if (!limpo) return 'Informe onde foi.';
  if (limpo.length > LOCAL_MAXIMO) return `O local pode ter no máximo ${LOCAL_MAXIMO} caracteres.`;
  return null;
}

export function validarDataOcorrencia(data: Date | null, agora: Date = new Date()): string | null {
  if (!data || Number.isNaN(data.getTime())) return 'Informe a data.';

  const fimDeHoje = new Date(agora);
  fimDeHoje.setHours(23, 59, 59, 999);
  if (data.getTime() > fimDeHoje.getTime()) return 'A data não pode ser no futuro.';

  const limite = new Date(agora);
  limite.setHours(0, 0, 0, 0);
  limite.setDate(limite.getDate() - DIAS_MAXIMOS_OCORRENCIA);
  if (data.getTime() < limite.getTime()) return 'A data deve ser de no máximo 1 ano atrás.';

  return null;
}

export type DadosFormularioItem = {
  tipo: string | null;
  titulo: string;
  categoria: string | null;
  descricao: string;
  local: string;
  dataOcorrencia: Date | null;
};

export type ErrosFormularioItem = Partial<Record<keyof DadosFormularioItem, string>>;

/** Valida todos os campos do formulário de publicação e devolve só os que têm erro. */
export function validarItem(dados: DadosFormularioItem): ErrosFormularioItem {
  const erros: ErrosFormularioItem = {};
  const tipo = validarTipo(dados.tipo);
  const titulo = validarTitulo(dados.titulo);
  const categoria = validarCategoria(dados.categoria);
  const descricao = validarDescricao(dados.descricao);
  const local = validarLocal(dados.local);
  const dataOcorrencia = validarDataOcorrencia(dados.dataOcorrencia);

  if (tipo) erros.tipo = tipo;
  if (titulo) erros.titulo = titulo;
  if (categoria) erros.categoria = categoria;
  if (descricao) erros.descricao = descricao;
  if (local) erros.local = local;
  if (dataOcorrencia) erros.dataOcorrencia = dataOcorrencia;
  return erros;
}
