import React from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import InstallationForm from '@/components/Installation/InstallationForm';
import CTOAnalysisForm from '@/components/CTO/CTOAnalysisForm';
import RMAForm from '@/components/RMA/RMAForm';
import TechnicianHistory from '@/components/Technician/TechnicianHistory';
import TechnicianNotifications from '@/pages/TechnicianNotifications';
import { Badge } from '@/components/ui/badge';
import { useOperations } from '@/context/operations/OperationsContext';
import { useAuth } from '@/context/AuthContext';

const IndexTabs = () => {
  const { operations } = useOperations();
  const { user } = useAuth();

  const handleBack = () => {
    // Implementar lógica de voltar se necessário
  };

  // Filtrar operações do técnico atual
  const technicianOperations = operations.filter(op => op.technician_id === user?.id);

  // Contar notificações não lidas
  const unreadNotifications = technicianOperations.filter(
    op => (op.feedback && !op.technician_response) || 
          (op.assigned_operator && !op.technician_response) ||
          op.status === 'in_progress'
  ).length;

  return (
    <Tabs defaultValue="installation" className="w-full">
      <TabsList className="grid grid-cols-5">
        <TabsTrigger value="installation">Instalação</TabsTrigger>
        <TabsTrigger value="cto">CTO</TabsTrigger>
        <TabsTrigger value="rma">RMA</TabsTrigger>
        <TabsTrigger value="history">Histórico</TabsTrigger>
        <TabsTrigger value="notifications" className="relative">
          Notificações
          {unreadNotifications > 0 && (
            <Badge className="absolute -top-1 -right-1 bg-blue-500">
              {unreadNotifications}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="installation" className="mt-6">
        <InstallationForm onBack={handleBack} />
      </TabsContent>
      <TabsContent value="cto" className="mt-6">
        <CTOAnalysisForm onBack={handleBack} />
      </TabsContent>
      <TabsContent value="rma" className="mt-6">
        <RMAForm onBack={handleBack} />
      </TabsContent>
      <TabsContent value="history" className="mt-6">
        <TechnicianHistory />
      </TabsContent>
      <TabsContent value="notifications" className="mt-6">
        <TechnicianNotifications />
      </TabsContent>
    </Tabs>
  );
};

export default IndexTabs;
