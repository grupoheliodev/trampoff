import React, { useState, useEffect, useRef } from 'react';

export default function JobApplyModal({ open, job, onCancel, onSubmit }) {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (open) {
      setMessage('');
      setSubmitting(false);
      setTimeout(() => {
        textareaRef.current && textareaRef.current.focus();
      }, 10);
    }
  }, [open]);

  if (!open) return null;

  const canSubmit = message.trim().length > 0 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      setSubmitting(true);
      await onSubmit(message.trim());
    } finally {
      setSubmitting(false);
    }
  };

  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(12,16,28,0.65)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3000,
    backdropFilter: 'blur(6px)'
  };
  const boxStyle = {
    width: 'min(560px, 94%)',
    background: 'linear-gradient(180deg, var(--bg-gradient-start), var(--bg-gradient-end))',
    border: '1px solid var(--border-color)',
    borderRadius: 12,
    boxShadow: '0 16px 44px rgba(0,0,0,0.45)',
    padding: 20,
    color: 'var(--text-light)'
  };
  const titleStyle = { fontSize: 18, fontWeight: 800, marginBottom: 12, color: 'var(--saffron)' };
  const labelStyle = { fontSize: 14, color: 'var(--text-medium)', marginBottom: 6 };
  const actionsStyle = { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 14 };
  const btnBase = { padding: '10px 16px', borderRadius: 10, fontWeight: 800, cursor: 'pointer', border: 'none' };
  const btnCancel = { ...btnBase, background: 'transparent', color: 'var(--text-medium)' };
  const btnSubmit = { ...btnBase, background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-purple))', color: '#fff', boxShadow: '0 8px 22px rgba(99,102,241,0.25)', opacity: canSubmit ? 1 : 0.6 };

  return (
    <div style={overlayStyle} role="dialog" aria-modal="true" aria-labelledby="apply-title">
      <div style={boxStyle}>
        <div id="apply-title" style={titleStyle}>Aplicar à vaga{job?.title ? `: ${job.title}` : ''}</div>
        <div style={labelStyle}>Carta de apresentação (obrigatória)</div>
        <textarea
          ref={textareaRef}
          rows={6}
          required
          placeholder="Escreva uma breve mensagem explicando seu interesse e experiência"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div style={actionsStyle}>
          <button type="button" style={btnCancel} onClick={onCancel} aria-label="Cancelar">Cancelar</button>
          <button type="button" style={btnSubmit} disabled={!canSubmit} onClick={handleSubmit} aria-label="Enviar candidatura">
            {submitting ? 'Enviando...' : 'Enviar candidatura'}
          </button>
        </div>
      </div>
    </div>
  );
}
