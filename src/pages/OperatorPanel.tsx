
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
import { Bell, MessageSquare } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

type TabType = 'installation' | 'cto' | 'rma';

const OperatorPanel = () => {
  const [activeTab, setActiveTab] = useState<TabType>('installation');
  const { operations } = useOperations();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Count pending operations for queue simulation
  const pendingOperations = operations.filter(op => op.status === 'pendente').length;
  
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'installation':
        return <InstallationOperations />;
      case 'cto':
        return <CTOAnalysisOperations />;
      case 'rma':
        return <RMAOperations />;
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
              onClick={() => navigate('/')}
              className="bg-blue-100 text-blue-800 px-4 py-2 rounded-md hover:bg-blue-200 transition-colors"
            >
              Voltar para Área do Técnico
            </button>
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
      </main>
    </div>
  );
};

export default OperatorPanel;
