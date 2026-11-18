import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Alerta } from '@/components/Alerta';
import { BarraFiltros } from '@/components/BarraFiltros';
import { EstadoErro } from '@/components/EstadoErro';
import { EstadoVazio } from '@/components/EstadoVazio';
import { ItemCard } from '@/components/ItemCard';
import { ItemCardEsqueleto } from '@/components/ItemCardEsqueleto';
import { cores } from '@/constants/cores';
import { useAuth } from '@/hooks/useAuth';
import { useConfirmadoApos } from '@/hooks/useConfirmadoApos';
import { mensagemErroFirestore, ouvirUltimosItens } from '@/services/itens';
import { Item } from '@/types/item';
import { filtrarItens, FILTROS_VAZIOS, FiltrosFeed, temFiltroAtivo } from '@/utils/filtros';

/**
 * O Feed escuta as publicações mais recentes em páginas de POR_PAGINA e busca mais quando o usuário
 * chega ao fim da lista. Como a foto fica dentro do documento (até ~150 KB cada), baixar tudo de uma
 * vez deixaria a abertura do app lenta e gastaria dados.
 *
 * A busca e os filtros (#13) são aplicados no app sobre o que já foi carregado: o Firestore não faz
 * busca por texto e filtrar lá exigiria índices compostos.
 */
const POR_PAGINA = 20;
const LIMITE_MAXIMO = 200;

// Aba Feed: lista as últimas publicações em tempo real, com busca e filtros por tipo e categoria (#13).
// O layout das abas já garante que existe um usuário logado.
export default function Feed() {
  const { usuario } = useAuth();

  const [itens, setItens] = useState<Item[]>([]);
  const [carregandoItens, setCarregandoItens] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);
  const [filtros, setFiltros] = useState<FiltrosFeed>(FILTROS_VAZIOS);
  const [semConexao, setSemConexao] = useState(false);
  const offline = useConfirmadoApos(semConexao);
  const [limite, setLimite] = useState(POR_PAGINA);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [atualizando, setAtualizando] = useState(false);

  const itensFiltrados = useMemo(() => filtrarItens(itens, filtros), [itens, filtros]);
  const filtrando = temFiltroAtivo(filtros);
  // Se veio a página cheia, provavelmente existem publicações mais antigas
  const temMais = itens.length >= limite && limite < LIMITE_MAXIMO;

  // Aumentar o limite refaz a escuta com mais itens; os que já estavam na tela continuam lá
  useEffect(() => {
    if (!usuario) return;
    setErro(null);
    const cancelar = ouvirUltimosItens(
      limite,
      (novosItens, doCache) => {
        setItens(novosItens);
        setSemConexao(doCache);
        setCarregandoItens(false);
        setCarregandoMais(false);
        setAtualizando(false);
      },
      (falha) => {
        setErro(mensagemErroFirestore(falha));
        setCarregandoItens(false);
        setCarregandoMais(false);
        setAtualizando(false);
      }
    );
    return cancelar;
  }, [usuario, tentativa, limite]);

  function carregarMais() {
    if (!temMais || carregandoMais || offline || erro) return;
    setCarregandoMais(true);
    setLimite((atual) => Math.min(atual + POR_PAGINA, LIMITE_MAXIMO));
  }

  /**
   * Puxar para atualizar: volta para a primeira página e refaz a escuta no Firestore.
   * O Feed já atualiza sozinho em tempo real; isso serve para quando a conexão estava instável.
   */
  function atualizar() {
    setAtualizando(true);
    setLimite(POR_PAGINA);
    setTentativa((n) => n + 1);
  }

  const abrirItem = useCallback(
    (id: string) => router.push({ pathname: '/item/[id]', params: { id } }),
    []
  );

  const renderItem = useCallback(
    ({ item }: { item: Item }) => <ItemCard item={item} onPress={() => abrirItem(item.id)} />,
    [abrirItem]
  );

  function tentarNovamente() {
    setCarregandoItens(true);
    setTentativa((n) => n + 1);
  }

  function renderRodape() {
    if (carregandoMais) {
      return (
        <View style={styles.rodape} accessibilityLiveRegion="polite">
          <ActivityIndicator color={cores.primaria} />
          <Text style={styles.textoRodape}>Carregando publicações mais antigas...</Text>
        </View>
      );
    }
    if (itensFiltrados.length === 0) return null;
    if (temMais) {
      // Com filtro, a lista pode ficar curta: o usuário pode pedir para procurar mais para trás
      return filtrando ? (
        <Pressable onPress={carregarMais} style={styles.rodape} accessibilityRole="button" hitSlop={8}>
          <Text style={styles.limpar}>Buscar em publicações mais antigas</Text>
        </Pressable>
      ) : null;
    }
    return (
      <View style={styles.rodape}>
        <Text style={styles.textoRodape}>
          {limite >= LIMITE_MAXIMO
            ? `Mostrando as ${LIMITE_MAXIMO} publicações mais recentes.`
            : 'Você chegou ao fim das publicações. 🎉'}
        </Text>
      </View>
    );
  }

  function renderConteudo() {
    // Lista vazia vinda só do cache: espera um pouco antes de concluir que não há publicações
    const aguardandoServidor = itens.length === 0 && semConexao && !offline;
    if (carregandoItens || aguardandoServidor) {
      return <ItemCardEsqueleto />;
    }
    if (erro) return <EstadoErro mensagem={erro} onTentarNovamente={tentarNovamente} />;
    if (itens.length === 0 && offline) {
      return (
        <EstadoVazio
          icone="cloud-offline-outline"
          titulo="Sem conexão com a internet"
          mensagem="Assim que a conexão voltar, as publicações aparecem aqui automaticamente."
          corIcone={cores.aviso}
        />
      );
    }
    return (
      <FlatList
        data={itensFiltrados}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.lista, itensFiltrados.length === 0 && styles.listaVazia]}
        ItemSeparatorComponent={Separador}
        // Renderiza só o que está perto da tela: a lista continua leve com muitos itens e fotos
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews={Platform.OS === 'android'}
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={atualizar}
            colors={[cores.primaria]}
            tintColor={cores.primaria}
          />
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        // Sem filtro, busca a próxima página automaticamente perto do fim da lista
        onEndReached={filtrando ? undefined : carregarMais}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderRodape() ?? undefined}
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
              mensagem="Achou ou perdeu alguma coisa no campus? Seja o primeiro a publicar."
              acao={{
                titulo: 'Publicar um item',
                icone: 'add-circle-outline',
                onPress: () => router.navigate('/publicar'),
              }}
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
      {offline && itens.length > 0 && (
        <Alerta
          tipo="aviso"
          mensagem="Sem internet. Mostrando as publicações salvas no aparelho."
          style={styles.avisoOffline}
        />
      )}
      {!erro && <BarraFiltros filtros={filtros} onChange={setFiltros} />}
      <View style={styles.flex}>{renderConteudo()}</View>
    </SafeAreaView>
  );
}

function Separador() {
  return <View style={styles.separador} />;
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
  avisoOffline: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 0,
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
  rodape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  textoRodape: {
    fontSize: 13,
    color: cores.textoSuave,
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
