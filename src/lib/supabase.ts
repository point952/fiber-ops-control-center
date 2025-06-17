import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL e Anon Key são necessários')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'fiber-ops-session',
    storage: {
      getItem: (key) => {
        const value = sessionStorage.getItem(key)
        return value ? JSON.parse(value) : null
      },
      setItem: (key, value) => {
        sessionStorage.setItem(key, JSON.stringify(value))
      },
      removeItem: (key) => {
        sessionStorage.removeItem(key)
      }
    }
  }
})

// Tipos para as tabelas do banco de dados
export type Database = {
  public: {
    Tables: {
      operations: {
        Row: {
          id: string
          type: 'installation' | 'cto' | 'rma'
          data: Record<string, any>
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          technician_id: string
          technician: string
          operator_id: string | null
          operator: string | null
          assigned_operator: string | null
          feedback: string | null
          technician_response: string | null
          created_at: string
          assigned_at: string | null
          completed_at: string | null
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['operations']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['operations']['Insert']>
      }
      operation_history: {
        Row: {
          id: string
          operation_id: string
          type: 'installation' | 'cto' | 'rma'
          data: Record<string, any>
          created_at: string
          completed_at: string
          technician: string
          technician_id: string
          operator: string | null
          feedback: string | null
          technician_response: string | null
        }
        Insert: Omit<Database['public']['Tables']['operation_history']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['operation_history']['Insert']>
      }
      technicians: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          status: 'available' | 'busy' | 'offline'
        }
        Insert: Omit<Database['public']['Tables']['technicians']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['technicians']['Insert']>
      }
      messages: {
        Row: {
          id: string
          created_at: string
          sender_id: string
          receiver_id: string
          content: string
          read: boolean
        }
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at' | 'read'>
        Update: Partial<Database['public']['Tables']['messages']['Insert']>
      }
    }
  }
} 