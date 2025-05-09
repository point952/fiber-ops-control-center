
import React from 'react';
import { cn } from '@/lib/utils';
import { Settings } from 'lucide-react';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  return (
    <header className={cn("bg-gradient-to-r from-blue-800 to-purple-700 text-white py-6 shadow-xl border-b border-white/10", className)}>
      <div className="container mx-auto flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
            <Settings className="h-7 w-7 animate-spin-slow text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">
              Sistema de Gerenciamento de Produção
            </span>
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
