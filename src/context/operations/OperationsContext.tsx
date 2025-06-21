
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Operation, HistoryRecord, OperationStatus } from './types';
import { toast } from "sonner";

interface OperationsContextType {
  operations: Operation[];
  history: HistoryRecord[];
  isLoading: boolean;
  addOperation: (operation: Omit<Operation, 'id' | 'created_at'>) => Promise<void>;
  updateOperation: (id: string, updates: Partial<Operation>) => Promise<void>;
  updateOperationStatus: (id: string, status: OperationStatus) => Promise<void>;
  updateOperationFeedback: (id: string, feedback: string) => Promise<void>;
  completeOperation: (id: string, completedBy: string) => Promise<void>;
  assignOperation: (id: string, operatorName: string) => Promise<void>;
  getOperationsByTechnician: (technicianId: string) => Operation[];
  getHistoryByTechnician: (technicianId: string) => HistoryRecord[];
  getUserOperations: (userId: string) => Operation[];
  refreshOperations: () => Promise<void>;
  refreshHistory: () => Promise<void>;
  sendOperatorMessage: (operationId: string, message: string) => Promise<void>;
  queue: Operation[];
  getQueuePosition: (operationId: string) => number;
  getEstimatedWaitTime: (operationId: string) => number;
}

const OperationsContext = createContext<OperationsContextType | undefined>(undefined);

export const useOperations = () => {
  const context = useContext(OperationsContext);
  if (!context) {
    throw new Error('useOperations must be used within an OperationsProvider');
  }
  return context;
};

