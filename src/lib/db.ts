import { PrismaClient } from '@prisma/client';
import { MetodoPagamento, TarifaConfig, Ticket } from '@/types/parking';
import { DEFAULT_TARIFA, normalizarPlaca } from './tariffCalculator';

// Prisma Client Singleton para conexão com PostgreSQL em ambiente de produção
declare global {
  var __prismaClient: PrismaClient | undefined;
  var __mockTickets: Ticket[] | undefined;
  var __mockTarifa: TarifaConfig | undefined;
}

export function getPrisma(): PrismaClient {
  if (!globalThis.__prismaClient) {
    globalThis.__prismaClient = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  }
  return globalThis.__prismaClient;
}

// Seed em memória para fallback resiliente em ambiente de desenvolvimento sem PostgreSQL
const initialTickets: Ticket[] = [
  {
    id: 'ticket-1024',
    codigoTicket: '1024',
    placa: 'ABC1234',
    horarioEntrada: new Date(Date.now() - 48 * 60 * 1000).toISOString(),
    status: 'PENDENTE',
    valorTotal: 12.00,
    pagamentos: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ticket-1025',
    codigoTicket: '1025',
    placa: 'XYZ9876',
    horarioEntrada: new Date(Date.now() - 105 * 60 * 1000).toISOString(),
    status: 'PENDENTE',
    valorTotal: 16.00,
    pagamentos: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ticket-1026',
    codigoTicket: '1026',
    placa: 'BRA2E19',
    horarioEntrada: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    status: 'PENDENTE',
    valorTotal: 0,
    pagamentos: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ticket-1027',
    codigoTicket: '1027',
    placa: 'KTM4G88',
    horarioEntrada: new Date(Date.now() - 500 * 60 * 1000).toISOString(),
    status: 'PENDENTE',
    valorTotal: 45.00,
    pagamentos: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ticket-1028',
    codigoTicket: '1028',
    placa: 'RIO1B22',
    horarioEntrada: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    horarioPagamento: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    toleranciaSaidaAte: new Date(Date.now() + 18 * 60 * 1000).toISOString(),
    status: 'PAGO',
    valorTotal: 12.00,
    pagamentos: [
      {
        id: 'pag-demo-28',
        ticketId: 'ticket-1028',
        metodo: 'PIX',
        valor: 12.00,
        codigoTransacao: 'PIX-1028VALID',
        status: 'APROVADO',
        pagoEm: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
  }
];

const getTicketsStore = (): Ticket[] => {
  if (!globalThis.__mockTickets) {
    globalThis.__mockTickets = [...initialTickets];
  }
  return globalThis.__mockTickets;
};

const getTarifaStore = (): TarifaConfig => {
  if (!globalThis.__mockTarifa) {
    globalThis.__mockTarifa = { ...DEFAULT_TARIFA };
  }
  return globalThis.__mockTarifa;
};

interface DbPagamentoRow {
  id: string;
  ticketId: string;
  metodo: string;
  valor: unknown;
  codigoTransacao: string;
  status: string;
  pagoEm: Date;
}

interface DbTicketRow {
  id: string;
  codigoTicket?: string | null;
  placa: string;
  horarioEntrada: Date;
  horarioPagamento?: Date | null;
  horarioSaida?: Date | null;
  status: string;
  valorTotal: unknown;
  toleranciaSaidaAte?: Date | null;
  pagamentos?: DbPagamentoRow[];
  createdAt: Date;
  updatedAt?: Date;
}

function mapPrismaTicketToTicket(dbTicket: DbTicketRow): Ticket {
  return {
    id: dbTicket.id,
    codigoTicket: dbTicket.codigoTicket || undefined,
    placa: dbTicket.placa,
    horarioEntrada: dbTicket.horarioEntrada.toISOString(),
    horarioPagamento: dbTicket.horarioPagamento?.toISOString() || null,
    horarioSaida: dbTicket.horarioSaida?.toISOString() || null,
    status: dbTicket.status as Ticket['status'],
    valorTotal: Number(dbTicket.valorTotal),
    toleranciaSaidaAte: dbTicket.toleranciaSaidaAte?.toISOString() || null,
    pagamentos: dbTicket.pagamentos?.map((p) => ({
      id: p.id,
      ticketId: p.ticketId,
      metodo: p.metodo as MetodoPagamento,
      valor: Number(p.valor),
      codigoTransacao: p.codigoTransacao,
      status: p.status as 'APROVADO' | 'RECUSADO' | 'PENDENTE',
      pagoEm: p.pagoEm.toISOString(),
    })) || [],
    createdAt: dbTicket.createdAt.toISOString(),
    updatedAt: dbTicket.updatedAt?.toISOString() || dbTicket.createdAt.toISOString(),
  };
}

/**
 * Testa conexão com o banco PostgreSQL para o endpoint de healthcheck
 */
export async function testarConexaoBanco(): Promise<{ conectado: boolean; driver: string; erro?: string }> {
  try {
    const prisma = getPrisma();
    await prisma.$queryRaw`SELECT 1`;
    return { conectado: true, driver: 'PostgreSQL (Prisma)' };
  } catch (err: unknown) {
    return {
      conectado: false,
      driver: 'In-Memory Store (Resiliente)',
      erro: err instanceof Error ? err.message : 'Conexão offline',
    };
  }
}

/**
 * Busca ticket por código de barras, ID ou placa
 */
export async function buscarTicketPorLeitura(codigoOuPlaca: string): Promise<Ticket | null> {
  const termo = codigoOuPlaca.trim().toUpperCase();
  const termoLimpo = normalizarPlaca(codigoOuPlaca);

  // Tenta consulta no PostgreSQL via Prisma
  try {
    const prisma = getPrisma();
    const dbTicket = await prisma.ticket.findFirst({
      where: {
        OR: [
          { codigoTicket: termo },
          { id: termo },
          { placa: termoLimpo },
        ],
      },
      include: { pagamentos: true },
    });

    if (dbTicket) {
      return mapPrismaTicketToTicket(dbTicket);
    }
  } catch {
    // Se o PostgreSQL não estiver conectado, usa fallback da memória
  }

  // Fallback em memória
  const tickets = getTicketsStore();
  const encontrado = tickets.find((t) => {
    const matchCodigo = t.codigoTicket && t.codigoTicket.toUpperCase() === termo;
    const matchId = t.id.toUpperCase() === termo || t.id.toUpperCase().endsWith(termo);
    const matchPlaca = normalizarPlaca(t.placa) === termoLimpo;
    return matchCodigo || matchId || matchPlaca;
  });

  return encontrado ? { ...encontrado } : null;
}

export async function buscarTicketPorPlaca(placaInput: string): Promise<Ticket | null> {
  return buscarTicketPorLeitura(placaInput);
}

export async function buscarTicketPorId(id: string): Promise<Ticket | null> {
  return buscarTicketPorLeitura(id);
}

export async function listarTodosTickets(): Promise<Ticket[]> {
  try {
    const prisma = getPrisma();
    const dbTickets = await prisma.ticket.findMany({
      include: { pagamentos: true },
      orderBy: { horarioEntrada: 'desc' },
    });

    if (dbTickets.length > 0) {
      return dbTickets.map(mapPrismaTicketToTicket);
    }
  } catch {
    // fallback
  }

  const tickets = getTicketsStore();
  return [...tickets].sort(
    (a, b) => new Date(b.horarioEntrada).getTime() - new Date(a.horarioEntrada).getTime()
  );
}

export async function criarTicket(placa: string, horarioEntradaCustom?: Date): Promise<Ticket> {
  const placaLimpa = normalizarPlaca(placa);
  const nextNum = Math.floor(1000 + Math.random() * 9000).toString();
  const entrada = horarioEntradaCustom || new Date();

  try {
    const prisma = getPrisma();
    const dbTicket = await prisma.ticket.create({
      data: {
        codigoTicket: nextNum,
        placa: placaLimpa,
        horarioEntrada: entrada,
        status: 'PENDENTE',
        valorTotal: 0,
      },
      include: { pagamentos: true },
    });

    return mapPrismaTicketToTicket(dbTicket);
  } catch {
    // fallback em memória
  }

  const tickets = getTicketsStore();
  const novoTicket: Ticket = {
    id: `ticket-${nextNum}`,
    codigoTicket: nextNum,
    placa: placaLimpa,
    horarioEntrada: entrada.toISOString(),
    status: 'PENDENTE',
    valorTotal: 0,
    pagamentos: [],
    createdAt: new Date().toISOString(),
  };

  tickets.unshift(novoTicket);
  return { ...novoTicket };
}

/**
 * Processa pagamento com transação atômica e validade de 20 min para cancela
 */
export async function processarPagamento(
  ticketId: string,
  metodo: MetodoPagamento,
  valor: number
): Promise<{ ticket: Ticket; pagamento: NonNullable<Ticket['pagamentos']>[0] }> {
  const agora = new Date();
  const tarifa = await obterTarifa();
  const toleranciaSaidaAte = new Date(agora.getTime() + tarifa.toleranciaSaidaMin * 60 * 1000);
  const codigoTransacao = `${metodo}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

  // Tentativa com transação atômica no PostgreSQL
  try {
    const prisma = getPrisma();
    const resultado = await prisma.$transaction(async (tx) => {
      const ticketAtual = await tx.ticket.findUnique({
        where: { id: ticketId },
      });

      if (!ticketAtual) {
        throw new Error('Ticket não encontrado no banco');
      }

      const novoPagamento = await tx.pagamento.create({
        data: {
          ticketId,
          metodo,
          valor,
          codigoTransacao,
          status: 'APROVADO',
          pagoEm: agora,
        },
      });

      const ticketAtualizado = await tx.ticket.update({
        where: { id: ticketId },
        data: {
          status: 'PAGO',
          valorTotal: valor,
          horarioPagamento: agora,
          toleranciaSaidaAte,
        },
        include: { pagamentos: true },
      });

      return { ticketAtualizado, novoPagamento };
    });

    return {
      ticket: mapPrismaTicketToTicket(resultado.ticketAtualizado),
      pagamento: {
        id: resultado.novoPagamento.id,
        ticketId,
        metodo,
        valor,
        codigoTransacao,
        status: 'APROVADO',
        pagoEm: agora.toISOString(),
      },
    };
  } catch {
    // Fallback resiliente em memória
  }

  const tickets = getTicketsStore();
  const index = tickets.findIndex((t) => t.id === ticketId || t.codigoTicket === ticketId);

  if (index === -1) {
    throw new Error('Ticket não encontrado');
  }

  const novoPagamento = {
    id: 'pag-' + Math.random().toString(36).substring(2, 9),
    ticketId: tickets[index].id,
    metodo,
    valor,
    codigoTransacao,
    status: 'APROVADO' as const,
    pagoEm: agora.toISOString(),
  };

  tickets[index] = {
    ...tickets[index],
    status: 'PAGO',
    valorTotal: valor,
    horarioPagamento: agora.toISOString(),
    toleranciaSaidaAte: toleranciaSaidaAte.toISOString(),
    pagamentos: [...(tickets[index].pagamentos || []), novoPagamento],
    updatedAt: agora.toISOString(),
  };

  return {
    ticket: { ...tickets[index] },
    pagamento: novoPagamento,
  };
}

export async function obterTarifa(): Promise<TarifaConfig> {
  try {
    const prisma = getPrisma();
    const dbTarifa = await prisma.tarifaConfig.findFirst();
    if (dbTarifa) {
      return {
        id: dbTarifa.id,
        nomeEstacionamento: dbTarifa.nomeEstacionamento,
        toleranciaMinutos: dbTarifa.toleranciaMinutos,
        valorPrimeiraHora: Number(dbTarifa.valorPrimeiraHora),
        valorHoraAdicional: Number(dbTarifa.valorHoraAdicional),
        fracaoMinutos: dbTarifa.fracaoMinutos,
        tetoDiario: Number(dbTarifa.tetoDiario),
        toleranciaSaidaMin: dbTarifa.toleranciaSaidaMin,
      };
    }
  } catch {
    // fallback
  }

  return { ...getTarifaStore() };
}

export async function atualizarTarifa(novaConfig: Partial<TarifaConfig>): Promise<TarifaConfig> {
  try {
    const prisma = getPrisma();
    const configAtual = await obterTarifa();
    const mesclada = { ...configAtual, ...novaConfig };

    await prisma.tarifaConfig.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        nomeEstacionamento: mesclada.nomeEstacionamento,
        toleranciaMinutos: mesclada.toleranciaMinutos,
        valorPrimeiraHora: mesclada.valorPrimeiraHora,
        valorHoraAdicional: mesclada.valorHoraAdicional,
        fracaoMinutos: mesclada.fracaoMinutos,
        tetoDiario: mesclada.tetoDiario,
        toleranciaSaidaMin: mesclada.toleranciaSaidaMin,
      },
      update: {
        nomeEstacionamento: mesclada.nomeEstacionamento,
        toleranciaMinutos: mesclada.toleranciaMinutos,
        valorPrimeiraHora: mesclada.valorPrimeiraHora,
        valorHoraAdicional: mesclada.valorHoraAdicional,
        fracaoMinutos: mesclada.fracaoMinutos,
        tetoDiario: mesclada.tetoDiario,
        toleranciaSaidaMin: mesclada.toleranciaSaidaMin,
      },
    });

    return mesclada;
  } catch {
    // fallback
  }

  const atual = getTarifaStore();
  globalThis.__mockTarifa = { ...atual, ...novaConfig };
  return { ...globalThis.__mockTarifa };
}
