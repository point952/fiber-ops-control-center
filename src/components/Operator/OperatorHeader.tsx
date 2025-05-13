
import React from 'react';
import { useNavigate } from 'react-router-dom';

const OperatorHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-4 px-6 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center">
            <span className="text-blue-800 font-bold text-lg">OP</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">Sistema de Gerenciamento</h1>
            <p className="text-sm opacity-80">Painel do Operador</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default OperatorHeader;
