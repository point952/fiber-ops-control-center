import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type Operation = Database['public']['Tables']['operations']['Row']
type Technician = Database['public']['Tables']['technicians']['Row']

export const databaseService = {
  // Operações
  async getOperations() {
    const { data, error } = await supabase
      .from('operations')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getOperationById(id: string) {
    const { data, error } = await supabase
      .from('operations')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async createOperation(operation: Omit<Operation, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('operations')
      .insert(operation)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateOperation(id: string, updates: Partial<Operation>) {
    const { data, error } = await supabase
      .from('operations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteOperation(id: string) {
    const { error } = await supabase
      .from('operations')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Técnicos
  async getTechnicians() {
    const { data, error } = await supabase
      .from('technicians')
      .select('*')
    
    if (error) throw error
    return data as Technician[]
  },

  async updateTechnicianStatus(id: string, status: Technician['status']) {
    const { data, error } = await supabase
      .from('technicians')
      .update({ status })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Technician
  }
} 