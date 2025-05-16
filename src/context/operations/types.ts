
// Define Types
export type InstallationStatus = 'pendente' | 'iniciando_provisionamento' | 'provisionamento_finalizado';
export type CTOStatus = 'pendente' | 'verificando' | 'verificacao_finalizada';
export type RMAStatus = 'pendente' | 'em_analise' | 'finalizado';
export type OperationType = 'installation' | 'cto' | 'rma';
export type OperationStatus = InstallationStatus | CTOStatus | RMAStatus;

export interface Operation {
  id: string;
  type: OperationType;
  data: Record<string, any>;
  createdAt: Date;
  status: OperationStatus;
  feedback?: string;
  technicianResponse?: string;
  technician: string;
  technicianId?: string;
  assignedOperator?: string;
  assignedAt?: Date;
}

export interface HistoryRecord {
  id: string;
  operationId: string;
  type: OperationType;
  data: Record<string, any>;
  createdAt: Date;
  completedAt: Date;
  technician: string;
  technicianId: string;
  operator: string;
  feedback?: string;
  technicianResponse?: string;
}

export interface OperationContextProps {
  operations: Operation[];
  addOperation: (type: OperationType, data: Record<string, any>, technician: string, technicianId?: string) => void;
  updateOperationStatus: (id: string, status: OperationStatus) => void;
  updateOperationFeedback: (id: string, feedback: string) => void;
  updateTechnicianResponse: (id: string, response: string) => void;
  getOperationsByType: (type: OperationType) => Operation[];
  getPendingOperationsCount: (type?: OperationType) => number;
  assignOperatorToOperation: (id: string, operatorName: string) => void;
  unassignOperatorFromOperation: (id: string) => void;
  completeOperation: (id: string, operatorName: string) => void;
  getUserOperations: (technicianId: string) => Operation[];
  history: HistoryRecord[];
  getHistoryByType: (type: OperationType) => HistoryRecord[];
}
