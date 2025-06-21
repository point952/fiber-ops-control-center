
import React, { useEffect, useState } from 'react';
import { useOperations } from '@/context/operations/OperationsContext';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, Users } from 'lucide-react';
import { toast } from 'sonner';

const OperationQueue: React.FC = () => {
  const { queue, getQueuePosition, getEstimatedWaitTime } = useOperations();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<number>(0);

  useEffect(() => {
    // Solicitar permissão para notificações
    if ('Notification' in window) {
      Notification.requestPermission();
    }

    // Configurar som de notificação
    const audio = new Audio('/notification.mp3');
    audio.load();

    // Configurar intervalo para verificar novas operações
    const interval = setInterval(() => {
      const oneMinuteAgo = new Date(Date.now() - 60000);
      const newNotifications = queue.filter(op => 
        !op.operator_id && op.created_at > oneMinuteAgo
      ).length;

      if (newNotifications > notifications) {
        audio.play().catch(console.error);
        toast.info(`${newNotifications} nova(s) operação(ões) disponível(is)!`);
      }

      setNotifications(newNotifications);
    }, 30000);

    return () => clearInterval(interval);
  }, [queue, notifications]);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Fila de Operações
          </CardTitle>
          {notifications > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <Bell className="h-4 w-4" />
              {notifications}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {queue.length === 0 ? (
            <p className="text-sm text-gray-500 text-center">
              Nenhuma operação na fila no momento
            </p>
          ) : (
            queue.map(operation => {
              const position = getQueuePosition(operation.id);
              const waitTime = getEstimatedWaitTime(operation.id);

              return (
                <div
                  key={operation.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {operation.type === 'installation' ? 'Instalação' :
                         operation.type === 'cto' ? 'CTO' : 'RMA'}
                      </Badge>
                      <span className="text-sm font-medium">
                        {operation.data.Cliente || operation.data.cto || operation.data.serial}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>Tempo estimado: {waitTime} min</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Técnico: {operation.technician}
                    </div>
                    <Badge variant="secondary">
                      Posição na fila: {position}º
                    </Badge>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OperationQueue;
