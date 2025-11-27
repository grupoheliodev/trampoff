import React, { useRef, useEffect } from 'react';

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(10, 10, 15, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 3000,
  backdropFilter: 'blur(4px)'
};

const boxStyle = {
  width: 'min(520px, 94%)',
  background: 'linear-gradient(180deg,#ffffff,#fbfbfd)',
  borderRadius: 12,
  boxShadow: '0 10px 40px rgba(10,12,20,0.18)',
  padding: 20,
  color: '#0b1220'
};

const titleStyle = { fontSize: 18, fontWeight: 700, marginBottom: 8 };
const textStyle = { fontSize: 14, color: '#334155', marginBottom: 16 };
const actionsStyle = { display: 'flex', gap: 10, justifyContent: 'flex-end' };
const btnBase = { padding: '8px 14px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', border: 'none' };
const btnCancel = { ...btnBase, background: 'transparent', color: '#475569' };
const btnConfirm = { ...btnBase, background: 'linear-gradient(90deg,#6366f1,#8b5cf6)', color: '#fff', boxShadow: '0 6px 18px rgba(99,102,241,0.18)' };

export default function ConfirmModal({ open, title = 'Confirmação', message = '', confirmText = 'Confirmar', cancelText = 'Cancelar', onCancel, onConfirm }) {
  const confirmRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    // foco no botão confirmar quando o modal abre
    setTimeout(() => {
      confirmRef.current && confirmRef.current.focus();
    }, 10);

    const onKey = (e) => {
      if (e.key === 'Escape') {
        onCancel && onCancel();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div style={overlayStyle} role="dialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-desc" ref={overlayRef}>
      <div style={boxStyle}>
        <div id="confirm-title" style={titleStyle}>{title}</div>
        <div id="confirm-desc" style={textStyle}>{message}</div>
        <div style={actionsStyle}>
          <button type="button" style={btnCancel} onClick={onCancel} aria-label="Cancelar">{cancelText}</button>
          <button ref={confirmRef} type="button" style={btnConfirm} onClick={onConfirm} aria-label="Confirmar">{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
