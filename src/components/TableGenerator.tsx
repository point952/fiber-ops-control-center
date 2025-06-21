import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext';
import { useOperations } from '@/context/operations/OperationsContext';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';

interface TableGeneratorProps {
  formData: Record<string, string>;
  type: 'installation' | 'cto' | 'rma';
  onTableGenerated?: (tableHTML: string, fields: Record<string, string>) => void;
  onBack?: () => void;
}

const TableGenerator: React.FC<TableGeneratorProps> = ({ 
  formData, 
  type, 
  onTableGenerated,
  onBack
}) => {
  const { user } = useAuth();
  const { addOperation } = useOperations();
  const [tableGenerated, setTableGenerated] = useState(false);
  const [generatedTable, setGeneratedTable] = useState('');
  const [submittedData, setSubmittedData] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Gerar tabela automaticamente quando o componente montar
  useEffect(() => {
    generateTable();
  }, []);

  const generateTable = () => {
    // Adiciona automaticamente o nome do técnico logado
    const dataWithTechnician = {
      ...formData,
      Técnico: user?.name || 'Técnico não identificado'
    };
    
    let tableHTML = '<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">';
    
    // Cabeçalho baseado no tipo de operação
    let header = '';
    if (type === 'installation') {
      header = '<tr style="background-color: #f2f2f2;"><th colspan="2">Dados da Instalação/Upgrade</th></tr>';
    } else if (type === 'cto') {
      header = '<tr style="background-color: #f2f2f2;"><th colspan="2">Análise de CTO</th></tr>';
    } else {
      header = '<tr style="background-color: #f2f2f2;"><th colspan="2">Solicitação de RMA</th></tr>';
    }
    
    tableHTML += header;
    
    // Adiciona as linhas da tabela
    for (const [key, value] of Object.entries(dataWithTechnician)) {
      if (value && value.trim() !== '') {
        tableHTML += `<tr><td style="font-weight: bold;">${key}</td><td>${value}</td></tr>`;
      }
    }
    
    // Adiciona data e hora atual
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR');
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    tableHTML += `<tr><td style="font-weight: bold;">Data</td><td>${dateStr} ${timeStr}</td></tr>`;
    
    tableHTML += '</table>';
    
    setGeneratedTable(tableHTML);
    setSubmittedData(dataWithTechnician);
    setTableGenerated(true);
    
    if (onTableGenerated) {
      onTableGenerated(tableHTML, dataWithTechnician);
    }
  };

  const copyToClipboard = () => {
    // Tentativa de copiar HTML
    try {
      navigator.clipboard.writeText(generatedTable).then(() => {
        toast.success("Tabela HTML copiada para área de transferência!");
      }).catch(err => {
        console.error('Erro ao copiar: ', err);
        toast.error("Erro ao copiar a tabela. Tente manualmente selecionando o conteúdo.");
      });
    } catch (err) {
      console.error('Erro ao copiar: ', err);
      toast.error("Erro ao copiar a tabela. Tente manualmente selecionando o conteúdo.");
    }
  };

  const submitAnalysis = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para enviar análises");
      return;
    }
    
    setSubmitting(true);
    
    try {
      await addOperation({
        type,
        data: formData,
        status: 'pending',
        technician: user.name,
        technician_id: user.id
      });
      
      toast.success("Análise enviada com sucesso!");
      setShowSuccess(true);
    } catch (error) {
      console.error("Erro ao enviar análise:", error);
      toast.error("Erro ao enviar análise. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-8 max-w-4xl mx-auto">
      <div className="flex justify-between mb-4">
        <Button 
          type="button"
          variant="outline"
          onClick={onBack}
        >
          Voltar
        </Button>
      </div>

      {tableGenerated && (
        <div>
          <div className="p-4 border rounded-lg bg-gray-50 mb-4">
            <p className="text-sm text-gray-600 mb-2">Tabela gerada com sucesso:</p>
            <div 
              className="border p-4 bg-white rounded"
              dangerouslySetInnerHTML={{ __html: generatedTable }} 
            />
          </div>
          
          <div className="flex justify-between mt-4">
            <Button
              type="button"
              variant="default"
              onClick={copyToClipboard}
            >
              Copiar HTML
            </Button>
            
            <Button
              type="button"
              variant="default"
              onClick={submitAnalysis}
            >
              Enviar para Operador
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableGenerator;
