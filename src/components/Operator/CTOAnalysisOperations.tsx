import React, { useState } from 'react';
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
  RefreshCcw,
  Network,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Operation, OperationStatus } from '@/context/operations/types';

interface CTOAnalysisOperationsProps {
  onClaimTask?: (operationId: string) => void;
}

const CTOAnalysisOperations = ({ onClaimTask }: CTOAnalysisOperationsProps) => {
  const { user } = useAuth();
  const { operations, updateOperationStatus, updateOperationFeedback, completeOperation } = useOperations();
  
  // Filter to show only CTO operations
  const ctoOperations = operations.filter(op => op.type === 'cto');
  
  // State for handling feedback text inputs
  const [feedbackText, setFeedbackText] = useState<Record<string, string>>({});
  
  // State to track expanded operations
  const [expandedOperations, setExpandedOperations] = useState<Record<string, boolean>>({});
  
  // State to track expanded feedback forms
  const [expandedFeedbackForms, setExpandedFeedbackForms] = useState<Record<string, boolean>>({});
  
  // State to track operations in working state
  const [workingOperations, setWorkingOperations] = useState<Record<string, boolean>>({});
  
  // Toggle expansion of an operation card
  const toggleExpand = (operationId: string) => {
    setExpandedOperations(prev => ({
      ...prev,
      [operationId]: !prev[operationId]
    }));
  };
  
  // Toggle expansion of feedback form
  const toggleFeedbackForm = (operationId: string, state?: boolean) => {
    setExpandedFeedbackForms(prev => ({
      ...prev,
      [operationId]: state !== undefined ? state : !prev[operationId]
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
    
    // Close the feedback form
    toggleFeedbackForm(operationId, false);
  };
  
  // Start working on an operation
  const startWorking = (operationId: string) => {
    updateOperationStatus(operationId, 'verificando');
    setWorkingOperations(prev => ({
      ...prev,
      [operationId]: true
    }));
    toast.info('Verificação iniciada');
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

  // Function to display CTO data in a more organized way
  const renderCTOData = (data: any) => {
    // Define fields that should be displayed prominently
    const mainFields = ['cto', 'tipoSplitter', 'bairro', 'rua', 'coordenadas'];
    
    // Define fields that should be skipped in the detailed view
    const skipFields = ['portas'];
    
    return (
      <>
        {/* Main data fields */}
        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          {mainFields.map(field => {
            if (data[field]) {
              return (
                <div key={field} className="flex space-x-2">
                  <span className="font-medium capitalize">{field === 'tipoSplitter' ? 'Tipo de Splitter' : field}:</span>
                  <span className="text-gray-600">{data[field]}</span>
                </div>
              );
            }
            return null;
          })}
        </div>
        
        {/* Other fields */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          {Object.entries(data).map(([key, value]) => {
            // Skip main fields that were already displayed and fields in the skip list
            if (mainFields.includes(key) || skipFields.includes(key)) {
              return null;
            }
            
            return (
              <div key={key} className="flex space-x-2">
                <span className="font-medium capitalize">{key}:</span>
                <span className="text-gray-600">{String(value)}</span>
              </div>
            );
          })}
        </div>
        
        {/* Display port information if available */}
        {data.portas && (
          <div className="mt-3">
            <h5 className="text-sm font-medium mb-1">Informações das Portas:</h5>
            <div className="grid grid-cols-2 gap-1 text-xs bg-gray-50 p-2 rounded">
              {Array.isArray(data.portas) && data.portas.map((porta: any, index: number) => (
                <div key={index} className="flex space-x-1">
                  <span className="font-medium">Porta {index + 1}:</span>
                  <span className="text-gray-600">{porta || 'Não preenchido'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    );
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
        <h2 className="text-xl font-semibold">Análises de CTOs</h2>
        <Badge variant="outline" className="bg-purple-100 text-purple-800">
          {ctoOperations.length} CTO(s)
        </Badge>
      </div>
      
      {ctoOperations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Não há análises de CTOs pendentes</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {ctoOperations.map((operation) => (
            <Card 
              key={operation.id} 
              className={`overflow-hidden border ${
                operation.status === 'pending' 
                  ? 'border-yellow-200' 
                  : operation.status === 'in_progress'
                    ? 'border-purple-300'
                    : 'border-green-300'
              } ${expandedOperations[operation.id] ? 'ring-2 ring-purple-400' : ''}`}
            >
              <CardContent className="p-0">
                {/* Header */}
                <div 
                  className={`p-4 cursor-pointer ${
                    operation.status === 'pending' 
                      ? 'bg-yellow-50' 
                      : operation.status === 'in_progress'
                        ? 'bg-purple-50'
                        : 'bg-green-50'
                  } flex justify-between items-center`}
                  onClick={() => toggleExpand(operation.id)}
                >
                  <div>
                    <h3 className="font-medium flex items-center">
                      <Network className="h-4 w-4 mr-1" />
                      CTO: {operation.data.cto || 'Não identificada'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {operation.data.bairro}, {operation.data.rua}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
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
                          : 'Finalized'
                      }
                    </Badge>
                    {expandedOperations[operation.id] ? 
                      <ChevronUp className="h-4 w-4" /> : 
                      <ChevronDown className="h-4 w-4" />
                    }
                  </div>
                </div>

                {/* Expanded content */}
                {expandedOperations[operation.id] && (
                  <div className="p-4 border-t border-gray-100">
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Detalhes da CTO</h4>
                      {renderCTOData(operation.data)}
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
                      
                      <div className="mt-3">
                        {expandedFeedbackForms[operation.id] ? (
                          <div className="flex flex-col gap-2">
                            <Textarea 
                              placeholder="Enviar feedback ou fazer pergunta ao técnico..." 
                              className="w-full text-sm min-h-[80px]"
                              value={feedbackText[operation.id] || ''}
                              onChange={(e) => handleFeedbackChange(operation.id, e.target.value)}
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFeedbackForm(operation.id, false);
                                }}
                              >
                                Cancelar
                              </Button>
                              <Button 
                                size="sm" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  sendFeedback(operation.id);
                                }}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <Send className="h-4 w-4 mr-1" />
                                Enviar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFeedbackForm(operation.id, true);
                            }}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Escrever Mensagem
                          </Button>
                        )}
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
                            onClick={(e) => {
                              e.stopPropagation();
                              onClaimTask(operation.id);
                            }}
                          >
                            Atribuir a mim
                          </Button>
                        )}
                        
                        {isAssignedToMe(operation) && operation.status === 'pending' && (
                          <Button 
                            size="sm"
                            variant="outline"
                            className="bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              startWorking(operation.id);
                            }}
                          >
                            <RefreshCcw className="h-3 w-3 mr-1" />
                            Iniciar Verificação
                          </Button>
                        )}
                        
                        {isAssignedToMe(operation) && operation.status === 'in_progress' && (
                          <Button 
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleComplete(operation.id);
                            }}
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

export default CTOAnalysisOperations;
