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
