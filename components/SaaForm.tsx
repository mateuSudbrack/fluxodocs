import React, { useState, useEffect } from 'react';
import type { SaaProject } from '../types';
import { FormSection } from './FormSection';
import { Input } from './Input';
import { Button } from './Button';
import { Save, Ban } from 'lucide-react';

type ProjectFormData = Omit<SaaProject, 'id' | 'monthlyControls'>;

interface SaaFormProps {
  onSave: (data: ProjectFormData) => void;
  onCancel: () => void;
  initialData?: SaaProject;
}

const initialFormData: ProjectFormData = {
  tituloProjeto: '',
  organizacao: '',
  responsavelFinanceiro: '',
  bancoPROJ: '',
  agenciaPROJ: '',
  contaCorrentePROJ: '',
};

export const SaaForm: React.FC<SaaFormProps> = ({ onSave, onCancel, initialData }) => {
  const [formData, setFormData] = useState<ProjectFormData>(initialData || initialFormData);
  const isEditing = !!initialData;

  useEffect(() => {
    if (initialData) {
        setFormData({
            tituloProjeto: initialData.tituloProjeto,
            organizacao: initialData.organizacao,
            responsavelFinanceiro: initialData.responsavelFinanceiro,
            bancoPROJ: initialData.bancoPROJ,
            agenciaPROJ: initialData.agenciaPROJ,
            contaCorrentePROJ: initialData.contaCorrentePROJ,
        });
    } else {
        setFormData(initialFormData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(formData);
  };
  
  const handlePrefill = () => {
    setFormData({
      tituloProjeto: 'Projeto CEPF 115.933 - Cerrado Guardians',
      organizacao: 'Rede Cerrado',
      responsavelFinanceiro: 'Rose Mary Paes de Araujo',
      bancoPROJ: 'BB/001',
      agenciaPROJ: '3475-4',
      contaCorrentePROJ: '27066-0',
    });
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-xl font-bold text-teal-400 -mt-1">{isEditing ? 'Editar Projeto' : 'Adicionar Novo Projeto'}</h2>
        
        <FormSection title="Detalhes do Projeto">
          <Input label="Título do Projeto" name="tituloProjeto" value={formData.tituloProjeto} onChange={handleChange} />
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Organização" name="organizacao" value={formData.organizacao} onChange={handleChange} />
            <Input label="Responsável Financeiro" name="responsavelFinanceiro" value={formData.responsavelFinanceiro} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Banco" name="bancoPROJ" value={formData.bancoPROJ} onChange={handleChange} />
            <Input label="Agência" name="agenciaPROJ" value={formData.agenciaPROJ} onChange={handleChange} />
            <Input label="Conta Corrente" name="contaCorrentePROJ" value={formData.contaCorrentePROJ} onChange={handleChange} />
          </div>
        </FormSection>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button type="submit" className="w-full sm:w-auto flex-grow">
            <Save className="mr-2 h-4 w-4" />
            {isEditing ? 'Salvar Alterações' : 'Adicionar Projeto'}
          </Button>
          <Button type="button" onClick={onCancel} variant="secondary" className="w-full sm:w-auto">
            <Ban className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          {!isEditing && (
              <Button type="button" onClick={handlePrefill} variant="secondary" className="w-full sm:w-auto">
                  Preencher Exemplo
              </Button>
          )}
        </div>
      </form>
    </div>
  );
};