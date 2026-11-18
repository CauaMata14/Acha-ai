import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { ItemCard } from '@/components/ItemCard';
import { NomeIcone } from '@/constants/categorias';
import { cores } from '@/constants/cores';
import { useToast } from '@/hooks/useToast';
import { alterarStatusItem, mensagemErroAoAlterar, removerItem } from '@/services/itens';
import { Item } from '@/types/item';

type Acao = 'status' | 'remover';

type BotaoAcaoProps = {
  titulo: string;
  icone: NomeIcone;
  onPress: () => void;
  cor?: string;
  carregando?: boolean;
  desabilitado?: boolean;
};

function BotaoAcao({ titulo, icone, onPress, cor = cores.primaria, carregando, desabilitado }: BotaoAcaoProps) {
  const inativo = desabilitado || carregando;
  return (
    <Pressable
      onPress={onPress}
      disabled={inativo}
      accessibilityRole="button"
      accessibilityLabel={titulo}
      accessibilityState={{ disabled: !!inativo, busy: !!carregando }}
      style={({ pressed }) => [styles.botao, pressed && styles.botaoPressionado, inativo && styles.inativo]}
    >
      {carregando ? (
        <ActivityIndicator size="small" color={cor} />
      ) : (
        <Ionicons name={icone} size={18} color={cor} />
      )}
      <Text style={[styles.textoBotao, { color: cor }]} numberOfLines={1}>
        {titulo}
      </Text>
    </Pressable>
  );
}

/**
 * Uma publicação na lista "Minhas publicações" do Perfil (#16):
 * o card do item (abre os detalhes) e as ações Editar, Marcar como devolvido/Reabrir e Remover.
 */
export function MinhaPublicacao({ item }: { item: Item }) {
  const toast = useToast();
  const [executando, setExecutando] = useState<Acao | null>(null);
  const devolvido = item.status === 'devolvido';

  async function executar(acao: Acao, tarefa: () => Promise<void>, sucesso: string) {
    setExecutando(acao);
    try {
      await tarefa();
      toast.sucesso(sucesso);
    } catch (erro) {
      toast.erro(mensagemErroAoAlterar(erro));
    } finally {
      setExecutando(null);
    }
  }

  function handleStatus() {
    if (devolvido) {
      executar('status', () => alterarStatusItem(item.id, 'aberto'), 'A publicação voltou a ficar em aberto.');
      return;
    }
    Alert.alert(
      'Marcar como devolvido?',
      `"${item.titulo}" vai aparecer como devolvido no Feed e os outros usuários não vão mais ver o contato.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Marcar',
          onPress: () =>
            executar('status', () => alterarStatusItem(item.id, 'devolvido'), 'Que bom! Item marcado como devolvido. 🎉'),
        },
      ]
    );
  }

  function handleRemover() {
    Alert.alert(
      'Remover publicação?',
      `"${item.titulo}" vai ser apagada para todo mundo. Não dá para desfazer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => executar('remover', () => removerItem(item.id), 'Publicação removida.'),
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <ItemCard
        item={item}
        onPress={() => router.push({ pathname: '/item/[id]', params: { id: item.id } })}
      />
      <View style={styles.acoes}>
        <BotaoAcao
          titulo="Editar"
          icone="create-outline"
          onPress={() => router.push({ pathname: '/editar/[id]', params: { id: item.id } })}
          desabilitado={!!executando}
        />
        <BotaoAcao
          titulo={devolvido ? 'Reabrir' : 'Devolvido'}
          icone={devolvido ? 'refresh-outline' : 'checkmark-circle-outline'}
          cor={devolvido ? cores.textoSuave : cores.sucesso}
          onPress={handleStatus}
          carregando={executando === 'status'}
          desabilitado={!!executando}
        />
        <BotaoAcao
          titulo="Remover"
          icone="trash-outline"
          cor={cores.erro}
          onPress={handleRemover}
          carregando={executando === 'remover'}
          desabilitado={!!executando}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  acoes: {
    flexDirection: 'row',
    gap: 8,
  },
  botao: {
    flex: 1,
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: cores.bordaSuave,
    borderRadius: 10,
    backgroundColor: cores.fundo,
  },
  botaoPressionado: {
    backgroundColor: cores.fundoTela,
  },
  inativo: {
    opacity: 0.5,
  },
  textoBotao: {
    fontSize: 14,
    fontWeight: '600',
  },
});
