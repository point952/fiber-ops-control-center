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
  getOperationsByTechnician: (technicianId: string) => Operation[];
  getHistoryByTechnician: (technicianId: string) => HistoryRecord[];
  refreshOperations: () => Promise<void>;
  refreshHistory: () => Promise<void>;
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
      
      // Cast the data to match our Operation type
      const typedOperations: Operation[] = data.map(op => ({
        ...op,
        type: op.type as 'installation' | 'cto' | 'rma',
        status: op.status as OperationStatus,
        data: op.data as Record<string, any>
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
      
      // Cast the data to match our HistoryRecord type
      const typedHistory: HistoryRecord[] = data.map(record => ({
        ...record,
        type: record.type as 'installation' | 'cto' | 'rma',
        data: record.data as Record<string, any>
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
          assigned_at: operation.assigned_at,
          completed_by: operation.completed_by,
          completed_at: operation.completed_at
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
      
      const { data, error } = await supabase
        .from('operations')
        .update(updates)
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

  const getOperationsByTechnician = (technicianId: string): Operation[] => {
    return operations.filter(op => op.technician_id === technicianId);
  };

  const getHistoryByTechnician = (technicianId: string): HistoryRecord[] => {
    return history.filter(record => record.technician_id === technicianId);
  };

  const refreshOperations = async () => {
    await fetchOperations();
  };

  const refreshHistory = async () => {
    await fetchHistory();
  };

  return (
    <OperationsContext.Provider value={{
      operations,
      history,
      isLoading,
      addOperation,
      updateOperation,
      getOperationsByTechnician,
      getHistoryByTechnician,
      refreshOperations,
      refreshHistory
    }}>
      {children}
    </OperationsContext.Provider>
  );
};
