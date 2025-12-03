import React from 'react';
import AppRoutes from './AppRoutes';
import AccessibilityPanel from './components/AccessibilityPanel';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AccessibilityPanel />
        <AppRoutes />
      </div>
    </AuthProvider>
  );
}

export default App;