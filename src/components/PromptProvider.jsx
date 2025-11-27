import React, { createContext, useCallback, useContext, useState } from 'react';
import PromptModal from './PromptModal';

const PromptContext = createContext(() => Promise.resolve(null));

export function PromptProvider({ children }) {
  const [opts, setOpts] = useState(null);
  const [resolver, setResolver] = useState(null);

  const prompt = useCallback((options = {}) => {
    const message = typeof options === 'string' ? options : (options.message || '');
    const title = typeof options === 'string' ? 'Pergunta' : (options.title || 'Pergunta');
    const defaultValue = options.defaultValue || '';
    const mask = typeof options === 'string' ? null : (options.mask || null);
    const inputType = typeof options === 'string' ? 'text' : (options.inputType || 'text');
    return new Promise((res) => {
      setOpts({ title, message, defaultValue, mask, inputType });
      setResolver(() => res);
    });
  }, []);

  const handleCancel = useCallback(() => {
    if (resolver) resolver(null);
    setOpts(null);
    setResolver(null);
  }, [resolver]);

  const handleConfirm = useCallback((value) => {
    if (resolver) resolver(value);
    setOpts(null);
    setResolver(null);
  }, [resolver]);

  return (
    <PromptContext.Provider value={prompt}>
      {children}
      <PromptModal
        open={!!opts}
        title={opts?.title}
        message={opts?.message}
        defaultValue={opts?.defaultValue}
        mask={opts?.mask}
        inputType={opts?.inputType}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    </PromptContext.Provider>
  );
}

export const usePrompt = () => useContext(PromptContext);

export default PromptProvider;
