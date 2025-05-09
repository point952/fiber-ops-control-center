
import React from 'react';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-to-r from-gray-100 to-gray-200 p-5 mt-8 border-t border-gray-200">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <p className="text-gray-600 text-sm">&copy; {year} Sistema de Gerenciamento de Produção. Todos os direitos reservados.</p>
        <div className="text-gray-500 text-xs mt-2 md:mt-0">
          Versão 1.0.0
        </div>
      </div>
    </footer>
  );
};

export default Footer;
