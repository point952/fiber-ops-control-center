
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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
  technician: string;
  assignedOperator?: string;
  assignedAt?: Date;
}

interface OperationContextProps {
  operations: Operation[];
  addOperation: (type: OperationType, data: Record<string, any>, technician: string) => void;
  updateOperationStatus: (id: string, status: InstallationStatus | CTOStatus | RMAStatus) => void;
  updateOperationFeedback: (id: string, feedback: string) => void;
  getOperationsByType: (type: OperationType) => Operation[];
  getPendingOperationsCount: (type?: OperationType) => number;
  assignOperatorToOperation: (id: string, operatorName: string) => void;
  unassignOperatorFromOperation: (id: string) => void;
}

const OperationContext = createContext<OperationContextProps | undefined>(undefined);

// Local storage key for operations
const STORAGE_KEY = 'operations_data';

export const OperationProvider: React.FC<{children: ReactNode}> = ({ children }) => {
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
      technician: 'Técnico Padrão'
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
      technician: 'Técnico CTO'
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
      technician: 'Técnico RMA'
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

  // Save to localStorage whenever operations change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(operations));
  }, [operations]);

  const addOperation = (type: OperationType, data: Record<string, any>, technician: string) => {
    const newOperation: Operation = {
      id: String(Date.now()),
      type,
      data,
      createdAt: new Date(),
      status: 'pendente',
      technician
    };
    setOperations(prev => [...prev, newOperation]);
  };

  const updateOperationStatus = (id: string, status: InstallationStatus | CTOStatus | RMAStatus) => {
    setOperations(prev => 
      prev.map(op => 
        op.id === id ? { ...op, status } : op
      )
    );
  };

  const updateOperationFeedback = (id: string, feedback: string) => {
    setOperations(prev => 
      prev.map(op => 
        op.id === id ? { ...op, feedback } : op
      )
    );
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
  };

  const getOperationsByType = (type: OperationType) => {
    return operations.filter(op => op.type === type);
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
        getOperationsByType,
        getPendingOperationsCount,
        assignOperatorToOperation,
        unassignOperatorFromOperation
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
