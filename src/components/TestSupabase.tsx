import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function TestSupabase() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [errorDetails, setErrorDetails] = useState('')

  useEffect(() => {
    async function checkConnection() {
      try {
        // Verificar se as variáveis de ambiente estão definidas
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseAnonKey) {
          setStatus('error')
          setMessage('Erro: Variáveis de ambiente não encontradas')
          setErrorDetails(`URL: ${supabaseUrl ? 'Definida' : 'Não definida'}\nChave: ${supabaseAnonKey ? 'Definida' : 'Não definida'}`)
          return
        }

        // Tentar fazer uma consulta simples
        const { data, error } = await supabase.from('technicians').select('count')
        
        if (error) {
          setStatus('error')
          setMessage('Erro na conexão com Supabase')
          setErrorDetails(`Detalhes do erro: ${error.message}`)
          return
        }
        
        setStatus('success')
        setMessage('Conexão com Supabase estabelecida!')
        setErrorDetails('')
      } catch (error) {
        setStatus('error')
        setMessage('Erro ao testar conexão')
        setErrorDetails(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      }
    }

    checkConnection()
  }, [])

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Teste de Conexão Supabase</h2>
      <div className={`p-4 rounded ${
        status === 'loading' ? 'bg-yellow-100' :
        status === 'success' ? 'bg-green-100' :
        'bg-red-100'
      }`}>
        <p className="font-semibold">{message}</p>
        {errorDetails && (
          <pre className="mt-2 text-sm whitespace-pre-wrap">
            {errorDetails}
          </pre>
        )}
      </div>
    </div>
  )
} 