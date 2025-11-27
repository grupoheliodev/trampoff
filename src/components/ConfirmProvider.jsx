import React, { createContext, useCallback, useContext, useState } from 'react';
import ConfirmModal from './ConfirmModal';

const ConfirmContext = createContext(() => Promise.resolve(false));

export function ConfirmProvider({ children }) {
  const [opts, setOpts] = useState(null);
  const [resolver, setResolver] = useState(null);

  const confirm = useCallback((options = {}) => {
    return new Promise((res) => {
      setOpts({
        title: options.title || options.header || 'Confirmação',
        message: options.message || options.text || '',
        confirmText: options.confirmText || 'Confirmar',
        cancelText: options.cancelText || 'Cancelar'
      });
      setResolver(() => res);
    });
  }, []);

  const handleCancel = useCallback(() => {
    if (resolver) resolver(false);
    setOpts(null);
    setResolver(null);
  }, [resolver]);

  const handleConfirm = useCallback(() => {
    if (resolver) resolver(true);
    setOpts(null);
    setResolver(null);
  }, [resolver]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmModal
        open={!!opts}
        title={opts?.title}
        message={opts?.message}
        confirmText={opts?.confirmText}
        cancelText={opts?.cancelText}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => useContext(ConfirmContext);

export default ConfirmProvider;
