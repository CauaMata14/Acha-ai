import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { NomeIcone } from '@/constants/categorias';
import { cores } from '@/constants/cores';

type Props = {
  texto: string;
  cor?: string;
  corFundo?: string;
  icone?: NomeIcone;
};

/** Etiqueta pequena (ex.: "Achado", "Perdido", "Devolvido", categoria). */
export function Badge({ texto, cor = cores.primaria, corFundo = cores.primariaFundo, icone }: Props) {
  return (
    <View style={[styles.badge, { backgroundColor: corFundo }]}>
      {icone && <Ionicons name={icone} size={12} color={cor} />}
      <Text style={[styles.texto, { color: cor }]} numberOfLines={1}>
        {texto}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  texto: {
    fontSize: 12,
    fontWeight: '700',
  },
});
