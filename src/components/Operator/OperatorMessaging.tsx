
import React, { useState, useEffect } from 'react';
import { useOperations } from '@/context/OperationContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bell, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

const OperatorMessaging = () => {
  const { operations, updateOperationFeedback } = useOperations();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [responseMap, setResponseMap] = useState<Record<string, string>>({});
  const [unreadResponses, setUnreadResponses] = useState<string[]>([]);
  
  // Filter operations with technician responses
  const operationsWithResponses = operations.filter(op => op.technicianResponse);
  
  // Group operations by type
  const installationResponses = operationsWithResponses.filter(op => op.type === 'installation');
  const ctoResponses = operationsWithResponses.filter(op => op.type === 'cto');
  const rmaResponses = operationsWithResponses.filter(op => op.type === 'rma');
  
  // Update unread responses whenever operations change
  useEffect(() => {
    const newUnreadResponses = operationsWithResponses
      .filter(op => !unreadResponses.includes(op.id))
      .map(op => op.id);
    
    if (newUnreadResponses.length > 0) {
      setUnreadResponses(prev => [...prev, ...newUnreadResponses]);
      
      if (!isOpen) {
        toast.info(`${newUnreadResponses.length} nova(s) resposta(s) de técnicos`, {
          action: {
            label: "Ver",
            onClick: () => setIsOpen(true)
          }
        });
      }
    }
  }, [operationsWithResponses, isOpen]);
  
  // Clear unread status when opening the messaging panel
  useEffect(() => {
    if (isOpen) {
      setUnreadResponses([]);
    }
  }, [isOpen]);
  
  const handleInputChange = (id: string, value: string) => {
    setResponseMap(prev => ({
      ...prev,
      [id]: value
    }));
  };
  
  const handleSubmitFeedback = (id: string) => {
    const feedback = responseMap[id];
    if (!feedback?.trim()) return;
    
    updateOperationFeedback(id, feedback);
    setResponseMap(prev => {
      const newMap = { ...prev };
      delete newMap[id];
      return newMap;
    });
    
    toast.success("Resposta enviada ao técnico");
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
  
  const renderOperations = (operations: any[]) => {
    if (operations.length === 0) {
      return (
        <div className="p-8 text-center text-gray-500">
          <p>Não há respostas de técnicos para exibir.</p>
        </div>
      );
    }
    
    return operations.map(op => (
      <div 
        key={op.id} 
        className={`mb-4 p-4 rounded-md ${
          unreadResponses.includes(op.id) ? 'bg-blue-50 border-l-4 border-blue-400' : 'bg-gray-50'
        }`}
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-medium flex items-center">
              {getDisplayName(op)}
              {unreadResponses.includes(op.id) && (
                <Badge variant="default" className="ml-2 bg-blue-500">Nova</Badge>
              )}
            </h4>
            <p className="text-sm text-gray-600">
              {getTypeLabel(op.type)} • {op.technician} • {
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
        
        <div className="bg-white p-3 rounded border mb-3">
          <p className="text-gray-800 mb-2 text-sm font-medium">Resposta do Técnico:</p>
          <p className="text-gray-700">{op.technicianResponse}</p>
        </div>
        
        {op.feedback ? (
          <div className="bg-green-50 p-3 rounded border">
            <p className="text-gray-800 mb-1 text-sm font-medium">Seu Feedback:</p>
            <p className="text-gray-700">{op.feedback}</p>
          </div>
        ) : (
          <div>
            <Textarea
              placeholder="Responder ao técnico..."
              value={responseMap[op.id] || ''}
              onChange={(e) => handleInputChange(op.id, e.target.value)}
              className="mb-2"
            />
            <Button 
              onClick={() => handleSubmitFeedback(op.id)}
              size="sm"
              className="w-full sm:w-auto"
            >
              Enviar Resposta
            </Button>
          </div>
        )}
      </div>
    ));
  };
  
  const hasUnread = unreadResponses.length > 0;

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <div className="fixed bottom-6 right-6 z-10">
            <Button 
              size="icon" 
              className={`h-14 w-14 rounded-full shadow-lg ${
                hasUnread ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-800'
              }`}
            >
              <div className="relative">
                <MessageSquare className="h-6 w-6" />
                {hasUnread && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadResponses.length}
                  </span>
                )}
              </div>
            </Button>
          </div>
        </SheetTrigger>
        
        <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>Mensagens dos Técnicos</SheetTitle>
          </SheetHeader>
          
          <Tabs 
            defaultValue="all" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col"
          >
            <TabsList className="grid grid-cols-4 px-4 pt-2">
              <TabsTrigger value="all" className="relative">
                Todos
                {hasUnread && <span className="absolute top-0 right-0 bg-red-500 h-2 w-2 rounded-full"></span>}
              </TabsTrigger>
              <TabsTrigger value="installation">Inst.</TabsTrigger>
              <TabsTrigger value="cto">CTO</TabsTrigger>
              <TabsTrigger value="rma">RMA</TabsTrigger>
            </TabsList>
            
            <ScrollArea className="flex-1 p-4">
              <TabsContent value="all" className="mt-0">
                {renderOperations(operationsWithResponses)}
              </TabsContent>
              
              <TabsContent value="installation" className="mt-0">
                {renderOperations(installationResponses)}
              </TabsContent>
              
              <TabsContent value="cto" className="mt-0">
                {renderOperations(ctoResponses)}
              </TabsContent>
              
              <TabsContent value="rma" className="mt-0">
                {renderOperations(rmaResponses)}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default OperatorMessaging;
