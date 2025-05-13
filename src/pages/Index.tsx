
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
import MainMenu from '@/components/MainMenu';
import InstallationForm from '@/components/Installation/InstallationForm';
import CTOAnalysisForm from '@/components/CTO/CTOAnalysisForm';
import RMAForm from '@/components/RMA/RMAForm';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { useOperations } from '@/context/OperationContext';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type FormType = 'installation' | 'cto' | 'rma' | null;

const Index = () => {
  const [activeForm, setActiveForm] = useState<FormType>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { operations } = useOperations();
  const isMobile = useIsMobile();
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Filter operations for the current user
  const userOperations = operations.filter(op => 
    op.technician === user?.name || op.technician === user?.username
  );
  
  // Check for operations with feedback
  const operationsWithFeedback = userOperations.filter(op => op.feedback);
  const hasUnreadFeedback = operationsWithFeedback.length > 0;

  useEffect(() => {
    // Show toast for operations with feedback
    if (hasUnreadFeedback) {
      toast.info(`Você tem ${operationsWithFeedback.length} operação(ões) com feedback do operador.`, {
        duration: 5000,
        action: {
          label: "Ver",
          onClick: () => setShowNotifications(true),
        },
      });
    }
  }, [operationsWithFeedback.length]);

  const handleFormSelection = (type: FormType) => {
    setActiveForm(type);
  };

  const handleBackToMenu = () => {
    setActiveForm(null);
  };

  const renderContent = () => {
    if (activeForm === 'installation') {
      return <InstallationForm onBack={handleBackToMenu} />;
    } else if (activeForm === 'cto') {
      return <CTOAnalysisForm onBack={handleBackToMenu} />;
    } else if (activeForm === 'rma') {
      return <RMAForm onBack={handleBackToMenu} />;
    } else {
      return (
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center">
            <MainMenu 
              onSelect={handleFormSelection} 
              className="w-full"
            />
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Área do Técnico</h1>
          <p className="text-gray-600">
            {user ? `Bem-vindo, ${user.name}` : 'Bem-vindo'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <button 
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors relative"
              onClick={() => setShowNotifications(true)}
            >
              <Bell className="h-5 w-5 text-gray-700" />
              {hasUnreadFeedback && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
              )}
            </button>
          </div>
          
          {user?.role === 'admin' && (
            <Button 
              variant="outline" 
              className="bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200"
              onClick={() => navigate('/admin')}
            >
              Painel de Admin
            </Button>
          )}
          
          {(user?.role === 'admin' || user?.role === 'operator') && (
            <Button 
              variant="outline" 
              className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200"
              onClick={() => navigate('/operador')}
            >
              Painel do Operador
            </Button>
          )}
          
          <Button
            variant="outline" 
            className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200"
            onClick={logout}
          >
            Sair
          </Button>
        </div>
      </div>
      
      <main className="flex-grow">
        {renderContent()}
      </main>

      <Footer />
      
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Notificações e Feedback</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {operationsWithFeedback.length > 0 ? (
              operationsWithFeedback.map((op) => (
                <Card key={op.id} className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">
                        {op.type === 'installation' 
                          ? 'Instalação/Upgrade' 
                          : op.type === 'cto' 
                            ? 'Análise de CTO' 
                            : 'RMA'}
                      </h3>
                      <Badge>
                        {op.status.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {op.type === 'installation' 
                        ? `Cliente: ${op.data.Cliente || 'N/A'}`
                        : op.type === 'cto'
                          ? `CTO: ${op.data.cto || 'N/A'}`
                          : `Serial: ${op.data.serial || 'N/A'}`}
                    </p>
                    <div className="bg-white p-3 rounded border border-blue-200 mt-2">
                      <p className="text-sm font-medium mb-1 text-blue-800">
                        Feedback do operador:
                      </p>
                      <p className="text-sm">{op.feedback}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center py-8 text-gray-500">
                Não há notificações ou feedback no momento.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {isMobile && (
        <div className="fixed bottom-6 right-6">
          <button
            className="p-3 bg-blue-600 rounded-full shadow-lg text-white"
            onClick={() => setShowNotifications(true)}
          >
            <MessageSquare className="h-5 w-5" />
            {hasUnreadFeedback && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default Index;
