import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Define Types
export type InstallationStatus = 'pendente' | 'iniciando_provisionamento' | 'provisionamento_finalizado';
export type CTOStatus = 'pendente' | 'verificando' | 'verificacao_finalizada';
export type RMAStatus = 'pendente' | 'em_analise' | 'finalizado';
export type OperationType = 'installation' | 'cto' | 'rma';

export interface Operation {
  id: string;
  type: OperationType;
  data: Record<string, any>;
  createdAt: Date;
  status: InstallationStatus | CTOStatus | RMAStatus;
  feedback?: string;
  technicianResponse?: string; // Nova propriedade para armazenar a resposta do técnico
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
  technicianResponse?: string; // Nova propriedade para armazenar a resposta do técnico no histórico
}

interface OperationContextProps {
  operations: Operation[];
  addOperation: (type: OperationType, data: Record<string, any>, technician: string, technicianId?: string) => void;
  updateOperationStatus: (id: string, status: InstallationStatus | CTOStatus | RMAStatus) => void;
  updateOperationFeedback: (id: string, feedback: string) => void;
  updateTechnicianResponse: (id: string, response: string) => void; // Nova função para atualizar a resposta do técnico
  getOperationsByType: (type: OperationType) => Operation[];
  getPendingOperationsCount: (type?: OperationType) => number;
  assignOperatorToOperation: (id: string, operatorName: string) => void;
  unassignOperatorFromOperation: (id: string) => void;
  completeOperation: (id: string, operatorName: string) => void;
  getUserOperations: (technicianId: string) => Operation[];
  history: HistoryRecord[];
  getHistoryByType: (type: OperationType) => HistoryRecord[];
}

const OperationContext = createContext<OperationContextProps | undefined>(undefined);

// Local storage keys
const STORAGE_KEY = 'operations_data';
const HISTORY_KEY = 'operations_history';
const USER_DB_PREFIX = 'technician_operations_';

