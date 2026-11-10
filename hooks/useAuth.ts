import { useContext } from 'react';

import { AuthContext } from '@/contexts/AuthContext';

/** Acessa o usuário logado e as ações de login, cadastro e logout em qualquer tela. */
export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth precisa ser usado dentro de <AuthProvider>.');
  }
  return contexto;
}
