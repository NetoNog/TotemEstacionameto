import { buscarTicketPorLeitura, obterTarifa } from '@/lib/db';
import { calcularTarifa } from '@/lib/tariffCalculator';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const termo = searchParams.get('codigo') || searchParams.get('ticket') || searchParams.get('placa');

    if (!termo || typeof termo !== 'string' || termo.trim().length === 0) {
      return NextResponse.json(
        { error: 'Código ou ticket não informado', encontrado: false },
        { status: 400 }
      );
    }

    if (termo.length > 32) {
      return NextResponse.json(
        { error: 'Código inválido. Tamanho excede o limite permitido de 32 caracteres.', encontrado: false },
        { status: 400 }
      );
    }

    const ticket = await buscarTicketPorLeitura(termo);

    if (!ticket) {
      return NextResponse.json(
        {
          encontrado: false,
          error: `Ticket não localizado para o código "${termo}". Aproxime novamente na leitora.`,
          termo,
        },
        { status: 200 }
      );
    }

    const tarifa = await obterTarifa();
    const calculo = calcularTarifa(ticket, tarifa);

    return NextResponse.json({
      encontrado: true,
      ticket,
      calculo,
      tarifa,
    });
  } catch (error) {
    console.error('Erro ao consultar ticket:', error);
    return NextResponse.json(
      { error: 'Erro interno ao consultar ticket', encontrado: false },
      { status: 500 }
    );
  }
}
