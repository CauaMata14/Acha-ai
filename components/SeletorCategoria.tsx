import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CATEGORIAS, infoCategoria } from '@/constants/categorias';
import { cores } from '@/constants/cores';
import { Categoria } from '@/types/item';

type Props = {
  label: string;
  valor: Categoria | null;
  onChange: (categoria: Categoria) => void;
  erro?: string | null;
  obrigatorio?: boolean;
  desabilitado?: boolean;
};

/** Campo que abre uma lista com as categorias de objetos (constants/categorias.ts). */
export function SeletorCategoria({
  label,
  valor,
  onChange,
  erro,
  obrigatorio = false,
  desabilitado = false,
}: Props) {
  const [aberto, setAberto] = useState(false);
  const selecionada = valor ? infoCategoria(valor) : null;

  function escolher(categoria: Categoria) {
    onChange(categoria);
    setAberto(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {obrigatorio && <Text style={styles.obrigatorio}> *</Text>}
      </Text>

      <Pressable
        onPress={() => setAberto(true)}
        disabled={desabilitado}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selecionada?.rotulo ?? 'nenhuma selecionada'}`}
        accessibilityHint={erro ?? 'Abre a lista de categorias'}
        accessibilityState={{ disabled: desabilitado, expanded: aberto }}
        style={[styles.campo, !!erro && styles.campoErro, desabilitado && styles.inativo]}
      >
        {selecionada && <Ionicons name={selecionada.icone} size={20} color={cores.primaria} />}
        <Text style={[styles.valor, !selecionada && styles.placeholder]} numberOfLines={1}>
          {selecionada?.rotulo ?? 'Selecione uma categoria'}
        </Text>
        <Ionicons name="chevron-down" size={20} color={cores.textoSuave} />
      </Pressable>

      {!!erro && (
        <Text style={styles.erro} accessibilityLiveRegion="polite">
          {erro}
        </Text>
      )}

      <Modal
        visible={aberto}
        transparent
        animationType="slide"
        onRequestClose={() => setAberto(false)}
      >
        <Pressable
          style={styles.fundoModal}
          onPress={() => setAberto(false)}
          accessibilityLabel="Fechar lista de categorias"
        />
        <SafeAreaView style={styles.folha} edges={['bottom']}>
          <View style={styles.cabecalhoFolha}>
            <Text style={styles.tituloFolha}>Escolha a categoria</Text>
            <Pressable
              onPress={() => setAberto(false)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Fechar"
            >
              <Ionicons name="close" size={24} color={cores.textoSuave} />
            </Pressable>
          </View>
          <FlatList
            data={CATEGORIAS}
            keyExtractor={(c) => c.valor}
            renderItem={({ item }) => {
              const ativa = item.valor === valor;
              return (
                <Pressable
                  onPress={() => escolher(item.valor)}
                  accessibilityRole="radio"
                  accessibilityLabel={item.rotulo}
                  accessibilityState={{ selected: ativa }}
                  style={({ pressed }) => [
                    styles.opcao,
                    ativa && styles.opcaoAtiva,
                    pressed && styles.opcaoPressionada,
                  ]}
                >
                  <Ionicons
                    name={item.icone}
                    size={22}
                    color={ativa ? cores.primaria : cores.textoSuave}
                  />
                  <Text style={[styles.textoOpcao, ativa && styles.textoOpcaoAtiva]}>
                    {item.rotulo}
                  </Text>
                  {ativa && <Ionicons name="checkmark" size={22} color={cores.primaria} />}
                </Pressable>
              );
            }}
          />
        </SafeAreaView>
      </Modal>
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
  obrigatorio: {
    color: cores.erro,
  },
  campo: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: cores.fundoCampo,
  },
  campoErro: {
    borderColor: cores.erro,
  },
  inativo: {
    opacity: 0.6,
  },
  valor: {
    flex: 1,
    fontSize: 16,
    color: cores.texto,
  },
  placeholder: {
    color: cores.textoSuave,
  },
  erro: {
    marginTop: 4,
    fontSize: 13,
    color: cores.erro,
  },
  fundoModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  folha: {
    maxHeight: '75%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: cores.fundo,
  },
  cabecalhoFolha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: cores.bordaSuave,
  },
  tituloFolha: {
    fontSize: 18,
    fontWeight: '700',
    color: cores.texto,
  },
  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  opcaoAtiva: {
    backgroundColor: cores.primariaFundo,
  },
  opcaoPressionada: {
    backgroundColor: cores.fundoTela,
  },
  textoOpcao: {
    flex: 1,
    fontSize: 16,
    color: cores.texto,
  },
  textoOpcaoAtiva: {
    fontWeight: '700',
    color: cores.primaria,
  },
});
