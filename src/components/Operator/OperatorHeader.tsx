
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

const OperatorHeader = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();

  return (
    <header className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-4 px-6 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center">
            <span className="text-blue-800 font-bold text-lg">OP</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">Sistema de Gerenciamento</h1>
            <p className="text-sm opacity-80">Painel do Operador</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {!isMobile && (
            <span className="text-sm mr-2">
              {user?.name || 'Operador'}
            </span>
          )}
          
          {user?.role === 'admin' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/admin')}
              className="bg-purple-800 text-white hover:bg-purple-900 border-purple-600"
            >
              Painel Admin
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={logout}
            className="bg-red-800 text-white hover:bg-red-900 border-red-600"
          >
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
};

export default OperatorHeader;
