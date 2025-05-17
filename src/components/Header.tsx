
import React from 'react';
import { cn } from '@/lib/utils';
import { Settings, LogOut, UserCog } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";
import { useIsMobile } from '@/hooks/use-mobile';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleLogout = () => {
    logout();
    toast.success("Logout realizado com sucesso");
    navigate('/login');
  };

  const handleOperatorAccess = () => {
    navigate('/operador');
  };

  return (
    <header className={cn("bg-gradient-to-r from-blue-800 to-purple-700 text-white py-6 shadow-xl border-b border-white/10", className)}>
      <div className="container mx-auto flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
            <Settings className="h-7 w-7 animate-spin-slow text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">
              Sistema de Gerenciamento de Produção
            </span>
          </h1>
        </div>

        {user && (
          <div className="flex items-center gap-2">
            {!isMobile && (
              <span className="text-sm mr-2 text-white/80">
                {user.name || 'Usuário'}
              </span>
            )}
            
            {user.role === 'admin' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleOperatorAccess}
                className="bg-purple-800 text-white hover:bg-purple-900 border-purple-600"
              >
                <UserCog className="mr-1" size={16} />
                {!isMobile && "Painel Operador"}
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLogout}
              className="bg-red-800 text-white hover:bg-red-900 border-red-600"
            >
              <LogOut className="mr-1" size={16} />
              {!isMobile && "Sair"}
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
