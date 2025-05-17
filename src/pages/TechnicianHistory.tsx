
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import TechnicianHistoryComponent from '@/components/Technician/TechnicianHistory';

const TechnicianHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
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
            <h1 className="text-3xl font-bold mb-1">Histórico</h1>
            <p className="text-gray-600">Visualize suas atividades anteriores</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <TechnicianHistoryComponent />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TechnicianHistory;
