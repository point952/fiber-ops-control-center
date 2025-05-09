
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import TableGenerator from '../TableGenerator';
import { Textarea } from '@/components/ui/textarea';

const MODELOS_ONU = ['HG6143D', 'HG6143D3', 'HG6145D2', 'HG6145F3', 'PLUS ROUTER', 'PLUS BRIDGE'];

interface FormData {
  servico: string;
  nome: string;
  data: Date | undefined;
  modeloONU: string;
  serialONU: string;
  ligandoONU: 'SIM' | 'NÃO' | '';
  problemasSinalONU: 'SIM' | 'NÃO' | '';
  falhasWifi: {
    wifi2ghz: boolean;
    wifi5ghz: boolean;
  };
  portasLANFalha: {
    porta1: boolean;
    porta2: boolean;
    porta3: boolean;
    porta4: boolean;
  };
  danosFisicos: {
    carcaca: boolean;
    antenas: boolean;
  };
  outrosProblemas: string;
  ligandoRadio: 'SIM' | 'NÃO' | '';
  sinalFracoRadio: 'SIM' | 'NÃO' | '';
  falhasRedeRadio: 'SIM' | 'NÃO' | '';
  tecnico: string;
  observacoes: string;
}

const RMAForm: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [formData, setFormData] = useState<FormData>({
    servico: '',
    nome: '',
    data: undefined,
    modeloONU: '',
    serialONU: '',
    ligandoONU: '',
    problemasSinalONU: '',
    falhasWifi: {
      wifi2ghz: false,
      wifi5ghz: false,
    },
    portasLANFalha: {
      porta1: false,
      porta2: false,
      porta3: false,
      porta4: false,
    },
    danosFisicos: {
      carcaca: false,
      antenas: false,
    },
    outrosProblemas: '',
    ligandoRadio: '',
    sinalFracoRadio: '',
    falhasRedeRadio: '',
    tecnico: '',
    observacoes: '',
  });
  
  const [showTable, setShowTable] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

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

  const handleNestedChange = (category: 'falhasWifi' | 'portasLANFalha' | 'danosFisicos', name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [name]: checked,
      },
    }));
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    if (!formData.servico) newErrors.servico = 'Campo obrigatório';
    if (!formData.nome) newErrors.nome = 'Campo obrigatório';
    if (!formData.data) newErrors.data = 'Campo obrigatório';
    
    // Validação específica do serial
    if (formData.serialONU && !formData.serialONU.startsWith('FHTT')) {
      newErrors.serialONU = 'Serial deve começar com FHTT';
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

  const getFalhasWifiText = () => {
    const falhas = [];
    if (formData.falhasWifi.wifi2ghz) falhas.push('2Ghz');
    if (formData.falhasWifi.wifi5ghz) falhas.push('5Ghz');
    return falhas.length ? falhas.join(', ') : 'Nenhuma';
  };

  const getPortasLANText = () => {
    const portas = [];
    if (formData.portasLANFalha.porta1) portas.push('1');
    if (formData.portasLANFalha.porta2) portas.push('2');
    if (formData.portasLANFalha.porta3) portas.push('3');
    if (formData.portasLANFalha.porta4) portas.push('4');
    return portas.length ? portas.join(', ') : 'Nenhuma';
  };

  const getDanosFisicosText = () => {
    const danos = [];
    if (formData.danosFisicos.carcaca) danos.push('Carcaça');
    if (formData.danosFisicos.antenas) danos.push('Antenas');
    return danos.length ? danos.join(', ') : 'Nenhum';
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

      <h2 className="text-2xl font-bold mb-6">RMA</h2>

      {!showTable ? (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Informações Básicas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Serviço */}
                  <div className="space-y-2">
                    <Label htmlFor="servico" className={errors.servico ? 'text-red-500' : ''}>
                      Serviço*
                    </Label>
                    <Input
                      id="servico"
                      value={formData.servico}
                      onChange={(e) => handleChange('servico', e.target.value)}
                      className={errors.servico ? 'border-red-500' : ''}
                    />
                    {errors.servico && <p className="text-red-500 text-xs">{errors.servico}</p>}
                  </div>

                  {/* Nome */}
                  <div className="space-y-2">
                    <Label htmlFor="nome" className={errors.nome ? 'text-red-500' : ''}>
                      Nome*
                    </Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => handleChange('nome', e.target.value)}
                      className={errors.nome ? 'border-red-500' : ''}
                    />
                    {errors.nome && <p className="text-red-500 text-xs">{errors.nome}</p>}
                  </div>

                  {/* Data */}
                  <div className="space-y-2">
                    <Label htmlFor="data" className={errors.data ? 'text-red-500' : ''}>
                      Data*
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.data && "text-muted-foreground",
                            errors.data && "border-red-500"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.data ? format(formData.data, "dd 'de' MMMM 'de' yyyy", { locale: pt }) : <span>Selecionar data</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.data}
                          onSelect={(date) => handleChange('data', date)}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.data && <p className="text-red-500 text-xs">{errors.data}</p>}
                  </div>
                </div>
              </div>

              {/* Informações da ONU */}
              <div className="space-y-4 pt-2">
                <h3 className="text-lg font-medium border-t pt-4">Informações da ONU</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Modelo ONU */}
                  <div className="space-y-2">
                    <Label htmlFor="modeloONU">
                      Modelo
                    </Label>
                    <Select 
                      value={formData.modeloONU} 
                      onValueChange={(value) => handleChange('modeloONU', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um modelo" />
                      </SelectTrigger>
                      <SelectContent>
                        {MODELOS_ONU.map(modelo => (
                          <SelectItem key={modelo} value={modelo}>
                            {modelo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Serial ONU */}
                  <div className="space-y-2">
                    <Label htmlFor="serialONU" className={errors.serialONU ? 'text-red-500' : ''}>
                      Serial (deve começar com FHTT)
                    </Label>
                    <Input
                      id="serialONU"
                      value={formData.serialONU}
                      onChange={(e) => handleChange('serialONU', e.target.value)}
                      className={errors.serialONU ? 'border-red-500' : ''}
                    />
                    {errors.serialONU && <p className="text-red-500 text-xs">{errors.serialONU}</p>}
                  </div>

                  {/* Ligando ONU */}
                  <div className="space-y-2">
                    <Label htmlFor="ligandoONU">
                      Ligando?
                    </Label>
                    <Select 
                      value={formData.ligandoONU} 
                      onValueChange={(value: 'SIM' | 'NÃO') => handleChange('ligandoONU', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SIM">SIM</SelectItem>
                        <SelectItem value="NÃO">NÃO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Problema de Sinal ONU */}
                  <div className="space-y-2">
                    <Label htmlFor="problemasSinalONU">
                      Problema de Sinal?
                    </Label>
                    <Select 
                      value={formData.problemasSinalONU} 
                      onValueChange={(value: 'SIM' | 'NÃO') => handleChange('problemasSinalONU', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SIM">SIM</SelectItem>
                        <SelectItem value="NÃO">NÃO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                  {/* Falhas no Wi-Fi */}
                  <div className="space-y-3">
                    <Label className="block">
                      Falhas no Wi-Fi
                    </Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="wifi2ghz"
                          checked={formData.falhasWifi.wifi2ghz}
                          onCheckedChange={(checked) => handleNestedChange('falhasWifi', 'wifi2ghz', checked === true)}
                        />
                        <Label htmlFor="wifi2ghz">2Ghz</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="wifi5ghz"
                          checked={formData.falhasWifi.wifi5ghz}
                          onCheckedChange={(checked) => handleNestedChange('falhasWifi', 'wifi5ghz', checked === true)}
                        />
                        <Label htmlFor="wifi5ghz">5Ghz</Label>
                      </div>
                    </div>
                  </div>

                  {/* Portas LAN com Falha */}
                  <div className="space-y-3">
                    <Label className="block">
                      Portas LAN com Falha
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="porta1"
                          checked={formData.portasLANFalha.porta1}
                          onCheckedChange={(checked) => handleNestedChange('portasLANFalha', 'porta1', checked === true)}
                        />
                        <Label htmlFor="porta1">Porta 1</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="porta2"
                          checked={formData.portasLANFalha.porta2}
                          onCheckedChange={(checked) => handleNestedChange('portasLANFalha', 'porta2', checked === true)}
                        />
                        <Label htmlFor="porta2">Porta 2</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="porta3"
                          checked={formData.portasLANFalha.porta3}
                          onCheckedChange={(checked) => handleNestedChange('portasLANFalha', 'porta3', checked === true)}
                        />
                        <Label htmlFor="porta3">Porta 3</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="porta4"
                          checked={formData.portasLANFalha.porta4}
                          onCheckedChange={(checked) => handleNestedChange('portasLANFalha', 'porta4', checked === true)}
                        />
                        <Label htmlFor="porta4">Porta 4</Label>
                      </div>
                    </div>
                  </div>

                  {/* Danos Físicos */}
                  <div className="space-y-3">
                    <Label className="block">
                      Danos Físicos
                    </Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="carcaca"
                          checked={formData.danosFisicos.carcaca}
                          onCheckedChange={(checked) => handleNestedChange('danosFisicos', 'carcaca', checked === true)}
                        />
                        <Label htmlFor="carcaca">Carcaça</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="antenas"
                          checked={formData.danosFisicos.antenas}
                          onCheckedChange={(checked) => handleNestedChange('danosFisicos', 'antenas', checked === true)}
                        />
                        <Label htmlFor="antenas">Antenas</Label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Outros Problemas */}
                <div className="space-y-2">
                  <Label htmlFor="outrosProblemas">
                    Outros Problemas
                  </Label>
                  <Textarea
                    id="outrosProblemas"
                    value={formData.outrosProblemas}
                    onChange={(e) => handleChange('outrosProblemas', e.target.value)}
                    placeholder="Descreva outros problemas aqui..."
                    className="min-h-[80px]"
                  />
                </div>
              </div>

              {/* Informações do Rádio */}
              <div className="space-y-4 pt-2">
                <h3 className="text-lg font-medium border-t pt-4">Informações do Rádio</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Ligando Rádio */}
                  <div className="space-y-2">
                    <Label htmlFor="ligandoRadio">
                      Ligando?
                    </Label>
                    <Select 
                      value={formData.ligandoRadio} 
                      onValueChange={(value: 'SIM' | 'NÃO') => handleChange('ligandoRadio', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SIM">SIM</SelectItem>
                        <SelectItem value="NÃO">NÃO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sinal Fraco Rádio */}
                  <div className="space-y-2">
                    <Label htmlFor="sinalFracoRadio">
                      Sinal Fraco (Saturado)?
                    </Label>
                    <Select 
                      value={formData.sinalFracoRadio} 
                      onValueChange={(value: 'SIM' | 'NÃO') => handleChange('sinalFracoRadio', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SIM">SIM</SelectItem>
                        <SelectItem value="NÃO">NÃO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Falhas na Rede Rádio */}
                  <div className="space-y-2">
                    <Label htmlFor="falhasRedeRadio">
                      Falhas na Rede (LAN)?
                    </Label>
                    <Select 
                      value={formData.falhasRedeRadio} 
                      onValueChange={(value: 'SIM' | 'NÃO') => handleChange('falhasRedeRadio', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SIM">SIM</SelectItem>
                        <SelectItem value="NÃO">NÃO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Informações Adicionais */}
              <div className="space-y-4 pt-2">
                <h3 className="text-lg font-medium border-t pt-4">Informações Adicionais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Técnico */}
                  <div className="space-y-2">
                    <Label htmlFor="tecnico">
                      Técnico
                    </Label>
                    <Input
                      id="tecnico"
                      value={formData.tecnico}
                      onChange={(e) => handleChange('tecnico', e.target.value)}
                    />
                  </div>
                </div>

                {/* Observações */}
                <div className="space-y-2">
                  <Label htmlFor="observacoes">
                    Observações
                  </Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => handleChange('observacoes', e.target.value)}
                    placeholder="Observações adicionais..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>

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
              'Serviço': formData.servico,
              'Nome': formData.nome,
              'Data': formData.data ? format(formData.data, "dd/MM/yyyy") : '',
              'Modelo ONU': formData.modeloONU,
              'Serial ONU': formData.serialONU,
              'ONU Ligando': formData.ligandoONU,
              'Problema de Sinal ONU': formData.problemasSinalONU,
              'Falhas Wi-Fi': getFalhasWifiText(),
              'Portas LAN com Falha': getPortasLANText(),
              'Danos Físicos': getDanosFisicosText(),
              'Outros Problemas ONU': formData.outrosProblemas,
              'Rádio Ligando': formData.ligandoRadio,
              'Sinal Fraco (Saturado)': formData.sinalFracoRadio,
              'Falhas na Rede (LAN)': formData.falhasRedeRadio,
              'Técnico': formData.tecnico,
              'Observações': formData.observacoes,
            }}
            title="Relatório de RMA" 
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

export default RMAForm;
