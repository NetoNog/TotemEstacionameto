'use client';

import React from 'react';
import { Clock, Calendar, CheckCircle2, ArrowRight, ArrowLeft, ShieldCheck, DollarSign, Info } from 'lucide-react';
import { CalculoTarifa, TarifaConfig, Ticket } from '@/types/parking';
import { PlateBadge } from '../ui/PlateBadge';
import { formatarMoeda } from '@/lib/tariffCalculator';
import { sound } from '@/lib/soundEffects';

interface TicketSummaryProps {
  ticket: Ticket;
  calculo: CalculoTarifa;
  tarifa: TarifaConfig;
  onProceedPayment: () => void;
  onFreeRelease: () => void;
  onBack: () => void;
}

export const TicketSummary: React.FC<TicketSummaryProps> = ({
  ticket,
  calculo,
  tarifa,
  onProceedPayment,
  onFreeRelease,
  onBack,
}) => {
  const entrada = new Date(ticket.horarioEntrada);
  const entradaFormatada = entrada.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const dataEntradaFormatada = entrada.toLocaleDateString('pt-BR');

  const agora = new Date();
  const agoraFormatada = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-between min-h-[calc(100vh-100px)] py-4 px-4 select-none">
      {/* Topo com botão voltar */}
      <div className="w-full flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => {
            sound.playKeyClear();
            onBack();
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95 transition-all text-sm font-bold cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Consultar Outra Placa</span>
        </button>

        <div className="flex items-center gap-2 bg-blue-950/60 border border-blue-800/50 px-4 py-2 rounded-2xl text-xs text-blue-300">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>Ticket Ativo</span>
        </div>
      </div>

      {/* Cartão Principal de Resumo do Veículo */}
      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl flex flex-col gap-6">
        {/* Cabeçalho do Cartão: Placa e Status */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <PlateBadge placa={ticket.placa} size="lg" />
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Identificador do Ticket</span>
              <p className="font-mono text-sm text-slate-300 font-bold">#{ticket.id.slice(0, 12).toUpperCase()}</p>
            </div>
          </div>

          <div>
            {calculo.isento ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                DENTRO DA TOLERÂNCIA (ISENTO)
              </span>
            ) : calculo.jaPago ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                PAGAMENTO JÁ REALIZADO
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold text-sm">
                <Clock className="w-5 h-5" />
                PAGAMENTO PENDENTE
              </span>
            )}
          </div>
        </div>

        {/* Métricas de Tempo: Entrada, Consulta e Duração */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Horário de Entrada</p>
              <p className="text-xl font-mono font-bold text-white">{entradaFormatada}</p>
              <p className="text-[11px] text-slate-500">{dataEntradaFormatada}</p>
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-700/60 text-slate-300 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Horário da Consulta</p>
              <p className="text-xl font-mono font-bold text-white">{agoraFormatada}</p>
              <p className="text-[11px] text-slate-500">Tempo real</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-950/40 to-slate-800/80 border border-blue-500/30 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-blue-300 font-semibold">Tempo de Permanência</p>
              <p className="text-2xl font-mono font-black text-white">{calculo.tempoFormatado}</p>
              <p className="text-[11px] text-blue-400 font-medium">{calculo.tempoMinutos} minutos totais</p>
            </div>
          </div>
        </div>

        {/* Detalhamento das Regras de Cobrança */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Info className="w-4 h-4 text-blue-400" />
            <span>Detalhamento da Tarifa ({tarifa.nomeEstacionamento})</span>
          </div>

          <ul className="space-y-2 text-sm text-slate-300">
            {calculo.descricaoRegra.map((regra, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-none"></span>
                <span>{regra}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Destaque do Valor Total a Pagar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 border border-slate-700/60 shadow-inner">
          <div>
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              {calculo.isento ? 'Status de Cobrança' : 'Valor Total a Pagar'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                {formatarMoeda(calculo.valorCalculado)}
              </span>
              {calculo.isento && (
                <span className="text-sm font-bold text-emerald-400">(Tolerância Gratuita)</span>
              )}
            </div>
          </div>

          {/* Botão de Ação Primária */}
          {calculo.isento || calculo.jaPago ? (
            <button
              type="button"
              onClick={() => {
                sound.playSuccessSound();
                onFreeRelease();
              }}
              className="w-full sm:w-auto px-8 py-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xl tracking-wide shadow-xl shadow-emerald-600/30 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <span>LIBERAR SAÍDA NA CANCELA</span>
              <ArrowRight className="w-6 h-6" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                sound.playKeyClick();
                onProceedPayment();
              }}
              className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white font-black text-xl tracking-wide shadow-2xl shadow-blue-600/40 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer animate-pulse"
            >
              <DollarSign className="w-7 h-7" />
              <span>PAGAR AGORA</span>
              <ArrowRight className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
