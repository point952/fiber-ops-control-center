
import React from 'react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  return (
    <header className={cn("bg-techblue-600 text-white p-4 shadow-md", className)}>
      <div className="container mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold">Sistema de Gerenciamento de Produção</h1>
      </div>
    </header>
  );
};

export default Header;
