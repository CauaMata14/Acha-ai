import { useEffect, useState } from 'react';

/**
 * Só devolve `true` depois que `valor` ficar `true` por `ms` milissegundos seguidos.
 *
 * Usado no aviso de "sem conexão": ao abrir uma tela, o Firestore às vezes responde primeiro com o cache
 * do aparelho e, uma fração de segundo depois, com o servidor. Sem essa espera o aviso piscaria na tela.
 */
export function useConfirmadoApos(valor: boolean, ms = 2500) {
  const [confirmado, setConfirmado] = useState(false);

  useEffect(() => {
    if (!valor) {
      setConfirmado(false);
      return;
    }
    const timer = setTimeout(() => setConfirmado(true), ms);
    return () => clearTimeout(timer);
  }, [valor, ms]);

  return confirmado;
}
