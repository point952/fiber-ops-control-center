import { supabase } from './supabase'

export async function testConnection() {
  try {
    const { data, error } = await supabase.from('technicians').select('count')
    
    if (error) {
      console.error('Erro na conexão:', error.message)
      return false
    }
    
    console.log('Conexão bem sucedida!')
    return true
  } catch (error) {
    console.error('Erro ao testar conexão:', error)
    return false
  }
} 