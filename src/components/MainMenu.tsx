
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
      <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">Menu Principal</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="overflow-hidden transition-all hover:shadow-xl border-t-4 border-t-techblue-500">
          <CardContent className="p-0">
            <Button
              variant="ghost"
              className="w-full h-full p-8 flex flex-col items-center justify-center gap-4 rounded-none hover:bg-techblue-50 transition-all duration-300"
              onClick={() => onSelect('installation')}
            >
              <div className="rounded-full bg-techblue-100 p-4 transition-transform duration-300 group-hover:scale-110">
                <Settings className="h-12 w-12 text-techblue-600" />
              </div>
              <span className="text-lg font-medium text-gray-800">Instalação/Upgrade</span>
            </Button>
          </CardContent>
        </Card>

        <Card className="overflow-hidden transition-all hover:shadow-xl border-t-4 border-t-techblue-500">
          <CardContent className="p-0">
            <Button
              variant="ghost"
              className="w-full h-full p-8 flex flex-col items-center justify-center gap-4 rounded-none hover:bg-techblue-50 transition-all duration-300"
              onClick={() => onSelect('cto')}
            >
              <div className="rounded-full bg-techblue-100 p-4 transition-transform duration-300 group-hover:scale-110">
                <FileBarChart className="h-12 w-12 text-techblue-600" />
              </div>
              <span className="text-lg font-medium text-gray-800">Análise de CTO</span>
            </Button>
          </CardContent>
        </Card>

        <Card className="overflow-hidden transition-all hover:shadow-xl border-t-4 border-t-techblue-500">
          <CardContent className="p-0">
            <Button
              variant="ghost"
              className="w-full h-full p-8 flex flex-col items-center justify-center gap-4 rounded-none hover:bg-techblue-50 transition-all duration-300"
              onClick={() => onSelect('rma')}
            >
              <div className="rounded-full bg-techblue-100 p-4 transition-transform duration-300 group-hover:scale-110">
                <Box className="h-12 w-12 text-techblue-600" />
              </div>
              <span className="text-lg font-medium text-gray-800">RMA</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MainMenu;
