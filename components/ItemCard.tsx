import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { infoCategoria, ROTULO_STATUS, ROTULO_TIPO } from '@/constants/categorias';
import { cores } from '@/constants/cores';
import { Item } from '@/types/item';
import { formatarDataRelativa } from '@/utils/formatacao';

type Props = {
  item: Item;
  onPress?: () => void;
};

/** Card de um item no feed/perfil: foto à esquerda e informações à direita. */
export function ItemCard({ item, onPress }: Props) {
  const [falhaNaFoto, setFalhaNaFoto] = useState(false);
  const categoria = infoCategoria(item.categoria);
  const achado = item.tipo === 'achado';
  const devolvido = item.status === 'devolvido';
  const mostrarFoto = !!item.fotoUrl && !falhaNaFoto;

  return (
    <Card
      onPress={onPress}
      style={[styles.card, devolvido && styles.devolvido]}
      accessibilityLabel={`${ROTULO_TIPO[item.tipo]}: ${item.titulo}, em ${item.local.descricao}`}
    >
      <View style={styles.miniatura}>
        {mostrarFoto ? (
          <Image
            source={{ uri: item.fotoUrl! }}
            style={styles.foto}
            onError={() => setFalhaNaFoto(true)}
          />
        ) : (
          <Ionicons name={categoria.icone} size={34} color={cores.textoSuave} />
        )}
      </View>

      <View style={styles.info}>
        <View style={styles.badges}>
          <Badge
            texto={ROTULO_TIPO[item.tipo]}
            cor={achado ? cores.achado : cores.perdido}
            corFundo={achado ? cores.achadoFundo : cores.perdidoFundo}
          />
          {devolvido && (
            <Badge
              texto={ROTULO_STATUS.devolvido}
              icone="checkmark-circle"
              cor={cores.textoSuave}
              corFundo={cores.fundoTela}
            />
          )}
        </View>

        <Text style={styles.titulo} numberOfLines={1}>
          {item.titulo}
        </Text>

        <View style={styles.linha}>
          <Ionicons name="location-outline" size={14} color={cores.textoSuave} />
          <Text style={styles.textoSuave} numberOfLines={1}>
            {item.local.descricao || 'Local não informado'}
          </Text>
        </View>

        <View style={styles.linha}>
          <Ionicons name="time-outline" size={14} color={cores.textoSuave} />
          <Text style={styles.textoSuave}>{formatarDataRelativa(item.criadoEm)}</Text>
        </View>
      </View>

      {onPress && <Ionicons name="chevron-forward" size={20} color={cores.borda} />}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  devolvido: {
    opacity: 0.7,
  },
  miniatura: {
    width: 84,
    height: 84,
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.fundoTela,
  },
  foto: {
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  titulo: {
    fontSize: 16,
    fontWeight: '700',
    color: cores.texto,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  textoSuave: {
    flexShrink: 1,
    fontSize: 13,
    color: cores.textoSuave,
  },
});
