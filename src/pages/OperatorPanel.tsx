
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOperations } from '@/context/OperationContext';
import { useAuth } from '@/context/AuthContext';
import OperatorHeader from '@/components/Operator/OperatorHeader';
import OperatorTabs from '@/components/Operator/OperatorTabs';
import InstallationOperations from '@/components/Operator/InstallationOperations';
import CTOAnalysisOperations from '@/components/Operator/CTOAnalysisOperations';
import RMAOperations from '@/components/Operator/RMAOperations';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Bell, MessageSquare, Database } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type TabType = 'installation' | 'cto' | 'rma';

const OperatorPanel = () => {
  const [activeTab, setActiveTab] = useState<TabType>('installation');
  const { operations, assignOperatorToOperation } = useOperations();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showDbStats, setShowDbStats] = useState(false);

  // Count pending operations for queue simulation
  const pendingOperations = operations.filter(op => op.status === 'pendente').length;
  
  // Count operations by type and status
  const stats = {
    installation: {
      total: operations.filter(op => op.type === 'installation').length,
      pending: operations.filter(op => op.type === 'installation' && op.status === 'pendente').length,
      inProgress: operations.filter(op => op.type === 'installation' && op.status === 'iniciando_provisionamento').length,
      completed: operations.filter(op => op.type === 'installation' && op.status === 'provisionamento_finalizado').length,
    },
    cto: {
      total: operations.filter(op => op.type === 'cto').length,
      pending: operations.filter(op => op.type === 'cto' && op.status === 'pendente').length,
      inProgress: operations.filter(op => op.type === 'cto' && op.status === 'verificando').length,
      completed: operations.filter(op => op.type === 'cto' && op.status === 'verificacao_finalizada').length,
    },
    rma: {
      total: operations.filter(op => op.type === 'rma').length,
      pending: operations.filter(op => op.type === 'rma' && op.status === 'pendente').length,
      inProgress: operations.filter(op => op.type === 'rma' && op.status === 'em_analise').length,
      completed: operations.filter(op => op.type === 'rma' && op.status === 'finalizado').length,
    }
  };

  // Count assigned operations
  const assignedOperations = operations.filter(op => op.assignedOperator).length;
  const assignedToCurrentOperator = operations.filter(
    op => op.assignedOperator === user?.name || op.assignedOperator === user?.username
  ).length;
  
  useEffect(() => {
    // Simulate queue position - in a real app this would come from the server
    if (pendingOperations > 0) {
      setQueuePosition(Math.floor(Math.random() * 3) + 1);
    } else {
      setQueuePosition(null);
    }
    
    // Check for new operations to trigger notifications
    const newOperationsCount = operations.filter(op => {
      const creationTime = new Date(op.createdAt).getTime();
      const now = new Date().getTime();
      const isRecent = now - creationTime < 60000; // Operations added within the last minute
      return isRecent;
    }).length;
    
    if (newOperationsCount > 0 && operations.length > 0) {
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
      
      toast.info(`${newOperationsCount} nova(s) operação(ões) adicionada(s)!`, {
        duration: 5000,
        action: {
          label: "Visualizar",
          onClick: () => {
            // Find the tab with the newest operation
            const newest = [...operations].sort((a, b) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )[0];
            
            if (newest) {
              setActiveTab(newest.type as TabType);
            }
          }
        }
      });
    }
  }, [operations, soundEnabled]);
  
  const dismissNotifications = () => {
    setHasNewNotification(false);
  };

  // Logic to assign/claim a task to the current operator
  const claimTask = (operationId: string) => {
    if (!user) return;
    
    assignOperatorToOperation(operationId, user.name);
    toast.success(`Chamado atribuído a ${user.name}`);
  };

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
      default:
        return <div>Selecione uma guia</div>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      <OperatorHeader />
      <main className="flex-grow py-8 px-4 container mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Painel do Operador</h1>
            <p className="text-gray-600">
              Bem-vindo, {user?.name || 'Operador'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {queuePosition !== null && (
              <div className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-md text-sm flex items-center">
                <span className="font-medium">Posição na fila:</span>
                <Badge variant="secondary" className="ml-2 bg-blue-200">
                  {queuePosition}º
                </Badge>
              </div>
            )}
            
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
            
            <button
              onClick={() => setShowDbStats(true)}
              className="bg-purple-100 text-purple-800 px-4 py-2 rounded-md hover:bg-purple-200 transition-colors flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              <span>Estatísticas</span>
            </button>
            
            <button 
              onClick={() => navigate('/')}
              className="bg-blue-100 text-blue-800 px-4 py-2 rounded-md hover:bg-blue-200 transition-colors"
            >
              Voltar para Área do Técnico
            </button>
          </div>
        </div>

        {/* Status summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total de Chamados</h3>
            <p className="text-2xl font-bold">{operations.length}</p>
            <div className="flex justify-between mt-2 text-xs">
              <span className="text-yellow-600">Pendentes: {pendingOperations}</span>
              <span className="text-blue-600">Em Progresso: {operations.filter(op => 
                op.status === 'iniciando_provisionamento' || 
                op.status === 'verificando' || 
                op.status === 'em_analise'
              ).length}</span>
              <span className="text-green-600">Concluídos: {operations.filter(op => 
                op.status === 'provisionamento_finalizado' || 
                op.status === 'verificacao_finalizada' || 
                op.status === 'finalizado'
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
              {new Set(operations.map(op => op.technician)).size}
            </p>
            <div className="mt-2 text-xs">
              <span className="text-blue-600">
                Operações mais recentes: {operations.filter(op => {
                  const today = new Date();
                  const opDate = new Date(op.createdAt);
                  return opDate.toDateString() === today.toDateString();
                }).length} hoje
              </span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Tempo Médio de Resolução</h3>
            <p className="text-2xl font-bold">~24min</p>
            <div className="mt-2 text-xs">
              <span className="text-green-600">Melhor desempenho: 12min</span>
            </div>
          </div>
        </div>

        <OperatorTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div className="bg-white rounded-lg shadow-md mt-6 p-6">
          {renderTabContent()}
        </div>
        
        {!isMobile && (
          <div className="fixed bottom-6 right-6">
            <div className="bg-blue-600 text-white p-4 rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition-colors">
              <MessageSquare className="h-6 w-6" />
            </div>
          </div>
        )}

        {/* Database Statistics Dialog */}
        <Dialog open={showDbStats} onOpenChange={setShowDbStats}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Estatísticas do Banco de Dados</DialogTitle>
              <DialogDescription>
                Visão geral das informações armazenadas no sistema
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Resumo de Operações</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Pendentes</TableHead>
                      <TableHead className="text-right">Em Progresso</TableHead>
                      <TableHead className="text-right">Concluídos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Instalações</TableCell>
                      <TableCell className="text-right">{stats.installation.total}</TableCell>
                      <TableCell className="text-right">{stats.installation.pending}</TableCell>
                      <TableCell className="text-right">{stats.installation.inProgress}</TableCell>
                      <TableCell className="text-right">{stats.installation.completed}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Análise CTO</TableCell>
                      <TableCell className="text-right">{stats.cto.total}</TableCell>
                      <TableCell className="text-right">{stats.cto.pending}</TableCell>
                      <TableCell className="text-right">{stats.cto.inProgress}</TableCell>
                      <TableCell className="text-right">{stats.cto.completed}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">RMA</TableCell>
                      <TableCell className="text-right">{stats.rma.total}</TableCell>
                      <TableCell className="text-right">{stats.rma.pending}</TableCell>
                      <TableCell className="text-right">{stats.rma.inProgress}</TableCell>
                      <TableCell className="text-right">{stats.rma.completed}</TableCell>
                    </TableRow>
                    <TableRow className="font-medium">
                      <TableCell className="font-medium">TOTAL</TableCell>
                      <TableCell className="text-right">
                        {stats.installation.total + stats.cto.total + stats.rma.total}
                      </TableCell>
                      <TableCell className="text-right">
                        {stats.installation.pending + stats.cto.pending + stats.rma.pending}
                      </TableCell>
                      <TableCell className="text-right">
                        {stats.installation.inProgress + stats.cto.inProgress + stats.rma.inProgress}
                      </TableCell>
                      <TableCell className="text-right">
                        {stats.installation.completed + stats.cto.completed + stats.rma.completed}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Informações de Armazenamento</h3>
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <p className="mb-2">
                    <span className="font-medium">Local de armazenamento:</span> LocalStorage do navegador
                  </p>
                  <p className="mb-2">
                    <span className="font-medium">Tamanho aproximado:</span>{" "}
                    {Math.round((JSON.stringify(operations).length / 1024) * 100) / 100} KB
                  </p>
                  <p className="mb-2">
                    <span className="font-medium">Última atualização:</span>{" "}
                    {new Date().toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-3">
                    Nota: Em um ambiente de produção, essas informações seriam armazenadas em um banco de dados servidor.
                  </p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default OperatorPanel;
