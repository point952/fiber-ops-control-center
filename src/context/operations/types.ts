
export type OperationStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface Operation {
  id: string;
  type: 'installation' | 'cto' | 'rma';
  data: Record<string, any>;
  status: OperationStatus;
  technician: string;
  technician_id?: string;
  feedback?: string;
  technician_response?: string;
  assigned_operator?: string;
  assigned_at?: string;
  completed_by?: string;
  completed_at?: string;
  created_at: string;
}

export interface HistoryRecord {
  id: string;
  operation_id: string;
  type: 'installation' | 'cto' | 'rma';
  data: Record<string, any>;
  created_at: string;
  completed_at: string;
  technician: string;
  technician_id?: string;
  operator?: string;
  feedback?: string;
  technician_response?: string;
}

export interface Message {
  id: string;
  operation_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  created_at: string;
  is_operator: boolean;
  is_read: boolean;
}
