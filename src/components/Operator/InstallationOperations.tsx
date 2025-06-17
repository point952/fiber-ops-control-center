import React, { useState, useEffect } from 'react';
import { useOperations } from '@/context/operations/OperationsContext';
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
  RefreshCcw
} from 'lucide-react';
import { Operation, OperationStatus } from '@/context/operations/types';

interface InstallationOperationsProps {
  onClaimTask?: (operationId: string) => void;
}

const InstallationOperations = ({ onClaimTask }: InstallationOperationsProps) => {
  const { user } = useAuth();
  const { operations, updateOperationStatus, updateOperationFeedback, completeOperation } = useOperations();
  
  // Filter to show only installation operations
  const installationOperations = operations.filter(op => op.type === 'installation');
  
  // Log operations for debugging
  useEffect(() => {
    console.log('Todas as operações:', operations);
    console.log('Operações de instalação:', installationOperations);
  }, [operations, installationOperations]);
  
  // State for handling feedback text inputs
  const [feedbackText, setFeedbackText] = useState<Record<string, string>>({});
  
  // State to track expanded operations
  const [expandedOperations, setExpandedOperations] = useState<Record<string, boolean>>({});
  
  // State to track operations in working state
  const [workingOperations, setWorkingOperations] = useState<Record<string, boolean>>({});
  
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
    updateOperationStatus(operationId, 'iniciando_provisionamento');
    setWorkingOperations(prev => ({
      ...prev,
      [operationId]: true
    }));
    toast.info('Provisionamento iniciado');
  };
  
  // Complete an operation
  const handleComplete = (operationId: string) => {
    if (!user) return;
    
    completeOperation(operationId, user.name);
    toast.success('Operação concluída com sucesso!');
    
    setWorkingOperations(prev => {
      const newState = { ...prev };
      delete newState[operationId];
      return newState;
    });
  };
  
  // Check if current user is assigned to this operation
  const isAssignedToMe = (operation: any) => {
    return operation.assigned_operator === user?.name || operation.assigned_operator === user?.username;
  };

  const handleStatusChange = async (id: string, newStatus: OperationStatus) => {
    try {
      await updateOperationStatus(id, newStatus);
      toast.success('Status atualizado com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Operações de Instalação/Upgrade</h2>
        <Badge variant="outline" className="bg-blue-100 text-blue-800">
          {installationOperations.length} operação(ões)
        </Badge>
      </div>
      
      {installationOperations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Não há operações de instalação pendentes</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {installationOperations.map((operation) => (
            <Card 
              key={operation.id} 
              className={`overflow-hidden border ${
                operation.status === 'pending' 
                  ? 'border-yellow-200' 
                  : operation.status === 'in_progress'
                    ? 'border-blue-300'
                    : 'border-green-300'
              } ${expandedOperations[operation.id] ? 'ring-2 ring-blue-400' : ''}`}
            >
              <CardContent className="p-0">
                {/* Header */}
                <div 
                  className={`p-4 cursor-pointer ${
                    operation.status === 'pending' 
                      ? 'bg-yellow-50' 
                      : operation.status === 'in_progress'
                        ? 'bg-blue-50'
                        : 'bg-green-50'
                  }`}
                  onClick={() => toggleExpand(operation.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">
                        {operation.data.Cliente || 'Cliente não especificado'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {operation.data.Serviço || 'Serviço não especificado'}
                      </p>
                    </div>
                    <Badge variant={
                      operation.status === 'pending' 
                        ? 'outline' 
                        : operation.status === 'in_progress'
                          ? 'secondary'
                          : 'default'
                    }>
                      {operation.status === 'pending' 
                        ? 'Pending' 
                        : operation.status === 'in_progress'
                          ? 'In Progress'
                          : 'Finalizado'
                      }
                    </Badge>
                  </div>
                </div>

                {/* Expanded content */}
                {expandedOperations[operation.id] && (
                  <div className="p-4 border-t border-gray-100">
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Detalhes da Instalação</h4>
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
                        <span>Criado em: {new Date(operation.created_at).toLocaleString('pt-BR')}</span>
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
                      
                      {operation.technician_response && (
                        <div className="bg-green-50 p-3 rounded mb-3">
                          <p className="text-xs text-green-600 mb-1">Resposta do técnico:</p>
                          <p className="text-sm">{operation.technician_response}</p>
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
                      {operation.assigned_operator ? (
                        <div className="text-sm">
                          <span className="font-medium">Atribuído a:</span>
                          <span className="ml-1">
                            {operation.assigned_operator} {isAssignedToMe(operation) && '(você)'}
                          </span>
                        </div>
                      ) : (
                        <span></span>
                      )}
                      
                      <div className="flex space-x-2">
                        {!operation.assigned_operator && onClaimTask && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => onClaimTask(operation.id)}
                          >
                            Atribuir a mim
                          </Button>
                        )}
                        
                        {isAssignedToMe(operation) && operation.status === 'pending' && (
                          <Button 
                            size="sm"
                            variant="outline"
                            className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                            onClick={() => startWorking(operation.id)}
                          >
                            <RefreshCcw className="h-3 w-3 mr-1" />
                            Iniciar Provisionamento
                          </Button>
                        )}
                        
                        {isAssignedToMe(operation) && operation.status === 'in_progress' && (
                          <Button 
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleComplete(operation.id)}
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Concluir
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

export default InstallationOperations;
