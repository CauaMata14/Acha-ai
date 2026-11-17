const MINUTO = 60 * 1000;
const HORA = 60 * MINUTO;
const DIA = 24 * HORA;

function doisDigitos(n: number) {
  return String(n).padStart(2, '0');
}

/** 10/11/2026 */
export function formatarData(data: Date): string {
  return `${doisDigitos(data.getDate())}/${doisDigitos(data.getMonth() + 1)}/${data.getFullYear()}`;
}

/** 10/11/2026 às 14:05 */
export function formatarDataHora(data: Date): string {
  return `${formatarData(data)} às ${doisDigitos(data.getHours())}:${doisDigitos(data.getMinutes())}`;
}

/** "agora", "há 5 min", "há 3 h", "ontem", "há 4 dias" ou a data completa. */
export function formatarDataRelativa(data: Date, agora: Date = new Date()): string {
  const diferenca = agora.getTime() - data.getTime();

  if (diferenca < MINUTO) return 'agora';
  if (diferenca < HORA) return `há ${Math.floor(diferenca / MINUTO)} min`;
  if (diferenca < DIA) return `há ${Math.floor(diferenca / HORA)} h`;
  if (diferenca < 2 * DIA) return 'ontem';
  if (diferenca < 7 * DIA) return `há ${Math.floor(diferenca / DIA)} dias`;
  return formatarData(data);
}

/** "Gustavo Domingos" → "GD" (usado no avatar do autor). */
export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  const primeira = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (primeira + ultima).toUpperCase();
}
