
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

  if (requiredRole && user.role !== requiredRole) {
    console.log('User role mismatch. Required:', requiredRole, 'User role:', user.role);
    // Redirect based on user role to prevent infinite loops
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'operator':
        return <Navigate to="/operator" replace />;
      case 'technician':
        return <Navigate to="/" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  console.log('Access granted to protected route');
  return <>{children}</>;
};

export default ProtectedRoute;
