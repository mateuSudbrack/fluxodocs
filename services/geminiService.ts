import { GoogleGenAI } from "@google/genai";
import type { SaaProject, SaaPayment } from '../types';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const generateDocumentPrompt = (project: SaaProject, payment: SaaPayment): string => {
  const currentDate = new Intl.DateTimeFormat('pt-BR').format(new Date());

  return `
You are a professional administrative assistant responsible for generating official documents.
Your task is to create a "Solicitação de Autorização de Aplicação" (SAA) document based on the JSON data provided for a specific project and payment.
Fill in the template below with the corresponding data.
Ensure the formatting is clean, professional, and easy to read.
Do not add any extra commentary, greetings, or explanations. Only output the filled document.

**DOCUMENT TEMPLATE:**

==================================================
**SOLICITAÇÃO DE AUTORIZAÇÃO DE APLICAÇÃO (SAA)**
==================================================

**Nº SAA:** ${payment.SAA}
**Data de Emissão:** ${currentDate}

---

**1. DADOS DO PROJETO**
   - **Título do Projeto:** ${project.tituloProjeto}
   - **Banco:** ${project.bancoPROJ}
   - **Agência:** ${project.agenciaPROJ}
   - **Conta Corrente:** ${project.contaCorrentePROJ}

---

**2. DADOS DO BENEFICIÁRIO (FORNECEDOR)**
   - **Nome / Razão Social:** ${payment.nomeFornecedor}
   - **CNPJ / CPF:** ${payment.CNPJ_FORNECEDOR}
   - **Código do Fornecedor:** ${payment.codigoFornecedor}

---

**3. DADOS BANCÁRIOS DO BENEFICIÁRIO**
   - **Banco / Código:** ${payment.bancoCodigo}
   - **Agência:** ${payment.agencia}
   - **Conta Corrente:** ${payment.contaCorrente}
   - **Chave PIX:** ${payment.pix}

---

**4. DETALHES DA DESPESA**
   - **Objetivo:** ${payment.objetivo || 'Não especificado'}
   - **Elemento de Despesa:** ${payment.tipoDespesa}
   - **Descrição da Despesa:** ${payment.descricaoDespesa || 'Não especificado'}
   - **Tipo de Comprovante:** ${payment.tipoComprovante}
   - **Número do Comprovante:** ${payment.numComprovante}
   - **Data de Vencimento:** ${payment.dataVencimento ? new Date(payment.dataVencimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A'}
   - **Valor a Pagar:** R$ ${Number(payment.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

---

**5. AUTORIZAÇÃO**

Autorizo o pagamento referente a esta solicitação.

_________________________________________
Assinatura do Responsável

`;
};

export const generateSaaDocument = async (project: SaaProject, payment: SaaPayment): Promise<string> => {
  try {
    const prompt = generateDocumentPrompt(project, payment);
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    return response.text;
  } catch (error) {
    console.error("Error generating document with Gemini:", error);
    throw new Error("Failed to communicate with the AI service. Please check your connection or API key.");
  }
};