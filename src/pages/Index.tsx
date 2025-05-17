
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useOperations } from '@/context/operations/OperationContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MainMenu from '@/components/MainMenu';

const Index = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { getPendingOperationsCount } = useOperations();
  
  // Get pending operations counts for menu indicators
  const pendingInstallations = getPendingOperationsCount('installation');
  const pendingCTOs = getPendingOperationsCount('cto');
  const pendingRMAs = getPendingOperationsCount('rma');
  
  if (!user) {
    navigate('/login');
    return null;
  }
  
  const handleMenuSelect = (option: string) => {
    if (option === 'logout') {
      logout();
      navigate('/login');
    } else if (option === 'profile') {
      // Handle profile option
      console.log("Profile selected");
    } else {
      // Handle tab selection for operation types
      navigate('/', { state: { activeTab: option } });
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6 text-center md:text-left">
          <h1 className="text-3xl font-bold mb-1">Painel do Técnico</h1>
          <p className="text-gray-600">Bem-vindo, {user.name}</p>
        </div>
        
        <MainMenu 
          onSelect={handleMenuSelect} 
          pendingInstallations={pendingInstallations}
          pendingCTOs={pendingCTOs}
          pendingRMAs={pendingRMAs}
        />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
