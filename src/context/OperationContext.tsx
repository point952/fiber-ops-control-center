
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type InstallationStatus = 'pendente' | 'iniciando_provisionamento' | 'provisionamento_finalizado';
export type CTOStatus = 'pendente' | 'verificando' | 'verificacao_finalizada';
export type RMAStatus = 'pendente' | 'em_analise' | 'finalizado';

export interface Operation {
  id: string;
  type: 'installation' | 'cto' | 'rma';
  data: Record<string, any>;
  status: InstallationStatus | CTOStatus | RMAStatus;
  feedback?: string;
  technician: string;
  createdAt: Date;
  updatedAt: Date;
}

interface OperationContextType {
  operations: Operation[];
  addOperation: (operation: Omit<Operation, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateOperationStatus: (id: string, status: InstallationStatus | CTOStatus | RMAStatus) => void;
  updateOperationFeedback: (id: string, feedback: string) => void;
  getOperationById: (id: string) => Operation | undefined;
}

const OperationContext = createContext<OperationContextType | undefined>(undefined);

export const useOperations = () => {
  const context = useContext(OperationContext);
  if (!context) {
    throw new Error('useOperations must be used within an OperationProvider');
  }
  return context;
};

export const OperationProvider = ({ children }: { children: ReactNode }) => {
  const [operations, setOperations] = useState<Operation[]>([]);

  const addOperation = (operation: Omit<Operation, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newOperation: Operation = {
      ...operation,
      id: `op-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setOperations(prev => [newOperation, ...prev]);
    return newOperation.id;
  };

  const updateOperationStatus = (id: string, status: InstallationStatus | CTOStatus | RMAStatus) => {
    setOperations(prev => 
      prev.map(op => 
        op.id === id 
          ? { ...op, status, updatedAt: new Date() } 
          : op
      )
    );
  };

  const updateOperationFeedback = (id: string, feedback: string) => {
    setOperations(prev => 
      prev.map(op => 
        op.id === id 
          ? { ...op, feedback, updatedAt: new Date() } 
          : op
      )
    );
  };

  const getOperationById = (id: string) => {
    return operations.find(op => op.id === id);
  };

  const value = {
    operations,
    addOperation,
    updateOperationStatus,
    updateOperationFeedback,
    getOperationById
  };

  return (
    <OperationContext.Provider value={value}>
      {children}
    </OperationContext.Provider>
  );
};
