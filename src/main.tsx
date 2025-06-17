import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext.tsx';
import { OperationsProvider } from './context/operations/OperationsContext';

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <OperationsProvider>
        <App />
      </OperationsProvider>
    </AuthProvider>
  </React.StrictMode>
);
