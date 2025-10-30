import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Template } from '../types';
import { Button } from './Button';
import { X, Clipboard, Check, UploadCloud, Download, Info, Loader2, AlertTriangle } from 'lucide-react';
import { generateDocxFromData, extractTextFromDocx } from '../services/documentService';
import { downloadBlob } from '../services/spreadsheetService';

declare global {
    interface Window {
        docx: any;
    }
}

type ScriptStatus = 'idle' | 'loading' | 'ready' | 'error';

const placeholderList = [
    { key: '{{tituloProjeto}}', description: 'Título do Projeto' },
    { key: '{{bancoPROJ}}', description: 'Banco do Projeto' },
    { key: '{{agenciaPROJ}}', description: 'Agência do Projeto' },
    { key: '{{contaCorrentePROJ}}', description: 'Conta Corrente do Projeto' },
    { key: '{{SAA}}', description: 'Nº do SAA' },
    { key: '{{dataEmissaoBR}}', description: 'Data de Geração (dd/mm/aaaa)' },
    { key: '{{nomeFornecedor}}', description: 'Nome do Fornecedor' },
    { key: '{{CNPJ_FORNECEDOR}}', description: 'CNPJ / CPF do Fornecedor' },
    { key: '{{codigoFornecedor}}', description: 'Código do Fornecedor' },
    { key: '{{bancoCodigo}}', description: 'Banco / Código do Fornecedor' },
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

interface TemplateEditorProps {
    isOpen: boolean;
    onClose: () => void;
    template: Template;
    onUpdate: (templateId: string, newFile: File) => void;
}

const loadScript = (src: string, id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (document.getElementById(id) || window.docx) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.id = id;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Falha ao carregar o script: ${src}`));
        document.body.appendChild(script);
    });
};

export const TemplateEditor: React.FC<TemplateEditorProps> = ({ isOpen, onClose, template, onUpdate }) => {
    const previewContainerId = `docx-preview-${template.id}`;
    const [editorContent, setEditorContent] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [previewStatus, setPreviewStatus] = useState<'idle' | 'loading' | 'rendering' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [sampleData, setSampleData] = useState<Record<string, string>>({});
    
    const scriptStatus = useRef<ScriptStatus>('idle');

    useEffect(() => {
        const initialData = placeholderList.reduce((acc, ph) => {
            const key = ph.key.replace(/{{|}}/g, '');
            acc[key] = `[${ph.description}]`;
            return acc;
        }, {} as Record<string, string>);
        setSampleData(initialData);
    }, []);

    useEffect(() => {
        if (isOpen && scriptStatus.current === 'idle') {
            scriptStatus.current = 'loading';
            setPreviewStatus('loading');
            loadScript('https://cdn.jsdelivr.net/npm/docx-preview@0.1.21/dist/docx-preview.js', 'docx-preview-script')
                .then(() => {
                    scriptStatus.current = 'ready';
                })
                .catch(err => {
                    scriptStatus.current = 'error';
                    setPreviewStatus('error');
                    setErrorMessage(
                        'A biblioteca de preview foi bloqueada ou falhou ao carregar. Use o gerador de preview para download como alternativa.'
                    );
                });
        }
    }, [isOpen]);
    
    const updatePreviewAndText = useCallback(async (file: File) => {
        if (scriptStatus.current !== 'ready') {
            return;
        }

        setPreviewStatus('rendering');
        const previewContainer = document.getElementById(previewContainerId);
        if (!previewContainer) return;

        try {
            await window.docx.renderAsync(file, previewContainer);
            const text = await extractTextFromDocx(file);
            setEditorContent(text);
            setPreviewStatus('success');
        } catch (error) {
             console.error("Error rendering DOCX preview:", error);
             const message = error instanceof Error ? error.message : "O arquivo pode estar corrompido ou em um formato não suportado.";
             setErrorMessage(`Falha ao renderizar o documento: ${message}`);
             setPreviewStatus('error');
        }
    }, [previewContainerId]);

    useEffect(() => {
        if (isOpen && template?.file) {
            extractTextFromDocx(template.file).then(setEditorContent);
            if (scriptStatus.current === 'ready') {
                updatePreviewAndText(template.file);
            }
        }
    }, [isOpen, template, updatePreviewAndText]);

    if (!isOpen) return null;

    const handleCopyContent = () => {
        navigator.clipboard.writeText(editorContent);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    const handleDragEvents = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
    const handleDragEnter = (e: React.DragEvent) => { handleDragEvents(e); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent) => { handleDragEvents(e); setIsDragging(false); };

    const handleDrop = (e: React.DragEvent) => {
        handleDragEvents(e);
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            onUpdate(template.id, file);
        } else {
            alert('Por favor, solte um arquivo .docx válido.');
        }
    };
    
    const handleSampleDataChange = (key: string, value: string) => {
        setSampleData(prev => ({ ...prev, [key]: value }));
    };

    const handleDownloadPreview = async () => {
        try {
            const blob = await generateDocxFromData(template.file, sampleData);
            downloadBlob(blob, `PREVIEW_${template.name}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Erro desconhecido";
            alert(`Falha ao gerar o preview para download:\n${message}`);
            console.error(error);
        }
    };

    const renderPreviewContent = () => {
        switch (previewStatus) {
            case 'loading':
                return <div className="flex flex-col items-center justify-center h-full text-gray-500"><Loader2 className="h-8 w-8 animate-spin mb-4" /><p>Carregando biblioteca de preview...</p></div>;
            case 'rendering':
                return <div className="flex flex-col items-center justify-center h-full text-gray-500"><Loader2 className="h-8 w-8 animate-spin mb-4" /><p>Renderizando preview...</p></div>;
            case 'error':
                 return (
                    <div className="flex flex-col h-full text-gray-300 p-1">
                        <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-200 p-3 rounded-md mb-4 text-sm flex-shrink-0">
                            <p className="font-bold">Preview Visual Indisponível</p>
                            <p>{errorMessage}</p>
                        </div>
                        <h4 className="font-semibold text-lg mb-2 text-teal-300 flex-shrink-0">Gerador de Preview para Download</h4>
                        <p className="text-sm text-gray-400 mb-4 flex-shrink-0">
                            Preencha os campos com dados de exemplo para gerar um arquivo .docx.
                        </p>
                        <div className="space-y-3 overflow-y-auto pr-2 flex-grow">
                            {Object.keys(sampleData).map(key => {
                                const ph = placeholderList.find(p => p.key.replace(/{{|}}/g, '') === key);
                                return (
                                    <div key={key}>
                                        <label htmlFor={`sample-${key}`} className="text-xs text-gray-400">{ph?.description || key}</label>
                                        <input
                                            id={`sample-${key}`}
                                            type="text"
                                            value={sampleData[key]}
                                            onChange={(e) => handleSampleDataChange(key, e.target.value)}
                                            className="block w-full text-sm mt-1 px-2 py-1 bg-gray-900 border border-gray-600 rounded-md text-gray-200 focus:ring-teal-500 focus:border-teal-500"
                                        />
                                    </div>
                                )
                            })}
                        </div>
                        <div className="pt-4 flex-shrink-0">
                           <Button onClick={handleDownloadPreview} className="w-full">
                                <Download className="mr-2 h-4 w-4" />
                                Baixar Preview com Dados de Exemplo
                            </Button>
                        </div>
                    </div>
                );
            case 'success':
            case 'idle':
                 return <div id={previewContainerId} className="docx-preview-wrapper" />;
        }
    }
    
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full h-full max-w-7xl flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b border-gray-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-teal-400 truncate pr-4">Estúdio de Template: <span className="text-gray-300">{template.name}</span></h2>
                    <Button onClick={onClose} variant="secondary"><X className="h-4 w-4 mr-2" />Fechar</Button>
                </header>
                <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 overflow-hidden">
                    <div className="xl:col-span-1 flex flex-col bg-gray-900/50 rounded-lg overflow-hidden">
                        <h3 className="text-lg font-semibold text-gray-300 p-3 border-b border-gray-700 flex-shrink-0">Placeholders</h3>
                        <div className="overflow-y-auto p-3 space-y-2">
                            {placeholderList.map(ph => (
                                <div key={ph.key} className="flex justify-between items-center p-2 bg-gray-700/50 rounded-md gap-2">
                                    <code className="text-teal-300 font-mono text-sm break-all">{ph.key}</code>
                                    <Button onClick={() => navigator.clipboard.writeText(ph.key)} variant="secondary" title={`Copiar ${ph.key}`} className="p-2 h-8 w-8 flex-shrink-0"><Clipboard className="h-4 w-4" /></Button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="lg:col-span-2 xl:col-span-2 flex flex-col bg-gray-900/50 rounded-lg overflow-hidden" onDragEnter={handleDragEnter} onDragOver={handleDragEvents} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                       <h3 className="text-lg font-semibold text-gray-300 p-3 border-b border-gray-700 flex-shrink-0">Preview Visual</h3>
                       <div className="flex-grow p-4 overflow-auto bg-gray-700 relative">
                           {renderPreviewContent()}
                           {isDragging && (
                                <div className="absolute inset-2 border-4 border-dashed border-teal-400 bg-black/60 rounded-lg flex flex-col items-center justify-center text-white pointer-events-none">
                                    <UploadCloud className="h-12 w-12 mb-4 text-teal-300" />
                                    <p className="text-lg font-semibold">Solte o novo arquivo .docx aqui</p>
                                    <p>O preview será atualizado instantaneamente.</p>
                                </div>
                           )}
                       </div>
                    </div>
                    <div className="lg:col-span-3 xl:col-span-1 flex flex-col bg-gray-900/50 rounded-lg overflow-hidden">
                       <div className="p-3 border-b border-gray-700 flex-shrink-0"><h3 className="text-lg font-semibold text-gray-300">Editor de Texto Rápido</h3></div>
                       <div className="p-2 text-xs bg-teal-900/30 border-b border-gray-700 text-teal-200 flex gap-2"><Info className="h-4 w-4 flex-shrink-0 mt-0.5" /><span>Edite aqui, copie, cole no seu .docx, salve e arraste o novo arquivo para o preview ao lado para atualizar.</span></div>
                       <div className="flex-grow p-3 relative">
                           <textarea value={editorContent} onChange={e => setEditorContent(e.target.value)} className="w-full h-full bg-gray-800 text-gray-200 p-3 rounded-md resize-none border border-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono text-sm" />
                       </div>
                       <div className="p-3 border-t border-gray-700 flex-shrink-0">
                            <Button onClick={handleCopyContent} className="w-full">
                                {copySuccess ? <Check className="h-4 w-4 mr-2 text-green-400" /> : <Clipboard className="h-4 w-4 mr-2" />}
                                {copySuccess ? 'Copiado!' : 'Copiar Texto para Área de Transferência'}
                            </Button>
                       </div>
                    </div>
                </div>
            </div>
        </div>
    );
};