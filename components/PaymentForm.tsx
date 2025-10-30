import React, { useState, useEffect } from 'react';
import type { SaaPayment, Supplier } from '../types';
import { FormSection } from './FormSection';
import { Input } from './Input';
import { Button } from './Button';
import { Save, Ban, UserSearch } from 'lucide-react';

type PaymentFormData = Omit<SaaPayment, 'id'>;
type NewSupplierData = Omit<Supplier, 'id'>;

interface PaymentFormProps {
  onSave: (paymentData: PaymentFormData, newSupplierData?: NewSupplierData) => void;
  onCancel: () => void;
  initialData?: SaaPayment;
  suppliers: Supplier[];
}

const initialFormData: PaymentFormData = {
  SAA: '',
  dataVencimento: '',
  tipoDespesa: '',
  tipoComprovante: '',
  numComprovante: '',
  valor: '',
  codigoFornecedor: '',
  nomeFornecedor: '',
  CNPJ_FORNECEDOR: '',
  bancoCodigo: '',
  agencia: '',
  contaCorrente: '',
  pix: '',
  objetivo: '',
  descricaoDespesa: '',
  dataPagamento: '',
  valorPago: '',
  observacoes: '',
  statusPagamento: 'Pendente',
  statusSAA: 'Pendente',
};

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }> = ({ label, name, children, ...props }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">
            {label}
        </label>
        <select
            id={name}
            name={name}
            className="block w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm text-gray-200 transition"
            {...props}
        >
            {children}
        </select>
    </div>
);


