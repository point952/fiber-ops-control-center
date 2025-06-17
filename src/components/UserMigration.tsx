import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const UserMigration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState('');

  const migrateUsers = async () => {
    setIsLoading(true);
    setProgress('Iniciando migração...');

    try {
      // Buscar usuários do Supabase
      const { data: users, error: fetchError } = await supabase
        .from('profiles')
        .select('*');

      if (fetchError) throw fetchError;

      if (!users || users.length === 0) {
        throw new Error('Nenhum usuário encontrado no banco de dados');
      }

      setProgress(`Encontrados ${users.length} usuários para migrar`);

      // Migrar cada usuário
      for (const user of users) {
        try {
          // Atualizar perfil no Supabase
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              username: user.username,
              role: user.role,
              name: user.name,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);

          if (profileError) throw profileError;

          setProgress(`Usuário ${user.username} migrado com sucesso`);
        } catch (error) {
          console.error(`Erro ao migrar usuário ${user.username}:`, error);
          setProgress(`Erro ao migrar usuário ${user.username}`);
        }
      }

      toast.success('Migração concluída com sucesso!');
    } catch (error) {
      console.error('Erro durante a migração:', error);
      toast.error('Erro durante a migração');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Migração de Usuários</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500">
            Este componente irá migrar todos os usuários para o novo formato do Supabase.
            Certifique-se de que o Supabase está configurado corretamente antes de prosseguir.
          </p>
          
          {progress && (
            <div className="p-4 bg-gray-100 rounded-md">
              <p className="text-sm">{progress}</p>
            </div>
          )}

          <Button 
            onClick={migrateUsers} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Migrando...' : 'Iniciar Migração'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserMigration; 