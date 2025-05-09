
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from "sonner";

interface TableGeneratorProps {
  data: Record<string, any>;
  title: string;
  className?: string;
}

const TableGenerator: React.FC<TableGeneratorProps> = ({ data, title, className }) => {
  const textRef = useRef<HTMLDivElement>(null);

  const copyToClipboard = () => {
    if (textRef.current) {
      const text = textRef.current.innerText;
      navigator.clipboard.writeText(text).then(
        () => {
          toast.success("Tabela copiada para a área de transferência");
        },
        () => {
          toast.error("Não foi possível copiar a tabela");
        }
      );
    }
  };

  // Filtrar propriedades com valor undefined, null ou string vazia
  const filteredData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => 
      value !== undefined && value !== null && value !== ''
    )
  );

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
        <Button onClick={copyToClipboard} className="w-full">
          Copiar Tabela
        </Button>
      </CardContent>
    </Card>
  );
};

export default TableGenerator;
