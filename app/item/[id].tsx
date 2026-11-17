import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Alerta } from '@/components/Alerta';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EstadoErro } from '@/components/EstadoErro';
import { EstadoVazio } from '@/components/EstadoVazio';
import { Loading } from '@/components/Loading';
import { infoCategoria, NomeIcone, ROTULO_STATUS, ROTULO_TIPO } from '@/constants/categorias';
import { cores } from '@/constants/cores';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { mensagemErroFirestore, ouvirItem } from '@/services/itens';
import { Item } from '@/types/item';
import { formatarData, formatarDataHora, formatarDataRelativa, iniciais } from '@/utils/formatacao';

type Estado =
  | { fase: 'carregando' }
  | { fase: 'erro'; mensagem: string }
  | { fase: 'pronto'; item: Item | null };

export default function DetalhesItem() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { usuario } = useAuth();
  const toast = useToast();
  const insets = useSafeAreaInsets();

  const [estado, setEstado] = useState<Estado>({ fase: 'carregando' });
  // Mudar este número refaz a inscrição no Firestore (botão "Tentar novamente")
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    if (!id) {
      setEstado({ fase: 'pronto', item: null });
      return;
    }
    setEstado({ fase: 'carregando' });
    const cancelar = ouvirItem(
      id,
      (item) => setEstado({ fase: 'pronto', item }),
      (erro) => setEstado({ fase: 'erro', mensagem: mensagemErroFirestore(erro) })
    );
    return cancelar;
  }, [id, tentativa]);

  if (estado.fase === 'carregando') {
    return <Loading mensagem="Carregando detalhes do item..." />;
  }

  if (estado.fase === 'erro') {
    return (
      <View style={styles.tela}>
        <EstadoErro mensagem={estado.mensagem} onTentarNovamente={() => setTentativa((n) => n + 1)} />
      </View>
    );
  }

  const { item } = estado;

  if (!item) {
    return (
      <View style={styles.tela}>
        <EstadoVazio
          icone="help-circle-outline"
          titulo="Item não encontrado"
          mensagem="Esta publicação pode ter sido removida pelo autor."
          acao={{ titulo: 'Voltar', icone: 'arrow-back', onPress: () => router.back() }}
        />
      </View>
    );
  }

  const categoria = infoCategoria(item.categoria);
  const achado = item.tipo === 'achado';
  const devolvido = item.status === 'devolvido';
  const ehMeu = !!usuario && usuario.uid === item.autor.uid;
  const temCoordenadas = item.local.latitude != null && item.local.longitude != null;

  async function abrirUrl(url: string, mensagemErro: string) {
    try {
      await Linking.openURL(url);
    } catch {
      toast.erro(mensagemErro);
    }
  }

  function abrirMapa() {
    const { latitude, longitude } = item!.local;
    abrirUrl(
      `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
      'Não foi possível abrir o mapa.'
    );
  }

  function entrarEmContato() {
    if (!item!.autor.email) {
      toast.erro('O autor não informou um e-mail de contato.');
      return;
    }
    const assunto = encodeURIComponent(`AchaAí: ${item!.titulo}`);
    const corpo = encodeURIComponent(
      `Olá, ${item!.autor.nome}! Vi sua publicação "${item!.titulo}" no AchaAí e gostaria de conversar sobre ele.`
    );
    abrirUrl(
      `mailto:${item!.autor.email}?subject=${assunto}&body=${corpo}`,
      'Não foi possível abrir o aplicativo de e-mail.'
    );
  }

  return (
    <View style={styles.tela}>
      <Stack.Screen options={{ title: ROTULO_TIPO[item.tipo] }} />

      <ScrollView contentContainerStyle={[styles.conteudo, { paddingBottom: insets.bottom + 24 }]}>
        <FotoItem key={item.fotoUrl ?? 'sem-foto'} url={item.fotoUrl} iconeReserva={categoria.icone} />

        <View style={styles.corpo}>
          <View style={styles.badges}>
            <Badge
              texto={ROTULO_TIPO[item.tipo]}
              icone={achado ? 'hand-left-outline' : 'search-outline'}
              cor={achado ? cores.achado : cores.perdido}
              corFundo={achado ? cores.achadoFundo : cores.perdidoFundo}
            />
            <Badge texto={categoria.rotulo} icone={categoria.icone} />
            <Badge
              texto={ROTULO_STATUS[item.status]}
              icone={devolvido ? 'checkmark-circle' : 'ellipse-outline'}
              cor={devolvido ? cores.sucesso : cores.textoSuave}
              corFundo={devolvido ? cores.sucessoFundo : cores.fundoTela}
            />
          </View>

          <Text style={styles.titulo}>{item.titulo}</Text>
          <Text style={styles.publicado}>Publicado {formatarDataRelativa(item.criadoEm)}</Text>

          {devolvido && (
            <Alerta tipo="sucesso" mensagem="Este item já foi devolvido ao dono." style={styles.alerta} />
          )}

          <Card style={styles.secao}>
            <Text style={styles.tituloSecao}>Descrição</Text>
            <Text style={styles.descricao}>
              {item.descricao || 'O autor não adicionou uma descrição.'}
            </Text>
          </Card>

          <Card style={styles.secao}>
            <Text style={styles.tituloSecao}>Informações</Text>
            <LinhaInfo icone={categoria.icone} rotulo="Categoria" valor={categoria.rotulo} />
            <LinhaInfo
              icone="location-outline"
              rotulo="Local"
              valor={item.local.descricao || 'Não informado'}
            />
            <LinhaInfo
              icone="calendar-outline"
              rotulo={achado ? 'Encontrado em' : 'Perdido em'}
              valor={formatarData(item.dataOcorrencia)}
            />
            <LinhaInfo
              icone="time-outline"
              rotulo="Publicado em"
              valor={formatarDataHora(item.criadoEm)}
            />
            {temCoordenadas && (
              <Button
                titulo="Ver no mapa"
                icone="map-outline"
                variante="texto"
                onPress={abrirMapa}
                style={styles.botaoMapa}
              />
            )}
          </Card>

          <Card style={[styles.secao, styles.autor]}>
            <View style={styles.avatar}>
              <Text style={styles.avatarTexto}>{iniciais(item.autor.nome)}</Text>
            </View>
            <View style={styles.flex}>
              <Text style={styles.autorRotulo}>{achado ? 'Encontrado por' : 'Perdido por'}</Text>
              <Text style={styles.autorNome}>
                {item.autor.nome}
                {ehMeu && ' (você)'}
              </Text>
            </View>
          </Card>

          {ehMeu ? (
            <Alerta
              tipo="info"
              mensagem="Esta publicação é sua. Você pode editá-la ou marcá-la como devolvida no seu Perfil."
            />
          ) : (
            !devolvido && (
              <Button
                titulo={achado ? 'É meu! Falar com quem achou' : 'Achei! Falar com o dono'}
                icone="mail-outline"
                onPress={entrarEmContato}
              />
            )
          )}
        </View>
      </ScrollView>
    </View>
  );
}

/** Foto do item com indicador de carregamento e ícone de reserva caso falhe ou não exista. */
function FotoItem({ url, iconeReserva }: { url?: string | null; iconeReserva: NomeIcone }) {
  const [carregando, setCarregando] = useState(!!url);
  const [falhou, setFalhou] = useState(false);

  if (!url || falhou) {
    return (
      <View style={[styles.foto, styles.fotoVazia]}>
        <Ionicons name={iconeReserva} size={64} color={cores.borda} />
        <Text style={styles.fotoVaziaTexto}>
          {falhou ? 'Não foi possível carregar a foto' : 'Sem foto'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.foto}>
      <Image
        source={{ uri: url }}
        style={styles.preencher}
        resizeMode="cover"
        onLoadEnd={() => setCarregando(false)}
        onError={() => setFalhou(true)}
        accessibilityLabel="Foto do item"
      />
      {carregando && (
        <View style={styles.fotoCarregando}>
          <ActivityIndicator size="large" color={cores.primaria} />
        </View>
      )}
    </View>
  );
}

function LinhaInfo({ icone, rotulo, valor }: { icone: NomeIcone; rotulo: string; valor: string }) {
  return (
    <View style={styles.linhaInfo}>
      <View style={styles.iconeInfo}>
        <Ionicons name={icone} size={18} color={cores.primaria} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.rotuloInfo}>{rotulo}</Text>
        <Text style={styles.valorInfo}>{valor}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.fundoTela,
  },
  flex: {
    flex: 1,
  },
  conteudo: {
    flexGrow: 1,
  },
  foto: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: cores.bordaSuave,
  },
  fotoVazia: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  fotoVaziaTexto: {
    fontSize: 14,
    color: cores.textoSuave,
  },
  preencher: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  fotoCarregando: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  corpo: {
    padding: 16,
    gap: 4,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  titulo: {
    fontSize: 24,
    fontWeight: '800',
    color: cores.texto,
  },
  publicado: {
    marginBottom: 12,
    fontSize: 14,
    color: cores.textoSuave,
  },
  alerta: {
    marginBottom: 12,
  },
  secao: {
    marginBottom: 12,
    padding: 16,
    gap: 12,
  },
  tituloSecao: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: cores.textoSuave,
  },
  descricao: {
    fontSize: 16,
    lineHeight: 23,
    color: cores.texto,
  },
  linhaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconeInfo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.primariaFundo,
  },
  rotuloInfo: {
    fontSize: 12,
    color: cores.textoSuave,
  },
  valorInfo: {
    fontSize: 15,
    fontWeight: '600',
    color: cores.texto,
  },
  botaoMapa: {
    alignSelf: 'flex-start',
  },
  autor: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.primaria,
  },
  avatarTexto: {
    fontSize: 17,
    fontWeight: '800',
    color: cores.fundo,
  },
  autorRotulo: {
    fontSize: 12,
    color: cores.textoSuave,
  },
  autorNome: {
    fontSize: 16,
    fontWeight: '700',
    color: cores.texto,
  },
});