export const OperationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOperations = async () => {
    try {
      console.log('Fetching operations...');
      const { data, error } = await supabase
        .from('operations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching operations:', error);
        toast.error('Erro ao carregar operações');
        return;
      }

      console.log('Operations fetched:', data);
      
      // Convert string dates to Date objects and cast types properly
      const typedOperations: Operation[] = data.map(op => ({
        ...op,
        type: op.type as 'installation' | 'cto' | 'rma',
        status: op.status as OperationStatus,
        data: op.data as Record<string, any>,
        created_at: new Date(op.created_at),
        assigned_at: op.assigned_at ? new Date(op.assigned_at) : undefined,
        completed_at: op.completed_at ? new Date(op.completed_at) : undefined
      }));
      
      setOperations(typedOperations);
    } catch (error) {
      console.error('Error in fetchOperations:', error);
      toast.error('Erro inesperado ao carregar operações');
    }
  };

  const fetchHistory = async () => {
    try {
      console.log('Fetching history...');
      const { data, error } = await supabase
        .from('operation_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching history:', error);
        toast.error('Erro ao carregar histórico');
        return;
      }

      console.log('History fetched:', data);
      
      // Convert string dates to Date objects and cast types properly
      const typedHistory: HistoryRecord[] = data.map(record => ({
        ...record,
        type: record.type as 'installation' | 'cto' | 'rma',
        data: record.data as Record<string, any>,
        created_at: new Date(record.created_at),
        completed_at: new Date(record.completed_at)
      }));
      
      setHistory(typedHistory);
    } catch (error) {
      console.error('Error in fetchHistory:', error);
      toast.error('Erro inesperado ao carregar histórico');
    }
  };

  // Set up realtime subscriptions
  useEffect(() => {
    const setupRealtimeSubscriptions = async () => {
      try {
        await fetchOperations();
        await fetchHistory();
        setIsLoading(false);

        // Subscribe to operations changes
        const operationsSubscription = supabase
          .channel('operations-changes')
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'operations' },
            (payload) => {
              console.log('Operations realtime update:', payload);
              fetchOperations();
            }
          )
          .subscribe();

        // Subscribe to history changes
        const historySubscription = supabase
          .channel('history-changes')
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'operation_history' },
            (payload) => {
              console.log('History realtime update:', payload);
              fetchHistory();
            }
          )
          .subscribe();

        return () => {
          operationsSubscription.unsubscribe();
          historySubscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error setting up realtime subscriptions:', error);
        setIsLoading(false);
      }
    };

    setupRealtimeSubscriptions();
  }, []);

  const addOperation = async (operation: Omit<Operation, 'id' | 'created_at'>) => {
    try {
      console.log('Adding operation:', operation);
      
      const { data, error } = await supabase
        .from('operations')
        .insert({
          type: operation.type,
          data: operation.data,
          status: operation.status,
          technician: operation.technician,
          technician_id: operation.technician_id,
          feedback: operation.feedback,
          technician_response: operation.technician_response,
          assigned_operator: operation.assigned_operator,
          assigned_at: operation.assigned_at ? operation.assigned_at.toISOString() : null,
          completed_by: operation.completed_by,
          completed_at: operation.completed_at ? operation.completed_at.toISOString() : null
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding operation:', error);
        toast.error('Erro ao adicionar operação');
        throw error;
      }

      console.log('Operation added successfully:', data);
      toast.success('Operação adicionada com sucesso!');
      await fetchOperations();
    } catch (error) {
      console.error('Error in addOperation:', error);
      throw error;
    }
  };

  const updateOperation = async (id: string, updates: Partial<Operation>) => {
    try {
      console.log('Updating operation:', id, updates);
      
      // Convert Date objects to ISO strings for database storage
      const dbUpdates = {
        ...updates,
        assigned_at: updates.assigned_at ? updates.assigned_at.toISOString() : undefined,
        completed_at: updates.completed_at ? updates.completed_at.toISOString() : undefined
      };
      
      const { data, error } = await supabase
        .from('operations')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating operation:', error);
        toast.error('Erro ao atualizar operação');
        throw error;
      }

      console.log('Operation updated successfully:', data);
      toast.success('Operação atualizada com sucesso!');
      await fetchOperations();
    } catch (error) {
      console.error('Error in updateOperation:', error);
      throw error;
    }
  };

  const updateOperationStatus = async (id: string, status: OperationStatus) => {
    try {
      const { error } = await supabase
        .from('operations')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      await fetchOperations();
      toast.success('Status atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating operation status:', error);
      toast.error('Erro ao atualizar status');
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
      
      await fetchOperations();
      toast.success('Feedback enviado com sucesso!');
    } catch (error) {
      console.error('Error updating operation feedback:', error);
      toast.error('Erro ao enviar feedback');
      throw error;
    }
  };

  const completeOperation = async (id: string, completedBy: string) => {
    try {
      const operation = operations.find(op => op.id === id);
      if (!operation) throw new Error('Operação não encontrada');

      // Create history record
      const { error: historyError } = await supabase
        .from('operation_history')
        .insert({
          operation_id: id,
          type: operation.type,
          data: operation.data,
          created_at: operation.created_at.toISOString(),
          completed_at: new Date().toISOString(),
          technician: operation.technician,
          technician_id: operation.technician_id,
          operator: completedBy,
          feedback: operation.feedback,
          technician_response: operation.technician_response
        });

      if (historyError) throw historyError;

      // Delete from operations
      const { error: deleteError } = await supabase
        .from('operations')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      await fetchOperations();
      await fetchHistory();
      toast.success('Operação concluída com sucesso!');
    } catch (error) {
      console.error('Error completing operation:', error);
      toast.error('Erro ao concluir operação');
      throw error;
    }
  };

  const assignOperation = async (id: string, operatorName: string) => {
    try {
      const { error } = await supabase
        .from('operations')
        .update({ 
          assigned_operator: operatorName,
          assigned_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      await fetchOperations();
      toast.success('Operação atribuída com sucesso!');
    } catch (error) {
      console.error('Error assigning operation:', error);
      toast.error('Erro ao atribuir operação');
      throw error;
    }
  };

  const sendOperatorMessage = async (operationId: string, message: string) => {
    try {
      const { error } = await supabase
        .from('operations')
        .update({ feedback: message })
        .eq('id', operationId);

      if (error) throw error;
      
      await fetchOperations();
      toast.success('Mensagem enviada com sucesso!');
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const getOperationsByTechnician = (technicianId: string): Operation[] => {
    return operations.filter(op => op.technician_id === technicianId);
  };

  const getHistoryByTechnician = (technicianId: string): HistoryRecord[] => {
    return history.filter(record => record.technician_id === technicianId);
  };

  const getUserOperations = (userId: string): Operation[] => {
    return operations.filter(op => op.technician_id === userId);
  };

  const refreshOperations = async () => {
    await fetchOperations();
  };

  const refreshHistory = async () => {
    await fetchHistory();
  };

  // Queue-related computed values
  const queue = operations.filter(op => op.status === 'pending');
  
  const getQueuePosition = (operationId: string): number => {
    const index = queue.findIndex(op => op.id === operationId);
    return index >= 0 ? index + 1 : 0;
  };

  const getEstimatedWaitTime = (operationId: string): number => {
    const position = getQueuePosition(operationId);
    return position * 15; // 15 minutes per operation estimate
  };

  return (
    <OperationsContext.Provider value={{
      operations,
      history,
      isLoading,
      addOperation,
      updateOperation,
      updateOperationStatus,
      updateOperationFeedback,
      completeOperation,
      assignOperation,
      getOperationsByTechnician,
      getHistoryByTechnician,
      getUserOperations,
      refreshOperations,
      refreshHistory,
      sendOperatorMessage,
      queue,
      getQueuePosition,
      getEstimatedWaitTime
    }}>
      {children}
    </OperationsContext.Provider>
  );
};
