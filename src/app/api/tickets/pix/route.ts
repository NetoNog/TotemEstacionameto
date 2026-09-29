import { buscarTicketPorId, obterTarifa } from '@/lib/db';
import { calcularTarifa } from '@/lib/tariffCalculator';
import { pixService } from '@/lib/payments/pix/pixService';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Gera Cobrança PIX com QR Code de Alta Resolução e Código Copia-e-Cola Oficial Bacen
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || !body.ticketId) {
      return NextResponse.json(
        { error: 'Parâmetro ticketId é obrigatório' },
        { status: 400 }
      );
    }

    const { ticketId } = body;
    const ticket = await buscarTicketPorId(ticketId);

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket não encontrado' },
        { status: 404 }
      );
    }

    const tarifa = await obterTarifa();
    const calculo = calcularTarifa(ticket, tarifa);

    // Se o valor for 0 (isento), não gera cobrança bancária
    if (calculo.isento || calculo.valorCalculado <= 0) {
      return NextResponse.json({
        isento: true,
        mensagem: 'Ticket dentro do período de carência. Não há valor a pagar.',
      });
    }

    const pixCharge = await pixService.gerarCobrancaPix(ticket, calculo.valorCalculado);

    return NextResponse.json({
      sucesso: true,
      ticketId: ticket.id,
      valor: calculo.valorCalculado,
      copiaECola: pixCharge.copiaECola,
      qrCodeBase64: pixCharge.qrCodeBase64,
      txid: pixCharge.txid,
      beneficiario: pixCharge.beneficiario,
      expiraEm: pixCharge.expiraEm,
    });
  } catch (error) {
    console.error('Erro ao gerar cobrança PIX:', error);
    return NextResponse.json(
      { error: 'Falha ao gerar cobrança PIX' },
      { status: 500 }
    );
  }
}
