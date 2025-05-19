
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useOperations } from '@/context/operations/OperationContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Bell, Check, Calendar, MessageSquare, RefreshCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Notification {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  read: boolean;
  type: 'status' | 'message' | 'assignment';
  operatorName: string;
  operationId?: string;
}

const TechnicianNotifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { operations, getUserOperations } = useOperations();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  
  useEffect(() => {
    if (user?.id) {
      loadNotifications();
    }
  }, [user, operations]);
  
  const loadNotifications = () => {
    if (!user?.id) return;
    
    // Get user operations
    const userOps = getUserOperations(user.id);
    
    // Generate notifications from operations data
    const generatedNotifications: Notification[] = [];
    
    // Status change notifications
    userOps.forEach(op => {
      // Status updates
      if (op.status !== 'pendente') {
        generatedNotifications.push({
          id: `status_${op.id}_${op.status}`,
          title: `Status Atualizado: ${getStatusLabel(op.status)}`,
          description: `${getOperationTypeLabel(op.type)} #${op.id.substring(0, 8)} foi atualizado.`,
          createdAt: op.assignedAt || new Date(),
          read: false,
          type: 'status',
          operatorName: op.assignedOperator || 'Sistema',
          operationId: op.id
        });
      }
      
      // Assignment notifications
      if (op.assignedOperator) {
        generatedNotifications.push({
          id: `assign_${op.id}`,
          title: 'Operador Designado',
          description: `${op.assignedOperator} foi designado para ${getOperationTypeLabel(op.type)} #${op.id.substring(0, 8)}.`,
          createdAt: op.assignedAt || new Date(),
          read: false,
          type: 'assignment',
          operatorName: op.assignedOperator,
          operationId: op.id
        });
      }
      
      // Feedback notifications
      if (op.feedback) {
        generatedNotifications.push({
          id: `feedback_${op.id}`,
          title: 'Feedback do Operador',
          description: op.feedback.length > 100 ? op.feedback.substring(0, 100) + '...' : op.feedback,
          createdAt: new Date(),
          read: false,
          type: 'message',
          operatorName: op.assignedOperator || 'Operador',
          operationId: op.id
        });
      }
    });
    
    // Sort notifications by date (newest first)
    generatedNotifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    setNotifications(generatedNotifications);
  };
  
  const getStatusLabel = (status: string): string => {
    switch(status) {
      case 'iniciando_provisionamento': return 'Provisionamento Iniciado';
      case 'provisionamento_finalizado': return 'Provisionamento Finalizado';
      case 'verificando': return 'Verificação em Andamento';
      case 'verificacao_finalizada': return 'Verificação Finalizada';
      case 'em_analise': return 'Em Análise';
      case 'finalizado': return 'Finalizado';
      default: return status;
    }
  };
  
  const getOperationTypeLabel = (type: string): string => {
    switch(type) {
      case 'installation': return 'Instalação';
      case 'cto': return 'Análise de CTO';
      case 'rma': return 'RMA';
      default: return type;
    }
  };
  
  const handleBack = () => {
    navigate('/');
  };
  
  const markAsRead = (id: string) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };
  
  const markAllAsRead = () => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
    toast({
      title: "Notificações",
      description: "Todas as notificações foram marcadas como lidas",
    });
  };
  
  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : notifications.filter(notification => notification.type === activeTab);
  
  const unreadCount = notifications.filter(notification => !notification.read).length;
  
  if (!user) {
    navigate('/login');
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Voltar ao Menu
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-1 flex items-center gap-3">
              Notificações
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">{unreadCount}</Badge>
              )}
            </h1>
            <p className="text-gray-600">Acompanhe atualizações e novidades</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={markAllAsRead}
            className="flex items-center gap-2"
          >
            <Check size={16} />
            Marcar todas como lidas
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={loadNotifications} 
            className="flex items-center gap-2"
          >
            <RefreshCcw size={16} />
            Atualizar
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          {notifications.length > 0 ? (
            <div>
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="all">
                    Tudo 
                    {unreadCount > 0 && <Badge variant="outline" className="ml-2">{unreadCount}</Badge>}
                  </TabsTrigger>
                  <TabsTrigger value="status">
                    Status
                    {notifications.filter(n => n.type === 'status' && !n.read).length > 0 && (
                      <Badge variant="outline" className="ml-2">
                        {notifications.filter(n => n.type === 'status' && !n.read).length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="message">
                    Mensagens
                    {notifications.filter(n => n.type === 'message' && !n.read).length > 0 && (
                      <Badge variant="outline" className="ml-2">
                        {notifications.filter(n => n.type === 'message' && !n.read).length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="assignment">
                    Designações
                    {notifications.filter(n => n.type === 'assignment' && !n.read).length > 0 && (
                      <Badge variant="outline" className="ml-2">
                        {notifications.filter(n => n.type === 'assignment' && !n.read).length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value={activeTab}>
                  <ScrollArea className="h-[60vh]">
                    {filteredNotifications.length > 0 ? (
                      <div className="space-y-4">
                        {filteredNotifications.map((notification) => (
                          <div 
                            key={notification.id} 
                            className={`p-4 border rounded-lg ${notification.read ? 'bg-white' : 'bg-blue-50 border-l-4 border-l-blue-500'}`}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex items-center space-x-3">
                                {notification.type === 'status' && (
                                  <div className="rounded-full bg-amber-100 p-3">
                                    <Bell className="h-5 w-5 text-amber-500" />
                                  </div>
                                )}
                                {notification.type === 'message' && (
                                  <div className="rounded-full bg-green-100 p-3">
                                    <MessageSquare className="h-5 w-5 text-green-500" />
                                  </div>
                                )}
                                {notification.type === 'assignment' && (
                                  <div className="rounded-full bg-purple-100 p-3">
                                    <Calendar className="h-5 w-5 text-purple-500" />
                                  </div>
                                )}
                                <div>
                                  <h3 className="font-semibold text-lg">{notification.title}</h3>
                                  <p className="text-gray-600 text-sm mb-2">De: {notification.operatorName}</p>
                                </div>
                              </div>
                              <span className="text-xs text-gray-500">
                                {notification.createdAt.toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            
                            <p className="text-gray-700 mt-2 border-t pt-2">{notification.description}</p>
                            
                            <div className="mt-2 flex justify-end">
                              {notification.operationId && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => navigate('/operations')}
                                >
                                  Ver Operação
                                </Button>
                              )}
                              {!notification.read && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                >
                                  Marcar como lida
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="bg-gray-100 p-6 rounded-full mb-4">
                          <Bell className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-600 mb-1">Nenhuma notificação</h3>
                        <p className="text-gray-500">
                          Não há notificações {activeTab !== 'all' ? `do tipo ${activeTab}` : ''} para exibir
                        </p>
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 py-12">
              <div className="bg-amber-100 p-6 rounded-full">
                <Bell className="h-16 w-16 text-amber-500" />
              </div>
              <h2 className="text-2xl font-medium text-gray-700">Centro de Notificações</h2>
              <p className="text-gray-500 max-w-md text-center">
                Você não tem notificações no momento. Aqui serão exibidas atualizações de status, 
                mensagens de operadores e outras notificações importantes.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TechnicianNotifications;
