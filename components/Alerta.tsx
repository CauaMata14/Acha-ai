import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { NomeIcone } from '@/constants/categorias';
import { cores } from '@/constants/cores';

export type TipoAlerta = 'erro' | 'sucesso' | 'aviso' | 'info';

export const TEMA_ALERTA: Record<TipoAlerta, { cor: string; fundo: string; icone: NomeIcone }> = {
  erro: { cor: cores.erro, fundo: cores.erroFundo, icone: 'alert-circle' },
  sucesso: { cor: cores.sucesso, fundo: cores.sucessoFundo, icone: 'checkmark-circle' },
  aviso: { cor: cores.aviso, fundo: cores.avisoFundo, icone: 'warning' },
  info: { cor: cores.primaria, fundo: cores.primariaFundo, icone: 'information-circle' },
};

type Props = {
  tipo: TipoAlerta;
  mensagem: string;
  /** Se informado, mostra um X para fechar o alerta. */
  onFechar?: () => void;
  style?: StyleProp<ViewStyle>;
};

/** Mensagem fixa dentro da tela (erro do formulário, sucesso do cadastro, aviso etc.). */
export function Alerta({ tipo, mensagem, onFechar, style }: Props) {
  const tema = TEMA_ALERTA[tipo];

  return (
    <View
      style={[styles.alerta, { backgroundColor: tema.fundo, borderColor: tema.cor }, style]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Ionicons name={tema.icone} size={20} color={tema.cor} />
      <Text style={[styles.texto, { color: tema.cor }]}>{mensagem}</Text>
      {onFechar && (
        <Pressable
          onPress={onFechar}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Fechar mensagem"
        >
          <Ionicons name="close" size={18} color={tema.cor} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  alerta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
  },
  texto: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
});
