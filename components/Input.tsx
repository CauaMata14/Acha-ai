import { Ref, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputInstance,
  TextInputProps,
  View,
} from 'react-native';

import { cores } from '@/constants/cores';

type Props = TextInputProps & {
  label: string;
  erro?: string | null;
  ref?: Ref<TextInputInstance>;
};

export function Input({ label, erro, style, onFocus, onBlur, ref, ...props }: Props) {
  const [focado, setFocado] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        ref={ref}
        placeholderTextColor={cores.textoSuave}
        accessibilityLabel={label}
        style={[
          styles.campo,
          focado && styles.campoFocado,
          !!erro && styles.campoErro,
          style,
        ]}
        onFocus={(e) => {
          setFocado(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocado(false);
          onBlur?.(e);
        }}
        {...props}
      />
      {!!erro && <Text style={styles.erro}>{erro}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
    fontSize: 14,
    fontWeight: '600',
    color: cores.texto,
  },
  campo: {
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: cores.texto,
    backgroundColor: cores.fundoCampo,
  },
  campoFocado: {
    borderColor: cores.primaria,
    backgroundColor: cores.fundo,
  },
  campoErro: {
    borderColor: cores.erro,
  },
  erro: {
    marginTop: 4,
    fontSize: 13,
    color: cores.erro,
  },
});
