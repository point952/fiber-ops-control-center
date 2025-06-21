
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const AdminMigration: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<string>('technician');
  const [name, setName] = useState<string>('');

  const migrateAdmin = async (): Promise<void> => {
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

      const authResult = await supabase.auth.signUp({
        email: 'admin@fiberops.com',
        password: '#point#123',
        options: {
          data: {
            username: 'admin',
            role: 'admin',
            name: 'Administrador'
          }
        }
      });

      if (authResult.error) {
        console.error('Erro ao criar usuário auth:', authResult.error);
        throw new Error(`Erro ao criar usuário: ${authResult.error.message}`);
      }

      if (!authResult.data.user) {
        throw new Error('Não foi possível criar o usuário');
      }

      setProgress('Usuário admin criado no Auth...');

      const profileResult = await supabase
        .from('profiles')
        .insert([
          {
            id: authResult.data.user.id,
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
  };

  const createNewUser = async (): Promise<void> => {
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

      const authResult = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            username: username,
            role: role,
            name: name
          }
        }
      });

      if (authResult.error) {
        throw new Error(`Erro ao criar usuário: ${authResult.error.message}`);
      }

      if (!authResult.data.user) {
        throw new Error('Não foi possível criar o usuário');
      }

      const profileResult = await supabase
        .from('profiles')
        .insert([
          {
            id: authResult.data.user.id,
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
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleRoleChange = (value: string) => {
    setRole(value);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
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
                  onChange={handleEmailChange}
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <Label htmlFor="username">Nome de Usuário</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={handleUsernameChange}
                  placeholder="nomeusuario"
                />
              </div>

              <div>
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={handleNameChange}
                  placeholder="Nome Completo"
                />
              </div>

              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="********"
                />
              </div>

              <div>
                <Label htmlFor="role">Papel</Label>
                <Select
                  value={role}
                  onValueChange={handleRoleChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o papel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="operator">Operador</SelectItem>
                    <SelectItem value="technician">Técnico</SelectItem>
                  </SelectContent>
                </Select>
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
  );
};

export default AdminMigration;
