import { Linking } from 'react-native';

import { Item } from '@/types/item';

/** Formas de falar com quem publicou o item. */
export type CanalContato = 'whatsapp' | 'email';

/** Canais disponíveis para este item, na ordem em que aparecem na tela. */
export function canaisDeContato(item: Item): CanalContato[] {
  const canais: CanalContato[] = [];
  if (item.autor.telefone) canais.push('whatsapp');
  if (item.autor.email) canais.push('email');
  return canais;
}

/** Mensagem pronta que já abre a conversa explicando de qual publicação se trata. */
function mensagemInicial(item: Item): string {
  const motivo =
    item.tipo === 'achado'
      ? 'Acho que esse objeto é meu e gostaria de combinar a devolução.'
      : 'Acho que encontrei esse objeto e gostaria de combinar a devolução.';
  return `Olá, ${item.autor.nome}! Vi sua publicação "${item.titulo}" no AchaAí. ${motivo}`;
}

/** Link do WhatsApp com a mensagem já escrita (wa.me abre o app ou o WhatsApp Web). */
export function linkWhatsApp(item: Item): string | null {
  if (!item.autor.telefone) return null;
  return `https://wa.me/55${item.autor.telefone}?text=${encodeURIComponent(mensagemInicial(item))}`;
}

/** Link de e-mail com assunto e corpo preenchidos. */
export function linkEmail(item: Item): string | null {
  if (!item.autor.email) return null;
  const assunto = encodeURIComponent(`AchaAí: ${item.titulo}`);
  const corpo = encodeURIComponent(mensagemInicial(item));
  return `mailto:${item.autor.email}?subject=${assunto}&body=${corpo}`;
}

/**
 * Abre o WhatsApp ou o app de e-mail. Lança erro com mensagem amigável se não conseguir
 * (ex.: nenhum app de e-mail instalado).
 */
export async function abrirContato(item: Item, canal: CanalContato): Promise<void> {
  const url = canal === 'whatsapp' ? linkWhatsApp(item) : linkEmail(item);
  if (!url) {
    throw new Error(
      canal === 'whatsapp'
        ? 'Quem publicou não informou um WhatsApp.'
        : 'Quem publicou não informou um e-mail.'
    );
  }
  try {
    await Linking.openURL(url);
  } catch {
    throw new Error(
      canal === 'whatsapp'
        ? 'Não foi possível abrir o WhatsApp.'
        : 'Não foi possível abrir o aplicativo de e-mail. Verifique se há um app de e-mail configurado.'
    );
  }
}
