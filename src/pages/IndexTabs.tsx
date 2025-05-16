
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

interface IndexTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingInstallations: number;
  pendingCTOs: number;
  pendingRMAs: number;
}

const IndexTabs: React.FC<IndexTabsProps> = ({
  activeTab,
  setActiveTab,
  pendingInstallations,
  pendingCTOs,
  pendingRMAs,
}) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-4 w-full">
        <TabsTrigger value="installation" className="relative">
          Instalação
          {pendingInstallations > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {pendingInstallations}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="cto" className="relative">
          CTO
          {pendingCTOs > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {pendingCTOs}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="rma" className="relative">
          RMA
          {pendingRMAs > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {pendingRMAs}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="history">
          Histórico
        </TabsTrigger>
      </TabsList>
      <TabsContent value="installation" className="mt-6">
        <InstallationForm />
      </TabsContent>
      <TabsContent value="cto" className="mt-6">
        <CTOAnalysisForm />
      </TabsContent>
      <TabsContent value="rma" className="mt-6">
        <RMAForm />
      </TabsContent>
      <TabsContent value="history" className="mt-6">
        <TechnicianHistory />
      </TabsContent>
    </Tabs>
  );
};

export default IndexTabs;
