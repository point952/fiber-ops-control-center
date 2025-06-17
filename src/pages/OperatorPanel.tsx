import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOperations } from '../context/operations/OperationsContext';
import { useAuth } from '../context/AuthContext';
import OperatorHeader from '../components/Operator/OperatorHeader';
import OperatorTabs from '../components/Operator/OperatorTabs';
import InstallationOperations from '../components/Operator/InstallationOperations';
import CTOAnalysisOperations from '../components/Operator/CTOAnalysisOperations';
import RMAOperations from '../components/Operator/RMAOperations';
import OperatorHistory from '../components/Operator/OperatorHistory';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { Bell, Database, History } from 'lucide-react';
import { useIsMobile } from '../hooks/use-mobile';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { supabase } from '../lib/supabase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OperationQueue from '@/components/Operator/OperationQueue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type TabType = 'installation' | 'cto' | 'rma' | 'history';

const OperatorPanel = () => {
  const [activeTab, setActiveTab] = useState<TabType>('installation');
  const { operations, assignOperation, history, refreshOperations } = useOperations();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showDbStats, setShowDbStats] = useState(false);
  
  // Count pending operations for queue simulation
  const pendingOperations = operations.filter(op => 
    op.status === 'pending' || op.status === 'in_progress'
  ).length;
  
  // Count operations by type and status
  const stats = {
    installation: {
      total: operations.filter(op => op.type === 'installation').length,
      pending: operations.filter(op => op.type === 'installation' && (op.status === 'pending' || op.status === 'in_progress')).length,
      completed: operations.filter(op => op.type === 'installation' && op.status === 'completed').length,
    },
    cto: {
      total: operations.filter(op => op.type === 'cto').length,
      pending: operations.filter(op => op.type === 'cto' && (op.status === 'pending' || op.status === 'in_progress')).length,
      completed: operations.filter(op => op.type === 'cto' && op.status === 'completed').length,
    },
    rma: {
      total: operations.filter(op => op.type === 'rma').length,
      pending: operations.filter(op => op.type === 'rma' && (op.status === 'pending' || op.status === 'in_progress')).length,
      completed: operations.filter(op => op.type === 'rma' && op.status === 'completed').length,
    }
  };

  // Count assigned operations
  const assignedOperations = operations.filter(op => op.assigned_operator).length;
  const assignedToCurrentOperator = operations.filter(
    op => op.assigned_operator === user?.name || op.assigned_operator === user?.username
  ).length;

  // Count today's history
  const todayHistory = history.filter(h => {
    const today = new Date();
    const historyDate = new Date(h.created_at);
    return historyDate.toDateString() === today.toDateString();
  }).length;
  
  useEffect(() => {
    // Subscribe to real-time updates
    const operationsSubscription = supabase
      .channel('operations_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'operations' 
        }, 
        (payload) => {
          console.log('Change received!', payload);
          refreshOperations();
          
          // Check if it's a new operation
          if (payload.eventType === 'INSERT') {
            setHasNewNotification(true);
            
            // Play notification sound if enabled
            if (soundEnabled) {
              try {
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                audio.volume = 0.5;
                audio.play();
              } catch (err) {
                console.log('Error playing notification sound:', err);
              }
            }
            
            toast.info('Nova operação recebida!', {
              duration: 5000,
              action: {
                label: "Visualizar",
                onClick: () => {
                  setActiveTab(payload.new.type as TabType);
                }
              }
            });
          }
        }
      )
      .subscribe();

    // Subscribe to history changes
    const historySubscription = supabase
      .channel('history_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'operation_history' 
        }, 
        (payload) => {
          console.log('History change received!', payload);
          refreshOperations();
        }
      )
      .subscribe();

    return () => {
      operationsSubscription.unsubscribe();
      historySubscription.unsubscribe();
    };
  }, [refreshOperations, soundEnabled]);
  
  const dismissNotifications = () => {
    setHasNewNotification(false);
  };

  // Logic to assign/claim a task to the current operator
  const claimTask = async (operationId: string) => {
    if (!user) return;
    
    try {
      await assignOperation(operationId, user.id, user.name);
      toast.success(`Chamado atribuído a ${user.name}`);
    } catch (error) {
      console.error('Erro ao atribuir chamado:', error);
      toast.error('Erro ao atribuir chamado');
    }
  };

  // Update the tab list to include history
  const tabOptions: { value: TabType; label: string; count?: number }[] = [
    { value: 'installation', label: 'Instalações', count: stats.installation.total },
    { value: 'cto', label: 'CTOs', count: stats.cto.total },
    { value: 'rma', label: 'RMAs', count: stats.rma.total },
    { value: 'history', label: 'Histórico', count: todayHistory }
  ];

  const renderTabContent = () => {
    // Pass the claim task function to each operation component
    const props = { onClaimTask: claimTask };
    
    switch (activeTab) {
      case 'installation':
        return <InstallationOperations {...props} />;
      case 'cto':
        return <CTOAnalysisOperations {...props} />;
      case 'rma':
        return <RMAOperations {...props} />;
      case 'history':
        return <OperatorHistory />;
      default:
        return <div>Selecione uma guia</div>;
    }
  };
  
  // Only show appropriate controls based on user role
  const showControls = user?.role === 'operator' || user?.role === 'admin';

  if (!user) {
    return null;
  }

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      <OperatorHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Painel do Operador</h1>
            <p className="text-gray-600">
              Bem-vindo, {user?.name || 'Operador'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {queuePosition !== null && showControls && (
              <div className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-md text-sm flex items-center">
                <span className="font-medium">Posição na fila:</span>
                <Badge variant="secondary" className="ml-2 bg-blue-200">
                  {queuePosition}º
                </Badge>
              </div>
            )}
            
            {showControls && (
              <>
                <div className="relative">
                  <button 
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors relative"
                    onClick={dismissNotifications}
                  >
                    <Bell className="h-5 w-5 text-gray-700" />
                    {hasNewNotification && (
                      <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
                    )}
                  </button>
                </div>
                
                <button 
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-2 rounded-full transition-colors ${
                    soundEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <span className="text-xs font-medium">
                    {soundEnabled ? 'Som ON' : 'Som OFF'}
                  </span>
                </button>
              </>
            )}
            
            <button
              onClick={() => setActiveTab('history')}
              className="bg-amber-100 text-amber-800 px-4 py-2 rounded-md hover:bg-amber-200 transition-colors flex items-center gap-2"
            >
              <History className="h-4 w-4" />
              <span>Histórico</span>
              {todayHistory > 0 && (
                <Badge variant="secondary" className="bg-amber-200">
                  {todayHistory}
                </Badge>
              )}
            </button>
            
            {user?.role === 'admin' && (
              <button
                onClick={() => setShowDbStats(true)}
                className="bg-purple-100 text-purple-800 px-4 py-2 rounded-md hover:bg-purple-200 transition-colors flex items-center gap-2"
              >
                <Database className="h-4 w-4" />
                <span>Estatísticas</span>
              </button>
            )}
            
            {user?.role === 'admin' && (
              <button
                onClick={() => navigate('/')}
                className="bg-blue-100 text-blue-800 px-4 py-2 rounded-md hover:bg-blue-200 transition-colors"
              >
                Voltar para Área do Técnico
              </button>
            )}
          </div>
        </div>

        {/* Status summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total de Chamados</h3>
            <p className="text-2xl font-bold">{operations.length}</p>
            <div className="flex justify-between mt-2 text-xs">
              <span className="text-yellow-600">Pendentes: {pendingOperations}</span>
              <span className="text-green-600">Concluídos: {operations.filter(op => 
                op.status === 'completed'
              ).length}</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Chamados Atribuídos</h3>
            <p className="text-2xl font-bold">{assignedOperations} / {operations.length}</p>
            <div className="mt-2 text-xs">
              <span className="text-purple-600">Atribuídos a você: {assignedToCurrentOperator}</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Técnicos Ativos</h3>
            <p className="text-2xl font-bold">
              {new Set(operations.map(op => op.technician_id)).size}
            </p>
            <div className="mt-2 text-xs">
              <span className="text-blue-600">
                Operações mais recentes: {operations.filter(op => {
                  const today = new Date();
                  const opDate = new Date(op.created_at);
                  return opDate.toDateString() === today.toDateString();
                }).length} hoje
              </span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Histórico</h3>
            <p className="text-2xl font-bold">{todayHistory}</p>
            <div className="mt-2 text-xs">
              <span className="text-green-600">Operações finalizadas hoje</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="inline-flex rounded-lg bg-gray-100 p-1">
            {tabOptions.map((tab) => (
              <button
                key={tab.value}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors relative ${
                  activeTab === tab.value
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab(tab.value)}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`ml-1.5 px-2 py-0.5 rounded text-xs ${
                    activeTab === tab.value
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md mt-6 p-6">
          {renderTabContent()}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OperatorPanel;
