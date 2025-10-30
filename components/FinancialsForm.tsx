import React, { useState, useEffect } from 'react';
import type { FinancialData, MonthlyControl } from '../types';
import { FormSection } from './FormSection';
import { Input } from './Input';
import { Button } from './Button';
import { Save, Ban, Info } from 'lucide-react';

interface FinancialsFormProps {
    onSave: (data: FinancialData) => void;
    onCancel: () => void;
    control: MonthlyControl;
}

const initialFormData: FinancialData = {
    periodoDe: '',
    periodoAte: '',
    totalAprovado: '',
    parcelaRecebida: '',
    saldoParcelaAnterior: '',
    rendimentosAplicacao: '',
    doacao: '',
    emprestimos: '',
    devolucaoCredito: '',
    doacaoRede: '',
    resgates: '',
    taxasBancarias: '',
    estornos: '',
    aplicacaoFinanceira: '',
    pagamentoIndevido: '',
    saldoBancario: '',
    saldoAplicacao: '',
    dataExtrato: '',
};

const N = (value: string | number): number => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
}

export const FinancialsForm: React.FC<FinancialsFormProps> = ({ onSave, onCancel, control }) => {
    const [formData, setFormData] = useState<FinancialData>(control.financials || initialFormData);

    useEffect(() => {
        let updatedFinancials = { ...(control.financials || initialFormData) };

        // Auto-fill date range from payments if the fields are empty
        if (!updatedFinancials.periodoDe || !updatedFinancials.periodoAte) {
            const paymentDates = control.payments
                .map(p => p.dataVencimento ? new Date(p.dataVencimento).getTime() : 0)
                .filter(t => t > 0);

            if (paymentDates.length > 0) {
                if (!updatedFinancials.periodoDe) {
                    const minDate = new Date(Math.min(...paymentDates));
                    updatedFinancials.periodoDe = minDate.toISOString().split('T')[0];
                }
                if (!updatedFinancials.periodoAte) {
                    const maxDate = new Date(Math.max(...paymentDates));
                    updatedFinancials.periodoAte = maxDate.toISOString().split('T')[0];
                }
            }
        }
        
        // Auto-calculate special expenses from payments
        const calculateTotalFor = (expenseType: string) => {
            return control.payments
                .filter(p => p.tipoDespesa === expenseType)
                .reduce((acc, p) => acc + N(p.valor), 0)
                .toString();
        }

        updatedFinancials.taxasBancarias = calculateTotalFor('Taxas Bancarias');
        updatedFinancials.estornos = calculateTotalFor('Estornos');
        updatedFinancials.aplicacaoFinanceira = calculateTotalFor('Aplicação Financeira');
        updatedFinancials.pagamentoIndevido = calculateTotalFor('Pagamento indevido');
        
        setFormData(updatedFinancials);

    }, [control]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'number' ? (value === '' ? '' : String(Number(value))) : value 
        }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSave(formData);
    };

    const inputProps = (name: keyof FinancialData) => ({
        name,
        id: name,
        value: formData[name],
        onChange: handleChange,
    });

    const numberInputProps = (name: keyof FinancialData, readOnly = false) => ({
        ...inputProps(name),
        type: 'number',
        step: '0.01',
        readOnly,
        className: readOnly ? "block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm sm:text-sm text-gray-400 transition cursor-not-allowed" : undefined
    });

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl font-bold text-teal-400">Prestação de Contas: <span className="text-gray-300">{control.name}</span></h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <FormSection title="Período e Resumo">
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Período De" {...inputProps('periodoDe')} type="date" />
                        <Input label="Período Até" {...inputProps('periodoAte')} type="date" />
                    </div>
                    <Input label="Total Aprovado (R$)" {...numberInputProps('totalAprovado')} />
                    <Input label="Parcela Recebida (R$)" {...numberInputProps('parcelaRecebida')} />
                    <Input label="Saldo da Parcela Anterior (R$)" {...numberInputProps('saldoParcelaAnterior')} />
                </FormSection>

                <FormSection title="1. Receitas">
                    <Input label="Rendimentos de Aplicação (R$)" {...numberInputProps('rendimentosAplicacao')} />
                    <Input label="Doação (R$)" {...numberInputProps('doacao')} />
                    <Input label="Empréstimos entre contas (R$)" {...numberInputProps('emprestimos')} />
                    <Input label="Devolução de Crédito (R$)" {...numberInputProps('devolucaoCredito')} />
                    <Input label="Doação Rede Cerrado (R$)" {...numberInputProps('doacaoRede')} />
                    <Input label="Resgates (R$)" {...numberInputProps('resgates')} />
                </FormSection>

                <FormSection title="2. Outras Despesas (Automático)">
                     <div className="p-2 text-xs bg-blue-900/30 border-l-4 border-blue-500 text-blue-200 flex gap-2 rounded-r-md">
                        <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span>Estes valores são calculados automaticamente a partir dos pagamentos cadastrados.</span>
                    </div>
                    <Input label="Taxas Bancárias (R$)" {...numberInputProps('taxasBancarias', true)} />
                    <Input label="Estornos (R$)" {...numberInputProps('estornos', true)} />
                    <Input label="Aplicação Financeira (R$)" {...numberInputProps('aplicacaoFinanceira', true)} />
                    <Input label="Pagamento Indevido (R$)" {...numberInputProps('pagamentoIndevido', true)} />
                </FormSection>

                <FormSection title="Saldos Finais">
                     <Input label="Data do Extrato" {...inputProps('dataExtrato')} type="date" />
                     <Input label="Saldo Bancário (Extrato) (R$)" {...numberInputProps('saldoBancario')} />
                     <Input label="Saldo de Aplicação (Extrato) (R$)" {...numberInputProps('saldoAplicacao')} />
                </FormSection>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-700">
                <Button type="submit" className="w-full sm:w-auto flex-grow">
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Dados Financeiros
                </Button>
                <Button type="button" onClick={onCancel} variant="secondary" className="w-full sm:w-auto">
                    <Ban className="mr-2 h-4 w-4" />
                    Cancelar
                </Button>
            </div>
        </form>
    );
};
