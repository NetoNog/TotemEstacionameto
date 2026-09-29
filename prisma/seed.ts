import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando Carga Inicial do Banco de Dados (Seed) ---');

  // 1. Configuração Padrão de Tarifas do Estacionamento
  const tarifa = await prisma.tarifaConfig.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      nomeEstacionamento: 'SmartPark Estacionamento Rotativo',
      toleranciaMinutos: 15, // 15 minutos de gratuidade
      valorPrimeiraHora: 12.00, // R$ 12,00 na 1ª hora
      valorHoraAdicional: 4.00, // R$ 4,00 a cada fração
      fracaoMinutos: 30, // 30 minutos por fração
      tetoDiario: 45.00, // R$ 45,00 teto diário
      toleranciaSaidaMin: 20, // 20 minutos de tolerância pós-pagamento
    },
  });
  console.log('✅ Configuração de tarifas registrada:', tarifa.nomeEstacionamento);

  // 2. Tickets Iniciais de Demonstração / Operação
  const ticketsIniciais = [
    {
      codigoTicket: '1024',
      placa: 'ABC1234',
      horarioEntrada: new Date(Date.now() - 48 * 60 * 1000), // 48 min atrás (1ª hora)
      status: 'PENDENTE' as const,
      valorTotal: 12.00,
    },
    {
      codigoTicket: '1025',
      placa: 'XYZ9876',
      horarioEntrada: new Date(Date.now() - 105 * 60 * 1000), // 1h 45m atrás (adicional)
      status: 'PENDENTE' as const,
      valorTotal: 16.00,
    },
    {
      codigoTicket: '1026',
      placa: 'BRA2E19',
      horarioEntrada: new Date(Date.now() - 10 * 60 * 1000), // 10 min atrás (tolerância gratuita)
      status: 'PENDENTE' as const,
      valorTotal: 0.00,
    },
    {
      codigoTicket: '1027',
      placa: 'KTM4G88',
      horarioEntrada: new Date(Date.now() - 500 * 60 * 1000), // 8h 20m atrás (teto diário)
      status: 'PENDENTE' as const,
      valorTotal: 45.00,
    },
  ];

  for (const t of ticketsIniciais) {
    const ticketExistente = await prisma.ticket.findFirst({
      where: {
        OR: [{ codigoTicket: t.codigoTicket }, { placa: t.placa }],
      },
    });

    if (!ticketExistente) {
      await prisma.ticket.create({
        data: t,
      });
      console.log(`✅ Ticket #${t.codigoTicket} (${t.placa}) criado com sucesso.`);
    } else {
      console.log(`ℹ️ Ticket #${t.codigoTicket} já existente no banco.`);
    }
  }

  console.log('--- Carga Inicial Concluída com Sucesso ---');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
