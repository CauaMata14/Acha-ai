import Ionicons from '@expo/vector-icons/Ionicons';
import { Ref, useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInputInstance,
  View,
} from 'react-native';
import * as Location from 'expo-location';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { cores } from '@/constants/cores';
import { LOCAIS_CAMPUS } from '@/constants/locaisCampus';
import { useToast } from '@/hooks/useToast';
import { Coordenadas, mensagemErroLocalizacao, obterLocalizacaoAtual } from '@/services/localizacao';

export type { Coordenadas };

type Props = {
  label: string;
  /** Texto do local (vai para `local.descricao`). */
  valor: string;
  onChangeValor: (texto: string) => void;
  /** Coordenadas do GPS, ou null se o usuário não usou a localização. */
  coordenadas: Coordenadas | null;
  onChangeCoordenadas: (coordenadas: Coordenadas | null) => void;
  maxLength: number;
  erro?: string | null;
  obrigatorio?: boolean;
  desabilitado?: boolean;
  ref?: Ref<TextInputInstance>;
};

/**
 * Campo "Onde foi?": texto livre, atalhos com os pontos do campus e botão para usar o GPS.
 * O GPS é opcional: as coordenadas permitem abrir o local no mapa na tela de detalhes.
 */
export function CampoLocal({
  label,
  valor,
  onChangeValor,
  coordenadas,
  onChangeCoordenadas,
  maxLength,
  erro,
  obrigatorio = false,
  desabilitado = false,
  ref,
}: Props) {
  const toast = useToast();
  const [buscando, setBuscando] = useState(false);
  const inativo = desabilitado || buscando;

  function avisarSemPermissao(podePerguntarDeNovo: boolean) {
    if (podePerguntarDeNovo) {
      toast.erro('Precisamos da sua localização para registrar onde foi. Você também pode escolher um ponto do campus.');
      return;
    }
    // O usuário marcou "não perguntar de novo": só dá para liberar nas Configurações
    Alert.alert(
      'Permissão necessária',
      'O acesso à localização está bloqueado. Libere nas Configurações do aparelho ou escolha um ponto do campus.',
      [
        { text: 'Agora não', style: 'cancel' },
        { text: 'Abrir Configurações', onPress: () => Linking.openSettings() },
      ]
    );
  }

  function avisarGpsDesligado() {
    const botoes: Parameters<typeof Alert.alert>[2] = [{ text: 'Ok', style: 'cancel' }];
    if (Platform.OS === 'android') {
      // No Android dá para pedir para ligar a localização sem sair do app
      botoes.push({
        text: 'Ativar',
        onPress: () => {
          Location.enableNetworkProviderAsync()
            .then(() => toast.sucesso('Localização ativada. Toque em "Usar minha localização" de novo.'))
            .catch(() => {});
        },
      });
    }
    Alert.alert('Localização desligada', 'Ative a localização do aparelho e tente de novo.', botoes);
  }

  async function handleUsarLocalizacao() {
    setBuscando(true);
    try {
      const resultado = await obterLocalizacaoAtual();
      if (resultado.status === 'semPermissao') {
        avisarSemPermissao(resultado.podePerguntarDeNovo);
        return;
      }
      if (resultado.status === 'gpsDesligado') {
        avisarGpsDesligado();
        return;
      }

      onChangeCoordenadas(resultado.coordenadas);
      // Só preenche o texto se o usuário ainda não escreveu nada
      if (!valor.trim()) {
        onChangeValor((resultado.endereco ?? 'Localização pelo GPS').slice(0, maxLength));
      }
      toast.sucesso('Localização registrada!');
    } catch (erro) {
      toast.erro(mensagemErroLocalizacao(erro));
    } finally {
      setBuscando(false);
    }
  }

  const precisao = coordenadas?.precisao != null ? Math.round(coordenadas.precisao) : null;

  return (
    <View style={styles.container}>
      <Input
        ref={ref}
        label={label}
        obrigatorio={obrigatorio}
        placeholder="Ex.: Biblioteca – 2º andar"
        value={valor}
        onChangeText={onChangeValor}
        erro={erro}
        maxLength={maxLength}
        autoCapitalize="sentences"
        returnKeyType="done"
        editable={!inativo}
      />

      <Text style={styles.subtitulo}>Pontos do campus</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        keyboardShouldPersistTaps="handled"
      >
        {LOCAIS_CAMPUS.map((ponto) => {
          const ativo = valor.trim() === ponto.rotulo;
          return (
            <Pressable
              key={ponto.rotulo}
              onPress={() => onChangeValor(ponto.rotulo)}
              disabled={inativo}
              accessibilityRole="button"
              accessibilityLabel={`Usar ${ponto.rotulo} como local`}
              accessibilityState={{ selected: ativo, disabled: inativo }}
              style={({ pressed }) => [
                styles.chip,
                ativo && styles.chipAtivo,
                pressed && styles.chipPressionado,
                inativo && styles.inativo,
              ]}
            >
              <Ionicons name={ponto.icone} size={16} color={ativo ? cores.primaria : cores.textoSuave} />
              <Text style={[styles.textoChip, ativo && styles.textoChipAtivo]}>{ponto.rotulo}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {coordenadas ? (
        <View style={styles.gps} accessibilityLiveRegion="polite">
          <Ionicons name="location" size={20} color={cores.sucesso} />
          <View style={styles.flex}>
            <Text style={styles.gpsTitulo}>Localização do GPS registrada</Text>
            <Text style={styles.gpsDetalhe}>
              {precisao != null ? `Precisão de cerca de ${precisao} m · ` : ''}
              Dá para abrir no mapa nos detalhes.
            </Text>
          </View>
          {!inativo && (
            <Pressable
              onPress={() => onChangeCoordenadas(null)}
              accessibilityRole="button"
              accessibilityLabel="Remover localização do GPS"
              hitSlop={8}
            >
              <Ionicons name="close" size={20} color={cores.textoSuave} />
            </Pressable>
          )}
        </View>
      ) : (
        <Button
          titulo={buscando ? 'Buscando sua localização...' : 'Usar minha localização'}
          icone="locate-outline"
          variante="secundario"
          onPress={handleUsarLocalizacao}
          carregando={buscando}
          desabilitado={desabilitado}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  flex: {
    flex: 1,
  },
  subtitulo: {
    marginTop: -6,
    marginBottom: 8,
    fontSize: 13,
    color: cores.textoSuave,
  },
  chips: {
    gap: 8,
    paddingBottom: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 20,
    backgroundColor: cores.fundoCampo,
  },
  chipAtivo: {
    borderColor: cores.primaria,
    backgroundColor: cores.primariaFundo,
  },
  chipPressionado: {
    backgroundColor: cores.fundoTela,
  },
  inativo: {
    opacity: 0.6,
  },
  textoChip: {
    fontSize: 14,
    color: cores.texto,
  },
  textoChipAtivo: {
    fontWeight: '700',
    color: cores.primaria,
  },
  gps: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: cores.sucesso,
    borderRadius: 10,
    backgroundColor: cores.sucessoFundo,
  },
  gpsTitulo: {
    fontSize: 14,
    fontWeight: '600',
    color: cores.texto,
  },
  gpsDetalhe: {
    marginTop: 2,
    fontSize: 13,
    color: cores.textoSuave,
  },
});
