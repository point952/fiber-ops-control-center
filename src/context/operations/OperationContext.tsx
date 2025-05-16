
import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from '../AuthContext';
import { OperationContextProps } from './types';
import { loadHistory, loadOperations, initializeTechnicianDatabase } from './utils';
import { useOperationsActions } from './useOperationsActions';

const OperationContext = createContext<OperationContextProps | undefined>(undefined);

export const OperationProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const { user } = useAuth();
  
  // Initialize state from localStorage
  const initialOperations = loadOperations();
  const initialHistory = loadHistory();
  
  const {
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
  } = useOperationsActions(initialOperations, initialHistory);

  // Initialize or update technician's individual database
  useEffect(() => {
    if (user && user.role === 'technician') {
      initializeTechnicianDatabase(user.id, user.name, operations);
    }
  }, [user, operations]);

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
