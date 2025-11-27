import React, { useEffect, useRef, useState } from 'react';

const overlayStyle = {
  position: 'fixed', inset: 0, background: 'rgba(10,10,15,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, backdropFilter: 'blur(4px)'
};
const boxStyle = { width: 'min(520px,94%)', background: 'linear-gradient(180deg,#ffffff,#fbfbfd)', borderRadius: 12, padding: 20, boxShadow: '0 10px 40px rgba(10,12,20,0.18)' };
const titleStyle = { fontSize: 18, fontWeight: 700, marginBottom: 8 };
const inputStyle = { width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 12 };
const actionsStyle = { display: 'flex', gap: 10, justifyContent: 'flex-end' };
const btnBase = { padding: '8px 14px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', border: 'none' };
const btnCancel = { ...btnBase, background: 'transparent', color: '#475569' };
const btnOk = { ...btnBase, background: 'linear-gradient(90deg,#6366f1,#8b5cf6)', color: '#fff' };

export default function PromptModal({ open, title = 'Pergunta', message = '', defaultValue = '', mask = null, inputType = 'text', onCancel, onConfirm }) {
  const [value, setValue] = useState(defaultValue || '');
  const inputRef = useRef(null);

  const onlyDigits = (v) => (v || '').toString().replace(/\D/g, '');

  const formatCpfCnpj = (value) => {
    const digits = onlyDigits(value);
    if (!digits) return '';
    if (digits.length <= 11) {
      const d = digits.slice(0, 11);
      const part1 = d.slice(0, 3);
      const part2 = d.slice(3, 6);
      const part3 = d.slice(6, 9);
      const part4 = d.slice(9, 11);
      let formatted = '';
      if (part1) formatted += part1;
      if (part2) formatted += `.${part2}`;
      if (part3) formatted += `.${part3}`;
      if (part4) formatted += `-${part4}`;
      return formatted;
    }
    const d = digits.slice(0, 14);
    const p1 = d.slice(0, 2);
    const p2 = d.slice(2, 5);
    const p3 = d.slice(5, 8);
    const p4 = d.slice(8, 12);
    const p5 = d.slice(12, 14);
    let formatted = '';
    if (p1) formatted += p1;
    if (p2) formatted += `.${p2}`;
    if (p3) formatted += `.${p3}`;
    if (p4) formatted += `/${p4}`;
    if (p5) formatted += `-${p5}`;
    return formatted;
  };

  const formatPhone = (value) => {
    const d = onlyDigits(value);
    if (!d) return '';
    if (d.length <= 2) return `(${d}`;
    if (d.length <= 6) return `(${d.slice(0,2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6,10)}`;
    return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7,11)}`;
  };

  const formatMoney = (value) => {
    const d = onlyDigits(value);
    if (!d) return '';
    // keep cents
    const cents = d.length > 2 ? d.slice(-2) : d.padStart(2, '0');
    const whole = d.slice(0, d.length - 2) || '0';
    // format with thousands
    const withThousands = whole.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `R$ ${withThousands},${cents}`;
  };

  useEffect(() => {
    if (open) setValue(defaultValue || '');
  }, [open, defaultValue]);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => inputRef.current && inputRef.current.focus(), 10);
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel && onCancel();
      if (e.key === 'Enter') onConfirm && onConfirm(value);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel, onConfirm, value]);

  if (!open) return null;

  return (
    <div style={overlayStyle} role="dialog" aria-modal="true">
      <div style={boxStyle}>
        <div style={titleStyle}>{title}</div>
        <div style={{ marginBottom: 12, color: '#334155' }}>{message}</div>
        <input
          ref={inputRef}
          style={inputStyle}
          value={value}
          onChange={(e) => {
            let v = e.target.value;
            if (mask === 'cpfcnpj') v = formatCpfCnpj(v);
            if (mask === 'phone') v = formatPhone(v);
            if (mask === 'money') v = formatMoney(v);
            setValue(v);
          }}
          type={inputType}
        />
        <div style={actionsStyle}>
          <button type="button" style={btnCancel} onClick={onCancel}>Cancelar</button>
          <button type="button" style={btnOk} onClick={() => onConfirm && onConfirm(value)}>OK</button>
        </div>
      </div>
    </div>
  );
}
