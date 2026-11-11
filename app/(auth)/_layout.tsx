import { Stack } from 'expo-router';

import { cores } from '@/constants/cores';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: cores.primaria,
        headerTitleStyle: { color: cores.texto },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: cores.fundo },
      }}
    >
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="cadastro" options={{ title: 'Criar conta', headerBackTitle: 'Voltar' }} />
    </Stack>
  );
}
