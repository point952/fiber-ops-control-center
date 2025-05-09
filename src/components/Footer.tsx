
import React from 'react';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-100 p-4 mt-8 border-t border-gray-200">
      <div className="container mx-auto text-center text-gray-600 text-sm">
        <p>&copy; {year} Sistema de Gerenciamento de Produção. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
