import React, { useEffect, useState, useRef, useCallback } from 'react';

const STORAGE_KEY = 'trampoff_a11y_prefs';

const defaultPrefs = {
  textScale: 1.0,
  highContrast: false,
  reduceMotion: false,
  // Por padrão desligado: usuário opta manualmente por destacar links
  highlightLinks: false,
  theme: 'system',
  colorBlindMode: 'none', // none | protanopia | deuteranopia | tritanopia | achromatopsia
};

function applyPrefs(p) {
  const root = document.documentElement;
  const body = document.body;
  const targets = [body, root].filter(Boolean);

  try { root.style.setProperty('--a11y-scale', String(p.textScale || 1)); } catch (e) {}

  const toggleClass = (condition, className) => {
    targets.forEach(el => {
      if (!el) return;
      if (condition) el.classList.add(className); else el.classList.remove(className);
    });
  };

  toggleClass(p.highContrast, 'a11y-high-contrast');
  toggleClass(p.reduceMotion, 'a11y-reduce-motion');
  toggleClass(p.highlightLinks, 'a11y-highlight-links');

  const colorBlindClasses = ['a11y-cvd-protanopia','a11y-cvd-deuteranopia','a11y-cvd-tritanopia','a11y-cvd-achromatopsia'];
  targets.forEach(el => { colorBlindClasses.forEach(cls => el.classList.remove(cls)); });
  if (p.colorBlindMode && p.colorBlindMode !== 'none') {
    toggleClass(true, `a11y-cvd-${p.colorBlindMode}`);
  }

  // theme handling
  const themePref = p.theme || 'system';
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const effectiveTheme = themePref === 'system' ? (prefersDark ? 'dark' : 'light') : themePref;
  root.setAttribute('data-theme', effectiveTheme);
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

  // draggable support
    const panelRef = useRef(null);
    const dragHandleRef = useRef(null);
    const [positionY, setPositionY] = useState(null);
    const dragData = useRef({ dragging: false, offsetY: 0 });

    const clampY = useCallback((rawY) => {
      if (typeof window === 'undefined') return rawY ?? null;
      const panel = panelRef.current;
      const viewportHeight = window.innerHeight || 0;
      const panelHeight = panel ? panel.offsetHeight : 0;
      const minY = 80;
      const maxY = Math.max(minY, viewportHeight - panelHeight - 80);
      if (typeof rawY !== 'number' || Number.isNaN(rawY)) return null;
      return Math.min(Math.max(rawY, minY), maxY);
    }, []);

      const startDrag = (e) => {
        const handle = dragHandleRef.current;
        const panel = panelRef.current;
        if (!panel || !handle) return;
        if (open) return;
        const target = e.target;
        if (target !== handle) return;
        e.preventDefault();
      const point = e.touches ? e.touches[0] : e;
      const rect = panel.getBoundingClientRect();
      dragData.current.dragging = true;
      dragData.current.offsetY = point.clientY - rect.top;
      document.addEventListener('mousemove', onDrag);
      document.addEventListener('mouseup', endDrag);
      document.addEventListener('touchmove', onDrag, { passive: false });
      document.addEventListener('touchend', endDrag);
  };

  const onDrag = (e) => {
      if (!dragData.current.dragging) return;
      e.preventDefault();
      const point = e.touches ? e.touches[0] : e;
      if (!point) return;
      const nextY = clampY(point.clientY - dragData.current.offsetY);
      if (nextY != null) setPositionY(nextY);
  };

  const endDrag = () => {
        dragData.current.dragging = false;
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('mouseup', endDrag);
        document.removeEventListener('touchmove', onDrag);
        document.removeEventListener('touchend', endDrag);
  };

  // close when clicking outside
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
        if (!panelRef.current) return;
        if (!panelRef.current.contains(e.target)) {
            setOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);
    return () => {
        document.removeEventListener('mousedown', handleClick);
        document.removeEventListener('touchstart', handleClick);
    };
  }, [open]);

  useEffect(() => {
      if (!open) return undefined;
      const handleResize = () => {
          setPositionY(prev => {
              if (prev == null) return prev;
              const clamped = clampY(prev);
              return clamped == null ? prev : clamped;
          });
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
  }, [open, clampY]);

  const topValue = positionY != null ? positionY : '30%';

  return (
    <div
      className={`a11y-panel ${open ? 'open' : ''}`}
      aria-hidden={!open}
      style={{ position: 'fixed', top: topValue, right: 14, zIndex: 1400 }}
      ref={panelRef}
    >
      <button
        ref={dragHandleRef}
        className="a11y-toggle"
        aria-label="Acessibilidade"
        onClick={() => setOpen(s => !s)}
        onMouseDown={startDrag}
        onTouchStart={startDrag}
      >⚙️</button>
      <div
        className="a11y-body"
        role="dialog"
        aria-label="Painel de Acessibilidade"
      >
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

          <button
            className={`a11y-option-btn ${prefs.theme === 'light' ? 'active' : ''}`}
            aria-pressed={prefs.theme === 'light'}
            onClick={() => setPrefs(prev => ({ ...prev, theme: prev.theme === 'light' ? 'system' : 'light' }))}
            title="Modo claro"
          >
            <span className="a11y-ico">🌞</span>
            <span className="a11y-label">Modo Claro</span>
          </button>

          <button
            className={`a11y-option-btn ${prefs.theme === 'dark' ? 'active' : ''}`}
            aria-pressed={prefs.theme === 'dark'}
            onClick={() => setPrefs(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'system' : 'dark' }))}
            title="Modo escuro"
          >
            <span className="a11y-ico">🌙</span>
            <span className="a11y-label">Modo Escuro</span>
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
