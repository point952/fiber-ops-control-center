
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useOperations } from '@/context/operations/OperationContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import IndexTabs from './IndexTabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const OperationsView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { getPendingOperationsCount } = useOperations();
  
  // Get the active tab from location state or default to 'installation'
  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab || 'installation'
  );
  
  // Update active tab when location state changes
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);
  
  // Get pending operations counts for tab indicators
  const pendingInstallations = getPendingOperationsCount('installation');
  const pendingCTOs = getPendingOperationsCount('cto');
  const pendingRMAs = getPendingOperationsCount('rma');
  
  if (!user) {
    navigate('/login');
    return null;
  }
  
  const handleBack = () => {
    navigate('/');
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
            <h1 className="text-3xl font-bold mb-1">Operações</h1>
            <p className="text-gray-600">Gerenciar atividades técnicas</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <IndexTabs 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            pendingInstallations={pendingInstallations}
            pendingCTOs={pendingCTOs}
            pendingRMAs={pendingRMAs}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OperationsView;
