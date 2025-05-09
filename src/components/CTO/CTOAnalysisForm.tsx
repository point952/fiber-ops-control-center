
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import CTOSplitterTypeSelector from './CTOSplitterTypeSelector';
import CTOLocationForm from './CTOLocationForm';
import CTOPortsForm from './CTOPortsForm';
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
  const [errors, setErrors] = useState<Partial<Record<keyof FormData | 'portaEspecifica', string>>>({});

  const handleChange = <K extends keyof FormData>(name: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for the modified field
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
    
    // Clear specific port errors
    if (errors.portaEspecifica) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.portaEspecifica;
        return newErrors;
      });
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
                <CTOSplitterTypeSelector
                  value={formData.tipoSplitter}
                  onChange={(value) => handleChange('tipoSplitter', value)}
                  error={errors.tipoSplitter}
                />

                {/* Espaço vazio para manter o layout do grid */}
                <div></div>
              </div>

              {/* Location Form (Bairro, Rua, Coordenadas) */}
              <CTOLocationForm
                bairro={formData.bairro}
                rua={formData.rua}
                coordenadas={formData.coordenadas}
                onBairroChange={(value) => handleChange('bairro', value)}
                onRuaChange={(value) => handleChange('rua', value)}
                onCoordenadasChange={(value) => handleChange('coordenadas', value)}
                errors={{
                  bairro: errors.bairro,
                  rua: errors.rua,
                }}
              />

              {/* Campos de serviços */}
              {formData.tipoSplitter && (
                <CTOPortsForm
                  portCount={portasParaExibir}
                  ports={formData.portas}
                  onChange={handlePortaChange}
                />
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
