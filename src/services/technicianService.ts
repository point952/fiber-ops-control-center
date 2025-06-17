import { supabase } from '@/lib/supabase'

export type Technician = {
  id: string
  name: string
  email: string
  phone: string
  status: 'available' | 'busy' | 'offline'
  created_at: string
}

export const technicianService = {
  // Buscar todos os técnicos
  async getAllTechnicians() {
    const { data, error } = await supabase
      .from('technicians')
      .select('*')
      .order('name')
    
    if (error) throw error
    return data as Technician[]
  },

  // Buscar um técnico específico
  async getTechnicianById(id: string) {
    const { data, error } = await supabase
      .from('technicians')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data as Technician
  },

  // Criar um novo técnico
  async createTechnician(technician: Omit<Technician, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('technicians')
      .insert(technician)
      .select()
      .single()
    
    if (error) throw error
    return data as Technician
  },

  // Atualizar um técnico
  async updateTechnician(id: string, updates: Partial<Technician>) {
    const { data, error } = await supabase
      .from('technicians')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Technician
  },

  // Atualizar o status de um técnico
  async updateTechnicianStatus(id: string, status: Technician['status']) {
    const { data, error } = await supabase
      .from('technicians')
      .update({ status })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Technician
  },

  // Buscar técnicos disponíveis
  async getAvailableTechnicians() {
    const { data, error } = await supabase
      .from('technicians')
      .select('*')
      .eq('status', 'available')
      .order('name')
    
    if (error) throw error
    return data as Technician[]
  },

  // Buscar técnicos ocupados
  async getBusyTechnicians() {
    const { data, error } = await supabase
      .from('technicians')
      .select('*')
      .eq('status', 'busy')
      .order('name')
    
    if (error) throw error
    return data as Technician[]
  }
} 