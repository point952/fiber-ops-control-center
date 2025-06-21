
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, ArrowLeft } from 'lucide-react';

const AdminMigration: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('technician');
  const [name, setName] = useState('');

  const handleLogout = () => {
    logout();
    toast.success("Logout realizado com sucesso");
    navigate('/login');
  };

  const handleGoBack = () => {
    navigate('/admin');
  };

  const handleRoleChange = (value: string) => {
    setRole(value);
  };

  async function migrateAdmin() {
    setIsLoading(true);
    setError(null);
    setProgress('Iniciando migração do administrador...');

    try {
      const existingAdminResult = await supabase
        .from('profiles')
        .select('id')
        .eq('username', 'admin')
        .maybeSingle();

      if (existingAdminResult.data) {
        setError('O usuário administrador já existe no sistema.');
        setIsLoading(false);
        return;
      }

      setProgress('Criando usuário admin no Auth...');

      // Create user with explicit typing to avoid deep type inference
      const signUpData = {
        email: 'admin@fiberops.com',
        password: '#point#123'
      };

      const { data: authData, error: authError } = await supabase.auth.signUp(signUpData);

      if (authError) {
        console.error('Erro ao criar usuário auth:', authError);
        throw new Error(`Erro ao criar usuário: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('Não foi possível criar o usuário');
      }

      setProgress('Usuário admin criado no Auth...');

      const profileResult = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            username: 'admin',
            role: 'admin',
            name: 'Administrador',
            email: 'admin@fiberops.com'
          }
        ]);

      if (profileResult.error) {
        console.error('Erro ao criar perfil:', profileResult.error);
        throw new Error(`Erro ao criar perfil: ${profileResult.error.message}`);
      }

      setProgress('Perfil do admin criado com sucesso!');
      setIsLoading(false);
      toast.success('Usuário administrador migrado com sucesso!');
    } catch (err) {
      console.error('Erro durante a migração do admin:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido durante a migração';
      setError(errorMessage);
      setIsLoading(false);
      toast.error('Erro durante a migração do administrador');
    }
  }

  async function createNewUser() {
    setIsLoading(true);
    setError(null);
    setProgress('Criando novo usuário...');

    try {
      const existingUserResult = await supabase
        .from('profiles')
        .select('id')
        .or(`email.eq.${email},username.eq.${username}`)
        .maybeSingle();

      if (existingUserResult.data) {
        throw new Error('Já existe um usuário com este email ou nome de usuário');
      }

      // Create user with explicit typing to avoid deep type inference
      const signUpData = {
        email: email,
        password: password
      };

      const { data: authData, error: authError } = await supabase.auth.signUp(signUpData);

      if (authError) {
        throw new Error(`Erro ao criar usuário: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('Não foi possível criar o usuário');
      }

      const profileResult = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            username: username,
            role: role,
            name: name,
            email: email
          }
        ]);

      if (profileResult.error) {
        throw new Error(`Erro ao criar perfil: ${profileResult.error.message}`);
      }

      toast.success('Usuário criado com sucesso!');
      
      setEmail('');
      setUsername('');
      setPassword('');
      setRole('technician');
      setName('');
      setIsLoading(false);
    } catch (err) {
      console.error('Erro ao criar usuário:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      setIsLoading(false);
      toast.error('Erro ao criar usuário');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
      {/* Header with user info and logout */}
      <header className="bg-gradient-to-r from-blue-800 to-purple-700 text-white py-4 px-6 shadow-xl">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleGoBack}
              className="bg-white/10 text-white hover:bg-white/20 border-white/20"
            >
              <ArrowLeft className="mr-1" size={16} />
              Voltar
            </Button>
            <h1 className="text-xl font-bold">Migração do Administrador</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/80">
              {user?.name || 'Administrador'}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLogout}
              className="bg-red-800 text-white hover:bg-red-900 border-red-600"
            >
              <LogOut className="mr-1" size={16} />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Migração do Administrador</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">
              Este componente irá criar o usuário administrador padrão no Supabase.
              Certifique-se de que o Supabase está configurado corretamente antes de prosseguir.
            </p>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {progress && (
              <div className="p-4 bg-gray-100 rounded-md">
                <p className="text-sm">{progress}</p>
              </div>
            )}

            <Button 
              onClick={migrateAdmin} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Migrando...' : 'Criar Administrador'}
            </Button>

            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-semibold mb-4">Criar Novo Usuário</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                  />
                </div>

                <div>
                  <Label htmlFor="username">Nome de Usuário</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="nomeusuario"
                  />
                </div>

                <div>
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nome Completo"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                  />
                </div>

                <div>
                  <Label htmlFor="role">Papel</Label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="admin">Administrador</option>
                    <option value="operator">Operador</option>
                    <option value="technician">Técnico</option>
                  </select>
                </div>

                <Button 
                  onClick={createNewUser} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Criando...' : 'Criar Usuário'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminMigration;
