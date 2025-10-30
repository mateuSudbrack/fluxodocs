export interface SaaPayment {
  id: string;
  dataVencimento: string;
  SAA: string;
  tipoDespesa: string; // Elemento de Despesa
  tipoComprovante: string;
  numComprovante: string;
  valor: string; // Valor à Pagar
  codigoFornecedor: string;
  nomeFornecedor: string;
  CNPJ_FORNECEDOR: string;
  bancoCodigo: string;
  agencia: string;
  contaCorrente: string;
  pix: string;
  // New fields
  objetivo: string;
  descricaoDespesa: string;
  dataPagamento: string;
  valorPago: string;
  observacoes: string;
  statusPagamento: string;
  statusSAA: string;
}

export interface FinancialData {
  periodoDe: string;
  periodoAte: string;
  totalAprovado: string;
  parcelaRecebida: string;
  saldoParcelaAnterior: string;
  // Receitas
  rendimentosAplicacao: string;
  doacao: string;
  emprestimos: string;
  devolucaoCredito: string;
  doacaoRede: string;
  resgates: string;
  // Outras Despesas
  taxasBancarias: string;
  estornos: string;
  aplicacaoFinanceira: string;
  pagamentoIndevido: string;
  // Saldos
  saldoBancario: string;
  saldoAplicacao: string;
  dataExtrato: string;
}


export interface MonthlyControl {
  id: string;
  name: string;
  payments: SaaPayment[];
  financials: FinancialData;
}

export interface SaaProject {
  id: string;
  tituloProjeto: string;
  organizacao: string;
  responsavelFinanceiro: string;
  bancoPROJ: string;
  agenciaPROJ: string;
  contaCorrentePROJ: string;
  monthlyControls: MonthlyControl[];
}

export interface Supplier {
  id: string;
  codigoFornecedor: string;
  nomeFornecedor: string;
  CNPJ_FORNECEDOR: string;
  bancoCodigo: string;
  agencia: string;
  contaCorrente: string;
  pix: string;
}

export interface Template {
  id: string;
  name: string;
  file: File;
}