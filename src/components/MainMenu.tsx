
import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings, Box, FileBarChart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MainMenuProps {
  onSelect: (option: 'installation' | 'cto' | 'rma') => void;
  className?: string;
}

const MainMenu: React.FC<MainMenuProps> = ({ onSelect, className }) => {
  return (
    <div className={cn("w-full max-w-4xl mx-auto py-8 px-4", className)}>
      <h2 className="text-2xl font-bold text-center mb-8">Menu Principal</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="overflow-hidden transition-all hover:shadow-lg">
          <CardContent className="p-0">
            <Button
              variant="ghost"
              className="w-full h-full p-6 flex flex-col items-center justify-center gap-4 rounded-none hover:bg-techblue-50"
              onClick={() => onSelect('installation')}
            >
              <Settings className="h-12 w-12 text-techblue-500" />
              <span className="text-lg font-medium">Instalação/Upgrade</span>
            </Button>
          </CardContent>
        </Card>

        <Card className="overflow-hidden transition-all hover:shadow-lg">
          <CardContent className="p-0">
            <Button
              variant="ghost"
              className="w-full h-full p-6 flex flex-col items-center justify-center gap-4 rounded-none hover:bg-techblue-50"
              onClick={() => onSelect('cto')}
            >
              <FileBarChart className="h-12 w-12 text-techblue-500" />
              <span className="text-lg font-medium">Análise de CTO</span>
            </Button>
          </CardContent>
        </Card>

        <Card className="overflow-hidden transition-all hover:shadow-lg">
          <CardContent className="p-0">
            <Button
              variant="ghost"
              className="w-full h-full p-6 flex flex-col items-center justify-center gap-4 rounded-none hover:bg-techblue-50"
              onClick={() => onSelect('rma')}
            >
              <Box className="h-12 w-12 text-techblue-500" />
              <span className="text-lg font-medium">RMA</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MainMenu;
