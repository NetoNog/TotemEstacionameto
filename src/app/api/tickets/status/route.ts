import { buscarTicketPorId } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Endpoint de verificação de status do ticket em tempo real para o Totem.
 * Permite que a tela do totem detecte automaticamente quando o cliente efetua
 * o pagamento no app bancário (PIX) ou quando a cancela libera.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get('id') || searchParams.get('ticketId');

    if (!ticketId) {
      return NextResponse.json(
        { error: 'Parâmetro ticketId obrigatório' },
        { status: 400 }
      );
    }

    const ticket = await buscarTicketPorId(ticketId);

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket não encontrado', encontrado: false },
        { status: 404 }
      );
    }

    const isPago = ticket.status === 'PAGO' || ticket.status === 'LIBERADO';

    return NextResponse.json({
      encontrado: true,
      id: ticket.id,
      codigoTicket: ticket.codigoTicket,
      placa: ticket.placa,
      status: ticket.status,
      pago: isPago,
      horarioPagamento: ticket.horarioPagamento,
      toleranciaSaidaAte: ticket.toleranciaSaidaAte,
      ticket,
    });
  } catch (error) {
    console.error('Erro ao verificar status do ticket:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar status do ticket' },
      { status: 500 }
    );
  }
}
