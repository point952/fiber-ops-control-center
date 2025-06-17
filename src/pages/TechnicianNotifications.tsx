
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Bell, Check, RefreshCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TechnicianNotifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  if (!user) {
    navigate('/login');
    return null;
  }
  
  const handleBack = () => {
    navigate('/');
  };

  const markAllAsRead = () => {
    toast({
      title: "Em desenvolvimento",
      description: "A funcionalidade de marcar como lida estará disponível em breve.",
    });
  };

  const loadNotifications = () => {
    toast({
      title: "Atualizando",
      description: "Verificando novas notificações...",
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Voltar ao Menu
          </Button>
          <div>
            <h1 className="text-3xl font-bold mb-1">Notificações</h1>
            <p className="text-gray-600">Acompanhe atualizações e novidades</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={markAllAsRead}
            className="flex items-center gap-2"
          >
            <Check size={16} />
            Marcar todas como lidas
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={loadNotifications} 
            className="flex items-center gap-2"
          >
            <RefreshCcw size={16} />
            Atualizar
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <div className="bg-amber-100 p-6 rounded-full">
              <Bell className="h-16 w-16 text-amber-500" />
            </div>
            <h2 className="text-2xl font-medium text-gray-700">Centro de Notificações</h2>
            <p className="text-gray-500 max-w-md">
              O sistema de notificações para acompanhamento de solicitações será implementado em breve.
              Você receberá alertas sobre respostas de operadores e novas atribuições.
            </p>
            <Button 
              variant="outline" 
              onClick={() => toast({
                title: "Em desenvolvimento",
                description: "O sistema de notificações estará disponível em breve.",
              })}
              className="mt-4"
            >
              Verificar Novamente
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TechnicianNotifications;
