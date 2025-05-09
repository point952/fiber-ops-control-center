
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MapPin } from 'lucide-react';
import { toast } from "sonner";
import TableGenerator from '../TableGenerator';

interface FormData {
  tipoSplitter: '1/8' | '1/16' | '';
  bairro: string;
  rua: string;
  coordenadas: string;
  portas: string[];
}

const CTOAnalysisForm: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [formData, setFormData] = useState<FormData>({
    tipoSplitter: '',
    bairro: '',
    rua: '',
    coordenadas: '',
    portas: Array(16).fill(''),
  });
  
  const [showTable, setShowTable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData | 'portaEspecifica', string>>>({});

  const handleChange = <K extends keyof FormData>(name: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro do campo que foi modificado
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePortaChange = (index: number, value: string) => {
    const newPortas = [...formData.portas];
    newPortas[index] = value;
    setFormData(prev => ({ ...prev, portas: newPortas }));
    
    // Limpar erros específicos de portas
    if (errors.portaEspecifica) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.portaEspecifica;
        return newErrors;
      });
    }
  };

  const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );
      
      if (!response.ok) throw new Error('Falha ao obter endereço');
      
      const data = await response.json();
      
      // Extrair informações de endereço do resultado
      const address = data.address || {};
      
      // Tentar encontrar o bairro (neighbourhood, suburb ou district)
      const bairro = address.neighbourhood || address.suburb || address.district || '';
      
      // Tentar encontrar a rua (road, street ou path)
      const rua = address.road || address.street || address.path || '';
      
      return { bairro, rua };
    } catch (error) {
      console.error('Erro ao obter endereço:', error);
      return { bairro: '', rua: '' };
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const coordString = `${latitude}, ${longitude}`;
          handleChange('coordenadas', coordString);
          
          // Obter endereço a partir das coordenadas
          const { bairro, rua } = await getAddressFromCoordinates(latitude, longitude);
          
          // Atualizar campos de bairro e rua se forem encontrados
          if (bairro) handleChange('bairro', bairro);
          if (rua) handleChange('rua', rua);
          
          setIsLoading(false);
          toast.success("Localização obtida com sucesso!");
        },
        (error) => {
          setIsLoading(false);
          toast.error("Não foi possível obter sua localização");
          console.error('Erro de geolocalização:', error);
        }
      );
    } else {
      toast.error("Geolocalização não é suportada pelo seu navegador");
    }
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof FormData | 'portaEspecifica', string>> = {};
    
    if (!formData.tipoSplitter) newErrors.tipoSplitter = 'Campo obrigatório';
    if (!formData.bairro) newErrors.bairro = 'Campo obrigatório';
    if (!formData.rua) newErrors.rua = 'Campo obrigatório';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setShowTable(true);
    }
  };

  const portasParaExibir = formData.tipoSplitter === '1/8' ? 8 : 16;

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <Button 
        variant="outline" 
        onClick={onBack} 
        className="mb-6"
      >
        Voltar ao Menu Principal
      </Button>

      <h2 className="text-2xl font-bold mb-6">Análise de CTO</h2>

      {!showTable ? (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tipo de Splitter */}
                <div className="space-y-2">
                  <Label htmlFor="tipoSplitter" className={errors.tipoSplitter ? 'text-red-500' : ''}>
                    Tipo de Splitter*
                  </Label>
                  <Select 
                    value={formData.tipoSplitter} 
                    onValueChange={(value: '1/8' | '1/16') => handleChange('tipoSplitter', value)}
                  >
                    <SelectTrigger className={errors.tipoSplitter ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1/8">1/8</SelectItem>
                      <SelectItem value="1/16">1/16</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.tipoSplitter && <p className="text-red-500 text-xs">{errors.tipoSplitter}</p>}
                </div>

                {/* Espaço vazio para manter o layout do grid */}
                <div></div>

                {/* Bairro */}
                <div className="space-y-2">
                  <Label htmlFor="bairro" className={errors.bairro ? 'text-red-500' : ''}>
                    Bairro*
                  </Label>
                  <Input
                    id="bairro"
                    value={formData.bairro}
                    onChange={(e) => handleChange('bairro', e.target.value)}
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
                    value={formData.rua}
                    onChange={(e) => handleChange('rua', e.target.value)}
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
                      value={formData.coordenadas}
                      onChange={(e) => handleChange('coordenadas', e.target.value)}
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

              {/* Campos de serviços */}
              {formData.tipoSplitter && (
                <div className="mt-6">
                  <h3 className="font-medium mb-3">Serviços por Porta</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[...Array(portasParaExibir)].map((_, index) => (
                      <div key={index} className="space-y-1">
                        <Label htmlFor={`porta-${index + 1}`}>
                          Porta {index + 1}
                        </Label>
                        <Input
                          id={`porta-${index + 1}`}
                          value={formData.portas[index]}
                          onChange={(e) => handlePortaChange(index, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={!formData.tipoSplitter}
                >
                  Gerar Tabela
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <TableGenerator 
            data={{
              'Tipo de Splitter': formData.tipoSplitter,
              'Bairro': formData.bairro,
              'Rua': formData.rua,
              'Coordenadas': formData.coordenadas,
              ...formData.portas
                .slice(0, portasParaExibir)
                .reduce((acc, porta, index) => ({
                  ...acc,
                  [`Porta ${index + 1}`]: porta || 'Não preenchido',
                }), {}),
            }}
            title="Análise de CTO" 
          />
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setShowTable(false)}>
              Voltar ao Formulário
            </Button>
            <Button variant="outline" onClick={onBack}>
              Voltar ao Menu Principal
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CTOAnalysisForm;
