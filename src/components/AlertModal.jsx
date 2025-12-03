import React, { useEffect, useRef } from 'react';

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(2, 6, 23, 0.65)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 3000,
  backdropFilter: 'blur(4px)'
};

const boxStyle = {
  width: 'min(520px, 94%)',
  background: 'linear-gradient(180deg,#0b1220,#0f1a2b)',
  borderRadius: 12,
  boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
  padding: 20,
  color: '#e6eef8',
  border: '1px solid rgba(255,255,255,0.04)'
};

const titleStyle = { fontSize: 18, fontWeight: 700, marginBottom: 8 };
const textStyle = { fontSize: 14, color: '#cbd5e1', marginBottom: 16 };
const actionsStyle = { display: 'flex', gap: 10, justifyContent: 'flex-end' };
const btnBase = { padding: '8px 14px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', border: 'none' };
const btnOk = { ...btnBase, background: 'linear-gradient(90deg,#22272d,#394149)', color: '#fff', boxShadow: '0 6px 18px rgba(0,0,0,0.4)' };

export default function AlertModal({ open, title = 'Aviso', message = '', onClose }) {
  const okRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => okRef.current && okRef.current.focus(), 10);
    const onKey = (e) => { if (e.key === 'Escape') onClose && onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div style={overlayStyle} role="dialog" aria-modal="true" aria-labelledby="alert-title" aria-describedby="alert-desc">
      <div style={boxStyle}>
        <div id="alert-title" style={titleStyle}>{title}</div>
        <div id="alert-desc" style={textStyle}>{message}</div>
        <div style={actionsStyle}>
          <button ref={okRef} type="button" style={btnOk} onClick={onClose} aria-label="OK">OK</button>
        </div>
      </div>
    </div>
  );
}
