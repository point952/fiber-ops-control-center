import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import CTOSplitterTypeSelector from './CTOSplitterTypeSelector';
import CTOLocationForm from './CTOLocationForm';
import CTOPortsForm from './CTOPortsForm';
import TableGenerator from '../TableGenerator';
import { useOperations } from '@/context/operations/OperationsContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from "sonner";

interface FormData {
  tipoSplitter: '1/8' | '1/16' | '';
  bairro: string;
  rua: string;
  coordenadas: string;
  portas: string[];
  cto?: string; // Adding optional CTO identifier field
}

const CTOAnalysisForm: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { addOperation } = useOperations();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<FormData>({
    tipoSplitter: '',
    bairro: '',
    rua: '',
    coordenadas: '',
    portas: Array(16).fill(''),
    cto: '', // Initialize CTO field
  });
  
  const [showTable, setShowTable] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData | 'portaEspecifica', string>>>({});
  const [submitting, setSubmitting] = useState(false);

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

  const submitAnalysis = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para enviar análises");
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Format the data for the operation
      const operationData = {
        ...formData,
        portas: formData.portas.slice(0, formData.tipoSplitter === '1/8' ? 8 : 16),
        createdAt: new Date().toISOString()
      };
      
      // Add the operation to the context
      await addOperation({
        type: 'cto',
        data: operationData,
        status: 'pending',
        technician: user.name,
        technician_id: user.id
      });
      
      toast.success("Análise de CTO enviada com sucesso!");
      
      // Reset the form after successful submission
      setFormData({
        tipoSplitter: '',
        bairro: '',
        rua: '',
        coordenadas: '',
        portas: Array(16).fill(''),
        cto: '',
      });
      
      // Go back to the main menu
      onBack();
    } catch (error) {
      console.error("Erro ao enviar análise:", error);
      toast.error("Erro ao enviar análise. Tente novamente.");
    } finally {
      setSubmitting(false);
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
              {/* CTO Identifier field */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="cto" className="text-sm font-medium">
                    Identificação da CTO
                  </label>
                  <input
                    id="cto"
                    value={formData.cto}
                    onChange={(e) => handleChange('cto', e.target.value)}
                    placeholder="Ex: CTO-123"
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div></div>
              </div>
              
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
            formData={{
              'CTO': formData.cto || 'Não identificada',
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
            type="cto"
            onBack={() => setShowTable(false)}
          />
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setShowTable(false)}>
              Voltar ao Formulário
            </Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={onBack}>
                Voltar ao Menu Principal
              </Button>
              <Button 
                onClick={submitAnalysis}
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {submitting ? "Enviando..." : "Enviar para Análise"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CTOAnalysisForm;
