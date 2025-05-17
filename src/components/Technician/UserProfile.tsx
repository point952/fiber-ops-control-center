
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";

interface UserProfileProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const handleSaveProfile = () => {
    // In a real app, this would connect to an API to update the user profile
    toast.success("Perfil atualizado com sucesso!");
  };
  
  const handleChangePassword = () => {
    if (!currentPassword) {
      toast.error("Senha atual é obrigatória");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("A nova senha e a confirmação não coincidem");
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    
    // In a real app, this would connect to an API to change the password
    toast.success("Senha alterada com sucesso!");
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };
  
  return (
    <div className="space-y-6 py-4">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Nome completo</Label>
          <Input 
            id="name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Seu nome"
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu.email@exemplo.com"
          />
        </div>
        
        <div className="grid gap-2">
          <Label>Função</Label>
          <Input 
            value={user.role === 'technician' ? 'Técnico' : user.role === 'admin' ? 'Administrador' : user.role} 
            disabled
            className="bg-gray-50"
          />
        </div>
        
        <Button onClick={handleSaveProfile} className="w-full mt-4">
          Salvar Alterações
        </Button>
      </div>
      
      <div className="border-t pt-4">
        <h3 className="font-medium text-lg mb-4">Alterar Senha</h3>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="currentPassword">Senha atual</Label>
            <Input 
              id="currentPassword" 
              type="password" 
              value={currentPassword} 
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Digite sua senha atual"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="newPassword">Nova senha</Label>
            <Input 
              id="newPassword" 
              type="password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Digite a nova senha"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirme a nova senha</Label>
            <Input 
              id="confirmPassword" 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Digite a nova senha novamente"
            />
          </div>
          
          <Button onClick={handleChangePassword} variant="outline" className="w-full mt-2">
            Alterar Senha
          </Button>
        </div>
      </div>
    </div>
  );
};
