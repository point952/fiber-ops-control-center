
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TechnicianMessages = () => {
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
            <ArrowLeft size={18} />
            Voltar ao Menu
          </Button>
          <div>
            <h1 className="text-3xl font-bold mb-1">Mensagens</h1>
            <p className="text-gray-600">Sistema de comunicação com operadores</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <div className="bg-blue-100 p-6 rounded-full">
              <MessageSquare className="h-16 w-16 text-blue-500" />
            </div>
            <h2 className="text-2xl font-medium text-gray-700">Sistema de Mensagens</h2>
            <p className="text-gray-500 max-w-md">
              O sistema de mensagens para comunicação com operadores será implementado em breve.
              Esta funcionalidade permitirá a troca de informações sobre operações em andamento.
            </p>
            <Button 
              variant="outline" 
              onClick={() => toast({
                title: "Em desenvolvimento",
                description: "O sistema de mensagens estará disponível em breve.",
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

export default TechnicianMessages;
