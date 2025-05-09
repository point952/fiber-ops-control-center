
import React from 'react';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-to-r from-gray-900 to-blue-900 p-6 mt-8 border-t border-white/10 text-white">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <p className="text-gray-300 text-sm">&copy; {year} Sistema de Gerenciamento de Produção. Todos os direitos reservados.</p>
        <div className="text-blue-300 text-xs mt-2 md:mt-0 font-medium backdrop-blur-sm bg-white/5 px-3 py-1 rounded-full">
          Versão 1.2.0
        </div>
      </div>
    </footer>
  );
};

export default Footer;
