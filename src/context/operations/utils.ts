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
      created_at: new Date(op.created_at),
      assigned_at: op.assigned_at ? new Date(op.assigned_at) : undefined
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
        created_at: new Date(operation.created_at).toISOString(),
        assigned_at: operation.assigned_at ? new Date(operation.assigned_at).toISOString() : null,
        updated_at: new Date().toISOString()
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
        created_at: new Date(record.created_at).toISOString(),
        completed_at: new Date(record.completed_at).toISOString()
      });

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao salvar histórico:', error);
    throw error;
  }
};

// Update technician's operations in Supabase
export const updateTechnicianOperations = async (
  technicianId: string,
  operations: Operation[]
): Promise<void> => {
  if (!technicianId) return;
  
  try {
    const { error } = await supabase
      .from('technician_operations')
      .upsert({
        technician_id: technicianId,
        operations: operations.map(op => ({
          ...op,
          created_at: new Date(op.created_at).toISOString(),
          assigned_at: op.assigned_at ? new Date(op.assigned_at).toISOString() : null
        }))
      });

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao atualizar operações do técnico:', error);
    throw error;
  }
};

// Initialize technician's operations in Supabase
export const initializeTechnicianOperations = async (
  userId: string | undefined,
  userName: string | undefined,
  operations: Operation[]
): Promise<void> => {
  if (!userId) return;
  
  try {
    // Get existing technician operations
    const { data: existingOps, error: fetchError } = await supabase
      .from('technician_operations')
      .select('operations')
      .eq('technician_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    if (!existingOps) {
      // Initialize with any operations already in the system for this technician
      const technicianOps = operations.filter(
        op => op.technician_id === userId || op.technician === userName
      );
      
      if (technicianOps.length > 0) {
        await updateTechnicianOperations(userId, technicianOps);
      } else {
        await updateTechnicianOperations(userId, []);
      }
    }
  } catch (error) {
    console.error('Erro ao inicializar operações do técnico:', error);
    throw error;
  }
};
