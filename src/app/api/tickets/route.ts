import { criarTicket, listarTodosTickets, obterTarifa } from '@/lib/db';
import { calcularTarifa, normalizarPlaca } from '@/lib/tariffCalculator';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const tickets = await listarTodosTickets();
    const tarifa = await obterTarifa();

    // Adiciona o cálculo em tempo real para cada ticket
    const ticketsComCalculo = tickets.map((ticket) => ({
      ...ticket,
      calculo: calcularTarifa(ticket, tarifa),
    }));

    return NextResponse.json({
      tickets: ticketsComCalculo,
      tarifa,
    });
  } catch (error) {
    console.error('Erro ao listar tickets:', error);
    return NextResponse.json({ error: 'Erro ao listar tickets' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Payload JSON inválido' }, { status: 400 });
    }

    const { placa, minutosAtras } = body;

    if (!placa || typeof placa !== 'string' || placa.trim().length < 3 || placa.trim().length > 10) {
      return NextResponse.json(
        { error: 'Placa inválida. Forneça uma string entre 3 e 10 caracteres.' },
        { status: 400 }
      );
    }

    const placaLimpa = normalizarPlaca(placa);
    if (!placaLimpa) {
      return NextResponse.json({ error: 'Placa inválida após higienização.' }, { status: 400 });
    }

    let horarioEntrada = new Date();

    if (minutosAtras !== undefined && minutosAtras !== null) {
      if (typeof minutosAtras !== 'number' || !Number.isFinite(minutosAtras) || minutosAtras < 0 || minutosAtras > 525600) {
        return NextResponse.json(
          { error: 'Parâmetro minutosAtras inválido. Deve ser um número finito entre 0 e 525600.' },
          { status: 400 }
        );
      }
      horarioEntrada = new Date(Date.now() - minutosAtras * 60 * 1000);
    }

    const novoTicket = await criarTicket(placaLimpa, horarioEntrada);
    const tarifa = await obterTarifa();
    const calculo = calcularTarifa(novoTicket, tarifa);

    return NextResponse.json(
      {
        sucesso: true,
        ticket: novoTicket,
        calculo,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar ticket:', error);
    return NextResponse.json({ error: 'Erro ao criar ticket' }, { status: 500 });
  }
}
