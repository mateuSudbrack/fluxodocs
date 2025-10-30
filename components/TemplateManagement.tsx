import React, { useRef, useState } from 'react';
import type { Template } from '../types';
import { Button } from './Button';
import { UploadCloud, Trash2, FileText, Clipboard, Check, Edit } from 'lucide-react';
import { TemplateEditor } from './TemplateEditor';

interface TemplateManagementProps {
  templates: Template[];
  onAdd: (file: File) => void;
  onDelete: (templateId: string) => void;
  onUpdate: (templateId: string, newFile: File) => void;
}

const placeholderList = [
    { key: '{{tituloProjeto}}', description: 'Título do Projeto' },
    { key: '{{bancoPROJ}}', description: 'Banco do Projeto' },
    { key: '{{agenciaPROJ}}', description: 'Agência do Projeto' },
    { key: '{{contaCorrentePROJ}}', description: 'Conta Corrente do Projeto' },
    { key: '{{SAA}}', description: 'Nº do SAA' },
    { key: '{{dataEmissaoBR}}', description: 'Data de Geração do Documento (dd/mm/aaaa)' },
    { key: '{{nomeFornecedor}}', description: 'Nome / Razão Social do Fornecedor' },
    { key: '{{CNPJ_FORNECEDOR}}', description: 'CNPJ / CPF do Fornecedor' },
    { key: '{{codigoFornecedor}}', description: 'Código do Fornecedor' },
    { key: '{{bancoCodigo}}', description: 'Banco / Código do Fornenecedor' },
    { key: '{{agencia}}', description: 'Agência do Fornecedor' },
    { key: '{{contaCorrente}}', description: 'Conta Corrente do Fornecedor' },
    { key: '{{pix}}', description: 'Chave PIX do Fornecedor' },
    { key: '{{objetivo}}', description: 'Objetivo da Despesa' },
    { key: '{{tipoDespesa}}', description: 'Elemento de Despesa' },
    { key: '{{descricaoDespesa}}', description: 'Descrição da Despesa' },
    { key: '{{tipoComprovante}}', description: 'Tipo de Comprovante' },
    { key: '{{numComprovante}}', description: 'Número do Comprovante' },
    { key: '{{valor}}', description: 'Valor a Pagar (número)' },
    { key: '{{valorBR}}', description: 'Valor a Pagar (Formatado R$)' },
    { key: '{{dataVencimento}}', description: 'Data de Vencimento (yyyy-mm-dd)' },
    { key: '{{dataVencimentoBR}}', description: 'Data de Vencimento (dd/mm/aaaa)' },
    { key: '{{dataPagamento}}', description: 'Data do Pagamento (yyyy-mm-dd)' },
    { key: '{{dataPagamentoBR}}', description: 'Data do Pagamento (dd/mm/aaaa)' },
    { key: '{{valorPago}}', description: 'Valor Pago (número)' },
    { key: '{{valorPagoBR}}', description: 'Valor Pago (Formatado R$)' },
    { key: '{{observacoes}}', description: 'Observações' },
    { key: '{{statusPagamento}}', description: 'Status do Pagamento' },
    { key: '{{statusSAA}}', description: 'Status do SAA' },
];

const PlaceholderItem: React.FC<{ ph: { key: string, description: string } }> = ({ ph }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(ph.key);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex justify-between items-center p-2 bg-gray-700/50 rounded-md">
            <div>
                <code className="text-teal-300 font-mono">{ph.key}</code>
                <p className="text-xs text-gray-400">{ph.description}</p>
            </div>
            <Button onClick={handleCopy} variant="secondary" className="p-2 h-8 w-8">
                {copied ? <Check className="h-4 w-4 text-green-400" /> : <Clipboard className="h-4 w-4" />}
            </Button>
        </div>
    );
};


export const TemplateManagement: React.FC<TemplateManagementProps> = ({ templates, onAdd, onDelete, onUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        onAdd(file);
      } else {
        alert('Por favor, selecione um arquivo .docx válido.');
      }
    }
    // Reset file input to allow uploading the same file again
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl space-y-4">
                <div className="flex flex-wrap gap-2 justify-between items-center">
                    <h2 className="text-xl font-bold text-teal-400">Gerenciar Modelos (.docx)</h2>
                    <Button onClick={handleUploadClick}>
                        <UploadCloud className="mr-2 h-4 w-4" />
                        Adicionar Modelo
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".docx"
                    />
                </div>
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                    {templates.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">Nenhum modelo adicionado.</p>
                    ) : (
                        templates.map(template => (
                            <div key={template.id} className="p-3 bg-gray-700 rounded-md flex justify-between items-center group">
                                <div className="flex items-center overflow-hidden">
                                    <FileText className="h-5 w-5 mr-3 text-teal-400 flex-shrink-0" />
                                    <p className="font-medium text-gray-200 truncate" title={template.name}>
                                        {template.name}
                                    </p>
                                </div>
                                <div className="flex items-center">
                                    <Button onClick={() => setEditingTemplate(template)} variant="secondary" className="p-2" title="Editar Modelo">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button onClick={() => onDelete(template.id)} variant="secondary" className="p-2 hover:bg-red-500/20 hover:text-red-400 ml-2" title="Excluir Modelo">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl lg:sticky lg:top-24">
                <h3 className="text-xl font-bold text-teal-400 mb-4">Placeholders Disponíveis</h3>
                <p className="text-gray-400 text-sm mb-4">
                    Use o editor para inserir placeholders em seu documento <strong>.docx</strong>. Eles serão substituídos pelos dados corretos na geração final.
                </p>
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                    {placeholderList.map(ph => <PlaceholderItem key={ph.key} ph={ph} />)}
                </div>
            </div>
        </div>

        {editingTemplate && (
            <TemplateEditor
                template={editingTemplate}
                isOpen={!!editingTemplate}
                onClose={() => setEditingTemplate(null)}
                onUpdate={onUpdate}
            />
        )}
    </>
  );
};