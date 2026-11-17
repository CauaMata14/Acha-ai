import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect, Tabs } from 'expo-router';

import { Loading } from '@/components/Loading';
import { NomeIcone } from '@/constants/categorias';
import { cores } from '@/constants/cores';
import { useAuth } from '@/hooks/useAuth';

/** Ícone da aba: preenchido quando a aba está ativa, só contorno quando não está. */
function iconeDaAba(ativo: NomeIcone, inativo: NomeIcone) {
  // Usa as mesmas cores de tabBarActiveTintColor/tabBarInactiveTintColor
  return ({ focused, size }: { focused: boolean; size: number }) => (
    <Ionicons
      name={focused ? ativo : inativo}
      size={size}
      color={focused ? cores.primaria : cores.textoSuave}
    />
  );
}

// Fluxo logado: Bottom Tabs com Feed, Publicar e Perfil.
// Se não houver usuário (nunca logou ou acabou de sair), volta para o login.
export default function TabsLayout() {
  const { usuario, carregando } = useAuth();

  if (carregando) {
    return <Loading mensagem="Verificando sua sessão..." />;
  }

  if (!usuario) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: cores.primaria,
        tabBarInactiveTintColor: cores.textoSuave,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarStyle: { borderTopColor: cores.bordaSuave },
        headerTitleStyle: { color: cores.texto },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Feed',
          headerShown: false,
          tabBarIcon: iconeDaAba('home', 'home-outline'),
        }}
      />
      <Tabs.Screen
        name="publicar"
        options={{
          title: 'Publicar',
          headerTitle: 'Publicar item',
          tabBarIcon: iconeDaAba('add-circle', 'add-circle-outline'),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: iconeDaAba('person', 'person-outline'),
        }}
      />
    </Tabs>
  );
}
