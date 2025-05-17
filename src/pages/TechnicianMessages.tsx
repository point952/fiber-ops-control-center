
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useOperations } from '@/context/OperationContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare, Send, User } from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';

const TechnicianMessages = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { operations, updateTechnicianResponse } = useOperations();
  const isMobile = useIsMobile();
  
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Filter operations with feedback from operators
  const operationsWithFeedback = operations.filter(op => op.feedback);
  
  // Group operations by type
  const installationFeedback = operationsWithFeedback.filter(op => op.type === 'installation');
  const ctoFeedback = operationsWithFeedback.filter(op => op.type === 'cto');
  const rmaFeedback = operationsWithFeedback.filter(op => op.type === 'rma');

  useEffect(() => {
    // Check for new feedback when the component mounts
    if (operationsWithFeedback.length > 0) {
      // Notification for new feedback
      const newFeedback = operationsWithFeedback.filter(op => !op.technicianResponse);
      if (newFeedback.length > 0) {
        toast.info(`Você tem ${newFeedback.length} nova(s) mensagem(ns)`, {
          duration: 5000,
        });
      }
    }
  }, []); // Empty dependency array ensures this runs only once on mount
  
  if (!user) {
    navigate('/login');
    return null;
  }
  
  const handleBack = () => {
    navigate('/');
  };
  
  const handleSendResponse = (operationId: string) => {
    if (!message.trim()) {
      toast.error("Por favor, escreva uma mensagem");
      return;
    }
    
    updateTechnicianResponse(operationId, message);
    setMessage('');
    toast.success("Resposta enviada ao operador");
  };
  
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'installation': return 'Instalação';
      case 'cto': return 'Análise de CTO';
      case 'rma': return 'RMA';
      default: return type;
    }
  };
  
  const getDisplayName = (operation: any) => {
    if (operation.type === 'installation' && operation.data.Cliente) {
      return operation.data.Cliente;
    } else if (operation.type === 'cto' && operation.data.cto) {
      return operation.data.cto;
    } else if (operation.type === 'rma' && operation.data.serial) {
      return operation.data.serial;
    }
    return 'N/A';
  };
  
  const renderMessages = (operations: any[]) => {
    if (operations.length === 0) {
      return (
        <div className="p-8 text-center text-gray-500">
          <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-2" />
          <p className="text-lg">Não há mensagens para exibir</p>
          <p className="text-sm">As mensagens dos operadores aparecerão aqui</p>
        </div>
      );
    }
    
    return operations.map(op => (
      <div 
        key={op.id} 
        className="mb-4 p-4 rounded-lg bg-white border shadow-sm"
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-medium flex items-center">
              {getDisplayName(op)}
              <Badge variant="outline" className="ml-2">
                {getTypeLabel(op.type)}
              </Badge>
            </h4>
            <p className="text-sm text-gray-600">
              Operador: {op.assignedOperator || 'Não atribuído'} • {
                new Date(op.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              }
            </p>
          </div>
        </div>
        
        <div className="bg-blue-50 p-3 rounded border mb-3">
          <p className="text-gray-800 mb-1 text-sm font-medium">Mensagem do Operador:</p>
          <p className="text-gray-700">{op.feedback}</p>
        </div>
        
        {op.technicianResponse ? (
          <div className="bg-green-50 p-3 rounded border">
            <p className="text-gray-800 mb-1 text-sm font-medium">Sua Resposta:</p>
            <p className="text-gray-700">{op.technicianResponse}</p>
          </div>
        ) : (
          <div>
            <Textarea
              placeholder="Digite sua resposta..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mb-2 resize-none"
              rows={3}
            />
            <Button 
              onClick={() => handleSendResponse(op.id)}
              className="w-full sm:w-auto"
            >
              <Send className="h-4 w-4 mr-2" />
              Enviar Resposta
            </Button>
          </div>
        )}
      </div>
    ));
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
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="all" className="relative">
                Todas
                {operationsWithFeedback.length > 0 && (
                  <Badge className="ml-2 bg-blue-500">{operationsWithFeedback.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="installation">
                Instalações
                {installationFeedback.length > 0 && (
                  <Badge className="ml-2 bg-blue-500">{installationFeedback.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="cto">
                CTOs
                {ctoFeedback.length > 0 && (
                  <Badge className="ml-2 bg-blue-500">{ctoFeedback.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="rma">
                RMAs
                {rmaFeedback.length > 0 && (
                  <Badge className="ml-2 bg-blue-500">{rmaFeedback.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            <div className="border rounded-md p-4 bg-gray-50">
              <ScrollArea className="h-[500px] pr-4">
                <TabsContent value="all" className="mt-0">
                  {renderMessages(operationsWithFeedback)}
                </TabsContent>
                
                <TabsContent value="installation" className="mt-0">
                  {renderMessages(installationFeedback)}
                </TabsContent>
                
                <TabsContent value="cto" className="mt-0">
                  {renderMessages(ctoFeedback)}
                </TabsContent>
                
                <TabsContent value="rma" className="mt-0">
                  {renderMessages(rmaFeedback)}
                </TabsContent>
              </ScrollArea>
            </div>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TechnicianMessages;
