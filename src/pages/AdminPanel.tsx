
import React, { useState, useEffect } from 'react';
import { useAuth, UserProfile } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import { Trash2, PencilLine, UserPlus } from 'lucide-react';

const AdminPanel = () => {
  const { user: currentUser, getAllUsers, addUser, updateUser, deleteUser } = useAuth();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Carregar usuários quando o componente montar
  useEffect(() => {
    loadUsers();
  }, []);
  
  const loadUsers = async () => {
    try {
      const usersList = await getAllUsers();
      setUsers(usersList);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error("Erro ao carregar usuários");
    }
  };
  
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState<{
    username: string;
    name: string;
    role: 'admin' | 'operator' | 'technician';
    password: string;
    email: string;
  }>({
    username: '',
    name: '',
    role: 'technician',
    password: '',
    email: '',
  });
  
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.name || !newUser.password || !newUser.email) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }
    
    setIsLoading(true);
    try {
      const success = await addUser(newUser.email, newUser.password, newUser.name, newUser.role);
      
      if (success) {
        await loadUsers();
        
        // Resetar formulário
        setNewUser({ username: '', name: '', role: 'technician', password: '', email: '' });
        setShowAddUser(false);
        toast.success("Usuário adicionado com sucesso");
      } else {
        toast.error("Erro ao adicionar usuário");
      }
    } catch (error) {
      toast.error("Erro ao adicionar usuário: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (currentUser?.id === id) {
      toast.error("Não é possível excluir o próprio usuário");
      return;
    }
    
    setIsLoading(true);
    try {
      const success = await deleteUser(id);
      
      if (success) {
        await loadUsers();
        toast.success("Usuário excluído com sucesso");
      } else {
        toast.error("Não foi possível excluir o usuário");
      }
    } catch (error) {
      toast.error("Erro ao excluir usuário");
    } finally {
      setIsLoading(false);
    }
  };

  const startEditUser = (user: UserProfile) => {
    if (currentUser?.id === user.id) {
      toast.error("Não é possível editar o próprio usuário");
      return;
    }
    setEditingUser(user);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    setIsLoading(true);
    try {
      const success = await updateUser(editingUser.id, editingUser);
      
      if (success) {
        await loadUsers();
        setEditingUser(null);
        toast.success("Usuário atualizado com sucesso");
      } else {
        toast.error("Não foi possível atualizar o usuário");
      }
    } catch (error) {
      toast.error("Erro ao atualizar usuário");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Painel de Administração</h1>
        <Button onClick={() => setShowAddUser(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Adicionar Usuário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuários do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.role === 'admin' ? 'Administrador' :
                     user.role === 'operator' ? 'Operador' : 'Técnico'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditUser(user)}
                        disabled={isLoading}
                      >
                        <PencilLine className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Adicionar Usuário */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Adicionar Novo Usuário</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="role">Função</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value: 'admin' | 'operator' | 'technician') => 
                    setNewUser({ ...newUser, role: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="operator">Operador</SelectItem>
                    <SelectItem value="technician">Técnico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowAddUser(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button onClick={handleAddUser} disabled={isLoading}>
                Adicionar
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Modal de Editar Usuário */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Editar Usuário</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nome</Label>
                <Input
                  id="edit-name"
                  value={editingUser.name || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="edit-role">Função</Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(value: 'admin' | 'operator' | 'technician') => 
                    setEditingUser({ ...editingUser, role: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="operator">Operador</SelectItem>
                    <SelectItem value="technician">Técnico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setEditingUser(null)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button onClick={handleUpdateUser} disabled={isLoading}>
                Salvar
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
