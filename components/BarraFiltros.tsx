import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { CATEGORIAS, NomeIcone } from '@/constants/categorias';
import { cores } from '@/constants/cores';
import { Categoria, TipoItem } from '@/types/item';
import { FiltrosFeed } from '@/utils/filtros';

type Props = {
  filtros: FiltrosFeed;
  onChange: (filtros: FiltrosFeed) => void;
};

const OPCOES_TIPO: { valor: TipoItem | null; rotulo: string; cor: string; fundo: string }[] = [
  { valor: null, rotulo: 'Todos', cor: cores.primaria, fundo: cores.primariaFundo },
  { valor: 'achado', rotulo: 'Achados', cor: cores.achado, fundo: cores.achadoFundo },
  { valor: 'perdido', rotulo: 'Perdidos', cor: cores.perdido, fundo: cores.perdidoFundo },
];

const OPCOES_CATEGORIA: { valor: Categoria | null; rotulo: string; icone: NomeIcone }[] = [
  { valor: null, rotulo: 'Todas', icone: 'apps-outline' },
  ...CATEGORIAS,
];

type ChipProps = {
  rotulo: string;
  ativo: boolean;
  onPress: () => void;
  icone?: NomeIcone;
  cor?: string;
  fundo?: string;
};

function Chip({ rotulo, ativo, onPress, icone, cor = cores.primaria, fundo = cores.primariaFundo }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityLabel={rotulo}
      accessibilityState={{ selected: ativo }}
      style={({ pressed }) => [
        styles.chip,
        ativo && { borderColor: cor, backgroundColor: fundo },
        pressed && !ativo && styles.chipPressionado,
      ]}
    >
      {icone && <Ionicons name={icone} size={16} color={ativo ? cor : cores.textoSuave} />}
      <Text style={[styles.textoChip, ativo && { color: cor, fontWeight: '700' }]}>{rotulo}</Text>
    </Pressable>
  );
}

/** Busca por texto e filtros de tipo (achado/perdido) e categoria do Feed. */
export function BarraFiltros({ filtros, onChange }: Props) {
  const [focado, setFocado] = useState(false);

  return (
    <View style={styles.container}>
      <View style={[styles.busca, focado && styles.buscaFocada]}>
        <Ionicons name="search" size={20} color={cores.textoSuave} />
        <TextInput
          value={filtros.busca}
          onChangeText={(busca) => onChange({ ...filtros, busca })}
          placeholder="Buscar por nome, descrição ou local"
          placeholderTextColor={cores.textoSuave}
          accessibilityLabel="Buscar itens"
          returnKeyType="search"
          autoCorrect={false}
          onFocus={() => setFocado(true)}
          onBlur={() => setFocado(false)}
          style={styles.campoBusca}
        />
        {!!filtros.busca && (
          <Pressable
            onPress={() => onChange({ ...filtros, busca: '' })}
            accessibilityRole="button"
            accessibilityLabel="Limpar busca"
            hitSlop={10}
          >
            <Ionicons name="close-circle" size={20} color={cores.textoSuave} />
          </Pressable>
        )}
      </View>

      <View style={styles.linha} accessibilityRole="radiogroup" accessibilityLabel="Filtrar por tipo">
        {OPCOES_TIPO.map((opcao) => (
          <Chip
            key={opcao.rotulo}
            rotulo={opcao.rotulo}
            ativo={filtros.tipo === opcao.valor}
            onPress={() => onChange({ ...filtros, tipo: opcao.valor })}
            cor={opcao.cor}
            fundo={opcao.fundo}
          />
        ))}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.linha}
        accessibilityLabel="Filtrar por categoria"
      >
        {OPCOES_CATEGORIA.map((opcao) => (
          <Chip
            key={opcao.rotulo}
            rotulo={opcao.rotulo}
            icone={opcao.icone}
            ativo={filtros.categoria === opcao.valor}
            onPress={() => onChange({ ...filtros, categoria: opcao.valor })}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: cores.fundo,
    borderBottomWidth: 1,
    borderBottomColor: cores.bordaSuave,
  },
  busca: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 10,
    backgroundColor: cores.fundoCampo,
  },
  buscaFocada: {
    borderColor: cores.primaria,
  },
  campoBusca: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: cores.texto,
  },
  linha: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 20,
    backgroundColor: cores.fundo,
  },
  chipPressionado: {
    backgroundColor: cores.fundoTela,
  },
  textoChip: {
    fontSize: 14,
    color: cores.texto,
  },
});
