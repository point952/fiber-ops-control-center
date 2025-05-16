
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { OperationProvider } from './context/OperationContext.tsx'

createRoot(document.getElementById("root")!).render(
  <OperationProvider>
    <App />
  </OperationProvider>
);
