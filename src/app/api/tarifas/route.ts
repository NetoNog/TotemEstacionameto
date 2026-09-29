import { atualizarTarifa, obterTarifa } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const tarifa = await obterTarifa();
    return NextResponse.json(tarifa);
  } catch (error) {
    console.error('Erro ao obter tarifas:', error);
    return NextResponse.json({ error: 'Erro ao obter configurações de tarifa' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Autenticação de Segurança Administrativa
    const adminKey = request.headers.get('x-admin-key');
    const expectedKey = process.env.ADMIN_API_KEY || 'totem-admin-secret-2026';

    if (!adminKey || adminKey !== expectedKey) {
      return NextResponse.json(
        { error: 'Não autorizado. Forneça uma chave administrativa válida no cabeçalho x-admin-key.' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Payload JSON inválido' }, { status: 400 });
    }

    // Validações de limites e regras de negócio para impedir tarifas negativas ou exorbitantes
    if (body.toleranciaMinutos !== undefined) {
      if (typeof body.toleranciaMinutos !== 'number' || !Number.isFinite(body.toleranciaMinutos) || body.toleranciaMinutos < 0 || body.toleranciaMinutos > 120) {
        return NextResponse.json({ error: 'toleranciaMinutos deve ser um número entre 0 e 120 minutos.' }, { status: 400 });
      }
    }

    if (body.valorPrimeiraHora !== undefined) {
      if (typeof body.valorPrimeiraHora !== 'number' || !Number.isFinite(body.valorPrimeiraHora) || body.valorPrimeiraHora < 0 || body.valorPrimeiraHora > 500) {
        return NextResponse.json({ error: 'valorPrimeiraHora deve ser um valor positivo de até R$ 500,00.' }, { status: 400 });
      }
    }

    if (body.valorHoraAdicional !== undefined) {
      if (typeof body.valorHoraAdicional !== 'number' || !Number.isFinite(body.valorHoraAdicional) || body.valorHoraAdicional < 0 || body.valorHoraAdicional > 500) {
        return NextResponse.json({ error: 'valorHoraAdicional deve ser um valor positivo de até R$ 500,00.' }, { status: 400 });
      }
    }

    if (body.tetoDiario !== undefined) {
      if (typeof body.tetoDiario !== 'number' || !Number.isFinite(body.tetoDiario) || body.tetoDiario < 0 || body.tetoDiario > 5000) {
        return NextResponse.json({ error: 'tetoDiario deve ser um valor positivo de até R$ 5.000,00.' }, { status: 400 });
      }
    }

    if (body.toleranciaSaidaMin !== undefined) {
      if (typeof body.toleranciaSaidaMin !== 'number' || !Number.isFinite(body.toleranciaSaidaMin) || body.toleranciaSaidaMin < 5 || body.toleranciaSaidaMin > 120) {
        return NextResponse.json({ error: 'toleranciaSaidaMin deve ser um número entre 5 e 120 minutos.' }, { status: 400 });
      }
    }

    const atualizada = await atualizarTarifa(body);
    return NextResponse.json({ sucesso: true, tarifa: atualizada });
  } catch (error) {
    console.error('Erro ao atualizar tarifas:', error);
    return NextResponse.json({ error: 'Erro ao atualizar configurações de tarifa' }, { status: 500 });
  }
}
