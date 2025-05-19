
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import { Trash2, PencilLine, UserPlus } from 'lucide-react';

interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'operator' | 'technician';
}

const AdminPanel = () => {
  const { user: currentUser, getAllUsers, addUser, updateUser, deleteUser } = useAuth();
  const navigate = useNavigate();
  
  // Get users from AuthContext
  const [users, setUsers] = useState<User[]>([]);
  
  // Load users on component mount
  useEffect(() => {
    setUsers(getAllUsers());
  }, [getAllUsers]);
  
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState<Omit<User, 'id'> & { password: string }>({
    username: '',
    name: '',
    role: 'technician',
    password: '',
  });
  
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleAddUser = () => {
    if (!newUser.username || !newUser.name || !newUser.password) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }
    
    try {
      // Use AuthContext addUser function
      addUser(newUser);
      
      // Refresh users list
      setUsers(getAllUsers());
      
      // Reset form
      setNewUser({ username: '', name: '', role: 'technician', password: '' });
      setShowAddUser(false);
      toast.success("Usuário adicionado com sucesso");
    } catch (error) {
      toast.error("Erro ao adicionar usuário: " + (error as Error).message);
    }
  };

  const handleDeleteUser = (id: string) => {
    if (id === '1') {
      toast.error("Não é possível excluir o usuário administrador");
      return;
    }
    
    // Use AuthContext deleteUser function
    const success = deleteUser(id);
    
    if (success) {
      // Refresh users list
      setUsers(getAllUsers());
      toast.success("Usuário excluído com sucesso");
    } else {
      toast.error("Não foi possível excluir o usuário");
    }
  };

  const startEditUser = (user: User) => {
    if (user.id === '1') {
      toast.error("Não é possível editar o usuário administrador");
      return;
    }
    setEditingUser(user);
  };

  const handleSaveEdit = () => {
    if (!editingUser) return;
    
    // Use AuthContext updateUser function
    const success = updateUser(editingUser);
    
    if (success) {
      // Refresh users list
      setUsers(getAllUsers());
      setEditingUser(null);
      toast.success("Usuário atualizado com sucesso");
    } else {
      toast.error("Não foi possível atualizar o usuário");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="bg-gradient-to-r from-purple-700 to-purple-900 text-white py-4 px-6 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-purple-800 font-bold text-lg">AD</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Sistema de Gerenciamento</h1>
              <p className="text-sm opacity-80">Painel de Administração</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">
              Logado como: <strong>{currentUser?.name}</strong>
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/operador')}
              className="bg-purple-800 text-white hover:bg-purple-900 border-purple-600"
            >
              Painel Operador
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/')}
              className="bg-purple-800 text-white hover:bg-purple-900 border-purple-600"
            >
              Área Técnica
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <Card className="mb-8 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Gerenciamento de Usuários</CardTitle>
            <Button onClick={() => setShowAddUser(!showAddUser)}>
              <UserPlus className="mr-2 h-4 w-4" />
              {showAddUser ? "Cancelar" : "Adicionar Usuário"}
            </Button>
          </CardHeader>
          <CardContent>
            {showAddUser && (
              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                <div>
                  <Label htmlFor="username">Nome de Usuário</Label>
                  <Input
                    id="username"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    placeholder="Nome de usuário"
                  />
                </div>
                <div>
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Função</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value: 'admin' | 'operator' | 'technician') => 
                      setNewUser({ ...newUser, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma função" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technician">Técnico</SelectItem>
                      <SelectItem value="operator">Operador</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Senha"
                  />
                </div>
                <div className="col-span-full flex justify-end">
                  <Button onClick={handleAddUser}>Salvar Usuário</Button>
                </div>
              </div>
            )}

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nome de Usuário</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>
                        {editingUser?.id === user.id ? (
                          <Input
                            value={editingUser.username}
                            onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                          />
                        ) : (
                          user.username
                        )}
                      </TableCell>
                      <TableCell>
                        {editingUser?.id === user.id ? (
                          <Input
                            value={editingUser.name}
                            onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                          />
                        ) : (
                          user.name
                        )}
                      </TableCell>
                      <TableCell>
                        {editingUser?.id === user.id ? (
                          <Select
                            value={editingUser.role}
                            onValueChange={(value: 'admin' | 'operator' | 'technician') => 
                              setEditingUser({ ...editingUser, role: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="technician">Técnico</SelectItem>
                              <SelectItem value="operator">Operador</SelectItem>
                              <SelectItem value="admin">Administrador</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          user.role === 'admin' 
                            ? 'Administrador' 
                            : user.role === 'operator'
                              ? 'Operador'
                              : 'Técnico'
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {editingUser?.id === user.id ? (
                          <Button onClick={handleSaveEdit} size="sm">
                            Salvar
                          </Button>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <Button 
                              onClick={() => startEditUser(user)} 
                              size="icon" 
                              variant="outline"
                              disabled={user.id === '1'}
                            >
                              <PencilLine className="h-4 w-4" />
                            </Button>
                            <Button 
                              onClick={() => handleDeleteUser(user.id)} 
                              size="icon" 
                              variant="destructive"
                              disabled={user.id === '1'}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminPanel;
