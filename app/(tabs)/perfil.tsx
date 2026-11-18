import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { EstadoVazio } from '@/components/EstadoVazio';
import { cores } from '@/constants/cores';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { iniciais } from '@/utils/formatacao';

// Aba Perfil: dados do usuário e botão de sair.
// A lista "Minhas publicações" (editar, remover, marcar como devolvido) entra na #16.
export default function Perfil() {
  const { usuario, sair } = useAuth();
  const toast = useToast();

  const nome = usuario?.displayName || 'Usuário';

  const [saindo, setSaindo] = useState(false);

  async function sairDaConta() {
    setSaindo(true);
    try {
      await sair();
      toast.info('Você saiu da sua conta.');
      // O layout das abas percebe que não há mais usuário e redireciona para o login.
    } catch {
      toast.erro('Não foi possível sair. Tente novamente.');
      setSaindo(false);
    }
  }

  function handleSair() {
    Alert.alert('Sair da conta?', 'Você vai precisar entrar de novo para publicar ou ver os itens.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: sairDaConta },
    ]);
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <View style={styles.cabecalho}>
        <View style={styles.avatar} accessibilityElementsHidden importantForAccessibility="no">
          <Text style={styles.avatarTexto}>{iniciais(nome)}</Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.nome} numberOfLines={1}>
            {nome}
          </Text>
          <Text style={styles.email} numberOfLines={1}>
            {usuario?.email}
          </Text>
        </View>
      </View>

      <Text style={styles.secao}>Minhas publicações</Text>
      <EstadoVazio
        icone="albums-outline"
        titulo="Em breve"
        mensagem="Aqui vão aparecer os itens que você publicou, com opções para editar, remover e marcar como devolvido."
      />

      <View style={styles.acoes}>
        <Button
          titulo="Sair"
          variante="secundario"
          icone="log-out-outline"
          onPress={handleSair}
          carregando={saindo}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    gap: 16,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.primariaFundo,
  },
  avatarTexto: {
    fontSize: 20,
    fontWeight: '800',
    color: cores.primariaEscura,
  },
  nome: {
    fontSize: 19,
    fontWeight: '800',
    color: cores.texto,
  },
  email: {
    fontSize: 14,
    color: cores.textoSuave,
  },
  secao: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '800',
    color: cores.texto,
  },
  acoes: {
    marginTop: 'auto',
  },
});
