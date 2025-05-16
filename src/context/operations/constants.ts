
// Local storage keys
export const STORAGE_KEY = 'operations_data';
export const HISTORY_KEY = 'operations_history';
export const USER_DB_PREFIX = 'technician_operations_';

// Default operations data
export const defaultOperations = [
  {
    id: '1',
    type: 'installation',
    data: {
      Cliente: 'João Silva',
      Serviço: 'Nova Instalação',
      Modelo: 'ONT-123',
      Serial: 'ABC12345',
      Endereço: 'Rua das Flores, 123',
      Observações: 'Cliente prefere instalação no período da tarde'
    },
    createdAt: new Date('2023-05-10T10:30:00'),
    status: 'pendente',
    technician: 'Técnico Padrão',
    technicianId: '3'
  },
  {
    id: '2',
    type: 'cto',
    data: {
      cto: 'CTO-987',
      bairro: 'Centro',
      rua: 'Av. Principal',
      tipo: 'Aéreo',
      portas: 8
    },
    createdAt: new Date('2023-05-11T14:15:00'),
    status: 'pendente',
    technician: 'Técnico CTO',
    technicianId: '3'
  },
  {
    id: '3',
    type: 'rma',
    data: {
      modelo: 'ONT-456',
      serial: 'XYZ78901',
      problema: 'Dispositivo não liga'
    },
    createdAt: new Date('2023-05-12T09:45:00'),
    status: 'pendente',
    technician: 'Técnico RMA',
    technicianId: '3'
  }
];
