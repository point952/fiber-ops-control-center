import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useOperations } from '@/context/operations/OperationsContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InstallationForm from '@/components/Installation/InstallationForm';
import CTOAnalysisForm from '@/components/CTO/CTOAnalysisForm';
import RMAForm from '@/components/RMA/RMAForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from "sonner";

const OperationsView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Get the active tab from location state or default to 'installation'
  const [activeTab, setActiveTab] = useState<string>(
    location.state?.activeTab || 'installation'
  );
  
  // Check if we need to show direct form (from main menu)
  const directForm = location.state?.directForm || false;
  
  // Update active tab when location state changes
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      
      // Show a toast notification when the tab changes
      const tabLabels = {
        installation: 'Instalação/Upgrade',
        cto: 'Análise de CTO',
        rma: 'RMA'
      };
      
      toast.info(`Formulário de ${tabLabels[location.state.activeTab as keyof typeof tabLabels]} carregado`);
    }
  }, [location.state]);
  
  if (!user) {
    navigate('/login');
    return null;
  }
  
  const handleBack = () => {
    navigate('/');
  };
  
  // Render the appropriate form based on the active tab
  const renderForm = () => {
    switch (activeTab) {
      case 'installation':
        return <InstallationForm onBack={handleBack} />;
      case 'cto':
        return <CTOAnalysisForm onBack={handleBack} />;
      case 'rma':
        return <RMAForm onBack={handleBack} />;
      default:
        return <p>Selecione uma operação para iniciar</p>;
    }
  };
  
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
          <div>
            <h1 className="text-3xl font-bold mb-1">
              {activeTab === 'installation' && 'Instalação/Upgrade'}
              {activeTab === 'cto' && 'Análise de CTO'}
              {activeTab === 'rma' && 'RMA'}
            </h1>
            <p className="text-gray-600">Preencha o formulário abaixo</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          {renderForm()}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OperationsView;
