
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useOperations } from '@/context/operations/OperationsContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare } from 'lucide-react';
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
import { Operation } from '@/context/operations/types';

const OperatorMessaging: React.FC = () => {
  const { operations, updateOperationFeedback } = useOperations();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [responseMap, setResponseMap] = useState<Record<string, string>>({});
  const [unreadResponses, setUnreadResponses] = useState<string[]>([]);
  
  // Memoize filtered operations for better performance
  const operationsWithResponses = useMemo(() => 
    operations.filter(op => op.technician_response), 
    [operations]
  );
  
  const groupedOperations = useMemo(() => ({
    installation: operationsWithResponses.filter(op => op.type === 'installation'),
    cto: operationsWithResponses.filter(op => op.type === 'cto'),
    rma: operationsWithResponses.filter(op => op.type === 'rma')
  }), [operationsWithResponses]);
  
  // Update unread responses efficiently
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
  }, [operationsWithResponses, isOpen, unreadResponses]);
  
  // Clear unread status when opening the messaging panel
  useEffect(() => {
    if (isOpen) {
      setUnreadResponses([]);
    }
  }, [isOpen]);
  
  const handleInputChange = useCallback((id: string, value: string) => {
    setResponseMap(prev => ({
      ...prev,
      [id]: value
    }));
  }, []);
  
  const handleSubmitFeedback = useCallback((id: string) => {
    const feedback = responseMap[id];
    if (!feedback?.trim()) return;
    
    updateOperationFeedback(id, feedback);
    setResponseMap(prev => {
      const newMap = { ...prev };
      delete newMap[id];
      return newMap;
    });
    
    toast.success("Resposta enviada ao técnico");
  }, [responseMap, updateOperationFeedback]);
  
  const getTypeLabel = useCallback((type: string) => {
    const labels: Record<string, string> = {
      'installation': 'Instalação',
      'cto': 'Análise de CTO',
      'rma': 'RMA'
    };
    return labels[type] || type;
  }, []);
  
  const getDisplayName = useCallback((operation: Operation) => {
    if (operation.type === 'installation' && operation.data.Cliente) {
      return operation.data.Cliente;
    } else if (operation.type === 'cto' && operation.data.cto) {
      return operation.data.cto;
    } else if (operation.type === 'rma' && operation.data.serial) {
      return operation.data.serial;
    }
    return 'N/A';
  }, []);
  
  const OperationCard = React.memo(({ operation }: { operation: Operation }) => (
    <Card className={`mb-4 p-4 ${
      unreadResponses.includes(operation.id) ? 'bg-blue-50 border-l-4 border-blue-400' : 'bg-gray-50'
    }`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-medium flex items-center">
            {getDisplayName(operation)}
            {unreadResponses.includes(operation.id) && (
              <Badge variant="default" className="ml-2 bg-blue-500">Nova</Badge>
            )}
          </h4>
          <p className="text-sm text-gray-600">
            {getTypeLabel(operation.type)} • {operation.technician} • {
              new Date(operation.created_at).toLocaleDateString('pt-BR', {
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
        <p className="text-gray-700">{operation.technician_response}</p>
      </div>
      
      {operation.feedback ? (
        <div className="bg-green-50 p-3 rounded border">
          <p className="text-gray-800 mb-1 text-sm font-medium">Seu Feedback:</p>
          <p className="text-gray-700">{operation.feedback}</p>
        </div>
      ) : (
        <div>
          <Textarea
            placeholder="Responder ao técnico..."
            value={responseMap[operation.id] || ''}
            onChange={(e) => handleInputChange(operation.id, e.target.value)}
            className="mb-2"
          />
          <Button 
            onClick={() => handleSubmitFeedback(operation.id)}
            size="sm"
            className="w-full sm:w-auto"
          >
            Enviar Resposta
          </Button>
        </div>
      )}
    </Card>
  ));
  
  const renderOperations = useCallback((operations: Operation[]) => {
    if (operations.length === 0) {
      return (
        <div className="p-8 text-center text-gray-500">
          <p>Não há respostas de técnicos para exibir.</p>
        </div>
      );
    }
    
    return operations.map(op => (
      <OperationCard key={op.id} operation={op} />
    ));
  }, [responseMap, unreadResponses, handleInputChange, handleSubmitFeedback, getDisplayName, getTypeLabel]);
  
  const hasUnread = unreadResponses.length > 0;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <div className="fixed bottom-6 right-6 z-10">
          <Button 
            size="icon" 
            className={`h-14 w-14 rounded-full shadow-lg transition-all duration-200 ${
              hasUnread ? 'bg-blue-600 hover:bg-blue-700 animate-pulse' : 'bg-gray-700 hover:bg-gray-800'
            }`}
          >
            <div className="relative">
              <MessageSquare className="h-6 w-6" />
              {hasUnread && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
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
        
        <Tabs defaultValue="all" className="flex-1 flex flex-col">
          <TabsList className="p-4">
            <TabsTrigger value="all" className="relative">
              Todas
              {hasUnread && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadResponses.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="installation">Instalações</TabsTrigger>
            <TabsTrigger value="cto">CTOs</TabsTrigger>
            <TabsTrigger value="rma">RMAs</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="flex-1">
            <TabsContent value="all" className="p-4">
              {renderOperations(operationsWithResponses)}
            </TabsContent>
            <TabsContent value="installation" className="p-4">
              {renderOperations(groupedOperations.installation)}
            </TabsContent>
            <TabsContent value="cto" className="p-4">
              {renderOperations(groupedOperations.cto)}
            </TabsContent>
            <TabsContent value="rma" className="p-4">
              {renderOperations(groupedOperations.rma)}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default OperatorMessaging;
