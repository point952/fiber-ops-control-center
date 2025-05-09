
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MainMenu from '@/components/MainMenu';
import InstallationForm from '@/components/Installation/InstallationForm';
import CTOAnalysisForm from '@/components/CTO/CTOAnalysisForm';
import RMAForm from '@/components/RMA/RMAForm';

type ActiveSection = 'menu' | 'installation' | 'cto' | 'rma';

const Index = () => {
  const [activeSection, setActiveSection] = useState<ActiveSection>('menu');

  const renderSection = () => {
    switch (activeSection) {
      case 'installation':
        return <InstallationForm onBack={() => setActiveSection('menu')} />;
      case 'cto':
        return <CTOAnalysisForm onBack={() => setActiveSection('menu')} />;
      case 'rma':
        return <RMAForm onBack={() => setActiveSection('menu')} />;
      default:
        return (
          <MainMenu 
            onSelect={(option) => setActiveSection(option)} 
            className="animate-fade-in"
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />
      <main className="flex-grow py-6 px-4">
        <div className="container mx-auto animate-fade-in">
          {renderSection()}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
