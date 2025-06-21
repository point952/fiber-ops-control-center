
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type UserRole = 'admin' | 'operator' | 'technician';

// Simplified interface to avoid deep type instantiation
interface NewUserFormData {
  email: string;
  username: string;
  password: string;
  role: UserRole;
  name: string;
}

const AdminMigration = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  // Initialize with explicit type annotation to avoid inference issues
  const [newUser, setNewUser] = useState<NewUserFormData>({
    email: '',
    username: '',
    password: '',
    role: 'technician' as UserRole,
    name: ''
  });

  const migrateAdmin = async () => {
    setIsLoading(true);
    setError(null);
    setProgress('Iniciando migração do administrador...');

    try {
      // Verificar se o usuário admin já existe
      const { data: existingAdmin } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', 'admin')
        .maybeSingle();

      if (existingAdmin) {
        setError('O usuário administrador já existe no sistema.');
        return;
      }

      setProgress('Criando usuário admin no Auth...');

      // Criar usuário admin no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
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

      if (authError) {
        console.error('Erro ao criar usuário auth:', authError);
        throw new Error(`Erro ao criar usuário: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('Não foi possível criar o usuário');
      }

      setProgress('Usuário admin criado no Auth...');

      // Criar perfil do admin no Supabase
      const { error: profileError } = await supabase
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

      if (profileError) {
        console.error('Erro ao criar perfil:', profileError);
        throw new Error(`Erro ao criar perfil: ${profileError.message}`);
      }

      setProgress('Perfil do admin criado com sucesso!');
      toast.success('Usuário administrador migrado com sucesso!');
    } catch (error) {
      console.error('Erro durante a migração do admin:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido durante a migração');
      toast.error('Erro durante a migração do administrador');
    } finally {
      setIsLoading(false);
    }
  };

  const createNewUser = async () => {
    setIsLoading(true);
    setError(null);
    setProgress('Criando novo usuário...');

    try {
      // Verificar se o usuário já existe
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .or(`email.eq.${newUser.email},username.eq.${newUser.username}`)
        .maybeSingle();

      if (existingUser) {
        throw new Error('Já existe um usuário com este email ou nome de usuário');
      }

      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            username: newUser.username,
            role: newUser.role,
            name: newUser.name
          }
        }
      });

      if (authError) {
        throw new Error(`Erro ao criar usuário: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('Não foi possível criar o usuário');
      }

      // Criar perfil no Supabase
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            username: newUser.username,
            role: newUser.role,
            name: newUser.name,
            email: newUser.email
          }
        ]);

      if (profileError) {
        throw new Error(`Erro ao criar perfil: ${profileError.message}`);
      }

      toast.success('Usuário criado com sucesso!');
      setNewUser({
        email: '',
        username: '',
        password: '',
        role: 'technician' as UserRole,
        name: ''
      });
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      toast.error('Erro ao criar usuário');
    } finally {
      setIsLoading(false);
    }
  };

  const updateEmail = (value: string) => {
    setNewUser(prev => ({ ...prev, email: value }));
  };

  const updateUsername = (value: string) => {
    setNewUser(prev => ({ ...prev, username: value }));
  };

  const updateName = (value: string) => {
    setNewUser(prev => ({ ...prev, name: value }));
  };

  const updatePassword = (value: string) => {
    setNewUser(prev => ({ ...prev, password: value }));
  };

  const updateRole = (value: string) => {
    setNewUser(prev => ({ ...prev, role: value as UserRole }));
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
                  value={newUser.email}
                  onChange={(e) => updateEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <Label htmlFor="username">Nome de Usuário</Label>
                <Input
                  id="username"
                  value={newUser.username}
                  onChange={(e) => updateUsername(e.target.value)}
                  placeholder="nomeusuario"
                />
              </div>

              <div>
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => updateName(e.target.value)}
                  placeholder="Nome Completo"
                />
              </div>

              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => updatePassword(e.target.value)}
                  placeholder="********"
                />
              </div>

              <div>
                <Label htmlFor="role">Papel</Label>
                <Select
                  value={newUser.role}
                  onValueChange={updateRole}
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
