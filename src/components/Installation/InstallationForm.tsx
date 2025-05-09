
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

const CIDADES = ['ARINOS', 'BURITIS', 'CABECEIRA GRANDE', 'PARACATU', 'PALMITAL', 'UNAI', 'URUANA'];
const MODELOS = ['HG6143D', 'HG6143D3', 'HG6145D2', 'HG6145F3', 'PLUS ROUTER', 'PLUS BRIDGE'];
const PLANOS = ['100 Mega', '300 Mega', '500 Mega', '700 Mega'];
const TIPOS_SERVICO = ['Instalação', 'Upgrade', 'Transferência', 'Suporte'];

interface FormData {
  cidade: string;
  modelo: string;
  plano: string;
  tipoServico: string;
  servico: string;
  cliente: string;
  serial: string;
  sinalCaixa: string;
  sinalONU: string;
  wifi: string;
  senha: string;
  coordenadas: string;
}

const InstallationForm: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [formData, setFormData] = useState<FormData>({
    cidade: '',
    modelo: '',
    plano: '',
    tipoServico: '',
    servico: '',
    cliente: '',
    serial: '',
    sinalCaixa: '',
    sinalONU: '',
    wifi: '',
    senha: '',
    coordenadas: '',
  });
  
  const [showWifiFields, setShowWifiFields] = useState(true);
  const [showTable, setShowTable] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const handleChange = (name: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro do campo que foi modificado
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Se o modelo for alterado, verificamos se deve mostrar os campos de Wi-Fi
    if (name === 'modelo') {
      setShowWifiFields(!['PLUS ROUTER', 'PLUS BRIDGE'].includes(value));
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const coordString = `${latitude}, ${longitude}`;
          handleChange('coordenadas', coordString);
          toast.success("Localização obtida com sucesso!");
        },
        () => {
          toast.error("Não foi possível obter sua localização");
        }
      );
    } else {
      toast.error("Geolocalização não é suportada pelo seu navegador");
    }
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    // Validações obrigatórias
    if (!formData.cidade) newErrors.cidade = 'Campo obrigatório';
    if (!formData.modelo) newErrors.modelo = 'Campo obrigatório';
    if (!formData.plano) newErrors.plano = 'Campo obrigatório';
    if (!formData.tipoServico) newErrors.tipoServico = 'Campo obrigatório';
    if (!formData.servico) newErrors.servico = 'Campo obrigatório';
    if (!formData.cliente) newErrors.cliente = 'Campo obrigatório';
    
    // Validação específica do serial
    if (!formData.serial) {
      newErrors.serial = 'Campo obrigatório';
    } else if (!formData.serial.startsWith('FHTT')) {
      newErrors.serial = 'Serial deve começar com FHTT';
    }
    
    // Validação de senha e Wi-Fi se necessário
    if (showWifiFields) {
      if (formData.wifi && formData.wifi.length > 23) {
        newErrors.wifi = 'Wi-Fi deve ter no máximo 23 caracteres';
      }
      
      if (!formData.senha) {
        newErrors.senha = 'Campo obrigatório';
      } else if (formData.senha.length < 8) {
        newErrors.senha = 'Senha deve ter no mínimo 8 caracteres';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setShowTable(true);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <Button 
        variant="outline" 
        onClick={onBack} 
        className="mb-6"
      >
        Voltar ao Menu Principal
      </Button>

      <h2 className="text-2xl font-bold mb-6">Instalação / Upgrade</h2>

      {!showTable ? (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cidade */}
                <div className="space-y-2">
                  <Label htmlFor="cidade" className={errors.cidade ? 'text-red-500' : ''}>
                    Cidade*
                  </Label>
                  <Select 
                    value={formData.cidade} 
                    onValueChange={(value) => handleChange('cidade', value)}
                  >
                    <SelectTrigger className={errors.cidade ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione uma cidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {CIDADES.map(cidade => (
                        <SelectItem key={cidade} value={cidade}>
                          {cidade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.cidade && <p className="text-red-500 text-xs">{errors.cidade}</p>}
                </div>

                {/* Modelo */}
                <div className="space-y-2">
                  <Label htmlFor="modelo" className={errors.modelo ? 'text-red-500' : ''}>
                    Modelo*
                  </Label>
                  <Select 
                    value={formData.modelo} 
                    onValueChange={(value) => handleChange('modelo', value)}
                  >
                    <SelectTrigger className={errors.modelo ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione um modelo" />
                    </SelectTrigger>
                    <SelectContent>
                      {MODELOS.map(modelo => (
                        <SelectItem key={modelo} value={modelo}>
                          {modelo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.modelo && <p className="text-red-500 text-xs">{errors.modelo}</p>}
                </div>

                {/* Plano */}
                <div className="space-y-2">
                  <Label htmlFor="plano" className={errors.plano ? 'text-red-500' : ''}>
                    Plano*
                  </Label>
                  <Select 
                    value={formData.plano} 
                    onValueChange={(value) => handleChange('plano', value)}
                  >
                    <SelectTrigger className={errors.plano ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione um plano" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLANOS.map(plano => (
                        <SelectItem key={plano} value={plano}>
                          {plano}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.plano && <p className="text-red-500 text-xs">{errors.plano}</p>}
                </div>

                {/* Tipo de Serviço */}
                <div className="space-y-2">
                  <Label htmlFor="tipoServico" className={errors.tipoServico ? 'text-red-500' : ''}>
                    Tipo de Serviço*
                  </Label>
                  <Select 
                    value={formData.tipoServico} 
                    onValueChange={(value) => handleChange('tipoServico', value)}
                  >
                    <SelectTrigger className={errors.tipoServico ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione o tipo de serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS_SERVICO.map(tipo => (
                        <SelectItem key={tipo} value={tipo}>
                          {tipo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.tipoServico && <p className="text-red-500 text-xs">{errors.tipoServico}</p>}
                </div>

                {/* Serviço */}
                <div className="space-y-2">
                  <Label htmlFor="servico" className={errors.servico ? 'text-red-500' : ''}>
                    Serviço*
                  </Label>
                  <Input
                    id="servico"
                    type="number"
                    value={formData.servico}
                    onChange={(e) => handleChange('servico', e.target.value)}
                    className={errors.servico ? 'border-red-500' : ''}
                  />
                  {errors.servico && <p className="text-red-500 text-xs">{errors.servico}</p>}
                </div>

                {/* Cliente */}
                <div className="space-y-2">
                  <Label htmlFor="cliente" className={errors.cliente ? 'text-red-500' : ''}>
                    Cliente*
                  </Label>
                  <Input
                    id="cliente"
                    value={formData.cliente}
                    onChange={(e) => handleChange('cliente', e.target.value)}
                    className={errors.cliente ? 'border-red-500' : ''}
                  />
                  {errors.cliente && <p className="text-red-500 text-xs">{errors.cliente}</p>}
                </div>

                {/* Serial */}
                <div className="space-y-2">
                  <Label htmlFor="serial" className={errors.serial ? 'text-red-500' : ''}>
                    Serial* (deve começar com FHTT)
                  </Label>
                  <Input
                    id="serial"
                    value={formData.serial}
                    onChange={(e) => handleChange('serial', e.target.value)}
                    className={errors.serial ? 'border-red-500' : ''}
                  />
                  {errors.serial && <p className="text-red-500 text-xs">{errors.serial}</p>}
                </div>

                {/* Sinal da Caixa */}
                <div className="space-y-2">
                  <Label htmlFor="sinalCaixa">Sinal da Caixa</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-gray-500 select-none">-</span>
                    </div>
                    <Input
                      id="sinalCaixa"
                      type="number"
                      value={formData.sinalCaixa}
                      onChange={(e) => handleChange('sinalCaixa', e.target.value)}
                      className="pl-6"
                    />
                  </div>
                </div>

                {/* Sinal da ONU */}
                <div className="space-y-2">
                  <Label htmlFor="sinalONU">Sinal da ONU</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-gray-500 select-none">-</span>
                    </div>
                    <Input
                      id="sinalONU"
                      type="number"
                      value={formData.sinalONU}
                      onChange={(e) => handleChange('sinalONU', e.target.value)}
                      className="pl-6"
                    />
                  </div>
                </div>

                {/* Coordenadas */}
                <div className="space-y-2">
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
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Obter Localização
                    </Button>
                  </div>
                </div>
              </div>

              {/* Campos condicionais de Wi-Fi e Senha */}
              {showWifiFields && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Wi-Fi */}
                  <div className="space-y-2">
                    <Label htmlFor="wifi" className={errors.wifi ? 'text-red-500' : ''}>
                      Wi-Fi (máx. 23 caracteres)
                    </Label>
                    <Input
                      id="wifi"
                      value={formData.wifi}
                      onChange={(e) => handleChange('wifi', e.target.value)}
                      maxLength={23}
                      className={errors.wifi ? 'border-red-500' : ''}
                    />
                    {errors.wifi && <p className="text-red-500 text-xs">{errors.wifi}</p>}
                  </div>

                  {/* Senha */}
                  <div className="space-y-2">
                    <Label htmlFor="senha" className={errors.senha ? 'text-red-500' : ''}>
                      Senha* (mín. 8 caracteres)
                    </Label>
                    <Input
                      id="senha"
                      type="text" 
                      value={formData.senha}
                      onChange={(e) => handleChange('senha', e.target.value)}
                      className={errors.senha ? 'border-red-500' : ''}
                    />
                    {errors.senha && <p className="text-red-500 text-xs">{errors.senha}</p>}
                  </div>
                </div>
              )}

              <div className="pt-4">
                <Button type="submit" className="w-full">Gerar Tabela</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <TableGenerator 
            data={{
              Cidade: formData.cidade,
              Modelo: formData.modelo,
              Plano: formData.plano,
              'Tipo de Serviço': formData.tipoServico,
              Serviço: formData.servico,
              Cliente: formData.cliente,
              Serial: formData.serial,
              'Sinal da Caixa': formData.sinalCaixa ? `-${formData.sinalCaixa}` : '',
              'Sinal da ONU': formData.sinalONU ? `-${formData.sinalONU}` : '',
              'Wi-Fi': showWifiFields ? formData.wifi : 'N/A',
              'Senha': showWifiFields ? formData.senha : 'N/A',
              'Coordenadas': formData.coordenadas,
            }}
            title="Resumo da Instalação/Upgrade" 
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

export default InstallationForm;
