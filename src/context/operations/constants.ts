// Operation types
export const OPERATION_TYPES = {
  INSTALLATION: 'installation',
  CTO: 'cto',
  RMA: 'rma'
} as const;

// Operation status
export const OPERATION_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

// Default operation data
export const defaultOperationData = {
  [OPERATION_TYPES.INSTALLATION]: {
    Cliente: '',
    Endereco: '',
    Bairro: '',
    Cidade: '',
    Estado: '',
    CEP: '',
    Telefone: '',
    Email: '',
    Plano: '',
    Equipamento: '',
    Serial: '',
    Coordenadas: '',
    Observacoes: ''
  },
  [OPERATION_TYPES.CTO]: {
    cto: '',
    bairro: '',
    rua: '',
    coordenadas: '',
    observacoes: ''
  },
  [OPERATION_TYPES.RMA]: {
    serial: '',
    modelo: '',
    problema: '',
    observacoes: ''
  }
};
