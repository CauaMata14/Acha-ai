import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cores } from '@/constants/cores';

type Props = {
  uri: string;
  visivel: boolean;
  onFechar: () => void;
  /** Texto lido pelo leitor de tela, ex.: título do item. */
  descricao?: string;
};

/** Mostra a foto do item em tela cheia, sem cortes, para ver detalhes que ajudam a reconhecer o objeto. */
export function VisualizadorFoto({ uri, visivel, onFechar, descricao }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visivel}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onFechar}
    >
      <View style={styles.fundo}>
        <Image
          source={{ uri }}
          style={styles.foto}
          resizeMode="contain"
          accessibilityLabel={descricao ? `Foto ampliada: ${descricao}` : 'Foto ampliada do item'}
        />

        <Pressable
          onPress={onFechar}
          style={[styles.fechar, { top: insets.top + 12 }]}
          accessibilityRole="button"
          accessibilityLabel="Fechar foto ampliada"
          hitSlop={12}
        >
          <Ionicons name="close" size={26} color={cores.fundo} />
        </Pressable>

        <Text style={[styles.dica, { bottom: insets.bottom + 20 }]}>Toque no X para fechar</Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  foto: {
    width: '100%',
    height: '80%',
  },
  fechar: {
    position: 'absolute',
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  dica: {
    position: 'absolute',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
