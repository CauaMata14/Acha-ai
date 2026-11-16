import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EstadoErro } from '@/components/EstadoErro';
import { EstadoVazio } from '@/components/EstadoVazio';
import { ItemCard } from '@/components/ItemCard';
import { Loading } from '@/components/Loading';
import { cores } from '@/constants/cores';
import { useAuth } from '@/hooks/useAuth';
import { mensagemErroFirestore, ouvirUltimosItens } from '@/services/itens';
import { Item } from '@/types/item';

// Aba Feed: lista as últimas publicações em tempo real.
// Busca e filtros por categoria/tipo entram na #13.
// O layout das abas já garante que existe um usuário logado.
export default function Feed() {
  const { usuario } = useAuth();

  const [itens, setItens] = useState<Item[]>([]);
  const [carregandoItens, setCarregandoItens] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    if (!usuario) return;
    setCarregandoItens(true);
    setErro(null);
    const cancelar = ouvirUltimosItens(
      20,
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
        data={itens}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ItemCard
            item={item}
            onPress={() => router.push({ pathname: '/item/[id]', params: { id: item.id } })}
          />
        )}
        contentContainerStyle={[styles.lista, itens.length === 0 && styles.listaVazia]}
        ItemSeparatorComponent={() => <View style={styles.separador} />}
        ListEmptyComponent={
          <EstadoVazio
            icone="file-tray-outline"
            titulo="Nenhum item publicado ainda"
            mensagem="Quando alguém publicar um objeto achado ou perdido, ele aparece aqui."
          />
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
});
