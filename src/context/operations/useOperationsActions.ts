
import { useState } from 'react';
import { HistoryRecord, Operation, OperationStatus, OperationType } from './types';
import { saveHistory, saveOperations, updateTechnicianLocalDatabase } from './utils';
import { toast } from 'sonner';

export const useOperationsActions = (
  initialOperations: Operation[],
  initialHistory: HistoryRecord[]
) => {
  const [operations, setOperations] = useState<Operation[]>(initialOperations);
  const [history, setHistory] = useState<HistoryRecord[]>(initialHistory);

  // Save to localStorage whenever operations change
  const updateOperations = (newOperations: Operation[]) => {
    setOperations(newOperations);
    saveOperations(newOperations);
  };

  // Save to localStorage whenever history changes
  const updateHistory = (newHistory: HistoryRecord[]) => {
    setHistory(newHistory);
    saveHistory(newHistory);
  };

  const addOperation = (
    type: OperationType, 
    data: Record<string, any>, 
    technician: string, 
    technicianId?: string
  ) => {
    const newOperation: Operation = {
      id: String(Date.now()),
      type,
      data,
      createdAt: new Date(),
      status: 'pendente' as OperationStatus,
      technician,
      technicianId
    };
    
    updateOperations([...operations, newOperation]);

    // Also add to technician's individual database if applicable
    if (technicianId) {
      updateTechnicianLocalDatabase(technicianId, (technicianOps) => {
        return [...technicianOps, newOperation];
      });
    }
  };

  const updateOperationStatus = (id: string, status: OperationStatus) => {
    const newOperations = operations.map(op => 
      op.id === id ? { ...op, status } : op
    );
    
    updateOperations(newOperations);

    // Update in technician's database if applicable
    const operation = operations.find(op => op.id === id);
    if (operation?.technicianId) {
      updateTechnicianLocalDatabase(operation.technicianId, (technicianOps) => {
        return technicianOps.map((op: Operation) => 
          op.id === id ? { ...op, status } : op
        );
      });
    }
  };

  const updateOperationFeedback = (id: string, feedback: string) => {
    const newOperations = operations.map(op => 
      op.id === id ? { ...op, feedback } : op
    );
    
    updateOperations(newOperations);

    // Update in technician's database if applicable
    const operation = operations.find(op => op.id === id);
    if (operation?.technicianId) {
      updateTechnicianLocalDatabase(operation.technicianId, (technicianOps) => {
        return technicianOps.map((op: Operation) => 
          op.id === id ? { ...op, feedback } : op
        );
      });
    }
  };

  const updateTechnicianResponse = (id: string, response: string) => {
    const newOperations = operations.map(op => 
      op.id === id ? { ...op, technicianResponse: response } : op
    );
    
    updateOperations(newOperations);

    // Update in technician's database if applicable
    const operation = operations.find(op => op.id === id);
    if (operation?.technicianId) {
      updateTechnicianLocalDatabase(operation.technicianId, (technicianOps) => {
        return technicianOps.map((op: Operation) => 
          op.id === id ? { ...op, technicianResponse: response } : op
        );
      });
    }
  };

  const assignOperatorToOperation = (id: string, operatorName: string) => {
    const newOperations = operations.map(op => 
      op.id === id ? { 
        ...op, 
        assignedOperator: operatorName,
        assignedAt: new Date()
      } : op
    );
    
    updateOperations(newOperations);

    // Update in technician's database if applicable
    const operation = operations.find(op => op.id === id);
    if (operation?.technicianId) {
      updateTechnicianLocalDatabase(operation.technicianId, (technicianOps) => {
        return technicianOps.map((op: Operation) => 
          op.id === id ? { ...op, assignedOperator: operatorName, assignedAt: new Date() } : op
        );
      });
    }
  };

  const unassignOperatorFromOperation = (id: string) => {
    const newOperations = operations.map(op => {
      if (op.id === id) {
        const { assignedOperator, assignedAt, ...rest } = op;
        return rest;
      }
      return op;
    });
    
    updateOperations(newOperations);

    // Update in technician's database if applicable
    const operation = operations.find(op => op.id === id);
    if (operation?.technicianId) {
      updateTechnicianLocalDatabase(operation.technicianId, (technicianOps) => {
        return technicianOps.map((op: Operation) => {
          if (op.id === id) {
            const { assignedOperator, assignedAt, ...rest } = op;
            return rest;
          }
          return op;
        });
      });
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
      technicianResponse: operation.technicianResponse
    };
    
    // Add to history
    updateHistory([...history, historyRecord]);
    
    // Remove from active operations
    updateOperations(operations.filter(op => op.id !== id));
    
    // Update in technician's database
    if (operation.technicianId) {
      updateTechnicianLocalDatabase(operation.technicianId, (technicianOps) => {
        // Update the operation status to indicate completion
        return technicianOps.map((op: Operation) => {
          if (op.id === id) {
            const completionStatus = 
              op.type === 'installation' ? 'provisionamento_finalizado' as OperationStatus :
              op.type === 'cto' ? 'verificacao_finalizada' as OperationStatus :
              'finalizado' as OperationStatus;
            
            return { 
              ...op, 
              status: completionStatus,
              completedBy: operatorName,
              completedAt: new Date()
            };
          }
          return op;
        });
      });
    }
  };

  const getOperationsByType = (type: OperationType) => {
    return operations.filter(op => op.type === type);
  };

  const getHistoryByType = (type: OperationType) => {
    return history.filter(record => record.type === type);
  };

  const getUserOperations = (technicianId: string) => {
    const USER_DB_PREFIX = 'technician_operations_';
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
        op => op.technicianId === technicianId
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

  return {
    operations,
    history,
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
    getHistoryByType
  };
};
