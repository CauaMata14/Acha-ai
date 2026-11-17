import { ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { cores } from '@/constants/cores';

type Props = {
  children: ReactNode;
  /** Se informado, o card vira um botão com efeito ao pressionar. */
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

/** Container branco com borda arredondada e sombra leve, base para os outros cards. */
export function Card({ children, onPress, style, accessibilityLabel }: Props) {
  if (!onPress) {
    return <View style={[styles.card, style]}>{children}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.card, pressed && styles.pressionado, style]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: cores.bordaSuave,
    backgroundColor: cores.fundo,
    // Sombra no iOS
    shadowColor: cores.sombra,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    // Sombra no Android
    elevation: 2,
  },
  pressionado: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
});
