import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { OperationsProvider } from "./context/operations/OperationsContext";
import Index from "./pages/Index";
import OperationsView from "./pages/OperationsView";
import NotFound from "./pages/NotFound";
import OperatorPanel from "./pages/OperatorPanel";
import Login from "./pages/Login";
import AdminPanel from "./pages/AdminPanel";
import ProtectedRoute from "./components/ProtectedRoute";
import TechnicianHistory from './pages/TechnicianHistory';
import TechnicianNotifications from './pages/TechnicianNotifications';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <OperationsProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/operations" element={<OperationsView />} />
              <Route
                path="/operator"
                element={
                  <ProtectedRoute>
                    <OperatorPanel />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminPanel />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/technician/history"
                element={
                  <ProtectedRoute>
                    <TechnicianHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/technician/notifications"
                element={
                  <ProtectedRoute>
                    <TechnicianNotifications />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </OperationsProvider>
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
