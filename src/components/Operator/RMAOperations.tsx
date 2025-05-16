
import React, { useState } from 'react';
import { useOperations } from '@/context/OperationContext';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Clock, 
  CheckCircle2, 
  User, 
  Send,
  MessageSquare,
  RefreshCcw,
  AlertCircle
} from 'lucide-react';

interface RMAOperationsProps {
  onClaimTask?: (operationId: string) => void;
}

const RMAOperations = ({ onClaimTask }: RMAOperationsProps) => {
  const { user } = useAuth();
  const { operations, updateOperationStatus, updateOperationFeedback, completeOperation } = useOperations();
  
  // Filter to show only RMA operations
  const rmaOperations = operations.filter(op => op.type === 'rma');
  
  // State for handling feedback text inputs
  const [feedbackText, setFeedbackText] = useState<Record<string, string>>({});
  
  // State to track expanded operations
  const [expandedOperations, setExpandedOperations] = useState<Record<string, boolean>>({});
  
  // Toggle expansion of an operation card
  const toggleExpand = (operationId: string) => {
    setExpandedOperations(prev => ({
      ...prev,
      [operationId]: !prev[operationId]
    }));
  };
  
  // Update feedback text for an operation
  const handleFeedbackChange = (operationId: string, text: string) => {
    setFeedbackText(prev => ({
      ...prev,
      [operationId]: text
    }));
  };
  
  // Send feedback to technician
  const sendFeedback = (operationId: string) => {
    const feedback = feedbackText[operationId];
    if (!feedback || feedback.trim() === '') {
      toast.error('Por favor, escreva um feedback antes de enviar');
      return;
    }
    
    updateOperationFeedback(operationId, feedback);
    toast.success('Feedback enviado com sucesso!');
    
    // Clear the feedback text
    setFeedbackText(prev => ({
      ...prev,
      [operationId]: ''
    }));
  };
  
  // Start working on an operation
  const startWorking = (operationId: string) => {
    updateOperationStatus(operationId, 'em_analise');
    toast.info('Análise de RMA iniciada');
  };
  
  // Complete an operation
  const handleComplete = (operationId: string) => {
    if (!user) return;
    
    completeOperation(operationId, user.name);
    toast.success('RMA processado com sucesso!');
  };
  
  // Check if current user is assigned to this operation
  const isAssignedToMe = (operation: any) => {
    return operation.assignedOperator === user?.name || operation.assignedOperator === user?.username;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">RMAs para Processamento</h2>
        <Badge variant="outline" className="bg-red-100 text-red-800">
          {rmaOperations.length} RMA(s)
        </Badge>
      </div>
      
      {rmaOperations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Não há pedidos de RMA pendentes</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {rmaOperations.map((operation) => (
            <Card 
              key={operation.id} 
              className={`overflow-hidden border ${
                operation.status === 'pendente' 
                  ? 'border-yellow-200' 
                  : operation.status === 'em_analise'
                    ? 'border-orange-300'
                    : 'border-green-300'
              } ${expandedOperations[operation.id] ? 'ring-2 ring-orange-400' : ''}`}
            >
              <CardContent className="p-0">
                {/* Header */}
                <div 
                  className={`p-4 cursor-pointer ${
                    operation.status === 'pendente' 
                      ? 'bg-yellow-50' 
                      : operation.status === 'em_analise'
                        ? 'bg-orange-50'
                        : 'bg-green-50'
                  }`}
                  onClick={() => toggleExpand(operation.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {operation.data.modelo || 'Dispositivo'} 
                      </h3>
                      <p className="text-sm text-gray-600">
                        Serial: {operation.data.serial || 'Não informado'}
                      </p>
                    </div>
                    <Badge variant={
                      operation.status === 'pendente' 
                        ? 'outline' 
                        : operation.status === 'em_analise'
                          ? 'secondary'
                          : 'success'
                    }>
                      {operation.status === 'pendente' 
                        ? 'Pendente' 
                        : operation.status === 'em_analise'
                          ? 'Em Análise'
                          : 'Finalizado'
                      }
                    </Badge>
                  </div>
                </div>

                {/* Expanded content */}
                {expandedOperations[operation.id] && (
                  <div className="p-4 border-t border-gray-100">
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Detalhes do RMA</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(operation.data).map(([key, value]) => (
                          <div key={key} className="flex space-x-2">
                            <span className="font-medium">{key}:</span>
                            <span className="text-gray-600">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <User className="h-4 w-4 mr-1" />
                        <span>Técnico: {operation.technician}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Criado em: {new Date(operation.createdAt).toLocaleString('pt-BR')}</span>
                      </div>
                    </div>

                    {/* Feedback / Communication Section */}
                    <div className="border-t border-gray-100 pt-4 mt-4">
                      <h4 className="text-sm font-medium mb-2 flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Comunicação com o Técnico
                      </h4>
                      
                      {operation.feedback && (
                        <div className="bg-blue-50 p-3 rounded mb-3">
                          <p className="text-xs text-blue-600 mb-1">Enviado ao técnico:</p>
                          <p className="text-sm">{operation.feedback}</p>
                        </div>
                      )}
                      
                      {operation.technicianResponse && (
                        <div className="bg-green-50 p-3 rounded mb-3">
                          <p className="text-xs text-green-600 mb-1">Resposta do técnico:</p>
                          <p className="text-sm">{operation.technicianResponse}</p>
                        </div>
                      )}
                      
                      <div className="flex items-end gap-2 mt-3">
                        <Textarea 
                          placeholder="Enviar feedback ou fazer pergunta ao técnico..." 
                          className="flex-1 text-sm"
                          value={feedbackText[operation.id] || ''}
                          onChange={(e) => handleFeedbackChange(operation.id, e.target.value)}
                        />
                        <Button 
                          size="sm" 
                          onClick={() => sendFeedback(operation.id)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Enviar
                        </Button>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4 mt-4 flex justify-between">
                      {operation.assignedOperator ? (
                        <div className="text-sm">
                          <span className="font-medium">Atribuído a:</span>
                          <span className="ml-1">
                            {operation.assignedOperator} {isAssignedToMe(operation) && '(você)'}
                          </span>
                        </div>
                      ) : (
                        <span></span>
                      )}
                      
                      <div className="flex space-x-2">
                        {!operation.assignedOperator && onClaimTask && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => onClaimTask(operation.id)}
                          >
                            Atribuir a mim
                          </Button>
                        )}
                        
                        {isAssignedToMe(operation) && operation.status === 'pendente' && (
                          <Button 
                            size="sm"
                            variant="outline"
                            className="bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100"
                            onClick={() => startWorking(operation.id)}
                          >
                            <RefreshCcw className="h-3 w-3 mr-1" />
                            Iniciar Análise
                          </Button>
                        )}
                        
                        {isAssignedToMe(operation) && operation.status === 'em_analise' && (
                          <Button 
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleComplete(operation.id)}
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Concluir RMA
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RMAOperations;
