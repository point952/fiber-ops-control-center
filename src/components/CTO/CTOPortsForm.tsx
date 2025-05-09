
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface CTOPortsFormProps {
  portCount: number;
  ports: string[];
  onChange: (index: number, value: string) => void;
}

const CTOPortsForm: React.FC<CTOPortsFormProps> = ({
  portCount,
  ports,
  onChange
}) => {
  return (
    <div className="mt-6">
      <h3 className="font-medium mb-3">Serviços por Porta</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[...Array(portCount)].map((_, index) => (
          <div key={index} className="space-y-1">
            <Label htmlFor={`porta-${index + 1}`}>
              Porta {index + 1}
            </Label>
            <Input
              id={`porta-${index + 1}`}
              value={ports[index]}
              onChange={(e) => onChange(index, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CTOPortsForm;
