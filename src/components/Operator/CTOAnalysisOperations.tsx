
import React, { useState } from 'react';
import { useOperations, CTOStatus } from '@/context/OperationContext';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';

interface CTOAnalysisOperationsProps {
  onClaimTask?: (operationId: string) => void;
}

const CTOAnalysisOperations: React.FC<CTOAnalysisOperationsProps> = ({ onClaimTask }) => {
  const { operations, updateOperationStatus, updateOperationFeedback } = useOperations();
  const [selectedOperation, setSelectedOperation] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [availablePorts, setAvailablePorts] = useState<Record<string, boolean>>({});
  const [portsDialogOpen, setPortsDialogOpen] = useState(false);

  const ctoOperations = operations.filter(op => op.type === 'cto');

  const handleStatusChange = (id: string, status: CTOStatus) => {
    updateOperationStatus(id, status);
    toast.success(`Status atualizado para ${status.replace('_', ' ')}`);
  };

  const handleSendFeedback = (id: string) => {
    if (!feedback.trim()) {
      toast.error("Por favor, insira um feedback antes de enviar");
      return;
    }
    
    updateOperationFeedback(id, feedback);
    setFeedback('');
    setDialogOpen(false);
    toast.success("Feedback enviado com sucesso");
  };

  const openFeedbackDialog = (id: string) => {
    setSelectedOperation(id);
    // Get any existing feedback
    const operation = operations.find(op => op.id === id);
    if (operation && operation.feedback) {
      setFeedback(operation.feedback);
    } else {
      setFeedback('');
    }
    setDialogOpen(true);
  };

  const openPortsDialog = (id: string) => {
    setSelectedOperation(id);
    // Initialize ports from operation data
    const operation = operations.find(op => op.id === id);
    if (operation && operation.data.portas) {
      const initialPorts: Record<string, boolean> = {};
      const portNumbers = Array.from({ length: operation.data.portas || 8 }, (_, i) => i + 1);
      
      // Initialize each port as available
      portNumbers.forEach(portNumber => {
        initialPorts[`port-${portNumber}`] = false;
      });
      
      setAvailablePorts(initialPorts);
    }
    setPortsDialogOpen(true);
  };

  const handleSaveAvailablePorts = () => {
    if (!selectedOperation) return;
    
    // Update the operation with the available ports info
    const selectedOp = operations.find(op => op.id === selectedOperation);
    if (selectedOp) {
      const availablePortsList = Object.entries(availablePorts)
        .filter(([_, isAvailable]) => isAvailable)
        .map(([portKey]) => portKey.replace('port-', ''))
        .join(', ');
      
      const updatedFeedback = `Portas disponíveis: ${availablePortsList || 'Nenhuma'}`;
      updateOperationFeedback(selectedOperation, updatedFeedback);
      updateOperationStatus(selectedOperation, 'verificacao_finalizada');
      setPortsDialogOpen(false);
      toast.success("Verificação de portas concluída com sucesso");
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('pt-BR');
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'verificando':
        return 'bg-blue-100 text-blue-800';
      case 'verificacao_finalizada':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'Pendente';
      case 'verificando':
        return 'Verificando';
      case 'verificacao_finalizada':
        return 'Verificação Finalizada';
      default:
        return status;
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Análise de CTOs</h2>
      
      {ctoOperations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Nenhuma análise de CTO pendente.</p>
        </div>
      ) : (
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Técnico</TableHead>
                <TableHead>CTO</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Portas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ctoOperations.map((op) => (
                <TableRow key={op.id}>
                  <TableCell>{formatDate(op.createdAt)}</TableCell>
                  <TableCell>{op.technician}</TableCell>
                  <TableCell>{op.data.cto || 'N/A'}</TableCell>
                  <TableCell>{op.data.bairro ? `${op.data.bairro}, ${op.data.rua || ''}` : 'N/A'}</TableCell>
                  <TableCell>{op.data.tipo || 'N/A'}</TableCell>
                  <TableCell>{op.data.portas || 'N/A'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(op.status)}`}>
                      {getStatusText(op.status)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {onClaimTask && !op.assignedOperator && (
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => onClaimTask(op.id)}
                        >
                          Assumir
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleStatusChange(op.id, 'verificando')}
                        disabled={op.status !== 'pendente'}
                      >
                        Verificar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openPortsDialog(op.id)}
                        disabled={op.status !== 'verificando'}
                      >
                        Portas
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openFeedbackDialog(op.id)}
                      >
                        Feedback
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Feedback para o Técnico</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Insira informações adicionais ou correções sobre esta CTO..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[150px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={() => selectedOperation && handleSendFeedback(selectedOperation)}>Enviar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={portsDialogOpen} onOpenChange={setPortsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verificar Portas Disponíveis</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500 mb-4">Selecione as portas disponíveis para uso:</p>
            <div className="grid grid-cols-4 gap-4">
              {Object.keys(availablePorts).map((portKey) => {
                const portNumber = portKey.replace('port-', '');
                return (
                  <div key={portKey} className="flex items-center space-x-2">
                    <Checkbox 
                      id={portKey}
                      checked={availablePorts[portKey]}
                      onCheckedChange={(checked) => {
                        setAvailablePorts(prev => ({
                          ...prev,
                          [portKey]: checked === true
                        }));
                      }}
                    />
                    <label 
                      htmlFor={portKey}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Porta {portNumber}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPortsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveAvailablePorts}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CTOAnalysisOperations;
