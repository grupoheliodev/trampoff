import React, { useState, useMemo } from 'react';

const detectCardBrand = (num) => {
  if (!num) return 'unknown';
  const s = String(num).replace(/\s+/g, '');
  if (/^4/.test(s)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(s)) return 'mastercard';
  if (/^3[47]/.test(s)) return 'amex';
  if (/^6(?:011|5)/.test(s)) return 'discover';
  return 'unknown';
};

const brandLabel = (b) => {
  switch (b) {
    case 'visa': return 'Visa';
    case 'mastercard': return 'Mastercard';
    case 'amex': return 'American Express';
    case 'discover': return 'Discover';
    default: return 'Cartão';
  }
};

export default function CardForm({ onAdd, onCancel }) {
  // store digits-only in state for easier validation/limits
  const [number, setNumber] = useState('');
  const [name, setName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [error, setError] = useState('');

  const brand = useMemo(() => detectCardBrand(number), [number]);

  const maskNumber = (n) => {
    const digits = String(n || '').replace(/\D/g, '');
    const b = detectCardBrand(digits);
    if (b === 'amex') {
      // Amex: 4 - 6 - 5
      return digits.replace(/(\d{4})(\d{0,6})(\d{0,5})/, (m, p1, p2, p3) => {
        return [p1, p2, p3].filter(Boolean).join(' ').trim();
      }).trim();
    }
    // default: groups of 4
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };

  const getMaxDigitsFor = (digits) => {
    const b = detectCardBrand(digits);
    return b === 'amex' ? 15 : 16;
  };

  const getDisplayMaxLength = (digits) => {
    // display length includes spaces
    const max = getMaxDigitsFor(digits);
    const spaces = max === 15 ? 2 : 3; // Amex has 2 spaces, others 3 (for 16 digits)
    return max + spaces;
  };

  const handleNumberChange = (raw) => {
    const digitsOnly = String(raw).replace(/\D/g, '');
    const max = getMaxDigitsFor(digitsOnly);
    const limited = digitsOnly.slice(0, max);
    setNumber(limited);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const digits = String(number || '').replace(/\D/g, '');
    const brand = detectCardBrand(digits);
    const required = brand === 'amex' ? 15 : 16;
    if (digits.length < 13) return setError('Número do cartão inválido');
    // require full length for common brands
    if (digits.length !== required && digits.length !== 13 && digits.length !== 14) {
      // allow 13/14 as legacy lengths but prefer 16 (or 15 for AMEX)
      if (brand === 'amex' && digits.length !== 15) return setError('Número do cartão inválido para AMEX');
      if (brand !== 'amex' && digits.length < 13) return setError('Número do cartão inválido');
    }

    if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(expiry)) return setError('Validade inválida (MM/YY)');
    if (!name.trim()) return setError('Nome no cartão obrigatório');

    const last4 = digits.slice(-4);
    const card = { id: Date.now(), brand, last4, holder: name, expiry };
    onAdd && onAdd(card);
  };

  return (
    <form className="card-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Número do Cartão</label>
        <input
          className="card-input"
          type="text"
          inputMode="numeric"
          placeholder="1234 5678 9012 3456"
          value={maskNumber(number)}
          onChange={(e) => handleNumberChange(e.target.value)}
          maxLength={getDisplayMaxLength(number)}
        />
      </div>
      <div className="form-row" style={{display:'flex',gap:8}}>
        <div style={{flex:1}} className="form-group">
          <label>Nome no Cartão</label>
          <input className="card-input" type="text" placeholder="Nome como no cartão" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div style={{width:120}} className="form-group">
          <label>Validade (MM/YY)</label>
          <input
            className="card-input"
            type="text"
            placeholder="MM/YY"
            value={expiry}
            onChange={(e) => {
              // format as MM/YY and limit to 5 chars
              const raw = String(e.target.value).replace(/[^0-9]/g, '');
              const capped = raw.slice(0, 4);
              const formatted = capped.length > 2 ? capped.slice(0,2) + '/' + capped.slice(2) : capped;
              setExpiry(formatted);
            }}
            maxLength={5}
          />
        </div>
      </div>

      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,marginTop:10}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div className={`card-brand ${brand}`}>{brand === 'unknown' ? '●●●●' : brandLabel(brand)}</div>
          <small className="text-muted">Últimos: {number.replace(/\D/g,'').slice(-4) || '----'}</small>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
          <button type="submit" className="btn btn-primary">Salvar Cartão</button>
        </div>
      </div>
      {error && <div style={{color:'#ffb4a2',marginTop:8}}>{error}</div>}
    </form>
  );
}
