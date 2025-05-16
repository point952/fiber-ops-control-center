
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useOperations } from '@/context/operations/OperationContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileText, Search, Filter } from 'lucide-react';
import { Operation } from '@/context/operations/types';

const TechnicianHistory = () => {
  const { user } = useAuth();
  const { getUserOperations } = useOperations();
  
  const [userOperations, setUserOperations] = useState<Operation[]>([]);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);
  
  useEffect(() => {
    if (user?.id) {
      const operations = getUserOperations(user.id);
      setUserOperations(operations);
    }
  }, [user, getUserOperations]);
  
  // Filter operations based on type, search query, and completion status
  const filteredOperations = userOperations.filter(op => {
    // Type filter
    if (filterType !== 'all' && op.type !== filterType) {
      return false;
    }
    
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const type = op.type.toLowerCase();
      
      // Search in data based on operation type
      let dataMatches = false;
      if (op.type === 'installation' && op.data.Cliente) {
        dataMatches = op.data.Cliente.toLowerCase().includes(query);
      } else if (op.type === 'cto' && op.data.cto) {
        dataMatches = op.data.cto.toLowerCase().includes(query);
      } else if (op.type === 'rma' && (op.data.modelo || op.data.serial)) {
        dataMatches = 
          (op.data.modelo?.toLowerCase().includes(query) || false) ||
          (op.data.serial?.toLowerCase().includes(query) || false);
      }
      
      return type.includes(query) || dataMatches;
    }
    
    return true;
  });
  
  // Sort filtered operations
  const sortedOperations = [...filteredOperations].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'status':
        return a.status.localeCompare(b.status);
      case 'type':
        return a.type.localeCompare(b.type);
      default:
        return 0;
    }
  });
  
  const getDisplayName = (operation: Operation) => {
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
  
  const getStatusBadge = (operation: Operation) => {
    // Get appropriate badge variant and text based on status
    let variant: "secondary" | "default" | "destructive" | "outline" = "outline";
    let text = '';
    
    switch (operation.status) {
      case 'pendente':
        variant = 'outline';
        text = 'Pendente';
        break;
      case 'iniciando_provisionamento':
      case 'verificando':
      case 'em_analise':
        variant = 'secondary';
        text = 'Em processamento';
        break;
      case 'provisionamento_finalizado':
      case 'verificacao_finalizada':
      case 'finalizado':
        variant = 'default';
        text = 'Finalizado';
        break;
      default:
        variant = 'outline';
        text = operation.status;
    }
    
    return <Badge variant={variant}>{text}</Badge>;
  };
  
  const handleViewDetails = (operation: Operation) => {
    setSelectedOperation(operation);
  };
  
  const closeDetails = () => {
    setSelectedOperation(null);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-xl font-semibold">Seu Histórico de Operações</h2>
        
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Pesquisar no histórico..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
          
          <Select
            value={filterType}
            onValueChange={setFilterType}
          >
            <SelectTrigger className="w-[140px] flex gap-1 items-center">
              <Filter className="h-4 w-4 opacity-70" />
              <SelectValue placeholder="Filtrar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="installation">Instalações</SelectItem>
              <SelectItem value="cto">CTOs</SelectItem>
              <SelectItem value="rma">RMAs</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={sortBy}
            onValueChange={setSortBy}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Mais recentes</SelectItem>
              <SelectItem value="oldest">Mais antigos</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="type">Tipo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {userOperations.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Operador</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedOperations.map(operation => (
                <TableRow key={operation.id}>
                  <TableCell className="font-medium">{getDisplayName(operation)}</TableCell>
                  <TableCell>{getTypeLabel(operation.type)}</TableCell>
                  <TableCell>{getStatusBadge(operation)}</TableCell>
                  <TableCell>{new Date(operation.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit'
                  })}</TableCell>
                  <TableCell>{operation.assignedOperator || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(operation)}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Você ainda não tem operações registradas.</p>
        </div>
      )}
      
      {/* Operation Details Dialog */}
      <Dialog open={!!selectedOperation} onOpenChange={closeDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Operação</DialogTitle>
          </DialogHeader>
          
          {selectedOperation && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">{getTypeLabel(selectedOperation.type)}</h3>
                  <p className="text-sm text-gray-600">ID: {selectedOperation.id}</p>
                </div>
                {getStatusBadge(selectedOperation)}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Dados da Operação</h4>
                  <dl className="space-y-1 text-sm">
                    {Object.entries(selectedOperation.data).map(([key, value]) => (
                      <div key={key} className="grid grid-cols-2">
                        <dt className="font-medium">{key}:</dt>
                        <dd>{String(value)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Informações</h4>
                  <dl className="space-y-1 text-sm">
                    <div className="grid grid-cols-2">
                      <dt className="font-medium">Tipo:</dt>
                      <dd>{getTypeLabel(selectedOperation.type)}</dd>
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
                    {selectedOperation.assignedAt && (
                      <div className="grid grid-cols-2">
                        <dt className="font-medium">Atribuído em:</dt>
                        <dd>{new Date(selectedOperation.assignedAt).toLocaleString('pt-BR')}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
              
              {/* Communication Section */}
              <div className="mt-4">
                <h4 className="font-medium mb-2">Comunicação</h4>
                
                {selectedOperation.feedback ? (
                  <div className="bg-blue-50 p-4 rounded-md mb-3">
                    <p className="text-sm font-medium text-blue-700 mb-1">Feedback do Operador:</p>
                    <p className="text-gray-800">{selectedOperation.feedback}</p>
                  </div>
                ) : (
                  <p className="text-gray-500">Nenhum feedback do operador.</p>
                )}
                
                {selectedOperation.technicianResponse && (
                  <div className="bg-green-50 p-4 rounded-md">
                    <p className="text-sm font-medium text-green-700 mb-1">Sua Resposta:</p>
                    <p className="text-gray-800">{selectedOperation.technicianResponse}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TechnicianHistory;
