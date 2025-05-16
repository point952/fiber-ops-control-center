
import React, { useState } from 'react';
import { useOperations } from '@/context/OperationContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface InstallationOperationsProps {
  onClaimTask?: (operationId: string) => void;
}

const InstallationOperations: React.FC<InstallationOperationsProps> = ({ onClaimTask }) => {
  const { operations, updateOperationStatus, updateOperationFeedback, completeOperation } = useOperations();
  const { user } = useAuth();
  const [selectedOperation, setSelectedOperation] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [completionConfirmOpen, setCompletionConfirmOpen] = useState(false);
  
  // Filter operations to show only installation type
  const installationOperations = operations.filter(op => op.type === 'installation');

  const handleProvisioningStart = (id: string) => {
    updateOperationStatus(id, 'iniciando_provisionamento');
    toast.success("Status atualizado para: Iniciando Provisionamento");
  };

  const handleProvisioningComplete = (id: string) => {
    updateOperationStatus(id, 'provisionamento_finalizado');
    toast.success("Status atualizado para: Provisionamento Finalizado");
  };

  const handleSendFeedback = () => {
    if (selectedOperation && feedback.trim()) {
      updateOperationFeedback(selectedOperation, feedback);
      setFeedback('');
      setSelectedOperation(null);
      toast.success("Feedback enviado com sucesso");
    }
  };
  
  const handleCompleteOperation = () => {
    if (selectedOperation && user) {
      completeOperation(selectedOperation, user.name);
      setCompletionConfirmOpen(false);
      setSelectedOperation(null);
      toast.success("Chamado finalizado e arquivado com sucesso");
    }
  };

  const selectedOp = operations.find(op => op.id === selectedOperation);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Instalações e Upgrades</h2>
      
      {installationOperations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Não há solicitações de instalação no momento.
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Técnico</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {installationOperations.map((op) => (
                <TableRow key={op.id}>
                  <TableCell className="font-medium">{op.id.substring(0, 8)}</TableCell>
                  <TableCell>{op.data.Cliente || "N/A"}</TableCell>
                  <TableCell>{op.data.Serviço || "N/A"}</TableCell>
                  <TableCell>{op.technician || "N/A"}</TableCell>
                  <TableCell>
                    {new Date(op.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={op.status === 'pendente' ? "outline" : 
                              op.status === 'iniciando_provisionamento' ? "secondary" : 
                              "default"}
                      className={op.status === 'provisionamento_finalizado' ? "bg-green-600 text-white" : ""}
                    >
                      {op.status.replace(/_/g, ' ')}
                    </Badge>
                    {op.assignedOperator && (
                      <div className="text-xs text-blue-600 mt-1">
                        Resp: {op.assignedOperator}
                      </div>
                    )}
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
                        onClick={() => {
                          setSelectedOperation(op.id);
                          setShowDetails(true);
                        }}
                      >
                        Detalhes
                      </Button>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedOperation(op.id)}
                          >
                            Feedback
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Adicionar Feedback</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground">
                                Adicione instruções ou comentários para o técnico sobre esta instalação.
                              </p>
                              <textarea 
                                className="w-full p-2 border rounded-md" 
                                rows={4}
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Escreva seu feedback aqui..."
                              ></textarea>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setSelectedOperation(null)}>Cancelar</Button>
                            <Button onClick={handleSendFeedback}>Enviar Feedback</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      {op.status === 'pendente' && (
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleProvisioningStart(op.id)}
                        >
                          Iniciar Prov.
                        </Button>
                      )}
                      
                      {op.status === 'iniciando_provisionamento' && (
                        <Button 
                          variant="default" 
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleProvisioningComplete(op.id)}
                        >
                          Finalizar Prov.
                        </Button>
                      )}
                      
                      {op.status === 'provisionamento_finalizado' && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => {
                            setSelectedOperation(op.id);
                            setCompletionConfirmOpen(true);
                          }}
                        >
                          Arquivar
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes da Instalação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
            {selectedOp && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">Cliente:</p>
                    <p className="text-sm">{selectedOp.data.Cliente || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">Serviço:</p>
                    <p className="text-sm">{selectedOp.data.Serviço || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">Modelo:</p>
                    <p className="text-sm">{selectedOp.data.Modelo || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">Serial:</p>
                    <p className="text-sm">{selectedOp.data.Serial || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">Endereço:</p>
                    <p className="text-sm">{selectedOp.data.Endereço || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">Técnico:</p>
                    <p className="text-sm">{selectedOp.technician || "N/A"}</p>
                  </div>
                </div>
                
                {selectedOp.data.Observações && (
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm font-semibold">Observações:</p>
                    <p className="text-sm">{selectedOp.data.Observações}</p>
                  </div>
                )}

                {/* Exibir o resumo da instalação se presente */}
                {selectedOp.data.resumo && (
                  <div className="p-3 bg-blue-50 rounded-md border border-blue-100">
                    <p className="text-sm font-semibold text-blue-800">Resumo da Instalação:</p>
                    <pre className="text-sm whitespace-pre-wrap">{selectedOp.data.resumo}</pre>
                  </div>
                )}

                {/* Exibir todas as informações adicionais disponíveis */}
                {Object.entries(selectedOp.data).filter(
                  ([key]) => !['Cliente', 'Serviço', 'Modelo', 'Serial', 'Endereço', 'Observações', 'resumo'].includes(key)
                ).length > 0 && (
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm font-semibold">Informações Adicionais:</p>
                    {Object.entries(selectedOp.data).filter(
                      ([key]) => !['Cliente', 'Serviço', 'Modelo', 'Serial', 'Endereço', 'Observações', 'resumo'].includes(key)
                    ).map(([key, value]) => (
                      <div key={key} className="text-sm mt-1">
                        <span className="font-medium">{key}:</span> {String(value)}
                      </div>
                    ))}
                  </div>
                )}

                {selectedOp.feedback && (
                  <div className="p-3 bg-blue-50 rounded-md border border-blue-100">
                    <p className="text-sm font-semibold text-blue-800">Feedback enviado:</p>
                    <p className="text-sm">{selectedOp.feedback}</p>
                  </div>
                )}

                {selectedOp.assignedOperator && (
                  <div className="p-3 bg-purple-50 rounded-md border border-purple-100">
                    <p className="text-sm font-semibold text-purple-800">Chamado atribuído a:</p>
                    <p className="text-sm">{selectedOp.assignedOperator}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {selectedOp.assignedAt ? 
                        `Atribuído em: ${new Date(selectedOp.assignedAt).toLocaleString('pt-BR')}` :
                        ''}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={completionConfirmOpen} onOpenChange={setCompletionConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Arquivamento</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Tem certeza que deseja finalizar e arquivar este chamado?</p>
            <p className="text-sm text-gray-500 mt-2">
              Esta ação moverá o chamado para o histórico e ele não estará mais visível no painel de operações ativas.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompletionConfirmOpen(false)}>Cancelar</Button>
            <Button onClick={handleCompleteOperation} variant="destructive">Confirmar Arquivamento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstallationOperations;
