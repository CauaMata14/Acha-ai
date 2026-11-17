import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { cores } from '@/constants/cores';

type Props = {
  /** Texto abaixo do indicador (ex.: "Carregando itens..."). */
  mensagem?: string;
  /** true ocupa a tela inteira (padrão); false mostra só um bloco no meio do conteúdo. */
  telaCheia?: boolean;
};

export function Loading({ mensagem, telaCheia = true }: Props) {
  return (
    <View
      style={[styles.container, telaCheia && styles.telaCheia]}
      accessibilityRole="progressbar"
      accessibilityLabel={mensagem ?? 'Carregando'}
    >
      <ActivityIndicator size="large" color={cores.primaria} />
      {!!mensagem && <Text style={styles.mensagem}>{mensagem}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  telaCheia: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  mensagem: {
    fontSize: 15,
    color: cores.textoSuave,
    textAlign: 'center',
  },
});
