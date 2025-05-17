
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useOperations } from '@/context/operations/OperationContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MainMenu from '@/components/MainMenu';
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { getPendingOperationsCount } = useOperations();
  
  // Get pending operations counts for menu indicators
  const pendingInstallations = getPendingOperationsCount('installation');
  const pendingCTOs = getPendingOperationsCount('cto');
  const pendingRMAs = getPendingOperationsCount('rma');
  
  // Track if profile modal is open
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  
  if (!user) {
    navigate('/login');
    return null;
  }
  
  const handleMenuSelect = (option: string) => {
    switch (option) {
      case 'installation':
      case 'cto':
      case 'rma':
        // Navigate to operations view with the selected tab
        navigate('/operations', { state: { activeTab: option } });
        break;
        
      case 'logout':
        toast.success("Logout realizado com sucesso");
        logout();
        navigate('/login');
        break;
        
      case 'profile':
        // Show toast for feature in development
        toast.info("Perfil do usuário será implementado em breve");
        console.log("Profile selected");
        break;
        
      case 'messages':
        // Show toast for feature in development
        toast.info("Sistema de mensagens será implementado em breve");
        break;
        
      case 'notifications':
        // Show toast for feature in development
        toast.info("Sistema de notificações será implementado em breve");
        break;
        
      default:
        // Default case - unexpected option
        toast.error("Opção não reconhecida");
        console.error(`Unhandled menu option: ${option}`);
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
