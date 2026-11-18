import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { cores } from '@/constants/cores';

type Props = {
  /** Quantos cartões de esqueleto mostrar. */
  quantidade?: number;
};

/**
 * Cartões cinza pulsando no formato do ItemCard, mostrados enquanto o Feed carrega.
 * Dão a ideia de como a lista vai ficar, em vez de só um spinner no meio da tela.
 */
export function ItemCardEsqueleto({ quantidade = 5 }: Props) {
  const opacidade = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const pulso = Animated.loop(
      Animated.sequence([
        Animated.timing(opacidade, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacidade, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ])
    );
    pulso.start();
    return () => pulso.stop();
  }, [opacidade]);

  return (
    <View
      style={styles.lista}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Carregando publicações"
    >
      {Array.from({ length: quantidade }, (_, i) => (
        <Animated.View key={i} style={[styles.card, { opacity: opacidade }]}>
          <View style={styles.miniatura} />
          <View style={styles.info}>
            <View style={[styles.barra, styles.badge]} />
            <View style={[styles.barra, styles.titulo]} />
            <View style={[styles.barra, styles.linha]} />
            <View style={[styles.barra, styles.linhaCurta]} />
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  lista: {
    padding: 16,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: cores.bordaSuave,
    backgroundColor: cores.fundo,
  },
  miniatura: {
    width: 84,
    height: 84,
    borderRadius: 10,
    backgroundColor: cores.bordaSuave,
  },
  info: {
    flex: 1,
    gap: 8,
  },
  barra: {
    height: 12,
    borderRadius: 6,
    backgroundColor: cores.bordaSuave,
  },
  badge: {
    width: 60,
    height: 16,
    borderRadius: 8,
  },
  titulo: {
    width: '80%',
    height: 14,
  },
  linha: {
    width: '60%',
  },
  linhaCurta: {
    width: '35%',
  },
});
