
import { useState, useCallback } from 'react';
import { HistoryRecord, Operation, OperationStatus } from './types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useOperationsActions = (
  initialOperations: Operation[],
  initialHistory: HistoryRecord[]
) => {
  const [operations, setOperations] = useState<Operation[]>(initialOperations);
  const [history, setHistory] = useState<HistoryRecord[]>(initialHistory);

  const addOperation = useCallback(async (
    type: 'installation' | 'cto' | 'rma', 
    data: Record<string, any>, 
    technician: string, 
    technicianId?: string
  ) => {
    try {
      const { data: newOperation, error } = await supabase
        .from('operations')
        .insert({
          type,
          data,
          technician,
          technician_id: technicianId,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      const typedOperation: Operation = {
        ...newOperation,
        type: newOperation.type as 'installation' | 'cto' | 'rma',
        status: newOperation.status as OperationStatus,
        data: newOperation.data as Record<string, any>,
        created_at: new Date(newOperation.created_at),
        assigned_at: newOperation.assigned_at ? new Date(newOperation.assigned_at) : undefined,
        completed_at: newOperation.completed_at ? new Date(newOperation.completed_at) : undefined
      };

      setOperations(prev => [typedOperation, ...prev]);
      toast.success('Operação adicionada com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar operação:', error);
      toast.error('Erro ao adicionar operação');
      throw error;
    }
  }, []);

  const updateOperationStatus = useCallback(async (id: string, status: OperationStatus) => {
    try {
      const { data: updatedOperation, error } = await supabase
        .from('operations')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const typedOperation: Operation = {
        ...updatedOperation,
        type: updatedOperation.type as 'installation' | 'cto' | 'rma',
        status: updatedOperation.status as OperationStatus,
        data: updatedOperation.data as Record<string, any>,
        created_at: new Date(updatedOperation.created_at),
        assigned_at: updatedOperation.assigned_at ? new Date(updatedOperation.assigned_at) : undefined,
        completed_at: updatedOperation.completed_at ? new Date(updatedOperation.completed_at) : undefined
      };

      setOperations(prev => prev.map(op => 
        op.id === id ? typedOperation : op
      ));
      
      toast.success('Status atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
      throw error;
    }
  }, []);

  const updateOperationFeedback = useCallback(async (id: string, feedback: string) => {
    try {
      const { data: updatedOperation, error } = await supabase
        .from('operations')
        .update({ feedback })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const typedOperation: Operation = {
        ...updatedOperation,
        type: updatedOperation.type as 'installation' | 'cto' | 'rma',
        status: updatedOperation.status as OperationStatus,
        data: updatedOperation.data as Record<string, any>,
        created_at: new Date(updatedOperation.created_at),
        assigned_at: updatedOperation.assigned_at ? new Date(updatedOperation.assigned_at) : undefined,
        completed_at: updatedOperation.completed_at ? new Date(updatedOperation.completed_at) : undefined
      };

      setOperations(prev => prev.map(op => 
        op.id === id ? typedOperation : op
      ));
      
      toast.success('Feedback atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar feedback:', error);
      toast.error('Erro ao atualizar feedback');
      throw error;
    }
  }, []);

  const updateTechnicianResponse = useCallback(async (id: string, response: string) => {
    try {
      const { data: updatedOperation, error } = await supabase
        .from('operations')
        .update({ technician_response: response })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const typedOperation: Operation = {
        ...updatedOperation,
        type: updatedOperation.type as 'installation' | 'cto' | 'rma',
        status: updatedOperation.status as OperationStatus,
        data: updatedOperation.data as Record<string, any>,
        created_at: new Date(updatedOperation.created_at),
        assigned_at: updatedOperation.assigned_at ? new Date(updatedOperation.assigned_at) : undefined,
        completed_at: updatedOperation.completed_at ? new Date(updatedOperation.completed_at) : undefined
      };

      setOperations(prev => prev.map(op => 
        op.id === id ? typedOperation : op
      ));
      
      toast.success('Resposta enviada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar resposta do técnico:', error);
      toast.error('Erro ao enviar resposta');
      throw error;
    }
  }, []);

  const assignOperatorToOperation = useCallback(async (operationId: string, operatorName: string) => {
    try {
      const { data: updatedOperation, error } = await supabase
        .from('operations')
        .update({ 
          assigned_operator: operatorName,
          assigned_at: new Date().toISOString()
        })
        .eq('id', operationId)
        .select()
        .single();

      if (error) throw error;

      const typedOperation: Operation = {
        ...updatedOperation,
        type: updatedOperation.type as 'installation' | 'cto' | 'rma',
        status: updatedOperation.status as OperationStatus,
        data: updatedOperation.data as Record<string, any>,
        created_at: new Date(updatedOperation.created_at),
        assigned_at: updatedOperation.assigned_at ? new Date(updatedOperation.assigned_at) : undefined,
        completed_at: updatedOperation.completed_at ? new Date(updatedOperation.completed_at) : undefined
      };

      setOperations(prev => prev.map(op => 
        op.id === operationId ? typedOperation : op
      ));
      
      toast.success('Operador atribuído com sucesso!');
    } catch (error) {
      console.error('Erro ao atribuir operador:', error);
      toast.error('Erro ao atribuir operador');
      throw error;
    }
  }, []);

  const unassignOperatorFromOperation = useCallback(async (operationId: string) => {
    try {
      const { data: updatedOperation, error } = await supabase
        .from('operations')
        .update({ 
          assigned_operator: null,
          assigned_at: null
        })
        .eq('id', operationId)
        .select()
        .single();

      if (error) throw error;

      const typedOperation: Operation = {
        ...updatedOperation,
        type: updatedOperation.type as 'installation' | 'cto' | 'rma',
        status: updatedOperation.status as OperationStatus,
        data: updatedOperation.data as Record<string, any>,
        created_at: new Date(updatedOperation.created_at),
        assigned_at: updatedOperation.assigned_at ? new Date(updatedOperation.assigned_at) : undefined,
        completed_at: updatedOperation.completed_at ? new Date(updatedOperation.completed_at) : undefined
      };

      setOperations(prev => prev.map(op => 
        op.id === operationId ? typedOperation : op
      ));
      
      toast.success('Atribuição removida com sucesso!');
    } catch (error) {
      console.error('Erro ao remover atribuição:', error);
      toast.error('Erro ao remover atribuição');
      throw error;
    }
  }, []);

  const completeOperation = useCallback(async (operationId: string, operatorName: string) => {
    try {
      const operation = operations.find(op => op.id === operationId);
      if (!operation) throw new Error('Operação não encontrada');

      // Criar registro no histórico
      const { data: historyRecord, error: historyError } = await supabase
        .from('operation_history')
        .insert({
          operation_id: operationId,
          type: operation.type,
          data: operation.data,
          created_at: operation.created_at.toISOString(),
          completed_at: new Date().toISOString(),
          technician: operation.technician,
          technician_id: operation.technician_id,
          operator: operatorName,
          feedback: operation.feedback,
          technician_response: operation.technician_response
        })
        .select()
        .single();

      if (historyError) throw historyError;

      // Remover operação da tabela de operações
      const { error: deleteError } = await supabase
        .from('operations')
        .delete()
        .eq('id', operationId);

      if (deleteError) throw deleteError;

      const typedHistoryRecord: HistoryRecord = {
        ...historyRecord,
        type: historyRecord.type as 'installation' | 'cto' | 'rma',
        data: historyRecord.data as Record<string, any>,
        created_at: new Date(historyRecord.created_at),
        completed_at: new Date(historyRecord.completed_at)
      };

      // Atualizar estados
      setOperations(prev => prev.filter(op => op.id !== operationId));
      setHistory(prev => [typedHistoryRecord, ...prev]);
      
      toast.success('Operação concluída com sucesso!');
    } catch (error) {
      console.error('Erro ao completar operação:', error);
      toast.error('Erro ao concluir operação');
      throw error;
    }
  }, [operations]);

  const getOperationsByType = useCallback((type: 'installation' | 'cto' | 'rma') => {
    return operations.filter(op => op.type === type);
  }, [operations]);

  const getPendingOperationsCount = useCallback(() => {
    return operations.filter(op => op.status === 'pending').length;
  }, [operations]);

  const getUserOperations = useCallback((userId: string) => {
    return operations.filter(op => op.technician_id === userId);
  }, [operations]);

  const getHistoryByType = useCallback((type: 'installation' | 'cto' | 'rma') => {
    return history.filter(record => record.type === type);
  }, [history]);

  return {
    operations,
    history,
    setOperations,
    setHistory,
    addOperation,
    updateOperationStatus,
    updateOperationFeedback,
    updateTechnicianResponse,
    getOperationsByType,
    getPendingOperationsCount,
    assignOperatorToOperation,
    unassignOperatorFromOperation,
    completeOperation,
    getUserOperations,
    getHistoryByType
  };
};
