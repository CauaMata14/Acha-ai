import { useContext } from 'react';

import { ToastContext } from '@/contexts/ToastContext';

/**
 * Mostra notificações rápidas de sucesso, erro ou informação em qualquer tela.
 *
 * const toast = useToast();
 * toast.sucesso('Item publicado!');
 * toast.erro('Não foi possível salvar.');
 */
export function useToast() {
  const contexto = useContext(ToastContext);
  if (!contexto) {
    throw new Error('useToast precisa ser usado dentro de <ToastProvider>.');
  }
  return contexto;
}
