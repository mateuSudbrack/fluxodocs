import React, { useState, useEffect } from 'react';
import type { Supplier } from '../types';
import { FormSection } from './FormSection';
import { Input } from './Input';
import { Button } from './Button';
import { Save, Ban } from 'lucide-react';

type SupplierFormData = Omit<Supplier, 'id'>;

interface SupplierFormProps {
  onSave: (data: SupplierFormData) => void;
  onCancel: () => void;
  initialData?: Supplier;
}

const initialFormData: SupplierFormData = {
  codigoFornecedor: '',
  nomeFornecedor: '',
  CNPJ_FORNECEDOR: '',
  bancoCodigo: '',
  agencia: '',
  contaCorrente: '',
  pix: '',
};

export const SupplierForm: React.FC<SupplierFormProps> = ({ onSave, onCancel, initialData }) => {
  const [formData, setFormData] = useState<SupplierFormData>(initialData || initialFormData);
  const isEditing = !!initialData;

  useEffect(() => {
    setFormData(initialData || initialFormData);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-bold text-teal-400">{isEditing ? 'Editar Fornecedor' : 'Adicionar Novo Fornecedor'}</h2>
      
      <FormSection title="Dados do Fornecedor">
        <Input label="Código do Fornecedor" name="codigoFornecedor" value={formData.codigoFornecedor} onChange={handleChange} />
        <Input label="Nome do Fornecedor" name="nomeFornecedor" value={formData.nomeFornecedor} onChange={handleChange} />
        <Input label="CNPJ/CPF do Fornecedor" name="CNPJ_FORNECEDOR" value={formData.CNPJ_FORNECEDOR} onChange={handleChange} />
      </FormSection>

      <FormSection title="Dados Bancários">
        <Input label="Banco / Código" name="bancoCodigo" value={formData.bancoCodigo} onChange={handleChange} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Agência" name="agencia" value={formData.agencia} onChange={handleChange} />
          <Input label="Conta Corrente" name="contaCorrente" value={formData.contaCorrente} onChange={handleChange} />
        </div>
        <Input label="PIX" name="pix" value={formData.pix} onChange={handleChange} />
      </FormSection>
      
      <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-700">
        <Button type="submit" className="w-full sm:w-auto flex-grow">
          <Save className="mr-2 h-4 w-4" />
          {isEditing ? 'Salvar Alterações' : 'Adicionar Fornecedor'}
        </Button>
        <Button type="button" onClick={onCancel} variant="secondary" className="w-full sm:w-auto">
          <Ban className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
      </div>
    </form>
  );
};