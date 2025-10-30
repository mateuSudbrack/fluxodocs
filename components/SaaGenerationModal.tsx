import React from 'react';
import type { SaaPayment, Template } from '../types';
import { Button } from './Button';
import { X, FileText, BrainCircuit } from 'lucide-react';

interface SaaGenerationModalProps {
    isOpen: boolean;
    onClose: () => void;
    payment: SaaPayment;
    templates: Template[];
    onGenerateWithTemplate: (template: Template) => void;
    onGenerateWithAi: () => void;
}

export const SaaGenerationModal: React.FC<SaaGenerationModalProps> = ({
    isOpen,
    onClose,
    payment,
    templates,
    onGenerateWithTemplate,
    onGenerateWithAi
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div 
                className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4" 
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-teal-400">Gerar Documento SAA</h2>
                    <Button onClick={onClose} variant="secondary" className="p-2 rounded-full h-8 w-8">
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="border-t border-gray-700 pt-4">
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">Usar um Modelo</h3>
                    <div className="space-y-2">
                        {templates.length > 0 ? (
                            templates.map(template => (
                                <button
                                    key={template.id}
                                    onClick={() => onGenerateWithTemplate(template)}
                                    className="w-full text-left p-3 bg-gray-700 rounded-md hover:bg-teal-600/30 hover:ring-1 hover:ring-teal-500 transition-all flex items-center"
                                >
                                    <FileText className="h-5 w-5 mr-3 text-teal-400 flex-shrink-0" />
                                    {template.name}
                                </button>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 py-4">
                                Nenhum modelo .docx adicionado. Vá para a seção "Modelos" para adicionar um.
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center text-gray-500">
                    <div className="flex-grow border-t border-gray-600"></div>
                    <span className="px-4 text-sm">OU</span>
                    <div className="flex-grow border-t border-gray-600"></div>
                </div>

                <div>
                     <h3 className="text-lg font-semibold text-gray-300 mb-2">Usar Inteligência Artificial</h3>
                     <Button onClick={onGenerateWithAi} variant="secondary" className="w-full justify-start py-3">
                         <BrainCircuit className="h-5 w-5 mr-3 text-gray-400" />
                         Gerar Documento com IA
                     </Button>
                </div>
            </div>
        </div>
    );
};
