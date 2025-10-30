import type { SaaPayment, SaaProject, MonthlyControl, FinancialData } from '../types';

// This will use the global XLSX object loaded from the script in index.html
declare var XLSX: any;

const initialFinancialData: FinancialData = {
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

const escapeCsvCell = (cell: string | number | null | undefined) => {
  const cellString = String(cell || '');
  if (cellString.includes(',') || cellString.includes('"') || cellString.includes('\n')) {
    return `"${cellString.replace(/"/g, '""')}"`;
  }
  return cellString;
};

const fullHeaders = [
    'Código Fornecedor',
    'Data de Vencimento',
    'Nome do Fornecedor (Beneficiário)',
    'CNPJ Fornecedor (Beneficiário)',
    'Valor à Pagar (R$)',
    'Tipo de Comprovante',
    'Nº do Comprovante',
    'Objetivo',
    'Elemento de Despesa',
    'Descrição da Despesa',
    'Data do Pagto',
    'Valor Pago (R$)',
    'Observações',
    'Status do Pagamento',
    'Status do SAA',
    'Nº do SAA' // Added SAA number as it was in the old export
];

const paymentToRow = (p: SaaPayment): (string | number)[] => [
    p.codigoFornecedor,
    p.dataVencimento ? new Date(p.dataVencimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '',
    p.nomeFornecedor,
    p.CNPJ_FORNECEDOR,
    p.valor ? Number(p.valor).toFixed(2).replace('.', ',') : '0,00',
    p.tipoComprovante,
    p.numComprovante,
    p.objetivo,
    p.tipoDespesa,
    p.descricaoDespesa,
    p.dataPagamento ? new Date(p.dataPagamento).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '',
    p.valorPago ? Number(p.valorPago).toFixed(2).replace('.', ',') : '0,00',
    p.observacoes,
    p.statusPagamento,
    p.statusSAA,
    p.SAA,
];

export const generateSingleControlCsv = (payments: SaaPayment[]): string => {
  const rows: (string | number)[][] = [];
  rows.push(fullHeaders);
  payments.forEach(p => rows.push(paymentToRow(p)));
  return rows.map(row => row.map(escapeCsvCell).join(',')).join('\n');
};

const getSheetDataForControl = (control: MonthlyControl): (string | number)[][] => {
    const data: (string | number)[][] = [];
    data.push(fullHeaders);

    if (control.payments.length > 0) {
        control.payments.forEach(p => {
            const rowData = paymentToRow(p);
            // Convert currency strings to numbers for XLSX formatting
            rowData[4] = p.valor ? parseFloat(Number(p.valor).toFixed(2)) : 0;
            rowData[11] = p.valorPago ? parseFloat(Number(p.valorPago).toFixed(2)) : 0;
            data.push(rowData);
        });
    } else {
        data.push(['Nenhum pagamento para este período.']);
    }
    return data;
}

const N = (value: string | number): number => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
}

const specialExpenseTypes = [
    'Taxas Bancarias',
    'Estornos',
    'Aplicação Financeira',
    'Pagamento indevido'
];

const generatePrestacaoDeContasSheet = (project: SaaProject, control: MonthlyControl) => {
    const financials = control.financials || initialFinancialData;
    const { payments } = control;

    // --- Calculations ---
    const totalDespesas = payments.reduce((acc, p) => acc + N(p.valor), 0);
    const disponivelGasto = N(financials.saldoParcelaAnterior) + N(financials.parcelaRecebida);
    const saldoFinalCalculado = disponivelGasto - totalDespesas;
    
    const totalReceitas = N(financials.saldoParcelaAnterior) + N(financials.rendimentosAplicacao) + N(financials.doacao) + N(financials.emprestimos) + N(financials.devolucaoCredito) + N(financials.doacaoRede) + N(financials.resgates);
    
    const pagamentosNormais = payments.filter(p => !specialExpenseTypes.includes(p.tipoDespesa));

    const totalTaxas = payments.filter(p => p.tipoDespesa === 'Taxas Bancarias').reduce((acc, p) => acc + N(p.valor), 0);
    const totalEstornos = payments.filter(p => p.tipoDespesa === 'Estornos').reduce((acc, p) => acc + N(p.valor), 0);
    const totalAplicacao = payments.filter(p => p.tipoDespesa === 'Aplicação Financeira').reduce((acc, p) => acc + N(p.valor), 0);
    const totalIndevido = payments.filter(p => p.tipoDespesa === 'Pagamento indevido').reduce((acc, p) => acc + N(p.valor), 0);

    const saldoProjeto = totalReceitas - totalDespesas;
    const saldoFinalDiferenca = N(financials.saldoBancario) + N(financials.saldoAplicacao) - saldoProjeto;

    const sheetData: any[][] = [
        ['RELATÓRIO FINANCEIRO - Prestação de Contas', null, null, null, null, null],
        ['Título do Projeto:', project.tituloProjeto, null, 'Contrato nº:', project.tituloProjeto],
        ['Organização:', project.organizacao, null, 'Responsável financeiro:', project.responsavelFinanceiro],
        ['Data de entrega:', new Date().toLocaleDateString('pt-BR'), null, 'Banco:', project.bancoPROJ, `Agência: ${project.agenciaPROJ}`, `Conta Corrente: ${project.contaCorrentePROJ}`],
        ['Período relatado:', `De: ${financials.periodoDe ? new Date(financials.periodoDe).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : ''}`, `Até: ${financials.periodoAte ? new Date(financials.periodoAte).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : ''}`],
        [],
        ['TOTAL APROVADO', { t: 'n', v: N(financials.totalAprovado), z: 'R$ #,##0.00' }],
        ['PARCELA RECEBIDA em R$', { t: 'n', v: N(financials.parcelaRecebida), z: 'R$ #,##0.00' }],
        ['SALDO DA PARCELA ANTERIOR', { t: 'n', v: N(financials.saldoParcelaAnterior), z: 'R$ #,##0.00' }],
        ['DISPONÍVEL PARA GASTO', { t: 'n', v: disponivelGasto, z: 'R$ #,##0.00' }],
        ['TOTAL DE GASTOS', { t: 'n', v: totalDespesas, z: 'R$ #,##0.00' }],
        ['SALDO FINAL', { t: 'n', v: saldoFinalCalculado, z: 'R$ #,##0.00' }],
        [],
        ['1. Receitas', 'Valor (R$)'],
        ['Saldo Anterior', { t: 'n', v: N(financials.saldoParcelaAnterior), z: 'R$ #,##0.00' }],
        ['Rendimentos Líquidos de Aplicação Financeira', { t: 'n', v: N(financials.rendimentosAplicacao), z: 'R$ #,##0.00' }],
        ['Doação', { t: 'n', v: N(financials.doacao), z: 'R$ #,##0.00' }],
        ['Empréstimos entre contas', { t: 'n', v: N(financials.emprestimos), z: 'R$ #,##0.00' }],
        ['Devolução de crédito indevido', { t: 'n', v: N(financials.devolucaoCredito), z: 'R$ #,##0.00' }],
        ['Doação Rede Cerrado', { t: 'n', v: N(financials.doacaoRede), z: 'R$ #,##0.00' }],
        ['Resgates', { t: 'n', v: N(financials.resgates), z: 'R$ #,##0.00' }],
        [],
        ['Total das Receitas', { t: 'n', v: totalReceitas, z: 'R$ #,##0.00' }],
        [],
        ['2. Despesas', 'Valor (R$)'],
        ['Elemento de Despesa', 'Descrição da Despesa', 'Valor (R$)'],
        ...pagamentosNormais.map(p => [p.tipoDespesa, p.descricaoDespesa, { t: 'n', v: N(p.valor), z: 'R$ #,##0.00' }]),
        [],
        ['Taxas Bancárias', { t: 'n', v: totalTaxas, z: 'R$ #,##0.00' }],
        ['Estornos', { t: 'n', v: totalEstornos, z: 'R$ #,##0.00' }],
        ['Aplicação Financeira', { t: 'n', v: totalAplicacao, z: 'R$ #,##0.00' }],
        ['Pagamento indevido', { t: 'n', v: totalIndevido, z: 'R$ #,##0.00' }],
        [],
        ['Total das Despesas', { t: 'n', v: totalDespesas, z: 'R$ #,##0.00' }],
        [],
        ['3. Saldo do Projeto ( 1 - 2 )', { t: 'n', v: saldoProjeto, z: 'R$ #,##0.00' }],
        [`4. Saldo Bancário (Conforme Extrato Bancário): Em ${financials.dataExtrato ? new Date(financials.dataExtrato).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : ''}`, { t: 'n', v: N(financials.saldoBancario), z: 'R$ #,##0.00' }],
        [`5. Saldo de Aplicação Financeira (Conforme Extrato Bancário): Em ${financials.dataExtrato ? new Date(financials.dataExtrato).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : ''}`, { t: 'n', v: N(financials.saldoAplicacao), z: 'R$ #,##0.00' }],
        ['6. Saldo Final = Diferença ( = 4 (+) 5 (-) 3 )', { t: 'n', v: saldoFinalDiferenca, z: 'R$ #,##0.00' }],
    ];
    
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    
    // --- Merges ---
    worksheet['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }, // Title
        { s: { r: 1, c: 1 }, e: { r: 1, c: 2 } },
        { s: { r: 2, c: 1 }, e: { r: 2, c: 2 } },
        { s: { r: 3, c: 1 }, e: { r: 3, c: 2 } },
        { s: { r: 35, c: 0 }, e: { r: 35, c: 5 } },
        { s: { r: 36, c: 0 }, e: { r: 36, c: 5 } },
        { s: { r: 37, c: 0 }, e: { r: 37, c: 5 } },
        { s: { r: 38, c: 0 }, e: { r: 38, c: 5 } },
    ];
    
    // --- Column Widths ---
    worksheet['!cols'] = [
        { wch: 45 },
        { wch: 20 },
        { wch: 20 },
        { wch: 20 },
        { wch: 25 },
        { wch: 25 },
    ];

    return worksheet;
};


export const generateXlsxWorkbook = (project: SaaProject): Blob => {
    const workbook = XLSX.utils.book_new();

    project.monthlyControls.forEach(control => {
        // --- Sheet 1: Payments List ---
        const paymentSheetData = getSheetDataForControl(control);
        const paymentWorksheet = XLSX.utils.aoa_to_sheet(paymentSheetData);
        
        // Add currency formatting for the 'Valor' columns
        const range = XLSX.utils.decode_range(paymentWorksheet['!ref'] || 'A1');
        const currencyColumns = [4, 11]; // E and L
        for (let R = range.s.r + 1; R <= range.e.r; ++R) { // Start from row 1 (after header)
            currencyColumns.forEach(C => {
                const cell_address = { c: C, r: R }; 
                const cell_ref = XLSX.utils.encode_cell(cell_address);
                if (paymentWorksheet[cell_ref]) {
                    paymentWorksheet[cell_ref].t = 'n'; // type: number
                    paymentWorksheet[cell_ref].z = 'R$ #,##0.00'; // format string
                }
            });
        }

        // Auto-fit columns
        const colWidths = paymentSheetData[0].map((_, i) => ({
             wch: Math.max(...paymentSheetData.map(row => row[i]?.toString().length ?? 0)) + 2 
        }));
        paymentWorksheet['!cols'] = colWidths;

        const safeSheetName = control.name.replace(/[\\/*?:"<>|]/g, '').substring(0, 31);
        XLSX.utils.book_append_sheet(workbook, paymentWorksheet, safeSheetName);

        // --- Sheet 2: Prestação de Contas ---
        const pcWorksheet = generatePrestacaoDeContasSheet(project, control);
        const pcSheetName = `PC - ${safeSheetName}`.substring(0, 31);
        XLSX.utils.book_append_sheet(workbook, pcWorksheet, pcSheetName);
    });

    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

export const downloadBlob = (blob: Blob, filename: string) => {
  const link = document.createElement("a");
  if (link.download !== undefined) { 
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};