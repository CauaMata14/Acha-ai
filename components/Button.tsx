import Ionicons from '@expo/vector-icons/Ionicons';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import { NomeIcone } from '@/constants/categorias';
import { cores } from '@/constants/cores';

type Variante = 'primario' | 'secundario' | 'perigo' | 'texto';

type Props = {
  titulo: string;
  onPress: () => void;
  carregando?: boolean;
  desabilitado?: boolean;
  variante?: Variante;
  /** Ícone do @expo/vector-icons (Ionicons) exibido antes do texto. */
  icone?: NomeIcone;
  style?: StyleProp<ViewStyle>;
};

// Cor do texto/ícone e cor de fundo ao pressionar para cada variante
const TEMA: Record<Variante, { texto: string; pressionado: string }> = {
  primario: { texto: cores.fundo, pressionado: cores.primariaEscura },
  secundario: { texto: cores.primaria, pressionado: cores.primariaFundo },
  perigo: { texto: cores.fundo, pressionado: cores.erroEscuro },
  texto: { texto: cores.primaria, pressionado: cores.primariaFundo },
};

export function Button({
  titulo,
  onPress,
  carregando = false,
  desabilitado = false,
  variante = 'primario',
  icone,
  style,
}: Props) {
  const inativo = carregando || desabilitado;
  const tema = TEMA[variante];

  return (
    <Pressable
      onPress={onPress}
      disabled={inativo}
      accessibilityRole="button"
      accessibilityLabel={titulo}
      accessibilityState={{ disabled: inativo, busy: carregando }}
      style={({ pressed }) => [
        styles.botao,
        ESTILO_VARIANTE[variante],
        pressed && !inativo && { backgroundColor: tema.pressionado },
        inativo && styles.inativo,
        style,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={tema.texto} />
      ) : (
        <View style={styles.conteudo}>
          {icone && <Ionicons name={icone} size={20} color={tema.texto} />}
          <Text style={[styles.texto, { color: tema.texto }]}>{titulo}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    minHeight: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  primario: {
    backgroundColor: cores.primaria,
  },
  secundario: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: cores.primaria,
  },
  perigo: {
    backgroundColor: cores.erro,
  },
  semFundo: {
    minHeight: 40,
    backgroundColor: 'transparent',
  },
  inativo: {
    opacity: 0.6,
  },
  conteudo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  texto: {
    fontSize: 16,
    fontWeight: '700',
  },
});

const ESTILO_VARIANTE: Record<Variante, ViewStyle> = {
  primario: styles.primario,
  secundario: styles.secundario,
  perigo: styles.perigo,
  texto: styles.semFundo,
};
