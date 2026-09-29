import { buscarTicketPorId, obterTarifa, processarPagamento } from '@/lib/db';
import { calcularTarifa } from '@/lib/tariffCalculator';
import { MetodoPagamento } from '@/types/parking';
import { NextRequest, NextResponse } from 'next/server';

const METODOS_VALIDOS: MetodoPagamento[] = ['PIX', 'CARTAO_DEBITO', 'CARTAO_CREDITO'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Payload JSON inválido' }, { status: 400 });
    }

    const { ticketId, metodo } = body;

    if (!ticketId || typeof ticketId !== 'string' || ticketId.trim().length === 0 || ticketId.length > 64) {
      return NextResponse.json(
        { error: 'Parâmetro ticketId inválido. Deve ser uma string de até 64 caracteres.' },
        { status: 400 }
      );
    }

    if (!metodo || typeof metodo !== 'string' || !METODOS_VALIDOS.includes(metodo as MetodoPagamento)) {
      return NextResponse.json(
        { error: `Método de pagamento inválido. Valores aceitos: ${METODOS_VALIDOS.join(', ')}.` },
        { status: 400 }
      );
    }

    const ticketExistente = await buscarTicketPorId(ticketId);
    if (!ticketExistente) {
      return NextResponse.json(
        { error: 'Ticket não encontrado.' },
        { status: 404 }
      );
    }

    const tarifa = await obterTarifa();
    const calculo = calcularTarifa(ticketExistente, tarifa);

    // Verificação de idempotência: se o ticket já foi pago e está no período de tolerância de 20 min
    if (ticketExistente.status === 'PAGO' && calculo.saidaLiberada) {
      return NextResponse.json({
        sucesso: true,
        mensagem: 'Ticket já se encontra pago e com saída liberada na cancela.',
        ticket: ticketExistente,
        pagamento: ticketExistente.pagamentos?.[ticketExistente.pagamentos.length - 1],
        toleranciaMinutosParaSaida: tarifa.toleranciaSaidaMin,
        toleranciaSaidaAte: ticketExistente.toleranciaSaidaAte,
      });
    }

    // REGRA DE SEGURANÇA ZERO TRUST:
    // O valor cobrado é estritamente recalculado pelo servidor no momento do pagamento,
    // impedindo qualquer tentativa de fraude por adulteração de payload no cliente.
    const valorRealDevido = calculo.valorCalculado;

    const { ticket, pagamento } = await processarPagamento(
      ticketId,
      metodo as MetodoPagamento,
      valorRealDevido
    );

    return NextResponse.json({
      sucesso: true,
      mensagem: 'Pagamento processado com sucesso. Catraca de saída liberada!',
      ticket,
      pagamento,
      toleranciaMinutosParaSaida: tarifa.toleranciaSaidaMin,
      toleranciaSaidaAte: ticket.toleranciaSaidaAte,
    });
  } catch (error) {
    console.error('Erro ao processar pagamento:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar pagamento' },
      { status: 500 }
    );
  }
}
