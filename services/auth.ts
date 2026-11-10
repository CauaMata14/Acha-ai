import { FirebaseError } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';

import { auth } from './firebase';

export async function entrar(email: string, senha: string) {
  const credencial = await signInWithEmailAndPassword(auth, email.trim(), senha);
  return credencial.user;
}

export async function cadastrar(nome: string, email: string, senha: string) {
  const credencial = await createUserWithEmailAndPassword(auth, email.trim(), senha);
  await updateProfile(credencial.user, { displayName: nome.trim() });
  return credencial.user;
}

export function sair() {
  return signOut(auth);
}

const MENSAGENS: Record<string, string> = {
  'auth/invalid-email': 'E-mail inválido.',
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/user-not-found': 'E-mail ou senha incorretos.',
  'auth/wrong-password': 'E-mail ou senha incorretos.',
  'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
  'auth/weak-password': 'Senha fraca. Use pelo menos 6 caracteres.',
  'auth/user-disabled': 'Esta conta foi desativada.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde um pouco e tente novamente.',
  'auth/network-request-failed': 'Sem conexão com a internet. Verifique sua rede.',
};

/** Converte erros do Firebase Auth em mensagens em português para o usuário. */
export function mensagemDeErro(erro: unknown): string {
  if (erro instanceof FirebaseError && MENSAGENS[erro.code]) {
    return MENSAGENS[erro.code];
  }
  return 'Algo deu errado. Tente novamente.';
}
