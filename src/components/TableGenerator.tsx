
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from "sonner";
import { useOperations } from '@/context/OperationContext';
import { Link } from 'react-router-dom';

interface TableGeneratorProps {
  data: Record<string, any>;
  title: string;
  className?: string;
  type: 'installation' | 'cto' | 'rma';
  technician?: string;
}

const TableGenerator: React.FC<TableGeneratorProps> = ({ data, title, className, type, technician = 'Técnico' }) => {
  const textRef = useRef<HTMLDivElement>(null);
  const { operations, addOperation } = useOperations();
  
  const copyToClipboard = () => {
    if (textRef.current) {
      const text = textRef.current.innerText;
      
      // Use document.execCommand as a fallback method
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          toast.success("Tabela copiada para a área de transferência");
        } else {
          toast.error("Não foi possível copiar a tabela");
        }
      } catch (err) {
        toast.error("Não foi possível copiar a tabela");
        console.error("Clipboard error:", err);
      }
      
      document.body.removeChild(textArea);
    }
  };

  const sendToOperator = () => {
    addOperation({
      type,
      data,
      status: 'pendente',
      technician,
    });
    
    toast.success("Informações enviadas para o operador");
  };

  const operationExists = operations.some(op => 
    op.type === type && 
    op.technician === technician && 
    ((type === 'installation' && op.data.Serial === data.Serial) || 
    (type === 'rma' && op.data.serial === data.serial) || 
    (type === 'cto' && op.data.Bairro === data.Bairro && op.data.Rua === data.Rua))
  );

  const matchingOperation = operations.find(op => 
    op.type === type && 
    op.technician === technician && 
    ((type === 'installation' && op.data.Serial === data.Serial) || 
    (type === 'rma' && op.data.serial === data.serial) || 
    (type === 'cto' && op.data.Bairro === data.Bairro && op.data.Rua === data.Rua))
  );

  const status = matchingOperation ? matchingOperation.status : null;
  const feedback = matchingOperation ? matchingOperation.feedback : null;

  const filteredData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => 
      value !== undefined && value !== null && value !== ''
    )
  );

  const getStatusText = () => {
    if (!status) return null;

    switch (status) {
      case 'pendente': 
        return "Pendente de análise pelo operador";
      case 'iniciando_provisionamento':
        return "Provisionamento em andamento";
      case 'provisionamento_finalizado':
        return "Provisionamento finalizado";
      case 'verificando':
        return "CTO em verificação";
      case 'verificacao_finalizada':
        return "Verificação da CTO finalizada";
      case 'em_analise':
        return "RMA em análise";
      case 'finalizado':
        return "RMA finalizado";
      default:
        return null;
    }
  };

  const getStatusClass = () => {
    if (!status) return "";
    
    switch (status) {
      case 'pendente': 
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case 'iniciando_provisionamento':
      case 'verificando':
      case 'em_analise':
        return "bg-blue-50 border-blue-200 text-blue-800";
      case 'provisionamento_finalizado':
      case 'verificacao_finalizada':
      case 'finalizado':
        return "bg-green-50 border-green-200 text-green-800";
      default:
        return "";
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          ref={textRef} 
          className="bg-gray-50 p-4 border border-gray-200 rounded-md whitespace-pre-wrap font-mono text-sm mb-4 overflow-auto max-h-[600px]"
        >
          {Object.entries(filteredData).map(([key, value]) => (
            <div key={key} className="flex mb-1">
              <span className="font-semibold w-32">{key}:</span>
              <span className="ml-2">{value?.toString() || ''}</span>
            </div>
          ))}
        </div>

        {/* Status display */}
        {status && (
          <div className={cn("p-4 rounded-md mb-4 border", getStatusClass())}>
            <div className="font-medium mb-2">Status: {getStatusText()}</div>
            {feedback && (
              <div>
                <div className="font-medium mb-1">Feedback do Operador:</div>
                <div className="p-2 bg-white bg-opacity-50 rounded">{feedback}</div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button onClick={copyToClipboard} className="w-full">
          Copiar Tabela
        </Button>
        {!operationExists ? (
          <Button onClick={sendToOperator} variant="outline" className="w-full">
            Enviar para Operador
          </Button>
        ) : (
          <div className="text-center text-sm text-gray-500 mt-2">
            Já enviado para o operador. Verifique o status acima.
          </div>
        )}
        <Link to="/operador" className="w-full">
          <Button variant="secondary" className="w-full">
            Ir para Painel do Operador
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default TableGenerator;
