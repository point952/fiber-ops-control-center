import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Operation, HistoryRecord, Message } from './types';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface OperationsContextProps {
  operations: Operation[];
  history: HistoryRecord[];
  queue: Operation[];
  isLoading: boolean;
  addOperation: (type: 'installation' | 'cto' | 'rma', data: Record<string, any>, technician: string, technicianId?: string) => Promise<void>;
  updateOperationStatus: (id: string, status: Operation['status'], operator?: string) => Promise<void>;
  assignOperation: (operationId: string, operatorId: string, operatorName: string) => Promise<void>;
  updateOperationFeedback: (id: string, feedback: string) => Promise<void>;
  updateTechnicianResponse: (id: string, response: string) => Promise<void>;
  completeOperation: (id: string, operator: string) => Promise<void>;
  getUserOperations: (userId: string) => Operation[];
  refreshOperations: () => Promise<void>;
  getQueuePosition: (operationId: string) => number;
  getEstimatedWaitTime: (operationId: string) => number;
  sendOperatorMessage: (operationId: string, message: string) => Promise<void>;
  sendTechnicianMessage: (operationId: string, message: string) => Promise<void>;
}

const OperationsContext = createContext<OperationsContextProps | undefined>(undefined);

export const OperationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [queue, setQueue] = useState<Operation[]>([]);
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Setup realtime subscription
  useEffect(() => {
    let mounted = true;

    const initializeData = async () => {
      if (!isInitialized && mounted) {
        setIsLoading(true);
        await fetchOperations();
        setIsInitialized(true);
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
          console.log('Mudança no histórico:', payload);
          
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

    // Subscribe to operator messages
    const operatorMessagesSubscription = supabase
      .channel('operator_messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'operator_messages'
        },
        (payload) => {
          console.log('Nova mensagem do operador:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new as Message;
            setOperations(prev => 
              prev.map(op => {
                if (op.id === newMessage.operation_id) {
                  return {
                    ...op,
                    messages: [...(op.messages || []), newMessage]
                  };
                }
                return op;
              })
            );
          }
        }
      )
      .subscribe();

    // Subscribe to technician messages
    const technicianMessagesSubscription = supabase
      .channel('technician_messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'technician_messages'
        },
        (payload) => {
          console.log('Nova mensagem do técnico:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new as Message;
            setOperations(prev => 
              prev.map(op => {
                if (op.id === newMessage.operation_id) {
                  return {
                    ...op,
                    messages: [...(op.messages || []), newMessage]
                  };
                }
                return op;
              })
            );
          }
        }
      )
      .subscribe();

    // Subscribe to notifications
    const notificationsSubscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          console.log('Nova notificação:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newNotification = payload.new;
            // Mostrar notificação para o usuário
            if (newNotification.user_id === user?.id) {
              toast.info(newNotification.message);
            }
          }
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      mounted = false;
      operationsSubscription.unsubscribe();
      historySubscription.unsubscribe();
      operatorMessagesSubscription.unsubscribe();
      technicianMessagesSubscription.unsubscribe();
      notificationsSubscription.unsubscribe();
    };
  }, [isInitialized]);

  const fetchOperations = async () => {
    try {
      const { data: operationsData, error: operationsError } = await supabase
        .from('operations')
        .select('*')
        .order('created_at', { ascending: false });

      if (operationsError) {
        console.error('Erro ao buscar operações:', operationsError);
        throw operationsError;
      }

      setOperations(operationsData || []);
      
      // Update queue with only pending operations
      const pendingOperations = operationsData?.filter(op => op.status === 'pending') || [];
      setQueue(pendingOperations);

      const { data: historyData, error: historyError } = await supabase
        .from('operation_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (historyError) {
        console.error('Erro ao buscar histórico:', historyError);
        throw historyError;
      }

      setHistory(historyData || []);
    } catch (error) {
      console.error('Error fetching operations:', error);
      toast.error('Erro ao carregar operações');
    }
  };

  const refreshOperations = async () => {
    await fetchOperations();
  };

  const addOperation = async (
    type: 'installation' | 'cto' | 'rma',
    data: Record<string, any>,
    technician: string,
    technicianId?: string
  ) => {
    try {
      // Create the operation
      const { data: newOperation, error: operationError } = await supabase
        .from('operations')
        .insert([{
          type,
          data,
          status: 'pending',
          technician_id: technicianId || user?.id,
          technician,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (operationError) throw operationError;

      // Create notification for operators
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert([{
          type: 'new_operation',
          title: 'Nova Operação',
          message: `Nova operação de ${type} criada por ${technician}`,
          operation_id: newOperation.id,
          user_id: null, // This will be visible to all operators
          is_read: false,
          created_at: new Date().toISOString()
        }]);

      if (notificationError) {
        console.error('Erro ao criar notificação:', notificationError);
        // Continue execution even if notification fails
      }

      // Update local state
      setOperations(prev => [newOperation, ...prev]);
      setQueue(prev => [newOperation, ...prev]);
      
      // Refresh operations from database
      await refreshOperations();
      
      toast.success('Operação enviada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar operação:', error);
      toast.error('Erro ao enviar operação. Tente novamente.');
      throw error;
    }
  };

  const updateOperationStatus = async (id: string, status: Operation['status'], operator?: string) => {
    try {
      const { data, error } = await supabase
        .from('operations')
        .update({
          status,
          operator_id: operator,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setOperations(prev =>
        prev.map(op =>
          op.id === id
            ? { ...op, status, operator_id: operator }
            : op
        )
      );
      toast.success('Status atualizado com sucesso');

      if (status === 'completed') {
        const operation = operations.find(op => op.id === id);
        if (operation) {
          await saveToHistory(operation);
          setOperations(prev => prev.filter(op => op.id !== id));
        }
      }
    } catch (error) {
      console.error('Error updating operation status:', error);
      toast.error('Erro ao atualizar status');
      throw error;
    }
  };

  const assignOperation = async (operationId: string, operatorId: string, operatorName: string) => {
    try {
      const { data, error } = await supabase
        .from('operations')
        .update({
          operator_id: operatorId,
          operator: operatorName,
          assigned_operator: operatorName,
          status: 'in_progress',
          assigned_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', operationId)
        .select()
        .single();

      if (error) throw error;
      setOperations(prev =>
        prev.map(op =>
          op.id === operationId
            ? {
                ...op,
                operator_id: operatorId,
                operator: operatorName,
                assigned_operator: operatorName,
                status: 'in_progress',
                assigned_at: new Date().toISOString()
              }
            : op
        )
      );
      setQueue(prev => prev.filter(op => op.id !== operationId));
      toast.success('Operação atribuída com sucesso');
    } catch (error) {
      console.error('Error assigning operation:', error);
      toast.error('Erro ao atribuir operação');
      throw error;
    }
  };

  const updateOperationFeedback = async (id: string, feedback: string) => {
    try {
      const { data, error } = await supabase
        .from('operations')
        .update({ 
          feedback,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setOperations(prev => prev.map(op => op.id === id ? data : op));
      toast.success('Feedback enviado com sucesso');
    } catch (error) {
      console.error('Error updating feedback:', error);
      toast.error('Erro ao enviar feedback');
      throw error;
    }
  };

  const updateTechnicianResponse = async (id: string, response: string) => {
    try {
      const { data, error } = await supabase
        .from('operations')
        .update({ 
          technician_response: response,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setOperations(prev => prev.map(op => op.id === id ? data : op));
      toast.success('Resposta enviada com sucesso');
    } catch (error) {
      console.error('Error updating technician response:', error);
      toast.error('Erro ao enviar resposta');
      throw error;
    }
  };

  const completeOperation = async (id: string, operator: string) => {
    try {
      const { data, error } = await supabase
        .from('operations')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Move the operation to history
      const operation = operations.find(op => op.id === id);
      if (operation) {
        await saveToHistory(operation);
        setOperations(prev => prev.filter(op => op.id !== id));
      }

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
    const averageTimePerOperation = 15; // minutos
    return position * averageTimePerOperation;
  };

  const sendOperatorMessage = async (operationId: string, message: string) => {
    try {
      const { data: newMessage, error } = await supabase
        .from('operator_messages')
        .insert([{
          operation_id: operationId,
          sender_id: user?.id || '',
          sender_name: user?.name || 'Operador',
          content: message,
          created_at: new Date().toISOString(),
          is_operator: true,
          is_read: false
        }])
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setOperations(prev => 
        prev.map(op => {
          if (op.id === operationId) {
            return {
              ...op,
              messages: [...(op.messages || []), newMessage]
            };
          }
          return op;
        })
      );
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem');
      throw error;
    }
  };

  const sendTechnicianMessage = async (operationId: string, message: string) => {
    try {
      const { data: newMessage, error } = await supabase
        .from('technician_messages')
        .insert([{
          operation_id: operationId,
          sender_id: user?.id || '',
          sender_name: user?.name || 'Técnico',
          content: message,
          created_at: new Date().toISOString(),
          is_operator: false,
          is_read: false
        }])
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setOperations(prev => 
        prev.map(op => {
          if (op.id === operationId) {
            return {
              ...op,
              messages: [...(op.messages || []), newMessage]
            };
          }
          return op;
        })
      );
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem');
      throw error;
    }
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
          completed_at: new Date().toISOString(),
          technician: operation.technician,
          technician_id: operation.technician_id,
          operator: operation.operator || 'Não atribuído',
          feedback: operation.feedback || '',
          technician_response: operation.technician_response || '',
          status: operation.status
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao salvar no histórico:', error);
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
        getEstimatedWaitTime,
        sendOperatorMessage,
        sendTechnicianMessage
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