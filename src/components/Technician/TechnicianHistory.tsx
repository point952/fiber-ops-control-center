
import React, { useState } from 'react';
import { useOperations } from '@/context/OperationContext';
import { useAuth } from '@/context/AuthContext';
import { Search, FileText, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

type HistoryFilterType = 'all' | 'installation' | 'cto' | 'rma';
type StatusFilterType = 'all' | 'pending' | 'inProgress' | 'completed';

const TechnicianHistory = () => {
  const { user } = useAuth();
  const { getUserOperations } = useOperations();
  const [filterType, setFilterType] = useState<HistoryFilterType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetails, setShowDetails] = useState<string | null>(null);
  
  // Get operations for current technician
  const technicianOperations = user ? getUserOperations(user.id) : [];
  
  // Get selected operation for details
  const selectedOperation = technicianOperations.find(op => op.id === showDetails);
  
  // Helper function to translate status
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pendente': return 'Pendente';
      case 'iniciando_provisionamento': return 'Em Provisionamento';
      case 'provisionamento_finalizado': return 'Finalizado';
      case 'verificando': return 'Em Verificação';
      case 'verificacao_finalizada': return 'Verificado';
      case 'em_analise': return 'Em Análise';
      case 'finalizado': return 'Finalizado';
      default: return status;
    }
  };
  
  // Helper function to get status badge variant
  const getStatusVariant = (status: string) => {
    if (status.includes('pendente')) return 'secondary';
    if (status.includes('iniciando') || status.includes('verificando') || status.includes('em_analise')) return 'warning';
    return 'success';
  };
  
  // Helper function to categorize status
  const getStatusCategory = (status: string): StatusFilterType => {
    if (status === 'pendente') return 'pending';
    if (status.includes('finalizado') || status === 'finalizado') return 'completed';
    return 'inProgress';
  };
  
  // Filter operations based on type, status and search query
  const filteredOperations = technicianOperations.filter(op => {
    // Type filter
    if (filterType !== 'all' && op.type !== filterType) {
      return false;
    }
    
    // Status filter
    if (statusFilter !== 'all' && getStatusCategory(op.status) !== statusFilter) {
      return false;
    }
    
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      
      // Search in type and status
      const typeMatch = op.type.toLowerCase().includes(query);
      const statusMatch = getStatusLabel(op.status).toLowerCase().includes(query);
      
      // Search in data based on operation type
      let dataSearchResult = false;
      
      if (op.type === 'installation' && op.data.Cliente) {
        dataSearchResult = op.data.Cliente.toLowerCase().includes(query);
      } else if (op.type === 'cto' && op.data.cto) {
        dataSearchResult = op.data.cto.toLowerCase().includes(query);
      } else if (op.type === 'rma' && op.data.serial) {
        dataSearchResult = op.data.serial.toLowerCase().includes(query);
      }
      
      return typeMatch || statusMatch || dataSearchResult;
    }
    
    return true;
  });
  
  // Sort operations by creation date, newest first
  const sortedOperations = [...filteredOperations].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Helper function to get display name based on operation type
  const getDisplayName = (operation: any) => {
    if (operation.type === 'installation' && operation.data.Cliente) {
      return operation.data.Cliente;
    } else if (operation.type === 'cto' && operation.data.cto) {
      return operation.data.cto;
    } else if (operation.type === 'rma' && operation.data.serial) {
      return operation.data.serial;
    }
    return 'N/A';
  };
  
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'installation': return 'Instalação';
      case 'cto': return 'Análise de CTO';
      case 'rma': return 'RMA';
      default: return type;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h2 className="text-xl font-semibold">Minhas Solicitações</h2>
        
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Pesquisar solicitações..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
          
          <Select
            value={filterType}
            onValueChange={(value) => setFilterType(value as HistoryFilterType)}
          >
            <SelectTrigger className="w-[140px] flex gap-1">
              <Filter className="h-4 w-4 opacity-70" />
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="installation">Instalações</SelectItem>
              <SelectItem value="cto">CTOs</SelectItem>
              <SelectItem value="rma">RMAs</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as StatusFilterType)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="inProgress">Em Progresso</SelectItem>
              <SelectItem value="completed">Finalizados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="rounded-md border">
        {sortedOperations.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Identificação</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedOperations.map(op => (
                <TableRow key={op.id}>
                  <TableCell className="font-medium">{getDisplayName(op)}</TableCell>
                  <TableCell>{getTypeLabel(op.type)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(op.status)}>
                      {getStatusLabel(op.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(op.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowDetails(op.id)}
                    >
                      <FileText className="h-4 w-4 mr-1" /> Detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-8 text-center">
            {technicianOperations.length === 0 ? (
              <div className="text-gray-500">
                <p>Você ainda não tem solicitações registradas.</p>
              </div>
            ) : (
              <div className="text-gray-500">
                <p>Nenhuma solicitação encontrada com os filtros atuais.</p>
                <Button 
                  variant="link" 
                  onClick={() => {
                    setFilterType('all');
                    setStatusFilter('all');
                    setSearchQuery('');
                  }}
                >
                  Limpar filtros
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Operation Details Dialog */}
      <Dialog open={!!showDetails} onOpenChange={() => setShowDetails(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Solicitação</DialogTitle>
          </DialogHeader>
          {selectedOperation && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Informações Básicas</h3>
                  <dl className="space-y-1 text-sm">
                    <div className="grid grid-cols-2">
                      <dt className="font-medium">Tipo:</dt>
                      <dd>{getTypeLabel(selectedOperation.type)}</dd>
                    </div>
                    <div className="grid grid-cols-2">
                      <dt className="font-medium">Status:</dt>
                      <dd>
                        <Badge variant={getStatusVariant(selectedOperation.status)}>
                          {getStatusLabel(selectedOperation.status)}
                        </Badge>
                      </dd>
                    </div>
                    <div className="grid grid-cols-2">
                      <dt className="font-medium">Criado em:</dt>
                      <dd>{new Date(selectedOperation.createdAt).toLocaleString('pt-BR')}</dd>
                    </div>
                    {selectedOperation.assignedOperator && (
                      <div className="grid grid-cols-2">
                        <dt className="font-medium">Operador:</dt>
                        <dd>{selectedOperation.assignedOperator}</dd>
                      </div>
                    )}
                  </dl>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Dados da Operação</h3>
                  <dl className="space-y-1 text-sm">
                    {Object.entries(selectedOperation.data).map(([key, value]) => (
                      <div key={key} className="grid grid-cols-2">
                        <dt className="font-medium">{key}:</dt>
                        <dd>{String(value)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
              
              {selectedOperation.feedback && (
                <div className="bg-blue-50 p-4 rounded-md">
                  <h3 className="font-medium text-blue-800 mb-2">Feedback do Operador</h3>
                  <p className="text-blue-700">{selectedOperation.feedback}</p>
                </div>
              )}
              
              {selectedOperation.technicianResponse && (
                <div className="bg-green-50 p-4 rounded-md">
                  <h3 className="font-medium text-green-800 mb-2">Sua Resposta</h3>
                  <p className="text-green-700">{selectedOperation.technicianResponse}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TechnicianHistory;
