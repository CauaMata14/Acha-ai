import { Redirect } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Loading } from '@/components/Loading';
import { cores } from '@/constants/cores';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';

// Tela temporária: confirma o login e permite sair.
// Será substituída pelas abas Feed/Publicar/Perfil (#6).
export default function Home() {
  const { usuario, carregando, sair } = useAuth();
  const toast = useToast();

  async function handleSair() {
    try {
      await sair();
      toast.info('Você saiu da sua conta.');
    } catch {
      toast.erro('Não foi possível sair. Tente novamente.');
    }
  }

  if (carregando) {
    return <Loading mensagem="Verificando sua sessão..." />;
  }

  if (!usuario) {
    return <Redirect href="/login" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AchaAí</Text>
      <Text style={styles.subtitle}>Olá, {usuario.displayName || usuario.email}!</Text>
      <View style={styles.acoes}>
        <Button titulo="Sair" variante="secundario" icone="log-out-outline" onPress={handleSair} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: cores.fundo,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: cores.primaria,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: cores.textoSuave,
  },
  acoes: {
    marginTop: 32,
    alignSelf: 'stretch',
  },
});
