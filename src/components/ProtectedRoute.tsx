
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'operator' | 'technician';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated, 'user:', user, 'isLoading:', isLoading, 'requiredRole:', requiredRole);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Se não há role específico requerido, permite acesso
  if (!requiredRole) {
    console.log('No specific role required, access granted');
    return <>{children}</>;
  }

  // Normalizar roles para corresponder ao banco de dados
  const normalizeRole = (role: string) => {
    if (role === 'operator' || role === 'operador') return 'operator';
    if (role === 'technician' || role === 'técnico') return 'technician';
    return role;
  };

  const userRole = normalizeRole(user.role);
  const normalizedRequiredRole = normalizeRole(requiredRole);

  if (userRole !== normalizedRequiredRole) {
    console.log('User role mismatch. Required:', normalizedRequiredRole, 'User role:', userRole);
    
    // Redirecionamento baseado na role do usuário
    const getRedirectPath = () => {
      switch (userRole) {
        case 'admin':
          return '/admin';
        case 'operator':
          return '/operator';
        case 'technician':
          return '/';
        default:
          return '/login';
      }
    };

    const redirectPath = getRedirectPath();
    console.log('Redirecting to:', redirectPath);
    return <Navigate to={redirectPath} replace />;
  }

  console.log('Access granted to protected route');
  return <>{children}</>;
};

export default ProtectedRoute;
