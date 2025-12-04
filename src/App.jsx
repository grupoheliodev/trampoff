import React from 'react';
import AppRoutes from './AppRoutes';
import AccessibilityPanel from './components/AccessibilityPanel';

function App() {
  return (
    <>
      <AccessibilityPanel />
      <AppRoutes />
    </>
  );
}

export default App;