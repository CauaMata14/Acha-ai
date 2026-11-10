import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { cores } from '@/constants/cores';

type Props = {
  titulo: string;
  onPress: () => void;
  carregando?: boolean;
  desabilitado?: boolean;
  variante?: 'primario' | 'secundario';
};

export function Button({
  titulo,
  onPress,
  carregando = false,
  desabilitado = false,
  variante = 'primario',
}: Props) {
  const inativo = carregando || desabilitado;
  const secundario = variante === 'secundario';

  return (
    <Pressable
      onPress={onPress}
      disabled={inativo}
      accessibilityRole="button"
      accessibilityState={{ disabled: inativo, busy: carregando }}
      style={({ pressed }) => [
        styles.botao,
        secundario && styles.botaoSecundario,
        pressed && !inativo && (secundario ? styles.secundarioPressionado : styles.pressionado),
        inativo && styles.inativo,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={secundario ? cores.primaria : cores.fundo} />
      ) : (
        <Text style={[styles.texto, secundario && styles.textoSecundario]}>{titulo}</Text>
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
    backgroundColor: cores.primaria,
  },
  botaoSecundario: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: cores.primaria,
  },
  pressionado: {
    backgroundColor: cores.primariaEscura,
  },
  secundarioPressionado: {
    backgroundColor: cores.fundoCampo,
  },
  inativo: {
    opacity: 0.6,
  },
  texto: {
    fontSize: 16,
    fontWeight: '700',
    color: cores.fundo,
  },
  textoSecundario: {
    color: cores.primaria,
  },
});
