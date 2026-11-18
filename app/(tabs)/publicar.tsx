import { Redirect, router } from 'expo-router';
import { useRef } from 'react';

import { FormularioItem, ValoresItem } from '@/components/FormularioItem';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { mensagemErroAoSalvar, novoIdItem, publicarItem } from '@/services/itens';

// Aba "Publicar" (#8). Formulário de publicação de item.
// Foto pela câmera/galeria (#9). Local por texto, ponto do campus ou GPS (#10).
// Os campos ficam em components/FormularioItem.tsx, que também é usado na tela de editar (#16).
export default function Publicar() {
  const { usuario } = useAuth();
  const toast = useToast();

  // Id reservado para esta publicação. Se der erro (ex.: sem internet) e o usuário tentar de novo,
  // a nova tentativa usa o mesmo id e sobrescreve o documento, sem criar um item duplicado.
  const idPublicacao = useRef<string | null>(null);

  if (!usuario) {
    return <Redirect href="/login" />;
  }

  async function publicar(valores: ValoresItem) {
    if (!usuario) return;
    idPublicacao.current ??= novoIdItem();
    const id = await publicarItem(
      idPublicacao.current,
      {
        tipo: valores.tipo,
        titulo: valores.titulo,
        categoria: valores.categoria,
        descricao: valores.descricao,
        local: {
          descricao: valores.local,
          latitude: valores.coordenadas?.latitude ?? null,
          longitude: valores.coordenadas?.longitude ?? null,
        },
        dataOcorrencia: valores.dataOcorrencia,
        fotoUrl: valores.foto,
      },
      {
        uid: usuario.uid,
        nome: usuario.displayName || usuario.email || 'Usuário',
        email: usuario.email,
        telefone: valores.telefone || null,
      }
    );
    idPublicacao.current = null;
    toast.sucesso('Item publicado com sucesso!');
    // push (e não replace): o "voltar" dos detalhes retorna para as abas
    router.push({ pathname: '/item/[id]', params: { id } });
  }

  return (
    <FormularioItem
      intro="Achou ou perdeu algo? Conte pra comunidade."
      textoBotao="Publicar"
      iconeBotao="paper-plane-outline"
      textoEnviando="Publicando seu item... aguarde um instante."
      verbo="publicar"
      onEnviar={publicar}
      mensagemErro={mensagemErroAoSalvar}
      onCancelar={() => {
        idPublicacao.current = null;
        router.navigate('/feed');
      }}
      limparAoTerminar
      lembrarTelefone
    />
  );
}
