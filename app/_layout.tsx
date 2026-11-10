import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { cores } from '@/constants/cores';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ToastProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
              name="item/[id]"
              options={{
                headerShown: true,
                title: 'Detalhes do item',
                headerBackTitle: 'Voltar',
                headerTintColor: cores.primaria,
                headerTitleStyle: { color: cores.texto },
                headerShadowVisible: false,
              }}
            />
          </Stack>
        </ToastProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
