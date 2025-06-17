
import { HistoryRecord, Operation } from './types';
import { HISTORY_KEY, STORAGE_KEY, USER_DB_PREFIX, defaultOperations } from './constants';

// Load operations from local storage
export const loadOperations = (): Operation[] => {
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
};

// Load history from local storage
export const loadHistory = (): HistoryRecord[] => {
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
};

// Save operations to local storage
export const saveOperations = (operations: Operation[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(operations));
};

// Save history to local storage
export const saveHistory = (history: HistoryRecord[]): void => {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};

// Update technician's local database
export const updateTechnicianLocalDatabase = (
  technicianId: string,
  updater: (technicianOps: Operation[]) => Operation[]
): void => {
  if (!technicianId) return;
  
  const technicianKey = `${USER_DB_PREFIX}${technicianId}`;
  try {
    const existingOps = localStorage.getItem(technicianKey);
    if (existingOps) {
      let technicianOps = JSON.parse(existingOps);
      technicianOps = updater(technicianOps);
      localStorage.setItem(technicianKey, JSON.stringify(technicianOps));
    }
  } catch (error) {
    console.error('Erro ao atualizar banco do técnico:', error);
  }
};

// Initialize technician's local database
export const initializeTechnicianDatabase = (
  userId: string | undefined, 
  userName: string | undefined,
  operations: Operation[]
): void => {
  if (!userId) return;
  
  const technicianKey = `${USER_DB_PREFIX}${userId}`;
  
  // Get existing technician operations or initialize
  const existingOps = localStorage.getItem(technicianKey);
  if (!existingOps) {
    // Initialize with any operations already in the system for this technician
    const technicianOps = operations.filter(
      op => op.technicianId === userId || op.technician === userName
    );
    
    if (technicianOps.length > 0) {
      localStorage.setItem(technicianKey, JSON.stringify(technicianOps));
    } else {
      localStorage.setItem(technicianKey, JSON.stringify([]));
    }
  }
};
