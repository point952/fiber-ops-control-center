
import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings, FileBarChart, Box } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MainMenuProps {
  onSelect: (option: 'installation' | 'cto' | 'rma') => void;
  className?: string;
}

const MainMenu: React.FC<MainMenuProps> = ({ onSelect, className }) => {
  return (
    <div className={cn("w-full max-w-4xl mx-auto py-12 px-4", className)}>
      <h2 className="text-3xl font-bold text-center mb-10 text-gray-800 tracking-tight">
        Menu Principal
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl bg-gradient-to-br from-white to-blue-50 border-none shadow-lg">
          <CardContent className="p-0">
            <Button
              variant="ghost"
              className="w-full h-full p-8 flex flex-col items-center justify-center gap-4 rounded-none transition-all duration-300"
              onClick={() => onSelect('installation')}
            >
              <div className="rounded-full bg-gradient-to-br from-blue-500 to-blue-600 p-4 shadow-lg">
                <Settings className="h-12 w-12 text-white" />
              </div>
              <span className="text-lg font-medium text-blue-700">Instalação/Upgrade</span>
            </Button>
          </CardContent>
        </Card>

        <Card className="overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl bg-gradient-to-br from-white to-purple-50 border-none shadow-lg">
          <CardContent className="p-0">
            <Button
              variant="ghost"
              className="w-full h-full p-8 flex flex-col items-center justify-center gap-4 rounded-none transition-all duration-300"
              onClick={() => onSelect('cto')}
            >
              <div className="rounded-full bg-gradient-to-br from-purple-500 to-purple-600 p-4 shadow-lg">
                <FileBarChart className="h-12 w-12 text-white" />
              </div>
              <span className="text-lg font-medium text-purple-700">Análise de CTO</span>
            </Button>
          </CardContent>
        </Card>

        <Card className="overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl bg-gradient-to-br from-white to-green-50 border-none shadow-lg">
          <CardContent className="p-0">
            <Button
              variant="ghost"
              className="w-full h-full p-8 flex flex-col items-center justify-center gap-4 rounded-none transition-all duration-300"
              onClick={() => onSelect('rma')}
            >
              <div className="rounded-full bg-gradient-to-br from-green-500 to-green-600 p-4 shadow-lg">
                <Box className="h-12 w-12 text-white" />
              </div>
              <span className="text-lg font-medium text-green-700">RMA</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MainMenu;
