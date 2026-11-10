import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { NomeIcone } from '@/constants/categorias';
import { cores } from '@/constants/cores';

type Props = {
  titulo: string;
  mensagem?: string;
  icone?: NomeIcone;
  corIcone?: string;
  /** Botão opcional (ex.: "Publicar item", "Tentar novamente"). */
  acao?: { titulo: string; onPress: () => void; icone?: NomeIcone };
};

/** Tela amigável para listas vazias, buscas sem resultado ou item não encontrado. */
export function EstadoVazio({
  titulo,
  mensagem,
  icone = 'search-outline',
  corIcone = cores.primaria,
  acao,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={[styles.circulo, { backgroundColor: corIcone + '1A' }]}>
        <Ionicons name={icone} size={44} color={corIcone} />
      </View>
      <Text style={styles.titulo}>{titulo}</Text>
      {!!mensagem && <Text style={styles.mensagem}>{mensagem}</Text>}
      {acao && (
        <Button
          titulo={acao.titulo}
          icone={acao.icone}
          onPress={acao.onPress}
          variante="secundario"
          style={styles.botao}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  circulo: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  titulo: {
    fontSize: 18,
    fontWeight: '700',
    color: cores.texto,
    textAlign: 'center',
  },
  mensagem: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 21,
    color: cores.textoSuave,
    textAlign: 'center',
  },
  botao: {
    marginTop: 24,
    minWidth: 200,
  },
});