export const OperationProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const { user } = useAuth();
  
  // Default operations if none found in storage
  const defaultOperations: Operation[] = [
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

  // Initialize state from localStorage or with default values
  const [operations, setOperations] = useState<Operation[]>(() => {
    try {
      const storedOperations = localStorage.getItem(STORAGE_KEY);
      if (storedOperations) {
        // Parse and fix date objects that are stored as strings
        const parsedOperations = JSON.parse(storedOperations);
        return parsedOperations.map((op: any) => ({
          ...op,
          createdAt: new Date(op.createdAt),
          assignedAt: op.assignedAt ? new Date(op.assignedAt) : undefined
        }));
      }
      return defaultOperations;
    } catch (error) {
      console.error('Erro ao carregar operações:', error);
      return defaultOperations;
    }
  });

  const [history, setHistory] = useState<HistoryRecord[]>(() => {
    try {
      const storedHistory = localStorage.getItem(HISTORY_KEY);
      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory);
        return parsedHistory.map((record: any) => ({
          ...record,
          createdAt: new Date(record.createdAt),
          completedAt: new Date(record.completedAt)
        }));
      }
      return [];
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      return [];
    }
  });

  // Save to localStorage whenever operations change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(operations));
  }, [operations]);

  // Save to localStorage whenever history changes
  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  // Initialize or update technician's individual database
  useEffect(() => {
    if (user && user.role === 'technician') {
      const technicianKey = `${USER_DB_PREFIX}${user.id}`;
      
      // Get existing technician operations or initialize
      const existingOps = localStorage.getItem(technicianKey);
      if (!existingOps) {
        // Initialize with any operations already in the system for this technician
        const technicianOps = operations.filter(op => op.technicianId === user.id || op.technician === user.name);
        if (technicianOps.length > 0) {
          localStorage.setItem(technicianKey, JSON.stringify(technicianOps));
        } else {
          localStorage.setItem(technicianKey, JSON.stringify([]));
        }
      }
    }
  }, [user, operations]);

  const addOperation = (type: OperationType, data: Record<string, any>, technician: string, technicianId?: string) => {
    const newOperation: Operation = {
      id: String(Date.now()),
      type,
      data,
      createdAt: new Date(),
      status: 'pendente',
      technician,
      technicianId: technicianId || (user?.id || '')
    };
    
    setOperations(prev => [...prev, newOperation]);

    // Also add to technician's individual database if applicable
    if (technicianId || (user && user.role === 'technician')) {
      const id = technicianId || user?.id;
      if (id) {
        const technicianKey = `${USER_DB_PREFIX}${id}`;
        try {
          const existingOps = localStorage.getItem(technicianKey);
          let technicianOps = existingOps ? JSON.parse(existingOps) : [];
          technicianOps = [...technicianOps, newOperation];
          localStorage.setItem(technicianKey, JSON.stringify(technicianOps));
        } catch (error) {
          console.error('Erro ao adicionar operação ao banco do técnico:', error);
        }
      }
    }
  };

  const updateOperationStatus = (id: string, status: InstallationStatus | CTOStatus | RMAStatus) => {
    setOperations(prev => 
      prev.map(op => 
        op.id === id ? { ...op, status } : op
      )
    );

    // Update in technician's database if applicable
    const operation = operations.find(op => op.id === id);
    if (operation && operation.technicianId) {
      const technicianKey = `${USER_DB_PREFIX}${operation.technicianId}`;
      try {
        const existingOps = localStorage.getItem(technicianKey);
        if (existingOps) {
          let technicianOps = JSON.parse(existingOps);
          technicianOps = technicianOps.map((op: Operation) => 
            op.id === id ? { ...op, status } : op
          );
          localStorage.setItem(technicianKey, JSON.stringify(technicianOps));
        }
      } catch (error) {
        console.error('Erro ao atualizar status no banco do técnico:', error);
      }
    }
  };

  const updateOperationFeedback = (id: string, feedback: string) => {
    setOperations(prev => 
      prev.map(op => 
        op.id === id ? { ...op, feedback } : op
      )
    );

    // Update in technician's database if applicable
    const operation = operations.find(op => op.id === id);
    if (operation && operation.technicianId) {
      const technicianKey = `${USER_DB_PREFIX}${operation.technicianId}`;
      try {
        const existingOps = localStorage.getItem(technicianKey);
        if (existingOps) {
          let technicianOps = JSON.parse(existingOps);
          technicianOps = technicianOps.map((op: Operation) => 
            op.id === id ? { ...op, feedback } : op
          );
          localStorage.setItem(technicianKey, JSON.stringify(technicianOps));
        }
      } catch (error) {
        console.error('Erro ao atualizar feedback no banco do técnico:', error);
      }
    }
  };

  // Nova função para atualizar a resposta do técnico
  const updateTechnicianResponse = (id: string, response: string) => {
    setOperations(prev => 
      prev.map(op => 
        op.id === id ? { ...op, technicianResponse: response } : op
      )
    );

    // Update in technician's database if applicable
    const operation = operations.find(op => op.id === id);
    if (operation && operation.technicianId) {
      const technicianKey = `${USER_DB_PREFIX}${operation.technicianId}`;
      try {
        const existingOps = localStorage.getItem(technicianKey);
        if (existingOps) {
          let technicianOps = JSON.parse(existingOps);
          technicianOps = technicianOps.map((op: Operation) => 
            op.id === id ? { ...op, technicianResponse: response } : op
          );
          localStorage.setItem(technicianKey, JSON.stringify(technicianOps));
        }
      } catch (error) {
        console.error('Erro ao atualizar resposta no banco do técnico:', error);
      }
    }
  };

  const assignOperatorToOperation = (id: string, operatorName: string) => {
    setOperations(prev => 
      prev.map(op => 
        op.id === id ? { 
          ...op, 
          assignedOperator: operatorName,
          assignedAt: new Date()
        } : op
      )
    );

    // Update in technician's database if applicable
    const operation = operations.find(op => op.id === id);
    if (operation && operation.technicianId) {
      const technicianKey = `${USER_DB_PREFIX}${operation.technicianId}`;
      try {
        const existingOps = localStorage.getItem(technicianKey);
        if (existingOps) {
          let technicianOps = JSON.parse(existingOps);
          technicianOps = technicianOps.map((op: Operation) => 
            op.id === id ? { ...op, assignedOperator: operatorName, assignedAt: new Date() } : op
          );
          localStorage.setItem(technicianKey, JSON.stringify(technicianOps));
        }
      } catch (error) {
        console.error('Erro ao atualizar operador no banco do técnico:', error);
      }
    }
  };

  const unassignOperatorFromOperation = (id: string) => {
    setOperations(prev => 
      prev.map(op => {
        if (op.id === id) {
          const { assignedOperator, assignedAt, ...rest } = op;
          return rest;
        }
        return op;
      })
    );

    // Update in technician's database if applicable
    const operation = operations.find(op => op.id === id);
    if (operation && operation.technicianId) {
      const technicianKey = `${USER_DB_PREFIX}${operation.technicianId}`;
      try {
        const existingOps = localStorage.getItem(technicianKey);
        if (existingOps) {
          let technicianOps = JSON.parse(existingOps);
          technicianOps = technicianOps.map((op: Operation) => {
            if (op.id === id) {
              const { assignedOperator, assignedAt, ...rest } = op;
              return rest;
            }
            return op;
          });
          localStorage.setItem(technicianKey, JSON.stringify(technicianOps));
        }
      } catch (error) {
        console.error('Erro ao remover operador no banco do técnico:', error);
      }
    }
  };

  const completeOperation = (id: string, operatorName: string) => {
    // Find the operation to complete
    const operation = operations.find(op => op.id === id);
    
    if (!operation) return;
    
    // Create a history record
    const historyRecord: HistoryRecord = {
      id: String(Date.now()),
      operationId: operation.id,
      type: operation.type,
      data: operation.data,
      createdAt: operation.createdAt,
      completedAt: new Date(),
      technician: operation.technician,
      technicianId: operation.technicianId || '',
      operator: operatorName,
      feedback: operation.feedback,
      technicianResponse: operation.technicianResponse // Incluindo a resposta do técnico no histórico
    };
    
    // Add to history
    setHistory(prev => [...prev, historyRecord]);
    
    // Remove from active operations
    setOperations(prev => prev.filter(op => op.id !== id));
    
    // Remove from technician's database but keep completed status
    if (operation.technicianId) {
      const technicianKey = `${USER_DB_PREFIX}${operation.technicianId}`;
      try {
        const existingOps = localStorage.getItem(technicianKey);
        if (existingOps) {
          let technicianOps = JSON.parse(existingOps);
          
          // Update the operation status to indicate completion
          technicianOps = technicianOps.map((op: Operation) => {
            if (op.id === id) {
              const completionStatus = 
                op.type === 'installation' ? 'provisionamento_finalizado' as InstallationStatus :
                op.type === 'cto' ? 'verificacao_finalizada' as CTOStatus :
                'finalizado' as RMAStatus;
              
              return { 
                ...op, 
                status: completionStatus,
                completedBy: operatorName,
                completedAt: new Date()
              };
            }
            return op;
          });
          
          localStorage.setItem(technicianKey, JSON.stringify(technicianOps));
        }
      } catch (error) {
        console.error('Erro ao atualizar operação finalizada no banco do técnico:', error);
      }
    }
  };

  const getOperationsByType = (type: OperationType) => {
    return operations.filter(op => op.type === type);
  };

  const getHistoryByType = (type: OperationType) => {
    return history.filter(record => record.type === type);
  };

  const getUserOperations = (technicianId: string) => {
    const technicianKey = `${USER_DB_PREFIX}${technicianId}`;
    try {
      const existingOps = localStorage.getItem(technicianKey);
      if (existingOps) {
        const technicianOps = JSON.parse(existingOps);
        return technicianOps.map((op: any) => ({
          ...op,
          createdAt: new Date(op.createdAt),
          assignedAt: op.assignedAt ? new Date(op.assignedAt) : undefined,
          completedAt: op.completedAt ? new Date(op.completedAt) : undefined
        }));
      }
      // If no specific database, filter from main operations
      return operations.filter(
        op => op.technicianId === technicianId || op.technician === (user?.name || '')
      );
    } catch (error) {
      console.error('Erro ao carregar operações do técnico:', error);
      return [];
    }
  };

  const getPendingOperationsCount = (type?: OperationType) => {
    if (type) {
      return operations.filter(op => op.type === type && op.status === 'pendente').length;
    }
    return operations.filter(op => op.status === 'pendente').length;
  };

  return (
    <OperationContext.Provider 
      value={{ 
        operations, 
        addOperation, 
        updateOperationStatus,
        updateOperationFeedback,
        updateTechnicianResponse,
        getOperationsByType,
        getPendingOperationsCount,
        assignOperatorToOperation,
        unassignOperatorFromOperation,
        completeOperation,
        getUserOperations,
        history,
        getHistoryByType
      }}
    >
      {children}
    </OperationContext.Provider>
  );
};

export const useOperations = () => {
  const context = useContext(OperationContext);
  if (context === undefined) {
    throw new Error('useOperations must be used within an OperationProvider');
  }
  return context;
};
