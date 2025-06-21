
import { HistoryRecord, Operation } from './types';
import { supabase } from '@/integrations/supabase/client';

// Load operations from Supabase
export const loadOperations = async (): Promise<Operation[]> => {
  try {
    const { data: operations, error } = await supabase
      .from('operations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return operations.map(op => ({
      ...op,
      type: op.type as 'installation' | 'cto' | 'rma',
      status: op.status as any,
      data: op.data as Record<string, any>,
      created_at: new Date(op.created_at),
      assigned_at: op.assigned_at ? new Date(op.assigned_at) : undefined,
      completed_at: op.completed_at ? new Date(op.completed_at) : undefined
    }));
  } catch (error) {
    console.error('Erro ao carregar operações:', error);
    return [];
  }
};

// Load history from Supabase
export const loadHistory = async (): Promise<HistoryRecord[]> => {
  try {
    const { data: history, error } = await supabase
      .from('operation_history')
      .select('*')
      .order('completed_at', { ascending: false });

    if (error) throw error;

    return history.map(record => ({
      ...record,
      type: record.type as 'installation' | 'cto' | 'rma',
      data: record.data as Record<string, any>,
      created_at: new Date(record.created_at),
      completed_at: new Date(record.completed_at)
    }));
  } catch (error) {
    console.error('Erro ao carregar histórico:', error);
    return [];
  }
};

// Save operation to Supabase
export const saveOperation = async (operation: Operation): Promise<void> => {
  try {
    const { error } = await supabase
      .from('operations')
      .upsert({
        ...operation,
        created_at: operation.created_at.toISOString(),
        assigned_at: operation.assigned_at ? operation.assigned_at.toISOString() : null,
        completed_at: operation.completed_at ? operation.completed_at.toISOString() : null
      });

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao salvar operação:', error);
    throw error;
  }
};

// Save history record to Supabase
export const saveHistoryRecord = async (record: HistoryRecord): Promise<void> => {
  try {
    const { error } = await supabase
      .from('operation_history')
      .insert({
        ...record,
        created_at: record.created_at.toISOString(),
        completed_at: record.completed_at.toISOString()
      });

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao salvar histórico:', error);
    throw error;
  }
};

// Simple function to get user operations - query operations table directly
export const getUserOperations = async (userId: string): Promise<Operation[]> => {
  if (!userId) return [];
  
  try {
    const { data: operations, error } = await supabase
      .from('operations')
      .select('*')
      .eq('technician_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return operations.map(op => ({
      ...op,
      type: op.type as 'installation' | 'cto' | 'rma',
      status: op.status as any,
      data: op.data as Record<string, any>,
      created_at: new Date(op.created_at),
      assigned_at: op.assigned_at ? new Date(op.assigned_at) : undefined,
      completed_at: op.completed_at ? new Date(op.completed_at) : undefined
    }));
  } catch (error) {
    console.error('Erro ao carregar operações do usuário:', error);
    return [];
  }
};
