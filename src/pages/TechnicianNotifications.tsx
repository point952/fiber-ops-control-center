import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useOperations } from '@/context/operations/OperationsContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle2, XCircle, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

interface Notification {
  id: string;
  type: 'message' | 'assignment' | 'status';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  operation_id?: string;
}

const TechnicianNotifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { operations, refreshOperations } = useOperations();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  useEffect(() => {
    if (!user) return;

    const updateNotifications = () => {
      // Gerar notificações baseadas nas operações
      const newNotifications: Notification[] = [];

      operations.forEach(op => {
        // Filtrar apenas operações do técnico atual
        if (op.technician_id !== user.id) return;

        // Notificação de nova mensagem
        if (op.feedback && !op.technician_response) {
          newNotifications.push({
            id: `msg-${op.id}`,
            type: 'message',
            title: 'Nova mensagem do operador',
            message: `Você recebeu uma mensagem do operador sobre a operação ${op.type === 'installation' ? 'de instalação' : op.type === 'cto' ? 'de CTO' : 'de RMA'}`,
            timestamp: new Date(op.created_at),
            read: false,
            operation_id: op.id
          });
        }

        // Notificação de atribuição
        if (op.assigned_operator && !op.technician_response) {
          newNotifications.push({
            id: `assign-${op.id}`,
            type: 'assignment',
            title: 'Operação atribuída',
            message: `Uma operação ${op.type === 'installation' ? 'de instalação' : op.type === 'cto' ? 'de CTO' : 'de RMA'} foi atribuída a você`,
            timestamp: new Date(op.assigned_at || op.created_at),
            read: false,
            operation_id: op.id
          });
        }

        // Notificação de mudança de status
        if (op.status === 'in_progress') {
          newNotifications.push({
            id: `status-${op.id}`,
            type: 'status',
            title: 'Status atualizado',
            message: `A operação ${op.type === 'installation' ? 'de instalação' : op.type === 'cto' ? 'de CTO' : 'de RMA'} está em processamento`,
            timestamp: new Date(op.updated_at || op.created_at),
            read: false,
            operation_id: op.id
          });
        }
      });

      // Ordenar notificações por data (mais recentes primeiro)
      newNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setNotifications(newNotifications);
    };

    // Atualizar notificações a cada 5 segundos
    const interval = setInterval(() => {
      refreshOperations();
      updateNotifications();
    }, 5000);

    // Atualizar imediatamente ao montar
    updateNotifications();

    // Inscrever-se para atualizações em tempo real
    const subscription = supabase
      .channel('notifications_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          refreshOperations();
          updateNotifications();
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, [operations, user, refreshOperations]);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleBack = () => {
    navigate('/');
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // Atualizar no banco de dados
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      // Atualizar estado local
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      toast.error('Erro ao marcar notificação como lida');
    }
  };

  const markAllAsRead = async () => {
    try {
      // Atualizar no banco de dados
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      // Atualizar estado local
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );

      toast.success('Todas as notificações foram marcadas como lidas');
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
      toast.error('Erro ao marcar notificações como lidas');
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'assignment':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'status':
        return <XCircle className="h-5 w-5 text-amber-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
            Voltar ao Menu
          </Button>
          <div>
            <h1 className="text-3xl font-bold mb-1">Notificações</h1>
            <p className="text-gray-600">Central de notificações do sistema</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-gray-500" />
              <h2 className="text-lg font-medium">
                Notificações
                {unreadCount > 0 && (
                  <Badge variant="default" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </h2>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
              >
                Marcar todas como lidas
              </Button>
            )}
          </div>

          <ScrollArea className="h-[calc(100vh-16rem)]">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Não há notificações no momento</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map(notification => (
                  <Card
                    key={notification.id}
                    className={`transition-colors ${
                      notification.read ? 'bg-white' : 'bg-blue-50'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium">{notification.title}</h3>
                            {!notification.read && (
                              <Badge variant="default" className="bg-blue-500">
                                Nova
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-600 mt-1">{notification.message}</p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-sm text-gray-500">
                              {notification.timestamp.toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                              >
                                Marcar como lida
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TechnicianNotifications;
