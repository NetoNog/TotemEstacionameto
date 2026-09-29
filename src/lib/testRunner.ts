import { calcularTarifa, DEFAULT_TARIFA } from './tariffCalculator';
import { Ticket } from '../types/parking';

function runTests() {
  console.log('--- Iniciando Testes de Regras de Negócio de Tarifas ---');
  let passed = 0;
  let failed = 0;

  const now = new Date();

  const assertEqual = (actual: unknown, expected: unknown, testName: string) => {
    if (actual === expected) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} - Esperado: ${expected}, Obtido: ${actual}`);
      failed++;
    }
  };

  // Teste 1: Tolerância Gratuita (10 minutos)
  const ticketTolerancia: Ticket = {
    id: 'test-1',
    placa: 'BRA2E19',
    horarioEntrada: new Date(now.getTime() - 10 * 60 * 1000).toISOString(),
    status: 'PENDENTE',
    valorTotal: 0,
  };
  const calc1 = calcularTarifa(ticketTolerancia, DEFAULT_TARIFA, now);
  assertEqual(calc1.dentroTolerancia, true, 'Deve identificar dentro da tolerância');
  assertEqual(calc1.isento, true, 'Deve conceder isenção');
  assertEqual(calc1.valorCalculado, 0, 'Valor calculado deve ser R$ 0,00');

  // Teste 2: 1ª Hora (45 minutos)
  const ticket1Hora: Ticket = {
    id: 'test-2',
    placa: 'ABC1234',
    horarioEntrada: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
    status: 'PENDENTE',
    valorTotal: 0,
  };
  const calc2 = calcularTarifa(ticket1Hora, DEFAULT_TARIFA, now);
  assertEqual(calc2.isento, false, 'Não deve ser isento');
  assertEqual(calc2.valorCalculado, 12, 'Valor da 1ª hora deve ser R$ 12,00');

  // Teste 3: 1ª Hora + 1 fração de 30m (80 minutos)
  const ticketFracao1: Ticket = {
    id: 'test-3',
    placa: 'XYZ9876',
    horarioEntrada: new Date(now.getTime() - 80 * 60 * 1000).toISOString(),
    status: 'PENDENTE',
    valorTotal: 0,
  };
  const calc3 = calcularTarifa(ticketFracao1, DEFAULT_TARIFA, now);
  assertEqual(calc3.valorCalculado, 16, '80 minutos deve cobrar 1ª hora (12) + 1 fração (4) = R$ 16,00');

  // Teste 4: 1ª Hora + 3 frações (135 minutos = 2h 15m)
  const ticketFracao3: Ticket = {
    id: 'test-4',
    placa: 'XYZ9876',
    horarioEntrada: new Date(now.getTime() - 135 * 60 * 1000).toISOString(),
    status: 'PENDENTE',
    valorTotal: 0,
  };
  const calc4 = calcularTarifa(ticketFracao3, DEFAULT_TARIFA, now);
  assertEqual(calc4.valorCalculado, 24, '135 min deve cobrar 12 + (3 * 4) = R$ 24,00');

  // Teste 5: Teto Diário (10 horas = 600 minutos)
  const ticketTeto: Ticket = {
    id: 'test-5',
    placa: 'KTM4G88',
    horarioEntrada: new Date(now.getTime() - 600 * 60 * 1000).toISOString(),
    status: 'PENDENTE',
    valorTotal: 0,
  };
  const calc5 = calcularTarifa(ticketTeto, DEFAULT_TARIFA, now);
  assertEqual(calc5.atingiuTetoDiario, true, 'Deve indicar que atingiu o teto diário');
  assertEqual(calc5.valorCalculado, 45, 'Valor deve ser limitado ao teto de R$ 45,00');

  // Teste 6: Ticket já pago dentro da tolerância de saída (+10 min restantes)
  const ticketPago: Ticket = {
    id: 'test-6',
    placa: 'RIO1B22',
    horarioEntrada: new Date(now.getTime() - 90 * 60 * 1000).toISOString(),
    horarioPagamento: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
    toleranciaSaidaAte: new Date(now.getTime() + 10 * 60 * 1000).toISOString(),
    status: 'PAGO',
    valorTotal: 16,
  };
  const calc6 = calcularTarifa(ticketPago, DEFAULT_TARIFA, now);
  assertEqual(calc6.jaPago, true, 'Deve identificar como já pago');
  assertEqual(calc6.saidaLiberada, true, 'Deve estar com saída liberada');
  assertEqual(calc6.valorCalculado, 0, 'Valor a pagar deve ser zero para saída liberada');

  console.log(`\nResultado dos Testes: ${passed} passaram, ${failed} falharam.`);
  if (failed > 0) process.exit(1);
}

runTests();
