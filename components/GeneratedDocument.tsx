
import React, { useState, useEffect } from 'react';
import { Loader2, Clipboard, Check, AlertTriangle, FileCode2 } from 'lucide-react';

interface GeneratedDocumentProps {
  content: string;
  isLoading: boolean;
  error: string | null;
}

export const GeneratedDocument: React.FC<GeneratedDocumentProps> = ({ content, isLoading, error }) => {
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    if (content) {
      setHasCopied(false);
    }
  }, [content]);
  
  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-gray-400">
          <Loader2 className="h-12 w-12 animate-spin text-teal-500" />
          <p className="mt-4 text-lg">Gerando documento...</p>
          <p className="text-sm">Aguarde um momento.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center text-red-400">
          <AlertTriangle className="h-12 w-12" />
          <p className="mt-4 text-lg font-semibold">Erro ao Gerar</p>
          <p className="text-sm text-center">{error}</p>
        </div>
      );
    }

    if (!content) {
      return (
        <div className="flex flex-col items-center justify-center text-gray-500">
          <FileCode2 className="h-12 w-12" />
          <p className="mt-4 text-lg">O documento gerado aparecerá aqui.</p>
          <p className="text-sm">Preencha o formulário e clique em "Gerar".</p>
        </div>
      );
    }

    return (
      <>
        <div className="absolute top-2 right-2">
          <button
            onClick={handleCopy}
            className="p-2 bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-teal-500 transition-all duration-200"
            title="Copiar para a área de transferência"
          >
            {hasCopied ? <Check className="h-5 w-5 text-green-400" /> : <Clipboard className="h-5 w-5 text-gray-300" />}
          </button>
        </div>
        <pre className="whitespace-pre-wrap text-sm text-gray-200 font-mono">{content}</pre>
      </>
    );
  };
  
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl relative min-h-[500px] flex items-center justify-center lg:sticky lg:top-24">
      {renderContent()}
    </div>
  );
};
