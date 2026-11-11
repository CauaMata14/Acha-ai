import { onAuthStateChanged, User } from 'firebase/auth';
import { createContext, ReactNode, useEffect, useReducer, useState } from 'react';

import * as authService from '@/services/auth';
import { auth } from '@/services/firebase';

type AuthContextValue = {
  /** Usuário logado, ou null se ninguém estiver logado. */
  usuario: User | null;
  /** true enquanto o Firebase ainda verifica se existe uma sessão salva no aparelho. */
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  cadastrar: (nome: string, email: string, senha: string) => Promise<void>;
  sair: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [carregando, setCarregando] = useState(true);
  // O updateProfile altera o mesmo objeto User, então o React não perceberia o nome novo.
  // Este contador força uma nova renderização depois do cadastro.
  const [, forcarAtualizacao] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    const cancelar = onAuthStateChanged(auth, (novoUsuario) => {
      setUsuario(novoUsuario);
      setCarregando(false);
    });
    return cancelar;
  }, []);

  async function entrar(email: string, senha: string) {
    await authService.entrar(email, senha);
  }

  async function cadastrar(nome: string, email: string, senha: string) {
    await authService.cadastrar(nome, email, senha);
    forcarAtualizacao();
  }

  async function sair() {
    await authService.sair();
  }

  return (
    <AuthContext value={{ usuario, carregando, entrar, cadastrar, sair }}>
      {children}
    </AuthContext>
  );
}