export const PaymentForm: React.FC<PaymentFormProps> = ({ onSave, onCancel, initialData, suppliers }) => {
  const [formData, setFormData] = useState<PaymentFormData>(initialData || initialFormData);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const isEditing = !!initialData;

  const toInputDate = (dateString: string) => dateString ? new Date(dateString).toISOString().split('T')[0] : '';

  useEffect(() => {
    const data = initialData ? {
      ...initialData,
      dataVencimento: toInputDate(initialData.dataVencimento),
      dataPagamento: toInputDate(initialData.dataPagamento)
    } : initialFormData;
    setFormData(data);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if(name.startsWith('nomeFornecedor') || name.startsWith('CNPJ')){
        setSelectedSupplierId('');
    }
  };
  
  const handleSupplierSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const supplierId = e.target.value;
    setSelectedSupplierId(supplierId);
    const selectedSupplier = suppliers.find(s => s.id === supplierId);
    if (selectedSupplier) {
      setFormData(prev => ({
        ...prev,
        codigoFornecedor: selectedSupplier.codigoFornecedor,
        nomeFornecedor: selectedSupplier.nomeFornecedor,
        CNPJ_FORNECEDOR: selectedSupplier.CNPJ_FORNECEDOR,
        bancoCodigo: selectedSupplier.bancoCodigo,
        agencia: selectedSupplier.agencia,
        contaCorrente: selectedSupplier.contaCorrente,
        pix: selectedSupplier.pix,
      }));
    } else {
       setFormData(prev => ({
        ...prev,
        codigoFornecedor: '',
        nomeFornecedor: '',
        CNPJ_FORNECEDOR: '',
        bancoCodigo: '',
        agencia: '',
        contaCorrente: '',
        pix: '',
      }));
    }
  };


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let newSupplierData: NewSupplierData | undefined = undefined;
    const supplierExists = suppliers.some(s => s.CNPJ_FORNECEDOR === formData.CNPJ_FORNECEDOR && formData.CNPJ_FORNECEDOR);
    if (!selectedSupplierId && !supplierExists && formData.CNPJ_FORNECEDOR) {
        newSupplierData = {
            codigoFornecedor: formData.codigoFornecedor,
            nomeFornecedor: formData.nomeFornecedor,
            CNPJ_FORNECEDOR: formData.CNPJ_FORNECEDOR,
            bancoCodigo: formData.bancoCodigo,
            agencia: formData.agencia,
            contaCorrente: formData.contaCorrente,
            pix: formData.pix,
        };
    }
    onSave(formData, newSupplierData);
  };
  
  const handlePrefill = () => {
    setFormData({
      SAA: '2024-00273',
      dataVencimento: '2025-10-05',
      tipoDespesa: 'Aluguel e Contas de Consumo',
      tipoComprovante: 'Boleto',
      numComprovante: '123456789',
      valor: '441.16',
      codigoFornecedor: 'FORN-01',
      nomeFornecedor: 'ASCON Assessoria de Condomínios',
      CNPJ_FORNECEDOR: '18.191.228/0001-71',
      bancoCodigo: '001 - Banco do Brasil',
      agencia: '0123-4',
      contaCorrente: '98765-4',
      pix: 'pix@ascon.com',
      objetivo: 'Pagamento de condomínio',
      descricaoDespesa: 'Referente ao aluguel do escritório da Rede Cerrado',
      dataPagamento: '2025-10-04',
      valorPago: '441.16',
      observacoes: 'Pagamento efetuado via PIX',
      statusPagamento: 'Pago',
      statusSAA: 'Aprovado',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-bold text-teal-400">{isEditing ? 'Editar Pagamento' : 'Adicionar Novo Pagamento'}</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
        <FormSection title="Informações Gerais">
            <Input label="Nº do SAA" name="SAA" value={formData.SAA} onChange={handleChange} />
            <Input label="Objetivo" name="objetivo" value={formData.objetivo} onChange={handleChange} />
            <Input label="Elemento de Despesa" name="tipoDespesa" value={formData.tipoDespesa} onChange={handleChange} />
             <div>
                <label htmlFor="descricaoDespesa" className="block text-sm font-medium text-gray-300 mb-1">
                    Descrição da Despesa
                </label>
                <textarea
                    id="descricaoDespesa"
                    name="descricaoDespesa"
                    value={formData.descricaoDespesa}
                    onChange={handleChange}
                    rows={3}
                    className="block w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm text-gray-200 transition"
                />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Tipo de Comprovante" name="tipoComprovante" value={formData.tipoComprovante} onChange={handleChange} />
                <Input label="Nº do Comprovante" name="numComprovante" value={formData.numComprovante} onChange={handleChange} />
            </div>
        </FormSection>
        
        <FormSection title="Valores e Datas">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Data de Vencimento" name="dataVencimento" type="date" value={formData.dataVencimento} onChange={handleChange} />
                <Input label="Valor a Pagar (R$)" name="valor" type="number" step="0.01" value={formData.valor} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Data do Pagamento" name="dataPagamento" type="date" value={formData.dataPagamento} onChange={handleChange} />
                <Input label="Valor Pago (R$)" name="valorPago" type="number" step="0.01" value={formData.valorPago} onChange={handleChange} />
            </div>
             <div>
                <label htmlFor="observacoes" className="block text-sm font-medium text-gray-300 mb-1">
                    Observações
                </label>
                <textarea
                    id="observacoes"
                    name="observacoes"
                    value={formData.observacoes}
                    onChange={handleChange}
                    rows={3}
                    className="block w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm text-gray-200 transition"
                />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select label="Status do Pagamento" name="statusPagamento" value={formData.statusPagamento} onChange={handleChange}>
                    <option>Pendente</option>
                    <option>Pago</option>
                    <option>Atrasado</option>
                    <option>Cancelado</option>
                </Select>
                 <Select label="Status do SAA" name="statusSAA" value={formData.statusSAA} onChange={handleChange}>
                    <option>Pendente</option>
                    <option>Aprovado</option>
                    <option>Rejeitado</option>
                </Select>
            </div>
        </FormSection>
      </div>

      <FormSection title="Dados do Fornecedor">
        <div>
          <label htmlFor="supplier-select" className="block text-sm font-medium text-gray-300 mb-1">
            <UserSearch className="inline h-4 w-4 mr-1" />
            Selecionar Fornecedor Cadastrado
          </label>
          <select
            id="supplier-select"
            value={selectedSupplierId}
            onChange={handleSupplierSelect}
            className="block w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm text-gray-200 transition"
          >
            <option value="">-- Digitar novo ou selecionar --</option>
            {suppliers.map(supplier => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.nomeFornecedor} ({supplier.CNPJ_FORNECEDOR})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Código do Fornecedor" name="codigoFornecedor" value={formData.codigoFornecedor} onChange={handleChange} />
            <Input label="Nome do Fornecedor" name="nomeFornecedor" value={formData.nomeFornecedor} onChange={handleChange} className="sm:col-span-2" />
        </div>
        <Input label="CNPJ/CPF do Fornecedor" name="CNPJ_FORNECEDOR" value={formData.CNPJ_FORNECEDOR} onChange={handleChange} />
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
          {isEditing ? 'Salvar Alterações' : 'Adicionar Pagamento'}
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
  );
};