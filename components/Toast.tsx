import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TEMA_ALERTA, TipoAlerta } from '@/components/Alerta';
import { cores } from '@/constants/cores';

export type DadosToast = {
  id: number;
  tipo: TipoAlerta;
  mensagem: string;
  duracao: number;
};

type Props = {
  toast: DadosToast;
  /** Chamado quando a animação de saída termina. */
  onFim: () => void;
};

const DURACAO_ANIMACAO_MS = 220;

/** Notificação flutuante no topo da tela que some sozinha (toque para fechar antes). */
export function Toast({ toast, onFim }: Props) {
  const insets = useSafeAreaInsets();
  const animacao = useRef(new Animated.Value(0)).current;
  const tema = TEMA_ALERTA[toast.tipo];

  function fechar() {
    Animated.timing(animacao, {
      toValue: 0,
      duration: DURACAO_ANIMACAO_MS,
      useNativeDriver: true,
    }).start(({ finished }) => finished && onFim());
  }

  useEffect(() => {
    Animated.timing(animacao, {
      toValue: 1,
      duration: DURACAO_ANIMACAO_MS,
      useNativeDriver: true,
    }).start();
    const timer = setTimeout(fechar, toast.duracao);
    return () => clearTimeout(timer);
    // O componente é recriado a cada toast novo (key = id), então só roda na montagem
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deslocamento = animacao.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] });

  return (
    <Animated.View
      style={[
        styles.posicao,
        { top: insets.top + 8, opacity: animacao, transform: [{ translateY: deslocamento }] },
      ]}
    >
      <Pressable
        onPress={fechar}
        style={[styles.toast, { borderLeftColor: tema.cor }]}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        accessibilityHint="Toque para fechar"
      >
        <Ionicons name={tema.icone} size={22} color={tema.cor} />
        <Text style={styles.texto}>{toast.mensagem}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  posicao: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 1000,
    elevation: 1000,
    pointerEvents: 'box-none',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderLeftWidth: 5,
    backgroundColor: cores.fundo,
    shadowColor: cores.sombra,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  texto: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: cores.texto,
  },
});
