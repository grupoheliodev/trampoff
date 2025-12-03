import React, { createContext, useCallback, useContext, useState } from 'react';
import AlertModal from './AlertModal';

const AlertContext = createContext(() => Promise.resolve());

export function AlertProvider({ children }) {
  const [opts, setOpts] = useState(null);
  const [resolver, setResolver] = useState(null);

  const alert = useCallback((options) => {
    const message = typeof options === 'string' ? options : (options.message || '');
    const title = typeof options === 'string' ? 'Aviso' : (options.title || 'Aviso');
    return new Promise((res) => {
      setOpts({ title, message });
      setResolver(() => res);
    });
  }, []);

  const handleClose = useCallback(() => {
    if (resolver) resolver();
    setOpts(null);
    setResolver(null);
  }, [resolver]);

  return (
    <AlertContext.Provider value={alert}>
      {children}
      <AlertModal open={!!opts} title={opts?.title} message={opts?.message} onClose={handleClose} />
    </AlertContext.Provider>
  );
}

export const useAlert = () => useContext(AlertContext);

export default AlertProvider;
