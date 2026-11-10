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
  /** Texto de ajuda exibido abaixo do campo quando não há erro. */
  dica?: string;
  /** Mostra um * vermelho ao lado do label. */
  obrigatorio?: boolean;
  ref?: Ref<TextInputInstance>;
};

export function Input({
  label,
  erro,
  dica,
  obrigatorio = false,
  style,
  onFocus,
  onBlur,
  ref,
  multiline,
  ...props
}: Props) {
  const [focado, setFocado] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {obrigatorio && <Text style={styles.obrigatorio}> *</Text>}
      </Text>
      <TextInput
        ref={ref}
        placeholderTextColor={cores.textoSuave}
        accessibilityLabel={label}
        accessibilityHint={erro ?? dica}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[
          styles.campo,
          multiline && styles.campoMultilinha,
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
      {erro ? (
        <Text style={styles.erro} accessibilityLiveRegion="polite">
          {erro}
        </Text>
      ) : (
        !!dica && <Text style={styles.dica}>{dica}</Text>
      )}
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
  campoMultilinha: {
    minHeight: 110,
    paddingTop: 12,
  },
  campoFocado: {
    borderColor: cores.primaria,
    backgroundColor: cores.fundo,
  },
  campoErro: {
    borderColor: cores.erro,
  },
  obrigatorio: {
    color: cores.erro,
  },
  erro: {
    marginTop: 4,
    fontSize: 13,
    color: cores.erro,
  },
  dica: {
    marginTop: 4,
    fontSize: 13,
    color: cores.textoSuave,
  },
});
