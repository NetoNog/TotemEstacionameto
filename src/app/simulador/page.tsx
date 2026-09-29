'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  RefreshCw,
  Clock,
  ExternalLink,
  Sliders,
  CheckCircle2,
  ScanLine
} from 'lucide-react';
import { TarifaConfig, Ticket } from '@/types/parking';
import { formatarMoeda } from '@/lib/tariffCalculator';
import { sound } from '@/lib/soundEffects';
import { BrandLogo } from '@/components/ui/BrandLogo';

interface TicketWithCalculo extends Ticket {
  calculo?: {
    tempoFormatado: string;
    valorCalculado: number;
    isento: boolean;
    jaPago: boolean;
  };
}

export default function SimuladorPage() {
  const [tickets, setTickets] = useState<TicketWithCalculo[]>([]);
  const [tarifa, setTarifa] = useState<TarifaConfig | null>(null);
  const [novaPlaca, setNovaPlaca] = useState('');
  const [minutosAtras, setMinutosAtras] = useState<number>(30);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const carregarDados = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/tickets');
      const data = await res.json();
      setTickets(data.tickets || []);
      setTarifa(data.tarifa || null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const res = await fetch('/api/tickets');
        const data = await res.json();
        if (!ignore) {
          setTickets(data.tickets || []);
          setTarifa(data.tarifa || null);
        }
      } catch (err) {
        console.error(err);
      }
    }
    void init();
    return () => {
      ignore = true;
    };
  }, []);

  const handleCriarVeiculo = async (placaCustom?: string, mins?: number) => {
    const p = (placaCustom || novaPlaca).toUpperCase().replace(/[^A-Z0-9]/g, '');
    const m = mins !== undefined ? mins : minutosAtras;

    if (!p || p.length < 5) {
      alert('Digite uma placa válida com pelo menos 5 caracteres.');
      return;
    }

    sound.playKeyClick();
    setIsLoading(true);

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placa: p, minutosAtras: m }),
      });

      const data = await res.json();
      if (res.ok) {
        sound.playSuccessSound();
        setFeedback(`Ticket #${data.ticket.codigoTicket || data.ticket.id} emitido na cancela de entrada.`);
        setNovaPlaca('');
        await carregarDados();
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch (err) {
      console.error(err);
      sound.playErrorSound();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSalvarTarifas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tarifa) return;
    sound.playKeyClick();
    setIsLoading(true);

    try {
      const res = await fetch('/api/tarifas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': 'totem-admin-secret-2026',
        },
        body: JSON.stringify(tarifa),
      });

      if (res.ok) {
        sound.playSuccessSound();
        setFeedback('Regras tarifárias salvas com sucesso.');
        await carregarDados();
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const quickScenarios = [
    { label: 'Entrada há 8 min (Tolerância Gratuita)', mins: 8, placa: 'TOL0A15' },
    { label: 'Entrada há 48 min (1ª Hora)', mins: 48, placa: 'HOR1A00' },
    { label: 'Entrada há 1h 45m (1ª Hora + Frações)', mins: 105, placa: 'FRA2B30' },
    { label: 'Entrada há 8h (Teto Diário)', mins: 480, placa: 'TET8D00' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 sm:p-10 font-sans">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        {/* Header Minimalista */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-900">
          <div className="flex items-center gap-3">
            <Link
              href="/totem"
              className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-3">
              <BrandLogo size="sm" layout="icon-only" />
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-zinc-100 flex items-center gap-2">
                  <span>Painel de Controle & Simulador</span>
                </h1>
                <p className="text-xs text-zinc-500 font-mono mt-0.5">
                  SMARTPARK ENTERPRISE • Emissão de tickets e auditoria tarifária
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={carregarDados}
              disabled={isLoading}
              className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>

            <Link
              href="/totem"
              className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs flex items-center gap-2 transition-colors"
            >
              <span>Abrir Totem</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 flex items-center gap-2.5 text-xs">
            <CheckCircle2 className="w-4 h-4 text-zinc-400 flex-none" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Grid de Emissão de Tickets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cenários Rápidos */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-400" />
              <span>Simular Entrada Rápida</span>
            </h2>
            <p className="text-xs text-zinc-500">
              Gere tickets com tempos pré-estabelecidos para testar a leitora do totem:
            </p>

            <div className="flex flex-col gap-2 mt-1">
              {quickScenarios.map((scen) => (
                <button
                  key={scen.placa}
                  type="button"
                  onClick={() => handleCriarVeiculo(scen.placa, scen.mins)}
                  className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-left transition-all flex items-center justify-between text-xs cursor-pointer"
                >
                  <div>
                    <span className="font-medium text-zinc-200 block">{scen.label}</span>
                    <span className="text-[11px] font-mono text-zinc-500">Placa: {scen.placa}</span>
                  </div>
                  <Plus className="w-3.5 h-3.5 text-zinc-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Emissão Customizada */}
          <div className="md:col-span-2 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-2 mb-1">
                <ScanLine className="w-4 h-4 text-zinc-400" />
                <span>Emitir Novo Ticket Personalizado</span>
              </h2>
              <p className="text-xs text-zinc-500 mb-5">
                Simula o ticket impresso ao entrar no estacionamento:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 font-mono uppercase mb-2">
                    Placa do Veículo
                  </label>
                  <input
                    type="text"
                    value={novaPlaca}
                    onChange={(e) => setNovaPlaca(e.target.value.toUpperCase())}
                    placeholder="Ex: ABC1234 ou BRA2E19"
                    maxLength={7}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono text-sm uppercase focus:outline-none focus:border-zinc-600"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 font-mono uppercase mb-2">
                    Minutos decorridos
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={0}
                      max={1440}
                      value={minutosAtras}
                      onChange={(e) => setMinutosAtras(Number(e.target.value))}
                      className="w-28 px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono text-sm focus:outline-none focus:border-zinc-600"
                    />
                    <span className="text-xs text-zinc-500 font-mono">
                      {Math.floor(minutosAtras / 60)}h {minutosAtras % 60}m atrás
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                disabled={isLoading || !novaPlaca}
                onClick={() => handleCriarVeiculo()}
                className="px-5 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-40"
              >
                <Plus className="w-4 h-4" />
                <span>Emitir Ticket</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabela de Tickets */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-200">
              Tickets no Estacionamento ({tickets.length})
            </h2>
            <span className="text-xs font-mono text-zinc-500">
              Validade pós-pagamento: 20 min
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-xs font-mono text-zinc-500 uppercase">
                  <th className="py-2.5 px-3">Ticket</th>
                  <th className="py-2.5 px-3">Placa</th>
                  <th className="py-2.5 px-3">Permanência</th>
                  <th className="py-2.5 px-3">Valor</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-xs font-mono">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-zinc-900/40">
                    <td className="py-3 px-3 text-zinc-200 font-bold">
                      #{t.codigoTicket || t.id.slice(0, 6)}
                    </td>
                    <td className="py-3 px-3 text-zinc-300">
                      {t.placa}
                    </td>
                    <td className="py-3 px-3 text-zinc-300">
                      {t.calculo?.tempoFormatado || '...'}
                    </td>
                    <td className="py-3 px-3 text-zinc-200 font-bold">
                      {t.calculo ? formatarMoeda(t.calculo.valorCalculado) : '...'}
                    </td>
                    <td className="py-3 px-3">
                      {t.status === 'PAGO' ? (
                        <span className="text-zinc-400">Pago (Saída 20m)</span>
                      ) : t.calculo?.isento ? (
                        <span className="text-zinc-400">Tolerância Grátis</span>
                      ) : (
                        <span className="text-zinc-500">Pendente</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href="/totem"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
                      >
                        <span>Ler no Totem</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Configurações de Tarifas */}
        {tarifa && (
          <form
            onSubmit={handleSalvarTarifas}
            className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-zinc-400" />
                <span>Configuração de Tarifas</span>
              </h2>
              <span className="text-xs font-mono text-zinc-500">Validade Cancela: {tarifa.toleranciaSaidaMin} min</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div>
                <label className="block text-zinc-500 font-mono mb-1">Tolerância (min)</label>
                <input
                  type="number"
                  value={tarifa.toleranciaMinutos}
                  onChange={(e) => setTarifa({ ...tarifa, toleranciaMinutos: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-500 font-mono mb-1">1ª Hora (R$)</label>
                <input
                  type="number"
                  step="0.50"
                  value={tarifa.valorPrimeiraHora}
                  onChange={(e) => setTarifa({ ...tarifa, valorPrimeiraHora: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-500 font-mono mb-1">Fração Adic. (R$)</label>
                <input
                  type="number"
                  step="0.50"
                  value={tarifa.valorHoraAdicional}
                  onChange={(e) => setTarifa({ ...tarifa, valorHoraAdicional: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-500 font-mono mb-1">Teto Diário (R$)</label>
                <input
                  type="number"
                  step="1.00"
                  value={tarifa.tetoDiario}
                  onChange={(e) => setTarifa({ ...tarifa, tetoDiario: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-500 font-mono mb-1">Validade Saída (min)</label>
                <input
                  type="number"
                  value={tarifa.toleranciaSaidaMin}
                  onChange={(e) => setTarifa({ ...tarifa, toleranciaSaidaMin: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs cursor-pointer transition-colors"
              >
                Salvar Regras
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
