
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import { toast } from "sonner";
import { getAddressFromCoordinates, getCurrentLocation } from '@/services/locationService';

interface CTOLocationFormProps {
  bairro: string;
  rua: string;
  coordenadas: string;
  onBairroChange: (value: string) => void;
  onRuaChange: (value: string) => void;
  onCoordenadasChange: (value: string) => void;
  errors: {
    bairro?: string;
    rua?: string;
  };
}

const CTOLocationForm: React.FC<CTOLocationFormProps> = ({
  bairro,
  rua,
  coordenadas,
  onBairroChange,
  onRuaChange,
  onCoordenadasChange,
  errors
}) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const getLocation = async () => {
    try {
      setIsLoading(true);
      const position = await getCurrentLocation();
      
      const { latitude, longitude } = position.coords;
      const coordString = `${latitude}, ${longitude}`;
      onCoordenadasChange(coordString);
      
      // Get address from coordinates
      const { bairro, rua } = await getAddressFromCoordinates(latitude, longitude);
      
      // Update bairro and rua fields if found
      if (bairro) onBairroChange(bairro);
      if (rua) onRuaChange(rua);
      
      toast.success("Localização obtida com sucesso!");
    } catch (error) {
      toast.error("Não foi possível obter sua localização");
      console.error('Erro de geolocalização:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Bairro */}
      <div className="space-y-2">
        <Label htmlFor="bairro" className={errors.bairro ? 'text-red-500' : ''}>
          Bairro*
        </Label>
        <Input
          id="bairro"
          value={bairro}
          onChange={(e) => onBairroChange(e.target.value)}
          className={errors.bairro ? 'border-red-500' : ''}
        />
        {errors.bairro && <p className="text-red-500 text-xs">{errors.bairro}</p>}
      </div>

      {/* Rua */}
      <div className="space-y-2">
        <Label htmlFor="rua" className={errors.rua ? 'text-red-500' : ''}>
          Rua*
        </Label>
        <Input
          id="rua"
          value={rua}
          onChange={(e) => onRuaChange(e.target.value)}
          className={errors.rua ? 'border-red-500' : ''}
        />
        {errors.rua && <p className="text-red-500 text-xs">{errors.rua}</p>}
      </div>

      {/* Coordenadas */}
      <div className="space-y-2 col-span-2">
        <Label htmlFor="coordenadas">Coordenadas</Label>
        <div className="flex gap-2">
          <Input
            id="coordenadas"
            value={coordenadas}
            onChange={(e) => onCoordenadasChange(e.target.value)}
            placeholder="Latitude, Longitude"
            className="flex-1"
          />
          <Button 
            type="button" 
            variant="outline"
            onClick={getLocation}
            className="flex-shrink-0"
            disabled={isLoading}
          >
            <MapPin className="h-4 w-4 mr-2" />
            {isLoading ? 'Obtendo...' : 'Obter Localização'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CTOLocationForm;
