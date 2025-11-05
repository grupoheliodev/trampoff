// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
// Mude esta linha:
import { HashRouter } from 'react-router-dom'; // 👈 De BrowserRouter para HashRouter
import { AuthProvider } from './context/AuthContext.jsx';
import App from './App.jsx';

import './assets/styles/index.css';
import './assets/styles/animations.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* E mude aqui também: */}
    <HashRouter> 
      <AuthProvider>
        <App />
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>
);

// Registrar service worker (PWA)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        // Registration successful
        console.log('ServiceWorker registrado com sucesso:', registration.scope);
      })
      .catch((err) => {
        console.warn('Falha ao registrar ServiceWorker:', err);
      });
  });
}