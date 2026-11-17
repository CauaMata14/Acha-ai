import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { cores } from '@/constants/cores';
import { useToast } from '@/hooks/useToast';
import { escolherFoto, mensagemErroFoto, OrigemFoto } from '@/services/foto';

type Props = {
  label: string;
  /** Data URI da foto escolhida, ou null se não houver foto. */
  valor: string | null;
  onChange: (uri: string | null) => void;
  dica?: string;
  desabilitado?: boolean;
};

/**
 * Campo de foto do item: tira foto com a câmera ou escolhe da galeria, mostra a prévia
 * e permite trocar ou remover. Trata permissão negada e erros com mensagens claras.
 */
export function SeletorFoto({ label, valor, onChange, dica, desabilitado = false }: Props) {
  const toast = useToast();
  const [carregando, setCarregando] = useState(false);
  const inativo = desabilitado || carregando;

  function avisarSemPermissao(origem: OrigemFoto, podePerguntarDeNovo: boolean) {
    const recurso = origem === 'camera' ? 'à câmera' : 'às suas fotos';
    if (podePerguntarDeNovo) {
      toast.erro(`Precisamos de acesso ${recurso} para adicionar a foto.`);
      return;
    }
    // O usuário marcou "não perguntar de novo": só dá para liberar nas Configurações
    Alert.alert(
      'Permissão necessária',
      `O acesso ${recurso} está bloqueado. Libere nas Configurações do aparelho para adicionar a foto.`,
      [
        { text: 'Agora não', style: 'cancel' },
        { text: 'Abrir Configurações', onPress: () => Linking.openSettings() },
      ]
    );
  }

  async function handleEscolher(origem: OrigemFoto) {
    setCarregando(true);
    try {
      const resultado = await escolherFoto(origem);
      if (resultado.status === 'ok') {
        onChange(resultado.uri);
      } else if (resultado.status === 'semPermissao') {
        avisarSemPermissao(origem, resultado.podePerguntarDeNovo);
      }
    } catch (erro) {
      toast.erro(mensagemErroFoto(erro));
    } finally {
      setCarregando(false);
    }
  }

  function handleTrocar() {
    Alert.alert('Trocar foto', 'De onde você quer pegar a nova foto?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Câmera', onPress: () => handleEscolher('camera') },
      { text: 'Galeria', onPress: () => handleEscolher('galeria') },
    ]);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label} <Text style={styles.opcional}>(opcional)</Text>
      </Text>

      {valor ? (
        <View>
          <View style={styles.previa}>
            <Image
              source={{ uri: valor }}
              style={styles.imagem}
              resizeMode="cover"
              accessibilityLabel="Prévia da foto do item"
            />
            {carregando && (
              <View style={styles.sobreposicao}>
                <ActivityIndicator size="large" color={cores.fundo} />
              </View>
            )}
            {!inativo && (
              <Pressable
                onPress={() => onChange(null)}
                accessibilityRole="button"
                accessibilityLabel="Remover foto"
                hitSlop={8}
                style={({ pressed }) => [styles.remover, pressed && styles.removerPressionado]}
              >
                <Ionicons name="close" size={20} color={cores.fundo} />
              </Pressable>
            )}
          </View>
          <Button
            titulo="Trocar foto"
            icone="swap-horizontal-outline"
            variante="texto"
            onPress={handleTrocar}
            desabilitado={inativo}
            style={styles.trocar}
          />
        </View>
      ) : (
        <View style={[styles.vazio, inativo && styles.inativo]}>
          {carregando ? (
            <>
              <ActivityIndicator size="large" color={cores.primaria} />
              <Text style={styles.textoVazio}>Preparando a foto...</Text>
            </>
          ) : (
            <>
              <Ionicons name="camera-outline" size={40} color={cores.textoSuave} />
              <Text style={styles.textoVazio}>Uma foto ajuda o dono a reconhecer o objeto.</Text>
              <View style={styles.botoes}>
                <View style={styles.flex}>
                  <Button
                    titulo="Câmera"
                    icone="camera-outline"
                    variante="secundario"
                    onPress={() => handleEscolher('camera')}
                    desabilitado={inativo}
                  />
                </View>
                <View style={styles.flex}>
                  <Button
                    titulo="Galeria"
                    icone="images-outline"
                    variante="secundario"
                    onPress={() => handleEscolher('galeria')}
                    desabilitado={inativo}
                  />
                </View>
              </View>
            </>
          )}
        </View>
      )}

      {!!dica && <Text style={styles.dica}>{dica}</Text>}
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
  opcional: {
    fontWeight: '400',
    color: cores.textoSuave,
  },
  flex: {
    flex: 1,
  },
  vazio: {
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: cores.borda,
    borderRadius: 10,
    backgroundColor: cores.fundoCampo,
  },
  inativo: {
    opacity: 0.6,
  },
  textoVazio: {
    fontSize: 14,
    textAlign: 'center',
    color: cores.textoSuave,
  },
  botoes: {
    flexDirection: 'row',
    gap: 12,
    alignSelf: 'stretch',
  },
  previa: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: cores.bordaSuave,
  },
  imagem: {
    width: '100%',
    height: '100%',
  },
  sobreposicao: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  remover: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  removerPressionado: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  trocar: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  dica: {
    marginTop: 4,
    fontSize: 13,
    color: cores.textoSuave,
  },
});
