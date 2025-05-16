
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.tsx'
import { OperationProvider } from './context/operations/OperationContext.tsx'

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <OperationProvider>
      <App />
    </OperationProvider>
  </AuthProvider>
);
