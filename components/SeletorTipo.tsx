import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { NomeIcone } from '@/constants/categorias';
import { cores } from '@/constants/cores';
import { TipoItem } from '@/types/item';

type Props = {
  valor: TipoItem | null;
  onChange: (tipo: TipoItem) => void;
  erro?: string | null;
  desabilitado?: boolean;
};

const OPCOES: { valor: TipoItem; rotulo: string; icone: NomeIcone; cor: string; fundo: string }[] = [
  {
    valor: 'achado',
    rotulo: 'Achei um objeto',
    icone: 'hand-left-outline',
    cor: cores.achado,
    fundo: cores.achadoFundo,
  },
  {
    valor: 'perdido',
    rotulo: 'Perdi um objeto',
    icone: 'search-outline',
    cor: cores.perdido,
    fundo: cores.perdidoFundo,
  },
];

/** Alternador "Achei / Perdi" do formulário de publicação. */
export function SeletorTipo({ valor, onChange, erro, desabilitado = false }: Props) {
  return (
    <View style={styles.container}>
      <View
        style={[styles.trilho, !!erro && styles.trilhoErro]}
        accessibilityRole="radiogroup"
        accessibilityLabel="Tipo da publicação"
      >
        {OPCOES.map((opcao) => {
          const selecionado = valor === opcao.valor;
          return (
            <Pressable
              key={opcao.valor}
              onPress={() => onChange(opcao.valor)}
              disabled={desabilitado}
              accessibilityRole="radio"
              accessibilityLabel={opcao.rotulo}
              accessibilityState={{ selected: selecionado, disabled: desabilitado }}
              style={[styles.opcao, selecionado && { backgroundColor: opcao.fundo }]}
            >
              <Ionicons
                name={opcao.icone}
                size={18}
                color={selecionado ? opcao.cor : cores.textoSuave}
              />
              <Text style={[styles.texto, selecionado && { color: opcao.cor }]}>
                {opcao.rotulo}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {!!erro && (
        <Text style={styles.erro} accessibilityLiveRegion="polite">
          {erro}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  trilho: {
    flexDirection: 'row',
    gap: 6,
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: cores.fundoTela,
  },
  trilhoErro: {
    borderColor: cores.erro,
  },
  opcao: {
    flex: 1,
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 9,
  },
  texto: {
    fontSize: 15,
    fontWeight: '700',
    color: cores.textoSuave,
  },
  erro: {
    marginTop: 4,
    fontSize: 13,
    color: cores.erro,
  },
});
