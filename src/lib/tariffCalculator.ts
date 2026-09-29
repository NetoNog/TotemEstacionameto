import { CalculoTarifa, TarifaConfig, Ticket } from '@/types/parking';

export const DEFAULT_TARIFA: TarifaConfig = {
  id: 'default',
  nomeEstacionamento: 'Estacionamento Rotativo',
  toleranciaMinutos: 15,
  valorPrimeiraHora: 12.00,
  valorHoraAdicional: 4.00,
  fracaoMinutos: 30, // Fração adicional a cada 30 minutos
  tetoDiario: 45.00,
  toleranciaSaidaMin: 20, // 20 minutos de validade após o pagamento na cancela
};

/**
 * Formata um valor numérico em Real Brasileiro (BRL)
 */
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

/**
 * Formata minutos em formato legível (Ex: "1h 45min", "45min")
 */
export function formatarDuracao(minutos: number): string {
  if (minutos < 60) {
    return `${minutos} min`;
  }
  const horas = Math.floor(minutos / 60);
  const minsRestantes = minutos % 60;
  return `${horas}h ${minsRestantes.toString().padStart(2, '0')}min`;
}

/**
 * Normaliza e valida identificadores de tickets e placas
 */
export function normalizarIdentificador(input: unknown): string {
  const safeStr = typeof input === 'string' ? input : String(input ?? '');
  return safeStr.toUpperCase().replace(/[^A-Z0-9-]/g, '');
}

export function normalizarPlaca(placa: unknown): string {
  const safeStr = typeof placa === 'string' ? placa : String(placa ?? '');
  return safeStr.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function validarFormatoPlaca(placa: unknown): { valida: boolean; tipo: 'MERCOSUL' | 'TRADICIONAL' | 'INVALIDA'; formatada: string } {
  const limpa = normalizarPlaca(placa);

  const regexMercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;
  if (regexMercosul.test(limpa)) {
    return { valida: true, tipo: 'MERCOSUL', formatada: limpa };
  }

  const regexTradicional = /^[A-Z]{3}[0-9]{4}$/;
  if (regexTradicional.test(limpa)) {
    return { valida: true, tipo: 'TRADICIONAL', formatada: `${limpa.slice(0, 3)}-${limpa.slice(3)}` };
  }

  return { valida: false, tipo: 'INVALIDA', formatada: limpa };
}

/**
 * Calcula a permanência e a tarifa devida
 */
export function calcularTarifa(
  ticket: Ticket,
  tarifa: TarifaConfig = DEFAULT_TARIFA,
  dataReferencia: Date = new Date()
): CalculoTarifa {
  const rawEntrada = new Date(ticket.horarioEntrada);
  const entrada = isNaN(rawEntrada.getTime()) ? new Date() : rawEntrada;
  const ref = isNaN(dataReferencia.getTime()) ? new Date() : dataReferencia;
  const diffMs = Math.max(0, ref.getTime() - entrada.getTime());
  const tempoMinutos = Math.floor(diffMs / (1000 * 60));
  const tempoFormatado = formatarDuracao(tempoMinutos);

  // Verifica se o ticket já foi pago e está no período de tolerância de saída (20 min)
  if (ticket.status === 'PAGO' && ticket.toleranciaSaidaAte) {
    const limiteSaida = new Date(ticket.toleranciaSaidaAte);
    const msRestantes = limiteSaida.getTime() - dataReferencia.getTime();
    const minutosRestantes = Math.ceil(msRestantes / (1000 * 60));

    if (minutosRestantes >= 0) {
      return {
        tempoMinutos,
        tempoFormatado,
        dentroTolerancia: false,
        isento: false,
        valorPrimeiraHora: 0,
        valorAdicional: 0,
        atingiuTetoDiario: false,
        valorCalculado: 0,
        jaPago: true,
        saidaLiberada: true,
        minutosRestantesSaida: minutosRestantes,
        descricaoRegra: [
          'Pagamento já efetuado',
          `Você tem ${minutosRestantes} minuto(s) para validar o ticket na máquina da cancela.`,
        ],
      };
    }
  }

  // Tolerância gratuita inicial (até 15 minutos)
  if (tempoMinutos <= tarifa.toleranciaMinutos) {
    return {
      tempoMinutos,
      tempoFormatado,
      dentroTolerancia: true,
      isento: true,
      valorPrimeiraHora: 0,
      valorAdicional: 0,
      atingiuTetoDiario: false,
      valorCalculado: 0,
      jaPago: false,
      saidaLiberada: true,
      minutosRestantesSaida: tarifa.toleranciaMinutos - tempoMinutos,
      descricaoRegra: [
        `Tolerância de ${tarifa.toleranciaMinutos} minutos`,
        'Saída autorizada sem cobrança na cancela.',
      ],
    };
  }

  // Cobrança
  const regras: string[] = [];
  let valorFinal = 0;
  let atingiuTeto = false;

  if (tempoMinutos <= 60) {
    valorFinal = tarifa.valorPrimeiraHora;
    regras.push(`1ª Hora: ${formatarMoeda(tarifa.valorPrimeiraHora)}`);
  } else {
    const minutosExcedentes = tempoMinutos - 60;
    const blocosAdicionais = Math.ceil(minutosExcedentes / tarifa.fracaoMinutos);
    const valorAdicional = blocosAdicionais * tarifa.valorHoraAdicional;

    regras.push(`1ª Hora: ${formatarMoeda(tarifa.valorPrimeiraHora)}`);
    regras.push(
      `${blocosAdicionais} fração(ões) de ${tarifa.fracaoMinutos}min: ${formatarMoeda(valorAdicional)}`
    );

    valorFinal = tarifa.valorPrimeiraHora + valorAdicional;
  }

  if (valorFinal >= tarifa.tetoDiario) {
    valorFinal = tarifa.tetoDiario;
    atingiuTeto = true;
    regras.push(`Teto diário: ${formatarMoeda(tarifa.tetoDiario)}`);
  }

  return {
    tempoMinutos,
    tempoFormatado,
    dentroTolerancia: false,
    isento: false,
    valorPrimeiraHora: tarifa.valorPrimeiraHora,
    valorAdicional: valorFinal - tarifa.valorPrimeiraHora,
    atingiuTetoDiario: atingiuTeto,
    valorCalculado: valorFinal,
    jaPago: false,
    saidaLiberada: false,
    descricaoRegra: regras,
  };
}
