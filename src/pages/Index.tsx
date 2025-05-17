
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useOperations } from '@/context/operations/OperationContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MainMenu from '@/components/MainMenu';
import { toast } from "sonner";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserProfile } from '@/components/Technician/UserProfile';

const Index = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { getPendingOperationsCount, getUserOperations } = useOperations();
  
  // Get pending operations counts for menu indicators
  const pendingInstallations = getPendingOperationsCount('installation');
  const pendingCTOs = getPendingOperationsCount('cto');
  const pendingRMAs = getPendingOperationsCount('rma');
  
  // Track if modals are open
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  
  if (!user) {
    navigate('/login');
    return null;
  }
  
  const handleMenuSelect = (option: string) => {
    switch (option) {
      case 'installation':
        navigate('/operations', { state: { activeTab: 'installation', directForm: true } });
        break;
        
      case 'cto':
        navigate('/operations', { state: { activeTab: 'cto', directForm: true } });
        break;
        
      case 'rma':
        navigate('/operations', { state: { activeTab: 'rma', directForm: true } });
        break;
        
      case 'history':
        navigate('/history');
        break;
        
      case 'logout':
        toast.success("Logout realizado com sucesso");
        logout();
        navigate('/login');
        break;
        
      case 'profile':
        setProfileModalOpen(true);
        break;
        
      case 'messages':
        navigate('/messages');
        break;
        
      case 'notifications':
        navigate('/notifications');
        break;
        
      default:
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
      
      {/* User Profile Dialog */}
      <Dialog open={profileModalOpen} onOpenChange={setProfileModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Perfil do Técnico</DialogTitle>
          </DialogHeader>
          {user && <UserProfile user={user} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
