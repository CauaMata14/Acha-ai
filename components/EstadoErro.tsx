import { EstadoVazio } from '@/components/EstadoVazio';
import { cores } from '@/constants/cores';

type Props = {
  mensagem?: string;
  /** Se informado, mostra o botão "Tentar novamente". */
  onTentarNovamente?: () => void;
};

/** Tela de erro ao carregar dados (ex.: sem internet ou falha no Firestore). */
export function EstadoErro({
  mensagem = 'Não foi possível carregar as informações. Verifique sua conexão.',
  onTentarNovamente,
}: Props) {
  return (
    <EstadoVazio
      icone="cloud-offline-outline"
      corIcone={cores.erro}
      titulo="Ops! Algo deu errado"
      mensagem={mensagem}
      acao={
        onTentarNovamente
          ? { titulo: 'Tentar novamente', icone: 'refresh', onPress: onTentarNovamente }
          : undefined
      }
    />
  );
}
