import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { cores } from '@/constants/cores';
import { useAuth } from '@/hooks/useAuth';

// Tela temporária: confirma o login e permite sair.
// Será substituída pelas abas Feed/Publicar/Perfil (#6).
export default function Home() {
  const { usuario, carregando, sair } = useAuth();

  if (carregando) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={cores.primaria} />
      </View>
    );
  }

  if (!usuario) {
    return <Redirect href="/login" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AchaAí</Text>
      <Text style={styles.subtitle}>Olá, {usuario.displayName || usuario.email}!</Text>
      <View style={styles.acoes}>
        <Button titulo="Sair" variante="secundario" onPress={sair} />
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
