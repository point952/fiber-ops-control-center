
import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CTOSplitterTypeSelectorProps {
  value: '1/8' | '1/16' | '';
  onChange: (value: '1/8' | '1/16') => void;
  error?: string;
}

const CTOSplitterTypeSelector: React.FC<CTOSplitterTypeSelectorProps> = ({
  value,
  onChange,
  error
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="tipoSplitter" className={error ? 'text-red-500' : ''}>
        Tipo de Splitter*
      </Label>
      <Select 
        value={value} 
        onValueChange={(value: '1/8' | '1/16') => onChange(value)}
      >
        <SelectTrigger className={error ? 'border-red-500' : ''}>
          <SelectValue placeholder="Selecione o tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1/8">1/8</SelectItem>
          <SelectItem value="1/16">1/16</SelectItem>
        </SelectContent>
      </Select>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
};

export default CTOSplitterTypeSelector;
