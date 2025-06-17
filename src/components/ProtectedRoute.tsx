import React, { useEffect, useMemo } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useOperations } from '@/context/operations/OperationsContext';
import { Loader } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { isLoading: operationsLoading } = useOperations();
  const location = useLocation();
  const navigate = useNavigate();

  // Memoize the role check to avoid unnecessary recalculations
  const hasAccess = useMemo(() => {
    if (!user || !allowedRoles) return true;
    return allowedRoles.includes(user.role);
  }, [user, allowedRoles]);

  useEffect(() => {
    if (!authLoading && !operationsLoading && isAuthenticated && user && !hasAccess) {
      switch (user.role) {
        case 'operator':
          navigate('/operador');
          break;
        case 'technician':
          navigate('/');
          break;
        case 'admin':
          navigate('/admin');
          break;
        default:
          navigate('/login');
      }
    }
  }, [authLoading, operationsLoading, isAuthenticated, user, hasAccess, navigate]);

  if (authLoading || operationsLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!hasAccess) {
    return null; // O redirecionamento será feito pelo useEffect
  }

  return <>{children}</>;
};

export default ProtectedRoute;
