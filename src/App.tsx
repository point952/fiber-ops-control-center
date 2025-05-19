import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import Header from './components/Header';
import Footer from './components/Footer';
import OperatorHeader from './components/Operator/OperatorHeader';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected routes for technicians */}
        <Route path="/" element={
          <ProtectedRoute allowedRoles={['technician', 'admin']}>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">
                <Outlet />
              </main>
              <Footer />
            </div>
          </ProtectedRoute>
        }>
          <Route index element={<div>Dashboard do Técnico</div>} />
          <Route path="cto" element={<div>Análise de CTO</div>} />
          <Route path="ceo" element={<div>Análise de CEO</div>} />
          <Route path="profile" element={<div>Perfil do Usuário</div>} />
        </Route>
        
        {/* Protected routes for operators */}
        <Route path="/operador" element={
          <ProtectedRoute allowedRoles={['operator', 'admin']}>
            <div className="flex min-h-screen flex-col">
              <OperatorHeader />
              <main className="flex-1">
                <Outlet />
              </main>
              <Footer />
            </div>
          </ProtectedRoute>
        }>
          <Route index element={<div>Dashboard do Operador</div>} />
          <Route path="operations" element={<div>Operações</div>} />
          <Route path="reports" element={<div>Relatórios</div>} />
        </Route>
        
        {/* Protected routes for admin */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">
                <Outlet />
              </main>
              <Footer />
            </div>
          </ProtectedRoute>
        }>
          <Route index element={<div>Dashboard do Admin</div>} />
          <Route path="users" element={<div>Gerenciar Usuários</div>} />
          <Route path="settings" element={<div>Configurações</div>} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
