import { NomeIcone } from '@/constants/categorias';

export type LocalCampus = {
  /** Texto gravado em `local.descricao` quando o ponto é escolhido. */
  rotulo: string;
  icone: NomeIcone;
};

/**
 * Pontos do campus mais comuns, oferecidos como atalho no campo "Onde foi?".
 * Ao tocar em um, o texto do local é preenchido e o usuário ainda pode completar (ex.: "Bloco B – sala 204").
 */
export const LOCAIS_CAMPUS: LocalCampus[] = [
  { rotulo: 'Bloco A', icone: 'business-outline' },
  { rotulo: 'Bloco B', icone: 'business-outline' },
  { rotulo: 'Bloco C', icone: 'business-outline' },
  { rotulo: 'Biblioteca', icone: 'library-outline' },
  { rotulo: 'Cantina', icone: 'cafe-outline' },
  { rotulo: 'Laboratórios', icone: 'desktop-outline' },
  { rotulo: 'Auditório', icone: 'mic-outline' },
  { rotulo: 'Secretaria', icone: 'document-text-outline' },
  { rotulo: 'Estacionamento', icone: 'car-outline' },
  { rotulo: 'Área de convivência', icone: 'people-outline' },
];
