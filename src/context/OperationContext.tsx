
import React, { createContext, useContext, useState, ReactNode } from 'react';

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
}

interface OperationContextProps {
  operations: Operation[];
  addOperation: (type: OperationType, data: Record<string, any>, technician: string) => void;
  updateOperationStatus: (id: string, status: InstallationStatus | CTOStatus | RMAStatus) => void;
  updateOperationFeedback: (id: string, feedback: string) => void;
  getOperationsByType: (type: OperationType) => Operation[];
  getPendingOperationsCount: (type?: OperationType) => number;
}

const OperationContext = createContext<OperationContextProps | undefined>(undefined);

export const OperationProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [operations, setOperations] = useState<Operation[]>([
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
  ]);

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
        getPendingOperationsCount
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
