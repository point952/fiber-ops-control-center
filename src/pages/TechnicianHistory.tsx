import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useOperations } from '@/context/operations/OperationsContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

const TechnicianHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { history, refreshOperations } = useOperations();
  const [filteredHistory, setFilteredHistory] = useState(history);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    if (!user) return;

    // Atualizar histórico a cada 5 segundos
    const interval = setInterval(() => {
      refreshOperations();
    }, 5000);

    // Inscrever-se para atualizações em tempo real
    const subscription = supabase
      .channel('history_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'operation_history',
          filter: `technician_id=eq.${user.id}`
        },
        () => {
          refreshOperations();
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, [user, refreshOperations]);

  // Filtrar histórico quando houver mudanças
  useEffect(() => {
    let filtered = history;

    // Filtrar por tipo
    if (selectedType !== 'all') {
      filtered = filtered.filter(record => record.type === selectedType);
    }

    // Filtrar por busca
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(record => {
        const operationData = record.data;
        return (
          record.type.toLowerCase().includes(query) ||
          (operationData.Cliente && operationData.Cliente.toLowerCase().includes(query)) ||
          (operationData.cto && operationData.cto.toLowerCase().includes(query)) ||
          (operationData.serial && operationData.serial.toLowerCase().includes(query))
        );
      });
    }

    setFilteredHistory(filtered);
  }, [history, searchQuery, selectedType]);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleBack = () => {
    navigate('/');
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'installation': return 'Instalação';
      case 'cto': return 'Análise de CTO';
      case 'rma': return 'RMA';
      default: return type;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-amber-500" />;
    }
  };

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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Voltar ao Menu
          </Button>
          <div>
            <h1 className="text-3xl font-bold mb-1">Histórico</h1>
            <p className="text-gray-600">Histórico de operações realizadas</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar no histórico..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedType === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedType('all')}
              >
                Todos
              </Button>
              <Button
                variant={selectedType === 'installation' ? 'default' : 'outline'}
                onClick={() => setSelectedType('installation')}
              >
                Instalações
              </Button>
              <Button
                variant={selectedType === 'cto' ? 'default' : 'outline'}
                onClick={() => setSelectedType('cto')}
              >
                CTOs
              </Button>
              <Button
                variant={selectedType === 'rma' ? 'default' : 'outline'}
                onClick={() => setSelectedType('rma')}
              >
                RMAs
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[calc(100vh-16rem)]">
            {filteredHistory.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Nenhum registro encontrado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredHistory.map(record => (
                  <Card key={record.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="mt-1">
                          {getStatusIcon(record.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">
                                {getTypeLabel(record.type)} - {getDisplayName(record)}
                              </h3>
                              <p className="text-sm text-gray-500">
                                Operador: {record.operator || 'Não atribuído'}
                              </p>
                            </div>
                            <Badge variant="outline">
                              {new Date(record.completed_at).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </Badge>
                          </div>
                          {record.feedback && (
                            <div className="mt-2">
                              <p className="text-sm font-medium">Feedback do Operador:</p>
                              <p className="text-sm text-gray-600">{record.feedback}</p>
                            </div>
                          )}
                          {record.technician_response && (
                            <div className="mt-2">
                              <p className="text-sm font-medium">Sua Resposta:</p>
                              <p className="text-sm text-gray-600">{record.technician_response}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TechnicianHistory;
