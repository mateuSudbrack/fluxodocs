import type { SaaProject, SaaPayment } from '../types';

// These will use the global objects loaded from the scripts in index.html
declare var PizZip: any;
declare var docxtemplater: any;
declare var mammoth: any;

const loadFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
    reader.onerror = (e) => reject(e);
    reader.readAsArrayBuffer(file);
  });
};

export const generateDocxFromData = async (templateFile: File, data: Record<string, any>): Promise<Blob> => {
  try {
    const content = await loadFileAsArrayBuffer(templateFile);
    
    const zip = new PizZip(content);
    
    const doc = new docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: {
        start: '{{',
        end: '}}',
      },
    });

    doc.render(data);

    const out = doc.getZip().generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    
    return out;

  } catch (error: any) {
    console.error("Docxtemplater error:", error);
    if (error.properties && error.properties.errors) {
        const errorMessages = error.properties.errors.map((err: any) => err.properties.explanation).join('\n');
        throw new Error(`Erro no modelo do documento:\n${errorMessages}`);
    }
    throw error;
  }
};

export const generateDocx = async (templateFile: File, project: SaaProject, payment: SaaPayment): Promise<Blob> => {
  const data = {
    ...project,
    ...payment,
    // Add formatted values for convenience in the template
    dataEmissaoBR: new Intl.DateTimeFormat('pt-BR').format(new Date()),
    dataVencimentoBR: payment.dataVencimento ? new Date(payment.dataVencimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '',
    valorBR: payment.valor ? Number(payment.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00',
    dataPagamentoBR: payment.dataPagamento ? new Date(payment.dataPagamento).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '',
    valorPagoBR: payment.valorPago ? Number(payment.valorPago).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00',
  };
  return generateDocxFromData(templateFile, data);
};

export const extractTextFromDocx = async (file: File): Promise<string> => {
    try {
        const arrayBuffer = await loadFileAsArrayBuffer(file);
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
    } catch (error) {
        console.error("Error extracting text from DOCX:", error);
        return "Não foi possível extrair o texto deste documento.";
    }
};