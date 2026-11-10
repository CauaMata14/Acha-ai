import { createContext, ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { TipoAlerta } from '@/components/Alerta';
import { DadosToast, Toast } from '@/components/Toast';

const DURACAO_PADRAO_MS = 3000;

type ToastContextValue = {
  mostrar: (mensagem: string, tipo?: TipoAlerta, duracao?: number) => void;
  sucesso: (mensagem: string) => void;
  erro: (mensagem: string) => void;
  info: (mensagem: string) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);

/** Estado global das notificações: qualquer tela pode mostrar um toast com useToast(). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<DadosToast | null>(null);
  const proximoId = useRef(1);

  const mostrar = useCallback(
    (mensagem: string, tipo: TipoAlerta = 'info', duracao: number = DURACAO_PADRAO_MS) => {
      // Um toast novo substitui o anterior
      setToast({ id: proximoId.current++, tipo, mensagem, duracao });
    },
    []
  );

  const valor = useMemo<ToastContextValue>(
    () => ({
      mostrar,
      sucesso: (mensagem) => mostrar(mensagem, 'sucesso'),
      erro: (mensagem) => mostrar(mensagem, 'erro', 4000),
      info: (mensagem) => mostrar(mensagem, 'info'),
    }),
    [mostrar]
  );

  const remover = useCallback((id: number) => {
    setToast((atual) => (atual?.id === id ? null : atual));
  }, []);

  return (
    <ToastContext value={valor}>
      <View style={styles.flex}>
        {children}
        {toast && <Toast key={toast.id} toast={toast} onFim={() => remover(toast.id)} />}
      </View>
    </ToastContext>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
