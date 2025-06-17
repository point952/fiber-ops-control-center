
import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the previous location or default to appropriate route based on role
  const from = location.state?.from?.pathname || '/';

  // Debug log
  useEffect(() => {
    console.log("Login page auth state:", { 
      isAuthenticated, 
      userRole: user?.role, 
      previousPath: from 
    });
  }, [isAuthenticated, user, from]);

  // Redirect based on role if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log(`User authenticated as ${user.role}, redirecting...`);
      
      // Navigate to the previous location unless it was the login page
      if (from === '/login') {
        // Redirect based on user role
        if (user.role === 'operator') {
          navigate('/operador');
        } else if (user.role === 'technician') {
          navigate('/');
        } else if (user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/'); // Default fallback
        }
      } else {
        navigate(from);
      }
    }
  }, [isAuthenticated, user, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      console.log("Attempting login for:", email);
      const success = await login(email, password);
      
      if (success) {
        toast.success("Login realizado com sucesso!");
        console.log("Login successful");
        // Navigation will happen in the useEffect above
      } else {
        console.log("Login failed");
        setError('Usuário ou senha incorretos');
        toast.error("Falha no login. Verifique suas credenciais.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError('Ocorreu um erro ao tentar fazer login');
      toast.error("Erro ao realizar login.");
    } finally {
      setIsLoading(false);
    }
  };

  // If already authenticated, useEffect will handle redirection
  if (isAuthenticated && user) {
    return null; // Return null to avoid flickering, useEffect will handle navigation
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-100 to-gray-200 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Sistema de Gerenciamento</CardTitle>
          <CardDescription>
            Faça login para acessar o sistema
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" className="mb-4">
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
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;
