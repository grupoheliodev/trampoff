import React, { useEffect, useState } from 'react';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

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

  const isIos = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
  };

  const isInStandaloneMode = () => ('standalone' in window.navigator) && (window.navigator.standalone);

  const handleDownloadClick = () => {
    // Tentar acionar o prompt se disponível
    if (deferredPrompt) {
      handleInstallClick();
      return;
    }

    // iOS não suporta beforeinstallprompt -> mostrar instruções específicas
    if (isIos() && !isInStandaloneMode()) {
      setShowIOSInstructions(true);
      return;
    }

    // Fallback: fornecer um download do manifest.json
    const link = document.createElement('a');
    link.href = '/manifest.json';
    link.download = 'manifest.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <button className="install-button" onClick={handleInstallClick}>
            Instalar aplicativo
          </button>
        </div>
      )}

      {!deferredPrompt && !installed && (
        <p>Instale o app: abra o menu do navegador e escolha "Adicionar à Tela Inicial" ou use o botão abaixo.</p>
      )}

      <button className="download-button" onClick={handleDownloadClick}>
        Baixar / Instalar aplicativo
      </button>

      {showIOSInstructions && (
        <div className="ios-instructions" style={{ marginTop: 12, border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
          <strong>Como adicionar à Tela Inicial (iPhone/iPad)</strong>
          <ol style={{ marginTop: 8 }}>
            <li>Toque no botão <em>Compartilhar</em> (ícone de quadrado com seta) no Safari.</li>
            <li>Selecione <em>Adicionar à Tela de Início</em>.</li>
            <li>Confirme tocando em <em>Adicionar</em>.</li>
          </ol>
          <button style={{ marginTop: 8 }} onClick={() => setShowIOSInstructions(false)}>Fechar</button>
        </div>
      )}

      {installed && (
        <div style={{ marginTop: 8 }}>
          <p>Aplicativo instalado ✅</p>
        </div>
      )}
    </div>
  );
};

export default PWAInstallPrompt;
