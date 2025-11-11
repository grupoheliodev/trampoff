import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'trampoff_a11y_prefs';

const defaultPrefs = {
  textScale: 1.0,
  highContrast: false,
  reduceMotion: false,
  highlightLinks: true,
  colorBlindMode: 'none', // none | protanopia | deuteranopia | tritanopia | achromatopsia
};

function applyPrefs(p) {
  const body = document.body;
  // apply text scale via CSS variable for fine-grained control
  try { document.documentElement.style.setProperty('--a11y-scale', String(p.textScale || 1)); } catch (e) {}
  if (p.highContrast) body.classList.add('a11y-high-contrast'); else body.classList.remove('a11y-high-contrast');
  if (p.reduceMotion) body.classList.add('a11y-reduce-motion'); else body.classList.remove('a11y-reduce-motion');
  if (p.highlightLinks) body.classList.add('a11y-highlight-links'); else body.classList.remove('a11y-highlight-links');

  // color blind modes as classes
  body.classList.remove('a11y-cvd-protanopia','a11y-cvd-deuteranopia','a11y-cvd-tritanopia','a11y-cvd-achromatopsia');
  if (p.colorBlindMode && p.colorBlindMode !== 'none') {
    body.classList.add(`a11y-cvd-${p.colorBlindMode}`);
  }
}

export default function AccessibilityPanel() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultPrefs; } catch (e) { return defaultPrefs; }
  });

  useEffect(() => {
    applyPrefs(prefs);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch (e) {}
  }, [prefs]);

  useEffect(() => {
    // apply on mount
    applyPrefs(prefs);
  }, []);

  const toggle = (key) => setPrefs(prev => ({ ...prev, [key]: !prev[key] }));

  const setTextScale = (value) => setPrefs(prev => ({ ...prev, textScale: Number(value) }));

  return (
    <div className={`a11y-panel ${open ? 'open' : ''}`} aria-hidden={!open}>
      <button className="a11y-toggle" aria-label="Acessibilidade" onClick={() => setOpen(s => !s)}>⚙️</button>
      <div className="a11y-body" role="dialog" aria-label="Painel de Acessibilidade">
        <h4>Acessibilidade</h4>

        <div className="a11y-options-grid">
          <div className="a11y-option-btn" style={{ alignItems: 'center', gap: '10px' }}>
            <span className="a11y-ico">A</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span className="a11y-label">Tamanho do Texto</span>
                <strong aria-live="polite">{Math.round((prefs.textScale || 1) * 100)}%</strong>
              </div>
              <input
                type="range"
                min="1"
                max="1.5"
                step="0.05"
                value={prefs.textScale}
                onChange={(e) => setTextScale(e.target.value)}
                aria-label="Ajustar tamanho do texto"
              />
            </div>
          </div>

          <button
            className={`a11y-option-btn ${prefs.highContrast ? 'active' : ''}`}
            aria-pressed={prefs.highContrast}
            onClick={() => toggle('highContrast')}
            title="Alto contraste"
          >
            <span className="a11y-ico">◼︎</span>
            <span className="a11y-label">Alto Contraste</span>
          </button>

          <button
            className={`a11y-option-btn ${prefs.reduceMotion ? 'active' : ''}`}
            aria-pressed={prefs.reduceMotion}
            onClick={() => toggle('reduceMotion')}
            title="Reduzir animações"
          >
            <span className="a11y-ico">↯</span>
            <span className="a11y-label">Reduzir Animações</span>
          </button>

          <button
            className={`a11y-option-btn ${prefs.highlightLinks ? 'active' : ''}`}
            aria-pressed={prefs.highlightLinks}
            onClick={() => toggle('highlightLinks')}
            title="Destacar links"
          >
            <span className="a11y-ico">🔗</span>
            <span className="a11y-label">Destacar Links</span>
          </button>
        </div>

        <fieldset className="a11y-fieldset">
          <legend>Simular Daltonismo</legend>
          <div className="a11y-cvd-row">
            <select value={prefs.colorBlindMode} onChange={(e) => setPrefs(prev => ({ ...prev, colorBlindMode: e.target.value }))} aria-label="Modo de Daltonismo">
              <option value="none">Nenhum</option>
              <option value="protanopia">Protanopia</option>
              <option value="deuteranopia">Deuteranopia</option>
              <option value="tritanopia">Tritanopia</option>
              <option value="achromatopsia">Acromatopsia (grayscale)</option>
            </select>
            <button className="a11y-option-small" onClick={() => setPrefs(defaultPrefs)} aria-label="Restaurar preferências">Restaurar</button>
          </div>
        </fieldset>

        <div className="a11y-actions">
          <button onClick={() => { setPrefs(defaultPrefs); applyPrefs(defaultPrefs); }} className="reset-button">Restaurar Tudo</button>
        </div>
      </div>
    </div>
  );
}
