// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
// Mude esta linha:
import { HashRouter } from 'react-router-dom'; // 👈 De BrowserRouter para HashRouter
import { AuthProvider } from './context/AuthContext.jsx';
import App from './App.jsx';
import ConfirmProvider from './components/ConfirmProvider.jsx';
import AlertProvider from './components/AlertProvider.jsx';
import PromptProvider from './components/PromptProvider.jsx';

import './assets/styles/index.css';
import './assets/styles/animations.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* E mude aqui também: */}
    <HashRouter>
      <AuthProvider>
        <AlertProvider>
          <ConfirmProvider>
            <PromptProvider>
              <App />
            </PromptProvider>
          </ConfirmProvider>
        </AlertProvider>
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>
);

// Registrar service worker (PWA)
// Usa import.meta.env.BASE_URL para respeitar o `base` do Vite (ex: '/trampoff/')
// Em desenvolvimento, evitar registrar SW para impedir cache de bundles antigos
if (!import.meta.env.DEV && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swPath = `${import.meta.env.BASE_URL}service-worker.js`;
    navigator.serviceWorker.register(swPath)
      .then((registration) => {
        console.log('ServiceWorker registrado com sucesso:', registration.scope);
      })
      .catch((err) => {
        console.warn('Falha ao registrar ServiceWorker:', err);
      });
  });
}

// Forçar layout horizontal dos cards na tela inicial
function applySelectionLayout() {
  try {
    const isIndex = !window.location.hash || window.location.hash === '#/' || window.location.hash === '#';
    document.documentElement.classList.toggle('selection-horizontal', !!isIndex);
  } catch (e) {}
}
applySelectionLayout();
window.addEventListener('hashchange', applySelectionLayout);