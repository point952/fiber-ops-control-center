// Define Types
export type OperationStatus = 
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'verificando'
  | 'iniciando_provisionamento';

export interface Message {
  id: string;
  operation_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  created_at: string;
  is_read: boolean;
  is_operator: boolean;
}

export interface Operation {
  id: string;
  type: 'installation' | 'cto' | 'rma';
  data: Record<string, any>;
  status: OperationStatus;
  technician_id: string;
  technician: string;
  operator_id: string | null;
  operator: string | null;
  assigned_operator: string | null;
  feedback: string | null;
  technician_response: string | null;
  created_at: string;
  assigned_at: string | null;
  completed_at: string | null;
  updated_at: string;
  messages?: Message[];
}

export interface HistoryRecord {
  id: string;
  operation_id: string;
  type: 'installation' | 'cto' | 'rma';
  data: Record<string, any>;
  created_at: string;
  completed_at: string;
  technician: string;
  technician_id: string;
  operator?: string;
  feedback?: string;
  technician_response?: string;
  status: OperationStatus;
}

export interface OperationContextProps {
  operations: Operation[];
  history: HistoryRecord[];
  addOperation: (operation: Omit<Operation, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateOperationStatus: (id: string, status: OperationStatus) => Promise<void>;
  updateOperationFeedback: (id: string, feedback: string) => Promise<void>;
  updateTechnicianResponse: (id: string, response: string) => Promise<void>;
  assignOperatorToOperation: (id: string, operator: string) => Promise<void>;
  unassignOperatorFromOperation: (id: string) => Promise<void>;
  completeOperation: (id: string, operator: string) => Promise<void>;
  getUserOperations: (userId: string) => Operation[];
  refreshOperations: () => Promise<void>;
}

// Helper functions
export const getOperationsByType = (operations: Operation[], type: Operation['type']) => {
  return operations.filter(op => op.type === type);
};

export const getPendingOperationsCount = (operations: Operation[]) => {
  return operations.filter(op => op.status === 'pending').length;
};

export const getUserOperations = (operations: Operation[], userId: string) => {
  return operations.filter(op => op.technician_id === userId);
};

export const getHistoryByType = (history: HistoryRecord[], type: HistoryRecord['type']) => {
  return history.filter(record => record.type === type);
};
