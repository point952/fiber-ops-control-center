
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const checkRoutePermission = useCallback((path: string, userRole: string): boolean => {
    if (path.startsWith('/admin')) return userRole === 'admin';
    if (path.startsWith('/operator')) return userRole === 'operator';
    if (path === '/') return userRole === 'technician';
    return true;
  }, []);

  // Redirect authenticated users
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      console.log('User authenticated, determining redirect path for role:', user.role);
      
      const from = (location.state as any)?.from?.pathname;
      
      let redirectPath = '/';
      
      switch (user.role) {
        case 'admin':
          redirectPath = '/admin';
          break;
        case 'operator':
          redirectPath = '/operator';
          break;
        case 'technician':
          redirectPath = '/';
          break;
        default:
          redirectPath = '/';
      }

      if (from && from !== '/login') {
        const hasPermission = checkRoutePermission(from, user.role);
        if (hasPermission) {
          redirectPath = from;
        }
      }
      
      console.log('Redirecting to:', redirectPath);
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, authLoading, navigate, location.state, checkRoutePermission]);

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || authLoading) return;
    
    setError('');
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      
      if (!success) {
        setError('Credenciais inválidas');
      }
      // Não precisa redirecionar aqui, o useEffect vai cuidar disso
    } catch (err) {
      console.error('Login error:', err);
      setError('Ocorreu um erro ao tentar fazer login');
    } finally {
      setIsLoading(false);
    }
  }, [email, password, login, isLoading, authLoading]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-100 to-gray-200 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Verificando autenticação...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Don't render the login form if user is authenticated
  if (isAuthenticated && user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-100 to-gray-200 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Redirecionando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-100 to-gray-200 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Sistema de Operações</CardTitle>
          <CardDescription>
            Faça login para acessar o sistema
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Insira seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Insira sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || authLoading || !email || !password}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </CardFooter>
        </form>
        
        <div className="p-6 pt-0 text-center text-sm text-gray-600">
          <p>Apenas usuários cadastrados podem acessar o sistema.</p>
          <p>Entre em contato com o administrador para criar uma conta.</p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
