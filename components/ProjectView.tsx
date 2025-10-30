import React, { useState, useCallback } from 'react';
import type { SaaProject, SaaPayment, Supplier, MonthlyControl, Template, FinancialData } from '../types';
import { Button } from './Button';
import { GeneratedDocument } from './GeneratedDocument';
import { SaaGenerationModal } from './SaaGenerationModal';
import { generateSaaDocument } from '../services/geminiService';
import { generateDocx } from '../services/documentService';
import { generateXlsxWorkbook, generateSingleControlCsv, downloadBlob } from '../services/spreadsheetService';
import { Edit, FileText, PlusCircle, Trash2, ChevronDown, CalendarPlus, Download, Save, Ban, PieChart } from 'lucide-react';
import { PaymentForm } from './PaymentForm';
import { FinancialsForm } from './FinancialsForm';
import { Input } from './Input';

interface ProjectViewProps {
  project: SaaProject;
  suppliers: Supplier[];
  templates: Template[];
  onEditProject: () => void;
  onAddMonthlyControl: (projectId: string, name: string) => void;
  onDeleteMonthlyControl: (projectId: string, controlId: string) => void;
  onSavePayment: (projectId: string, controlId: string, payment: SaaPayment, newSupplierData?: Omit<Supplier, 'id'>) => void;
  onDeletePayment: (projectId: string, controlId: string, paymentId: string) => void;
  onSaveFinancials: (projectId: string, controlId: string, data: FinancialData) => void;
}

const DetailItem: React.FC<{ label: string; value?: string | number }> = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-400">{label}</p>
    <p className="text-gray-200 truncate">{value || '-'}</p>
  </div>
);

