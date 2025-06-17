
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <OperationsProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute requiredRole="technician">
                      <Index />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/operations"
                  element={
                    <ProtectedRoute>
                      <OperationsView />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/operator"
                  element={
                    <ProtectedRoute requiredRole="operator">
                      <OperatorPanel />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminPanel />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/technician/history"
                  element={
                    <ProtectedRoute requiredRole="technician">
                      <TechnicianHistory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/technician/notifications"
                  element={
                    <ProtectedRoute requiredRole="technician">
                      <TechnicianNotifications />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </OperationsProvider>
        </AuthProvider>
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
