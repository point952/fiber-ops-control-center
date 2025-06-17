import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Settings, 
  FileBarChart, 
  Box, 
  Monitor, 
  Bell,
  History,
  UserCircle,
  MessageSquare 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface MainMenuProps {
  onSelect: (option: string) => void;
  className?: string;
  pendingInstallations?: number;
  pendingCTOs?: number;
  pendingRMAs?: number;
}

const MainMenu: React.FC<MainMenuProps> = ({ 
  onSelect, 
  className,
  pendingInstallations = 0,
  pendingCTOs = 0,
  pendingRMAs = 0
}) => {
  return (
    <div className={cn("w-full max-w-5xl mx-auto py-8 px-4", className)}>
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
          Menu Principal
        </h2>
        <p className="text-gray-500 mt-2">
          Selecione o tipo de operação que deseja gerenciar
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {/* Installation Operations Card */}
        <Card className="overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl bg-gradient-to-br from-white to-blue-50 border-none shadow-lg">
          <CardContent className="p-0 relative">
            {pendingInstallations > 0 && (
              <Badge 
                variant="destructive"
                className="absolute top-3 right-3 z-10"
              >
                {pendingInstallations}
              </Badge>
            )}
            <Button
              variant="ghost"
              className="w-full h-full p-8 flex flex-col items-center justify-center gap-4 rounded-none transition-all duration-300"
              onClick={() => onSelect('installation')}
            >
              <div className="rounded-full bg-gradient-to-br from-blue-500 to-blue-600 p-4 shadow-lg mb-2">
                <Settings className="h-10 w-10 text-white" />
              </div>
              <div className="text-center">
                <span className="text-xl font-medium text-blue-700 block">Instalação/Upgrade</span>
                <span className="text-sm text-blue-500 mt-1 block">Gerenciar instalações e upgrades</span>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* CTO Analysis Card */}
        <Card className="overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl bg-gradient-to-br from-white to-purple-50 border-none shadow-lg">
          <CardContent className="p-0 relative">
            {pendingCTOs > 0 && (
              <Badge 
                variant="destructive"
                className="absolute top-3 right-3 z-10"
              >
                {pendingCTOs}
              </Badge>
            )}
            <Button
              variant="ghost"
              className="w-full h-full p-8 flex flex-col items-center justify-center gap-4 rounded-none transition-all duration-300"
              onClick={() => onSelect('cto')}
            >
              <div className="rounded-full bg-gradient-to-br from-purple-500 to-purple-600 p-4 shadow-lg mb-2">
                <FileBarChart className="h-10 w-10 text-white" />
              </div>
              <div className="text-center">
                <span className="text-xl font-medium text-purple-700 block">Análise de CTO</span>
                <span className="text-sm text-purple-500 mt-1 block">Gerenciar CTOs e splitters</span>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* RMA Card */}
        <Card className="overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl bg-gradient-to-br from-white to-green-50 border-none shadow-lg">
          <CardContent className="p-0 relative">
            {pendingRMAs > 0 && (
              <Badge 
                variant="destructive"
                className="absolute top-3 right-3 z-10"
              >
                {pendingRMAs}
              </Badge>
            )}
            <Button
              variant="ghost"
              className="w-full h-full p-8 flex flex-col items-center justify-center gap-4 rounded-none transition-all duration-300"
              onClick={() => onSelect('rma')}
            >
              <div className="rounded-full bg-gradient-to-br from-green-500 to-green-600 p-4 shadow-lg mb-2">
                <Box className="h-10 w-10 text-white" />
              </div>
              <div className="text-center">
                <span className="text-xl font-medium text-green-700 block">RMA</span>
                <span className="text-sm text-green-500 mt-1 block">Gerenciar devoluções e trocas</span>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Menu Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* History Card */}
        <Card className="overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl bg-gradient-to-br from-white to-amber-50 border-none shadow-lg">
          <CardContent className="p-0">
            <Button
              variant="ghost"
              className="w-full h-full p-6 flex flex-col items-center justify-center gap-3 rounded-none transition-all duration-300"
              onClick={() => onSelect('history')}
            >
              <div className="rounded-full bg-gradient-to-br from-amber-500 to-amber-600 p-3 shadow-lg">
                <History className="h-8 w-8 text-white" />
              </div>
              <div className="text-center">
                <span className="text-lg font-medium text-amber-700 block">Histórico</span>
                <span className="text-sm text-amber-500 mt-1 block">Visualizar atividades</span>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Messages Card */}
        <Card className="overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl bg-gradient-to-br from-white to-indigo-50 border-none shadow-lg">
          <CardContent className="p-0">
            <Button
              variant="ghost"
              className="w-full h-full p-6 flex flex-col items-center justify-center gap-3 rounded-none transition-all duration-300"
              onClick={() => onSelect('messages')}
            >
              <div className="rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 p-3 shadow-lg">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
              <div className="text-center">
                <span className="text-lg font-medium text-indigo-700 block">Mensagens</span>
                <span className="text-sm text-indigo-500 mt-1 block">Comunicação com operadores</span>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Notifications Card */}
        <Card className="overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl bg-gradient-to-br from-white to-rose-50 border-none shadow-lg">
          <CardContent className="p-0">
            <Button
              variant="ghost"
              className="w-full h-full p-6 flex flex-col items-center justify-center gap-3 rounded-none transition-all duration-300"
              onClick={() => onSelect('notifications')}
            >
              <div className="rounded-full bg-gradient-to-br from-rose-500 to-rose-600 p-3 shadow-lg">
                <Bell className="h-8 w-8 text-white" />
              </div>
              <div className="text-center">
                <span className="text-lg font-medium text-rose-700 block">Notificações</span>
                <span className="text-sm text-rose-500 mt-1 block">Alertas e atualizações</span>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Profile Card */}
        <Card className="overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl bg-gradient-to-br from-white to-gray-50 border-none shadow-lg">
          <CardContent className="p-0">
            <Button
              variant="ghost"
              className="w-full h-full p-6 flex flex-col items-center justify-center gap-3 rounded-none transition-all duration-300"
              onClick={() => onSelect('profile')}
            >
              <div className="rounded-full bg-gradient-to-br from-gray-500 to-gray-600 p-3 shadow-lg">
                <UserCircle className="h-8 w-8 text-white" />
              </div>
              <div className="text-center">
                <span className="text-lg font-medium text-gray-700 block">Perfil</span>
                <span className="text-sm text-gray-500 mt-1 block">Configurações pessoais</span>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MainMenu;
