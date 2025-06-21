import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

interface Technician {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'available' | 'busy' | 'offline';
}

export function TechnicianList() {
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTechnicians()
  }, [])

  async function loadTechnicians() {
    try {
      setLoading(true)
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'technician')

      if (error) throw error

      const techniciansData = profiles.map(profile => ({
        id: profile.id,
        name: profile.name || 'Técnico',
        email: profile.email || '',
        phone: '',
        status: 'available' as const
      }))

      setTechnicians(techniciansData)
    } catch (error) {
      toast.error('Erro ao carregar técnicos')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-4">Carregando técnicos...</div>
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Lista de Técnicos</h2>
      <div className="grid gap-4">
        {technicians.map((technician) => (
          <div
            key={technician.id}
            className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{technician.name}</h3>
                <p className="text-sm text-gray-600">{technician.email}</p>
                <p className="text-sm text-gray-600">{technician.phone}</p>
              </div>
              <span className={`px-2 py-1 rounded text-sm ${
                technician.status === 'available' ? 'bg-green-100 text-green-800' :
                technician.status === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {technician.status === 'available' ? 'Disponível' :
                 technician.status === 'busy' ? 'Ocupado' :
                 'Offline'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
