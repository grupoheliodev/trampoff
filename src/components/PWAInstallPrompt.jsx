import React, { useEffect, useState } from 'react';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  // not showing manual install instructions per user request; only native install will be offered

  useEffect(() => {
    const beforeInstallHandler = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const appInstalledHandler = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', beforeInstallHandler);
    window.addEventListener('appinstalled', appInstalledHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstallHandler);
      window.removeEventListener('appinstalled', appInstalledHandler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    try {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setInstalled(true);
      }
      setDeferredPrompt(null);
    } catch (err) {
      // ignore
      setDeferredPrompt(null);
    }
  };

  const handleDownloadClick = () => {
    // Try to trigger native prompt if available; otherwise do nothing (no manual instructions)
    if (deferredPrompt) handleInstallClick();
  };

  if (installed) {
    return (
      <div className="pwa-install">
        <p>Aplicativo instalado ✅</p>
      </div>
    );
  }

  // Se o navegador suporta o prompt de instalação, oferecemos o botão nativo
  // Além disso, sempre mostramos um botão de "Baixar/Instalar aplicativo" que tenta acionar o prompt
  return (
    <div className="pwa-install">
      {deferredPrompt && (
        <div style={{ marginBottom: 8 }}>
          <button className="card-button" onClick={handleInstallClick} aria-label="Instalar aplicativo">
            🚀 Instalar aplicativo
          </button>
        </div>
      )}

      {!deferredPrompt && !installed && (
        <p style={{ opacity: 0.8 }}>Instalação não disponível no momento.</p>
      )}

      <button className="card-button" onClick={handleDownloadClick} aria-label="Baixar ou instalar aplicativo">
        📥 Instalar aplicativo
      </button>
    </div>
  );
};

export default PWAInstallPrompt;
