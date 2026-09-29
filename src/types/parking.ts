export type TicketStatus = 'PENDENTE' | 'PAGO' | 'LIBERADO' | 'CANCELADO';

export type MetodoPagamento = 'PIX' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO';

export interface Pagamento {
  id: string;
  ticketId: string;
  metodo: MetodoPagamento;
  valor: number;
  codigoTransacao: string;
  status: 'APROVADO' | 'RECUSADO' | 'PENDENTE';
  pagoEm: string;
}

export interface Ticket {
  id: string;
  codigoTicket?: string; // Código de barras do ticket impresso (ex: "1024", "1025")
  placa: string;
  horarioEntrada: string;
  horarioPagamento?: string | null;
  horarioSaida?: string | null;
  status: TicketStatus;
  valorTotal: number;
  toleranciaSaidaAte?: string | null;
  pagamentos?: Pagamento[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TarifaConfig {
  id: string;
  nomeEstacionamento: string;
  toleranciaMinutos: number;       // Ex: 15 minutos de isenção
  valorPrimeiraHora: number;       // Ex: R$ 12,00
  valorHoraAdicional: number;      // Ex: R$ 4,00 a cada fração/hora
  fracaoMinutos: number;           // Ex: 30 minutos
  tetoDiario: number;              // Ex: R$ 45,00
  toleranciaSaidaMin: number;      // 20 minutos de validade para passar na cancela
}

export interface CalculoTarifa {
  tempoMinutos: number;
  tempoFormatado: string;          // Ex: "1h 45min"
  dentroTolerancia: boolean;
  isento: boolean;
  valorPrimeiraHora: number;
  valorAdicional: number;
  atingiuTetoDiario: boolean;
  valorCalculado: number;
  jaPago: boolean;
  saidaLiberada: boolean;
  minutosRestantesSaida?: number;
  descricaoRegra: string[];
}
