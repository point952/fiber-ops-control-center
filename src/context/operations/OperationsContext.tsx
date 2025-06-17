
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Operation, HistoryRecord } from './types';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface OperationsContextProps {
  operations: Operation[];
  history: HistoryRecord[];
  queue: Operation[];
  isLoading: boolean;
  addOperation: (type: 'installation' | 'cto' | 'rma', data: Record<string, any>, technician: string, technicianId?: string) => Promise<void>;
  updateOperationStatus: (id: string, status: Operation['status'], operator?: string) => Promise<void>;
  assignOperation: (operationId: string, operatorName: string) => Promise<void>;
  updateOperationFeedback: (id: string, feedback: string) => Promise<void>;
  updateTechnicianResponse: (id: string, response: string) => Promise<void>;
  completeOperation: (id: string, operator: string) => Promise<void>;
  getUserOperations: (userId: string) => Operation[];
  refreshOperations: () => Promise<void>;
  getQueuePosition: (operationId: string) => number;
  getEstimatedWaitTime: (operationId: string) => number;
}

const OperationsContext = createContext<OperationsContextProps | undefined>(undefined);

export const OperationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [queue, setQueue] = useState<Operation[]>([]);
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  // Setup realtime subscription
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setOperations([]);
      setHistory([]);
      setQueue([]);
      setIsLoading(false);
      return;
    }

    let mounted = true;

    const initializeData = async () => {
      if (mounted) {
        setIsLoading(true);
        await fetchOperations();
        await fetchHistory();
        setIsLoading(false);
      }
    };

    initializeData();

    // Subscribe to operations changes
    const operationsSubscription = supabase
      .channel('operations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'operations'
        },
        (payload) => {
          if (!mounted) return;

          console.log('Operations change:', payload);

          switch (payload.eventType) {
            case 'INSERT':
              const newOperation = payload.new as Operation;
              setOperations(prev => [newOperation, ...prev]);
              if (newOperation.status === 'pending') {
                setQueue(prev => [newOperation, ...prev]);
              }
              break;
            
            case 'UPDATE':
              const updatedOperation = payload.new as Operation;
              setOperations(prev => 
                prev.map(op => op.id === updatedOperation.id ? updatedOperation : op)
              );
              setQueue(prev => {
                if (updatedOperation.status === 'completed' || updatedOperation.status === 'cancelled') {
                  return prev.filter(op => op.id !== updatedOperation.id);
                } else if (updatedOperation.status === 'pending') {
                  return prev.some(op => op.id === updatedOperation.id) 
                    ? prev.map(op => op.id === updatedOperation.id ? updatedOperation : op)
                    : [updatedOperation, ...prev];
                } else {
                  return prev.map(op => op.id === updatedOperation.id ? updatedOperation : op);
                }
              });
              break;
            
            case 'DELETE':
              const deletedId = payload.old.id;
              setOperations(prev => prev.filter(op => op.id !== deletedId));
              setQueue(prev => prev.filter(op => op.id !== deletedId));
              break;
          }
        }
      )
      .subscribe();

    // Subscribe to history changes
    const historySubscription = supabase
      .channel('history_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'operation_history'
        },
        (payload) => {
          console.log('History change:', payload);
          
          switch (payload.eventType) {
            case 'INSERT':
              setHistory(prev => [payload.new as HistoryRecord, ...prev]);
              break;
            
            case 'UPDATE':
              setHistory(prev => 
                prev.map(record => record.id === payload.new.id ? payload.new as HistoryRecord : record)
              );
              break;
            
            case 'DELETE':
              setHistory(prev => prev.filter(record => record.id !== payload.old.id));
              break;
          }
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      mounted = false;
      operationsSubscription.unsubscribe();
      historySubscription.unsubscribe();
    };
  }, [isAuthenticated, user]);

  const fetchOperations = async () => {
    try {
      const { data: operationsData, error: operationsError } = await supabase
        .from('operations')
        .select('*')
        .order('created_at', { ascending: false });

      if (operationsError) {
        console.error('Error fetching operations:', operationsError);
        throw operationsError;
      }

      console.log('Fetched operations:', operationsData?.length);
      setOperations(operationsData || []);
      
      // Update queue with only pending operations
      const pendingOperations = operationsData?.filter(op => op.status === 'pending') || [];
      setQueue(pendingOperations);
    } catch (error) {
      console.error('Error fetching operations:', error);
      toast.error('Erro ao carregar operações');
    }
  };

  const fetchHistory = async () => {
    try {
      const { data: historyData, error: historyError } = await supabase
        .from('operation_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (historyError) {
        console.error('Error fetching history:', historyError);
        throw historyError;
      }

      console.log('Fetched history:', historyData?.length);
      setHistory(historyData || []);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('Erro ao carregar histórico');
    }
  };

  const refreshOperations = async () => {
    await fetchOperations();
    await fetchHistory();
  };

  const addOperation = async (
    type: 'installation' | 'cto' | 'rma',
    data: Record<string, any>,
    technician: string,
    technicianId?: string
  ) => {
    try {
      const { data: newOperation, error: operationError } = await supabase
        .from('operations')
        .insert([{
          type,
          data,
          status: 'pending' as const,
          technician_id: technicianId || user?.id,
          technician,
        }])
        .select()
        .single();

      if (operationError) throw operationError;

      console.log('Operation created:', newOperation);
      toast.success('Operação criada com sucesso!');
    } catch (error) {
      console.error('Error creating operation:', error);
      toast.error('Erro ao criar operação. Tente novamente.');
      throw error;
    }
  };

  const updateOperationStatus = async (id: string, status: Operation['status'], operator?: string) => {
    try {
      const updates: any = {
        status,
      };

      if (operator) {
        updates.assigned_operator = operator;
      }

      if (status === 'in_progress') {
        updates.assigned_at = new Date().toISOString();
      }

      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
        updates.completed_by = operator || user?.name;
      }

      const { error } = await supabase
        .from('operations')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      console.log('Operation status updated:', id, status);
      toast.success('Status atualizado com sucesso');

      // If completed, move to history
      if (status === 'completed') {
        const operation = operations.find(op => op.id === id);
        if (operation) {
          await saveToHistory({
            ...operation,
            status,
            completed_at: updates.completed_at,
            completed_by: updates.completed_by
          });
        }
      }
    } catch (error) {
      console.error('Error updating operation status:', error);
      toast.error('Erro ao atualizar status');
      throw error;
    }
  };

  const assignOperation = async (operationId: string, operatorName: string) => {
    try {
      const { error } = await supabase
        .from('operations')
        .update({
          assigned_operator: operatorName,
          status: 'in_progress' as const,
          assigned_at: new Date().toISOString(),
        })
        .eq('id', operationId);

      if (error) throw error;
      
      console.log('Operation assigned:', operationId, operatorName);
      toast.success('Operação atribuída com sucesso');
    } catch (error) {
      console.error('Error assigning operation:', error);
      toast.error('Erro ao atribuir operação');
      throw error;
    }
  };

  const updateOperationFeedback = async (id: string, feedback: string) => {
    try {
      const { error } = await supabase
        .from('operations')
        .update({ feedback })
        .eq('id', id);

      if (error) throw error;
      
      console.log('Feedback updated:', id);
      toast.success('Feedback enviado com sucesso');
    } catch (error) {
      console.error('Error updating feedback:', error);
      toast.error('Erro ao enviar feedback');
      throw error;
    }
  };

  const updateTechnicianResponse = async (id: string, response: string) => {
    try {
      const { error } = await supabase
        .from('operations')
        .update({ technician_response: response })
        .eq('id', id);

      if (error) throw error;
      
      console.log('Technician response updated:', id);
      toast.success('Resposta enviada com sucesso');
    } catch (error) {
      console.error('Error updating technician response:', error);
      toast.error('Erro ao enviar resposta');
      throw error;
    }
  };

  const completeOperation = async (id: string, operator: string) => {
    try {
      const { error } = await supabase
        .from('operations')
        .update({ 
          status: 'completed' as const,
          completed_at: new Date().toISOString(),
          completed_by: operator
        })
        .eq('id', id);

      if (error) throw error;

      // Move the operation to history
      const operation = operations.find(op => op.id === id);
      if (operation) {
        await saveToHistory({
          ...operation,
          status: 'completed' as const,
          completed_at: new Date().toISOString(),
          completed_by: operator
        });
      }

      console.log('Operation completed:', id);
      toast.success('Operação finalizada com sucesso');
    } catch (error) {
      console.error('Error completing operation:', error);
      toast.error('Erro ao finalizar operação');
      throw error;
    }
  };

  const getUserOperations = (userId: string) => {
    return operations.filter(op => op.technician_id === userId);
  };

  const getQueuePosition = (operationId: string): number => {
    const position = queue.findIndex(op => op.id === operationId);
    return position + 1;
  };

  const getEstimatedWaitTime = (operationId: string): number => {
    const position = getQueuePosition(operationId);
    const averageTimePerOperation = 15; // minutes
    return position * averageTimePerOperation;
  };

  const saveToHistory = async (operation: Operation) => {
    try {
      const { error } = await supabase
        .from('operation_history')
        .insert([{
          operation_id: operation.id,
          type: operation.type,
          data: operation.data,
          created_at: operation.created_at,
          completed_at: operation.completed_at || new Date().toISOString(),
          technician: operation.technician,
          technician_id: operation.technician_id,
          operator: operation.assigned_operator || operation.completed_by || 'Sistema',
          feedback: operation.feedback || '',
          technician_response: operation.technician_response || ''
        }]);

      if (error) throw error;
      console.log('Operation saved to history:', operation.id);
    } catch (error) {
      console.error('Error saving to history:', error);
      throw error;
    }
  };

  return (
    <OperationsContext.Provider
      value={{
        operations,
        history,
        queue,
        isLoading,
        addOperation,
        updateOperationStatus,
        assignOperation,
        updateOperationFeedback,
        updateTechnicianResponse,
        completeOperation,
        getUserOperations,
        refreshOperations,
        getQueuePosition,
        getEstimatedWaitTime
      }}
    >
      {children}
    </OperationsContext.Provider>
  );
};

export const useOperations = () => {
  const context = useContext(OperationsContext);
  if (context === undefined) {
    throw new Error('useOperations must be used within an OperationsProvider');
  }
  return context;
};
