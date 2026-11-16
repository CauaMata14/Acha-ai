import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { cores } from '@/constants/cores';
import { formatarData } from '@/utils/formatacao';

type Props = {
  label: string;
  valor: Date | null;
  onChange: (data: Date) => void;
  erro?: string | null;
  dica?: string;
  obrigatorio?: boolean;
  desabilitado?: boolean;
  dataMinima?: Date;
  dataMaxima?: Date;
};

/**
 * Campo de data com o DateTimePicker nativo.
 * Android: abre o calendário em uma janela. iOS: mostra o calendário embaixo do campo.
 */
export function CampoData({
  label,
  valor,
  onChange,
  erro,
  dica,
  obrigatorio = false,
  desabilitado = false,
  dataMinima,
  dataMaxima,
}: Props) {
  const [aberto, setAberto] = useState(false);
  const ios = Platform.OS === 'ios';

  function handleChange(evento: DateTimePickerEvent, data?: Date) {
    // No Android o calendário fecha sozinho depois de escolher ou cancelar
    if (!ios) setAberto(false);
    if (evento.type === 'set' && data) onChange(data);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {obrigatorio && <Text style={styles.obrigatorio}> *</Text>}
      </Text>

      <Pressable
        onPress={() => setAberto((a) => !a)}
        disabled={desabilitado}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${valor ? formatarData(valor) : 'nenhuma selecionada'}`}
        accessibilityHint={erro ?? 'Abre o calendário'}
        accessibilityState={{ disabled: desabilitado, expanded: aberto }}
        style={[
          styles.campo,
          aberto && styles.campoFocado,
          !!erro && styles.campoErro,
          desabilitado && styles.inativo,
        ]}
      >
        <Ionicons name="calendar-outline" size={20} color={cores.primaria} />
        <Text style={[styles.valor, !valor && styles.placeholder]}>
          {valor ? formatarData(valor) : 'Selecione a data'}
        </Text>
      </Pressable>

      {aberto && (
        <View style={ios && styles.calendarioIos}>
          <DateTimePicker
            value={valor ?? dataMaxima ?? new Date()}
            mode="date"
            display={ios ? 'inline' : 'default'}
            onChange={handleChange}
            minimumDate={dataMinima}
            maximumDate={dataMaxima}
            locale="pt-BR"
            accentColor={cores.primaria}
          />
          {ios && (
            <Button titulo="Confirmar data" variante="texto" onPress={() => setAberto(false)} />
          )}
        </View>
      )}

      {erro ? (
        <Text style={styles.erro} accessibilityLiveRegion="polite">
          {erro}
        </Text>
      ) : (
        !!dica && <Text style={styles.dica}>{dica}</Text>
      )}
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
  campoFocado: {
    borderColor: cores.primaria,
    backgroundColor: cores.fundo,
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
  calendarioIos: {
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: cores.bordaSuave,
    backgroundColor: cores.fundo,
  },
  erro: {
    marginTop: 4,
    fontSize: 13,
    color: cores.erro,
  },
  dica: {
    marginTop: 4,
    fontSize: 13,
    color: cores.textoSuave,
  },
});
