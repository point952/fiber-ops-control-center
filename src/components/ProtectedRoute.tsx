
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading, session } = useAuth();
  const location = useLocation();

  // Add debug logging for auth state
  useEffect(() => {
    console.log("ProtectedRoute auth state:", { 
      isAuthenticated, 
      user, 
      isLoading, 
      sessionExists: !!session,
      allowedRoles,
      currentPath: location.pathname 
    });
  }, [isAuthenticated, user, isLoading, session, allowedRoles, location]);

  // Check if the session is valid - this is important for handling token expiration
  useEffect(() => {
    if (!isLoading && session && new Date((session.expires_at || 0) * 1000) < new Date()) {
      console.log("Session expired, redirecting to login");
    }
  }, [session, isLoading]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page but save the current location
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    console.log(`User role ${user.role} not allowed, redirecting to appropriate page`);
    
    // If user doesn't have the required role, redirect based on their role
    if (user.role === 'operator') {
      return <Navigate to="/operador" replace />;
    } else if (user.role === 'technician') {
      return <Navigate to="/" replace />;
    } else if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    
    // Fallback to login if no matching role route
    return <Navigate to="/login" replace />;
  }

  console.log("Access granted to protected route");
  return <>{children}</>;
};

export default ProtectedRoute;
