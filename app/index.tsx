import { Redirect } from 'expo-router';

import { Loading } from '@/components/Loading';
import { useAuth } from '@/hooks/useAuth';

// Rota inicial: decide para onde o usuário vai conforme o estado de login.
// Logado → abas (Feed). Não logado → login. Enquanto o Firebase verifica a sessão salva → carregando.
export default function Index() {
  const { usuario, carregando } = useAuth();

  if (carregando) {
    return <Loading mensagem="Verificando sua sessão..." />;
  }

  return <Redirect href={usuario ? '/feed' : '/login'} />;
}
