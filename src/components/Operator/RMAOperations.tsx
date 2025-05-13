
import React, { useState } from 'react';
import { useOperations, RMAStatus } from '@/context/OperationContext';
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
import { MessageSquare, Clock } from 'lucide-react';

const RMAOperations = () => {
  const { operations, updateOperationStatus, updateOperationFeedback } = useOperations();
  const [selectedOperation, setSelectedOperation] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const rmaOperations = operations.filter(op => op.type === 'rma');

  const handleStatusChange = (id: string, status: RMAStatus) => {
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('pt-BR');
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'em_analise':
        return 'bg-blue-100 text-blue-800';
      case 'finalizado':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'Pendente';
      case 'em_analise':
        return 'Em Análise';
      case 'finalizado':
        return 'Finalizado';
      default:
        return status;
    }
  };

  const getOperationAge = (date: Date) => {
    const diff = new Date().getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      if (hours < 24) {
        return `${hours} h`;
      } else {
        const days = Math.floor(hours / 24);
        return `${days} d`;
      }
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Gerenciamento de RMA</h2>
      
      {rmaOperations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Nenhum RMA pendente.</p>
        </div>
      ) : (
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Espera</TableHead>
                <TableHead>Técnico</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Serial</TableHead>
                <TableHead>Problema</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rmaOperations.map((op) => (
                <TableRow key={op.id} className={op.status === 'pendente' ? 'bg-yellow-50' : ''}>
                  <TableCell>{formatDate(op.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {getOperationAge(op.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell>{op.technician}</TableCell>
                  <TableCell>{op.data.modelo || 'N/A'}</TableCell>
                  <TableCell>{op.data.serial || 'N/A'}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {op.data.problema || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(op.status)}`}>
                      {getStatusText(op.status)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleStatusChange(op.id, 'em_analise')}
                        disabled={op.status !== 'pendente'}
                      >
                        Analisar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleStatusChange(op.id, 'finalizado')}
                        disabled={op.status !== 'em_analise'}
                      >
                        Finalizar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openFeedbackDialog(op.id)}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
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
              placeholder="Insira informações adicionais ou instruções sobre este RMA..."
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
    </div>
  );
};

export default RMAOperations;
