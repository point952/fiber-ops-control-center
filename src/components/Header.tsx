
import React from 'react';
import { cn } from '@/lib/utils';
import { Settings } from 'lucide-react';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  return (
    <header className={cn("bg-gradient-to-r from-techblue-700 to-techblue-500 text-white py-5 shadow-lg", className)}>
      <div className="container mx-auto flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Settings className="h-7 w-7 animate-spin-slow" />
          <h1 className="text-2xl md:text-3xl font-bold">Sistema de Gerenciamento de Produção</h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
