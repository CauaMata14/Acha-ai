import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BarraFiltros } from '@/components/BarraFiltros';
import { EstadoErro } from '@/components/EstadoErro';
import { EstadoVazio } from '@/components/EstadoVazio';
import { ItemCard } from '@/components/ItemCard';
import { Loading } from '@/components/Loading';
import { cores } from '@/constants/cores';
import { useAuth } from '@/hooks/useAuth';
import { mensagemErroFirestore, ouvirUltimosItens } from '@/services/itens';
import { Item } from '@/types/item';
import { filtrarItens, FILTROS_VAZIOS, FiltrosFeed, temFiltroAtivo } from '@/utils/filtros';

/**
 * Quantas publicações recentes o Feed escuta. A busca e os filtros (#13) são aplicados no app
 * sobre essa lista: o Firestore não faz busca por texto e filtrar lá exigiria índices compostos.
 */
const LIMITE_FEED = 100;

// Aba Feed: lista as últimas publicações em tempo real, com busca e filtros por tipo e categoria (#13).
// O layout das abas já garante que existe um usuário logado.
export default function Feed() {
  const { usuario } = useAuth();

  const [itens, setItens] = useState<Item[]>([]);
  const [carregandoItens, setCarregandoItens] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);
  const [filtros, setFiltros] = useState<FiltrosFeed>(FILTROS_VAZIOS);

  const itensFiltrados = useMemo(() => filtrarItens(itens, filtros), [itens, filtros]);
  const filtrando = temFiltroAtivo(filtros);

  useEffect(() => {
    if (!usuario) return;
    setCarregandoItens(true);
    setErro(null);
    const cancelar = ouvirUltimosItens(
      LIMITE_FEED,
      (novosItens) => {
        setItens(novosItens);
        setCarregandoItens(false);
      },
      (falha) => {
        setErro(mensagemErroFirestore(falha));
        setCarregandoItens(false);
      }
    );
    return cancelar;
  }, [usuario, tentativa]);

  function renderConteudo() {
    if (carregandoItens) return <Loading mensagem="Carregando publicações..." telaCheia={false} />;
    if (erro) return <EstadoErro mensagem={erro} onTentarNovamente={() => setTentativa((n) => n + 1)} />;
    return (
      <FlatList
        data={itensFiltrados}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ItemCard
            item={item}
            onPress={() => router.push({ pathname: '/item/[id]', params: { id: item.id } })}
          />
        )}
        contentContainerStyle={[styles.lista, itensFiltrados.length === 0 && styles.listaVazia]}
        ItemSeparatorComponent={() => <View style={styles.separador} />}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListHeaderComponent={
          filtrando && itensFiltrados.length > 0 ? (
            <View style={styles.resumo}>
              <Text style={styles.textoResumo} accessibilityLiveRegion="polite">
                {itensFiltrados.length === 1
                  ? '1 item encontrado'
                  : `${itensFiltrados.length} itens encontrados`}
              </Text>
              <Pressable
                onPress={() => setFiltros(FILTROS_VAZIOS)}
                accessibilityRole="button"
                hitSlop={8}
              >
                <Text style={styles.limpar}>Limpar filtros</Text>
              </Pressable>
            </View>
          ) : undefined
        }
        ListEmptyComponent={
          itens.length > 0 ? (
            <EstadoVazio
              icone="search-outline"
              titulo="Nenhum item encontrado"
              mensagem="Tente outras palavras ou mude o tipo e a categoria."
              acao={{
                titulo: 'Limpar filtros',
                icone: 'close-circle-outline',
                onPress: () => setFiltros(FILTROS_VAZIOS),
              }}
            />
          ) : (
            <EstadoVazio
              icone="file-tray-outline"
              titulo="Nenhum item publicado ainda"
              mensagem="Quando alguém publicar um objeto achado ou perdido, ele aparece aqui."
            />
          )
        }
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.cabecalho}>
        <Text style={styles.title}>AchaAí</Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          Olá, {usuario?.displayName || usuario?.email}!
        </Text>
      </View>
      {!erro && <BarraFiltros filtros={filtros} onChange={setFiltros} />}
      <View style={styles.flex}>{renderConteudo()}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundoTela,
  },
  flex: {
    flex: 1,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: cores.fundo,
    borderBottomWidth: 1,
    borderBottomColor: cores.bordaSuave,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: cores.primaria,
  },
  subtitle: {
    flexShrink: 1,
    fontSize: 14,
    color: cores.textoSuave,
  },
  lista: {
    padding: 16,
  },
  listaVazia: {
    flexGrow: 1,
  },
  separador: {
    height: 12,
  },
  resumo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  textoResumo: {
    fontSize: 14,
    color: cores.textoSuave,
  },
  limpar: {
    fontSize: 14,
    fontWeight: '600',
    color: cores.primaria,
  },
});
