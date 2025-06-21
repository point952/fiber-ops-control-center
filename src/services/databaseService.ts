
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Operation = Database['public']['Tables']['operations']['Row']

export const databaseService = {
  // Operations
  async getOperations() {
    const { data, error } = await supabase
      .from('operations')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Operation[]
  },

  async createOperation(operation: Omit<Operation, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('operations')
      .insert(operation)
      .select()
      .single()
    
    if (error) throw error
    return data as Operation
  },

  async updateOperation(id: string, updates: Partial<Operation>) {
    const { data, error } = await supabase
      .from('operations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Operation
  },

  async deleteOperation(id: string) {
    const { error } = await supabase
      .from('operations')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Operation History
  async getOperationHistory() {
    const { data, error } = await supabase
      .from('operation_history')
      .select('*')
      .order('completed_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Profiles (for technician data)
  async getTechnicians() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'technician')
    
    if (error) throw error
    return data
  },

  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  }
}
