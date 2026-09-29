import { buscarTicketPorId, buscarTicketPorLeitura, processarPagamento } from '@/lib/db';
import { pixService } from '@/lib/payments/pix/pixService';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Webhook Oficial para Notificações de Pagamento PIX (Banco Central / PSP / Gateways)
 * Processa a confirmação de recebimento instantaneamente e libera o ticket no totem.
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json().catch(() => null);
    if (!rawBody || typeof rawBody !== 'object') {
      return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
    }

    const { ticketId, txid, valor, pago } = pixService.extrairDadosWebhook(rawBody);

    if (!pago) {
      return NextResponse.json({ recebido: true, status: 'IGNORADO_NAO_PAGO' });
    }

    // Localiza o ticket pelo ID ou txid
    let ticket = ticketId ? await buscarTicketPorId(ticketId) : null;
    if (!ticket && txid) {
      ticket = await buscarTicketPorLeitura(txid);
    }

    if (!ticket) {
      console.warn('[Webhook PIX] Ticket não localizado para os dados:', { ticketId, txid });
      return NextResponse.json(
        { error: 'Ticket associado não localizado', recebido: true },
        { status: 200 }
      );
    }

    // Se já estiver pago, retorna sucesso idempotente
    if (ticket.status === 'PAGO' || ticket.status === 'LIBERADO') {
      return NextResponse.json({
        recebido: true,
        sucesso: true,
        mensagem: 'Ticket já estava quitado',
      });
    }

    const valorCobrado = valor && valor > 0 ? valor : ticket.valorTotal || 12.0;

    await processarPagamento(ticket.id, 'PIX', valorCobrado);

    console.log(`[Webhook PIX] Ticket #${ticket.codigoTicket || ticket.id} pago com sucesso!`);

    return NextResponse.json({
      recebido: true,
      sucesso: true,
      ticketId: ticket.id,
      status: 'PAGO',
    });
  } catch (error) {
    console.error('Erro ao processar Webhook do PIX:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar webhook' },
      { status: 500 }
    );
  }
}
