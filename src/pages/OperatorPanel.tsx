
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOperations } from '@/context/OperationContext';
import OperatorHeader from '@/components/Operator/OperatorHeader';
import OperatorTabs from '@/components/Operator/OperatorTabs';
import InstallationOperations from '@/components/Operator/InstallationOperations';
import CTOAnalysisOperations from '@/components/Operator/CTOAnalysisOperations';
import RMAOperations from '@/components/Operator/RMAOperations';

type TabType = 'installation' | 'cto' | 'rma';

const OperatorPanel = () => {
  const [activeTab, setActiveTab] = useState<TabType>('installation');
  const { operations } = useOperations();
  const navigate = useNavigate();

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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Painel do Operador</h1>
          <button 
            onClick={() => navigate('/')}
            className="bg-blue-100 text-blue-800 px-4 py-2 rounded-md hover:bg-blue-200 transition-colors"
          >
            Voltar para Área do Técnico
          </button>
        </div>

        <OperatorTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div className="bg-white rounded-lg shadow-md mt-6 p-6">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
};

export default OperatorPanel;
