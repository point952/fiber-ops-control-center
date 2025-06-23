
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'operator' | 'technician';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute - Path:', location.pathname, 'isAuthenticated:', isAuthenticated, 'user:', user, 'isLoading:', isLoading, 'requiredRole:', requiredRole);

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-100 to-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Redirecionar para login se não autenticado
  if (!isAuthenticated || !user) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Se não há role específico requerido, permite acesso
  if (!requiredRole) {
    console.log('No specific role required, access granted');
    return <>{children}</>;
  }

  const userRole = user.role;

  // Verificar se o usuário tem a role necessária
  if (userRole !== requiredRole) {
    console.log('User role mismatch. Required:', requiredRole, 'User role:', userRole);
    
    // Redirecionar para a página apropriada baseada na role do usuário
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
    
    // Só redireciona se não estiver já no caminho correto
    if (location.pathname !== redirectPath) {
      console.log('Redirecting to:', redirectPath);
      return <Navigate to={redirectPath} replace />;
    }
  }

  console.log('Access granted to protected route');
  return <>{children}</>;
};

export default ProtectedRoute;