const MonthlyControlView: React.FC<{
    control: MonthlyControl;
    project: SaaProject;
    onDelete: () => void;
    onAddPayment: () => void;
    onEditPayment: (payment: SaaPayment) => void;
    onDeletePayment: (paymentId: string) => void;
    onGenerateSaa: (payment: SaaPayment) => void;
    onGenerateCsv: () => void;
    onOpenFinancials: () => void;
}> = ({ control, project, onDelete, onAddPayment, onEditPayment, onDeletePayment, onGenerateSaa, onGenerateCsv, onOpenFinancials }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="bg-gray-900/50 rounded-lg overflow-hidden border border-gray-700">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4 bg-gray-700/50 hover:bg-gray-700/80 transition-colors">
                <h4 className="font-semibold text-teal-300">{control.name}</h4>
                <div className="flex items-center space-x-3">
                    <Button onClick={(e) => { e.stopPropagation(); onOpenFinancials(); }} variant="secondary" className="p-2" title={`Prestação de Contas (${control.name})`}>
                        <PieChart className="h-4 w-4" />
                    </Button>
                    <Button onClick={(e) => { e.stopPropagation(); onGenerateCsv(); }} variant="secondary" className="p-2" title={`Gerar Planilha CSV (${control.name})`}>
                        <Download className="h-4 w-4" />
                    </Button>
                    <Button onClick={(e) => { e.stopPropagation(); onDelete(); }} variant="secondary" className="p-2 hover:bg-red-500/20 hover:text-red-400" title="Excluir Controle Mensal">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>
            {isOpen && (
                <div className="p-4 space-y-4">
                    <div className="flex justify-end">
                       <Button onClick={onAddPayment}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Adicionar Pagamento
                        </Button>
                    </div>
                    <div className="overflow-x-auto border border-gray-700 rounded-lg">
                        <table className="w-full min-w-[1600px] text-sm text-left text-gray-300">
                            <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                                <tr>
                                    <th scope="col" className="px-4 py-3 sticky left-0 bg-gray-700/80 z-10 w-48">Fornecedor</th>
                                    <th scope="col" className="px-4 py-3">Nº SAA</th>
                                    <th scope="col" className="px-4 py-3">Vencimento</th>
                                    <th scope="col" className="px-4 py-3">Valor a Pagar</th>
                                    <th scope="col" className="px-4 py-3">Data Pagto.</th>
                                    <th scope="col" className="px-4 py-3">Valor Pago</th>
                                    <th scope="col" className="px-4 py-3">Status Pagto.</th>
                                    <th scope="col" className="px-4 py-3">Status SAA</th>
                                    <th scope="col" className="px-4 py-3">Objetivo</th>
                                    <th scope="col" className="px-4 py-3">Elemento Desp.</th>
                                    <th scope="col" className="px-4 py-3 text-right sticky right-0 bg-gray-700/80 z-10">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {control.payments.length === 0 ? (
                                    <tr>
                                        <td colSpan={11} className="text-center py-8 text-gray-500">Nenhum pagamento para este período.</td>
                                    </tr>
                                ) : (
                                    control.payments.map(payment => (
                                        <tr key={payment.id} className="border-b border-gray-700 hover:bg-gray-700/40">
                                            <td className="px-4 py-3 font-medium truncate max-w-xs sticky left-0 bg-gray-800/80 group-hover:bg-gray-700/40 z-10 w-48">{payment.nomeFornecedor}</td>
                                            <td className="px-4 py-3">{payment.SAA}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">{payment.dataVencimento ? new Date(payment.dataVencimento).toLocaleDateString('pt-BR', {timeZone:'UTC'}) : '-'}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">{payment.valor ? Number(payment.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">{payment.dataPagamento ? new Date(payment.dataPagamento).toLocaleDateString('pt-BR', {timeZone:'UTC'}) : '-'}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">{payment.valorPago ? Number(payment.valorPago).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}</td>
                                            <td className="px-4 py-3">{payment.statusPagamento}</td>
                                            <td className="px-4 py-3">{payment.statusSAA}</td>
                                            <td className="px-4 py-3 truncate max-w-xs">{payment.objetivo}</td>
                                            <td className="px-4 py-3 truncate max-w-xs">{payment.tipoDespesa}</td>
                                            <td className="px-4 py-3 text-right space-x-2 sticky right-0 bg-gray-800/80 group-hover:bg-gray-700/40 z-10">
                                                <Button onClick={() => onGenerateSaa(payment)} variant="secondary" className="p-2" title="Gerar Documento SAA">
                                                    <FileText className="h-4 w-4" />
                                                </Button>
                                                <Button onClick={() => onEditPayment(payment)} variant="secondary" className="p-2" title="Editar Pagamento">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button onClick={() => onDeletePayment(payment.id)} variant="secondary" className="p-2 hover:bg-red-500/20 hover:text-red-400" title="Excluir Pagamento">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export const ProjectView: React.FC<ProjectViewProps> = ({ project, suppliers, templates, onEditProject, onAddMonthlyControl, onDeleteMonthlyControl, onSavePayment, onDeletePayment, onSaveFinancials }) => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<SaaPayment | null>(null);
  const [activeControl, setActiveControl] = useState<MonthlyControl | null>(null);

  const [isFinancialsModalOpen, setIsFinancialsModalOpen] = useState(false);

  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  
  const [isSaaGenerationModalOpen, setIsSaaGenerationModalOpen] = useState(false);
  const [selectedPaymentForGen, setSelectedPaymentForGen] = useState<SaaPayment | null>(null);

  const [isAddingControl, setIsAddingControl] = useState(false);
  const [newControlName, setNewControlName] = useState('');

  const handleOpenSaaGenerationModal = (payment: SaaPayment) => {
    setSelectedPaymentForGen(payment);
    setIsSaaGenerationModalOpen(true);
  };
  
  const handleGenerateWithAi = useCallback(async (payment: SaaPayment) => {
    setIsSaaGenerationModalOpen(false); // Close selection modal
    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedContent('');
    setIsDocumentModalOpen(true); // Open display modal
    try {
      const content = await generateSaaDocument(project, payment);
      setGeneratedContent(content);
    } catch (err) {
      setGenerationError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsGenerating(false);
    }
  }, [project]);

  const handleGenerateWithTemplate = async (payment: SaaPayment, template: Template) => {
    try {
      const blob = await generateDocx(template.file, project, payment);
      const filename = `${payment.SAA || 'SAA'}_${payment.nomeFornecedor.replace(/\s/g, '_')}.docx`;
      downloadBlob(blob, filename);
    } catch (error) {
      console.error("Error generating DOCX:", error);
      alert(`Falha ao gerar documento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
    setIsSaaGenerationModalOpen(false);
  };
  
  const handleSaveNewControl = () => {
    if (newControlName.trim()) {
        onAddMonthlyControl(project.id, newControlName.trim());
        setNewControlName('');
        setIsAddingControl(false);
    }
  };

  const handleCancelAddControl = () => {
      setNewControlName('');
      setIsAddingControl(false);
  };

  const handleGenerateFullWorkbook = () => {
    if(project.monthlyControls.length === 0) {
        alert("Não há controles mensais para exportar.");
        return;
    }
    const blob = generateXlsxWorkbook(project);
    downloadBlob(blob, `${project.tituloProjeto.replace(/\s/g, '_')}_completo.xlsx`);
  };

  const handleGenerateMonthlyCsv = (control: MonthlyControl) => {
     if(control.payments.length === 0) {
        alert("Não há pagamentos neste mês para exportar.");
        return;
    }
    const csvString = generateSingleControlCsv(control.payments);
    const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `${project.tituloProjeto.replace(/\s/g, '_')}_${control.name.replace(/\s/g, '_')}.csv`);
  };

  const handleOpenNewPaymentModal = (control: MonthlyControl) => {
    setActiveControl(control);
    setEditingPayment(null);
    setIsPaymentModalOpen(true);
  };
  
  const handleOpenEditPaymentModal = (control: MonthlyControl, payment: SaaPayment) => {
    setActiveControl(control);
    setEditingPayment(payment);
    setIsPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setEditingPayment(null);
    setActiveControl(null);
  };

  const handleSavePayment = (paymentData: Omit<SaaPayment, 'id'>, newSupplierData?: Omit<Supplier, 'id'>) => {
    if (!activeControl) return;
    const payment: SaaPayment = {
        id: editingPayment?.id || crypto.randomUUID(),
        ...paymentData,
    };
    onSavePayment(project.id, activeControl.id, payment, newSupplierData);
    handleClosePaymentModal();
  };
  
  const handleOpenFinancialsModal = (control: MonthlyControl) => {
    setActiveControl(control);
    setIsFinancialsModalOpen(true);
  };

  const handleCloseFinancialsModal = () => {
    setActiveControl(null);
    setIsFinancialsModalOpen(false);
  };
  
  const handleSaveFinancials = (data: FinancialData) => {
    if (!activeControl) return;
    onSaveFinancials(project.id, activeControl.id, data);
    handleCloseFinancialsModal();
  };

  return (
    <>
      <div className="space-y-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
          <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-3">
              <h2 className="text-xl font-bold text-teal-400 truncate" title={project.tituloProjeto}>
                  {project.tituloProjeto}
              </h2>
              <Button onClick={onEditProject} variant="secondary" className="flex-shrink-0">
                  <Edit className="mr-2 h-4 w-4"/>
                  Editar Projeto
              </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <DetailItem label="Organização" value={project.organizacao} />
              <DetailItem label="Responsável" value={project.responsavelFinanceiro} />
              <DetailItem label="Banco" value={`${project.bancoPROJ} | Ag: ${project.agenciaPROJ} | CC: ${project.contaCorrentePROJ}`} />
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-xl space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-teal-400">Controles de Pagamento</h3>
                {!isAddingControl && (
                    <div className="flex items-center space-x-2">
                        <Button onClick={handleGenerateFullWorkbook} variant="secondary">
                            <Download className="mr-2 h-4 w-4" />
                            Gerar Planilha Completa
                        </Button>
                        <Button onClick={() => setIsAddingControl(true)}>
                            <CalendarPlus className="mr-2 h-4 w-4" />
                            Adicionar Controle
                        </Button>
                    </div>
                )}
            </div>

            {isAddingControl && (
                <div className="bg-gray-700/50 p-4 rounded-lg flex items-end gap-4 transition-all duration-300">
                    <div className="flex-grow">
                        <Input
                            label="Nome do Novo Controle"
                            value={newControlName}
                            onChange={(e) => setNewControlName(e.target.value)}
                            placeholder="Ex: Julho/2024"
                            autoFocus
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSaveNewControl() }}
                        />
                    </div>
                    <Button onClick={handleSaveNewControl} className="h-10">
                        <Save className="mr-2 h-4 w-4" />
                        Salvar
                    </Button>
                    <Button onClick={handleCancelAddControl} variant="secondary" className="h-10">
                        <Ban className="mr-2 h-4 w-4" />
                        Cancelar
                    </Button>
                </div>
            )}
            
            {project.monthlyControls.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Nenhum controle mensal adicionado.</p>
            ) : (
                <div className="space-y-4">
                    {project.monthlyControls.map(control => (
                        <MonthlyControlView 
                            key={control.id}
                            control={control}
                            project={project}
                            onDelete={() => onDeleteMonthlyControl(project.id, control.id)}
                            onAddPayment={() => handleOpenNewPaymentModal(control)}
                            onEditPayment={(payment) => handleOpenEditPaymentModal(control, payment)}
                            onDeletePayment={(paymentId) => onDeletePayment(project.id, control.id, paymentId)}
                            onGenerateSaa={handleOpenSaaGenerationModal}
                            onGenerateCsv={() => handleGenerateMonthlyCsv(control)}
                            onOpenFinancials={() => handleOpenFinancialsModal(control)}
                        />
                    ))}
                </div>
            )}
        </div>
      </div>
      
      {isPaymentModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <PaymentForm 
                    onSave={handleSavePayment}
                    onCancel={handleClosePaymentModal}
                    initialData={editingPayment ?? undefined}
                    suppliers={suppliers}
                  />
                </div>
              </div>
          </div>
      )}

      {isFinancialsModalOpen && activeControl && (
           <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <FinancialsForm 
                        onSave={handleSaveFinancials}
                        onCancel={handleCloseFinancialsModal}
                        control={activeControl}
                    />
                </div>
              </div>
          </div>
      )}

      {selectedPaymentForGen && (
        <SaaGenerationModal
            isOpen={isSaaGenerationModalOpen}
            onClose={() => setIsSaaGenerationModalOpen(false)}
            payment={selectedPaymentForGen}
            templates={templates}
            onGenerateWithTemplate={(template) => handleGenerateWithTemplate(selectedPaymentForGen, template)}
            onGenerateWithAi={() => handleGenerateWithAi(selectedPaymentForGen)}
        />
      )}

      {isDocumentModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsDocumentModalOpen(false)}>
              <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <GeneratedDocument
                    content={generatedContent}
                    isLoading={isGenerating}
                    error={generationError}
                />
              </div>
          </div>
      )}
    </>
  );
};