import React from 'react';
import { useOperations } from '../../context/operations/OperationsContext';

interface OperatorTabsProps {
  activeTab: 'installation' | 'cto' | 'rma';
  setActiveTab: (tab: 'installation' | 'cto' | 'rma') => void;
}

const OperatorTabs: React.FC<OperatorTabsProps> = ({ activeTab, setActiveTab }) => {
  const { operations } = useOperations();
  
  const pendingInstallations = operations.filter(op => op.type === 'installation' && op.status === 'pending').length;
  const pendingCTOs = operations.filter(op => op.type === 'cto' && op.status === 'pending').length;
  const pendingRMAs = operations.filter(op => op.type === 'rma' && op.status === 'pending').length;

  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8">
        <button
          onClick={() => setActiveTab('installation')}
          className={`py-4 px-1 border-b-2 font-medium text-sm relative ${
            activeTab === 'installation'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Instalações/Upgrades
          {pendingInstallations > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {pendingInstallations}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('cto')}
          className={`py-4 px-1 border-b-2 font-medium text-sm relative ${
            activeTab === 'cto'
              ? 'border-purple-500 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Análises de CTO
          {pendingCTOs > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {pendingCTOs}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('rma')}
          className={`py-4 px-1 border-b-2 font-medium text-sm relative ${
            activeTab === 'rma'
              ? 'border-green-500 text-green-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          RMAs
          {pendingRMAs > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {pendingRMAs}
            </span>
          )}
        </button>
      </nav>
    </div>
  );
};

export default OperatorTabs;
