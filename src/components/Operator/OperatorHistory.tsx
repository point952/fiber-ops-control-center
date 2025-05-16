
import React, { useState } from 'react';
import { useOperations } from '@/context/OperationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Search, Filter } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type HistoryFilterType = 'all' | 'installation' | 'cto' | 'rma';
type SortOption = 'newest' | 'oldest' | 'technician' | 'type';

const OperatorHistory = () => {
  const { history } = useOperations();
  const [filterType, setFilterType] = useState<HistoryFilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showDetails, setShowDetails] = useState<string | null>(null);
  
  // Get selected record for details
  const selectedRecord = history.find(record => record.id === showDetails);
  
  // Filter history records based on type and search query
  const filteredHistory = history.filter(record => {
    // Type filter
    if (filterType !== 'all' && record.type !== filterType) {
      return false;
    }
    
    // Search query (search in multiple fields)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const technician = record.technician.toLowerCase();
      const operator = record.operator.toLowerCase();
      const type = record.type.toLowerCase();
      
      // Custom search in data object based on record type
      let dataSearchResult = false;
      
      if (record.type === 'installation' && record.data.Cliente) {
        dataSearchResult = record.data.Cliente.toLowerCase().includes(query);
      } else if (record.type === 'cto' && record.data.cto) {
        dataSearchResult = record.data.cto.toLowerCase().includes(query);
      } else if (record.type === 'rma' && record.data.serial) {
        dataSearchResult = record.data.serial.toLowerCase().includes(query);
      }
      
      return technician.includes(query) || 
             operator.includes(query) || 
             type.includes(query) ||
             dataSearchResult;
    }
    
    return true;
  });
  
  // Sort filtered records
  const sortedHistory = [...filteredHistory].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
      case 'oldest':
        return new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime();
      case 'technician':
        return a.technician.localeCompare(b.technician);
      case 'type':
        return a.type.localeCompare(b.type);
      default:
        return 0;
    }
  });
  
  const getDisplayName = (record: any) => {
    if (record.type === 'installation' && record.data.Cliente) {
      return record.data.Cliente;
    } else if (record.type === 'cto' && record.data.cto) {
      return record.data.cto;
    } else if (record.type === 'rma' && record.data.serial) {
      return record.data.serial;
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
        <h2 className="text-xl font-semibold">Histórico de Operações</h2>
        
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Pesquisar histórico..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
          
          <Select
            value={filterType}
            onValueChange={(value) => setFilterType(value as HistoryFilterType)}
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
            onValueChange={(value) => setSortBy(value as SortOption)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Mais recentes</SelectItem>
              <SelectItem value="oldest">Mais antigos</SelectItem>
              <SelectItem value="technician">Técnico</SelectItem>
              <SelectItem value="type">Tipo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="rounded-md border">
        {sortedHistory.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Identificação</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Técnico</TableHead>
                <TableHead>Operador</TableHead>
                <TableHead>Finalizado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedHistory.map(record => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{getDisplayName(record)}</TableCell>
                  <TableCell>{getTypeLabel(record.type)}</TableCell>
                  <TableCell>{record.technician}</TableCell>
                  <TableCell>{record.operator}</TableCell>
                  <TableCell>{new Date(record.completedAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowDetails(record.id)}
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
            {history.length === 0 ? (
              <div className="text-gray-500">
                <p>Não há operações finalizadas no histórico.</p>
              </div>
            ) : (
              <div className="text-gray-500">
                <p>Nenhuma operação encontrada com os filtros atuais.</p>
                <Button 
                  variant="link" 
                  onClick={() => {
                    setFilterType('all');
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
            <DialogTitle>Detalhes do Registro</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Informações Básicas</h3>
                  <dl className="space-y-1 text-sm">
                    <div className="grid grid-cols-2">
                      <dt className="font-medium">Tipo:</dt>
                      <dd>{getTypeLabel(selectedRecord.type)}</dd>
                    </div>
                    <div className="grid grid-cols-2">
                      <dt className="font-medium">Técnico:</dt>
                      <dd>{selectedRecord.technician}</dd>
                    </div>
                    <div className="grid grid-cols-2">
                      <dt className="font-medium">Operador:</dt>
                      <dd>{selectedRecord.operator}</dd>
                    </div>
                    <div className="grid grid-cols-2">
                      <dt className="font-medium">Criado em:</dt>
                      <dd>{new Date(selectedRecord.createdAt).toLocaleString('pt-BR')}</dd>
                    </div>
                    <div className="grid grid-cols-2">
                      <dt className="font-medium">Finalizado em:</dt>
                      <dd>{new Date(selectedRecord.completedAt).toLocaleString('pt-BR')}</dd>
                    </div>
                  </dl>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Dados da Operação</h3>
                  <dl className="space-y-1 text-sm">
                    {Object.entries(selectedRecord.data).map(([key, value]) => (
                      <div key={key} className="grid grid-cols-2">
                        <dt className="font-medium">{key}:</dt>
                        <dd>{String(value)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
              
              {selectedRecord.feedback && (
                <div className="bg-blue-50 p-4 rounded-md">
                  <h3 className="font-medium text-blue-800 mb-2">Feedback do Operador</h3>
                  <p className="text-blue-700">{selectedRecord.feedback}</p>
                </div>
              )}
              
              {selectedRecord.technicianResponse && (
                <div className="bg-green-50 p-4 rounded-md">
                  <h3 className="font-medium text-green-800 mb-2">Resposta do Técnico</h3>
                  <p className="text-green-700">{selectedRecord.technicianResponse}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OperatorHistory;
