
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useOperations } from '@/context/OperationContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MainMenu from '@/components/MainMenu';
import IndexTabs from './IndexTabs';

const Index = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { getPendingOperationsCount } = useOperations();
  
  const [activeTab, setActiveTab] = useState('installation');
  
  // Get pending operations counts for tab indicators
  const pendingInstallations = getPendingOperationsCount('installation');
  const pendingCTOs = getPendingOperationsCount('cto');
  const pendingRMAs = getPendingOperationsCount('rma');
  
  if (!user) {
    navigate('/login');
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-4 mb-6 items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">Painel do Técnico</h1>
            <p className="text-gray-600">Bem-vindo, {user.name}</p>
          </div>
          
          <MainMenu />
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

export default Index;
