'use client';

import React from 'react';
import { Printer } from 'lucide-react';
import { Ticket } from '@/types/parking';
import { formatarMoeda } from '@/lib/tariffCalculator';
import { sound } from '@/lib/soundEffects';

interface ThermalPrinterSlotProps {
  ticket: Ticket;
  isPrinting: boolean;
  isPrinted: boolean;
  onTakePaper?: () => void;
}

export const ThermalPrinterSlot: React.FC<ThermalPrinterSlotProps> = ({
  ticket,
  isPrinting,
  isPrinted,
  onTakePaper,
}) => {
  const ultimoPagamento = ticket.pagamentos && ticket.pagamentos.length > 0
    ? ticket.pagamentos[ticket.pagamentos.length - 1]
    : null;

  return (
    <div className="w-full flex flex-col items-center select-none my-3">
      {/* Moldura do Compartimento Físico da Impressora */}
      <div className="w-full max-w-xs bg-zinc-900 border-2 border-zinc-800 rounded-2xl p-3 shadow-2xl flex flex-col items-center">
        {/* Barra de Status do LED da Impressora */}
        <div className="w-full flex items-center justify-between px-2 pb-2 text-[10px] font-mono text-zinc-400">
          <div className="flex items-center gap-1.5">
            <Printer className="w-3.5 h-3.5 text-zinc-400" />
            <span className="uppercase font-semibold">Compartimento Térmico</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${
              isPrinting ? 'bg-emerald-400 animate-ping' : isPrinted ? 'bg-emerald-400' : 'bg-zinc-600'
            }`} />
            <span className="uppercase font-mono text-[9px] text-zinc-400">
              {isPrinting ? 'IMPRIMINDO' : isPrinted ? 'DISPONÍVEL' : 'STANDBY'}
            </span>
          </div>
        </div>

        {/* Fenda da Saída de Papel (Slit) */}
        <div className="w-full h-3 bg-zinc-950 border-y border-zinc-800/90 rounded-sm relative overflow-visible flex justify-center items-center shadow-inner">
          {/* Seta indicativa para retirar papel */}
          {isPrinted && (
            <div className="absolute -top-5 text-[9px] font-mono text-emerald-400 animate-bounce">
              ▼ PUXE O COMPROVANTE ▼
            </div>
          )}
        </div>

        {/* Papel Térmico Ejetado com Animação Fluida */}
        {(isPrinting || isPrinted) && (
          <div
            onClick={() => {
              sound.playKeyClick();
              if (onTakePaper) onTakePaper();
            }}
            className="animate-paper-feed w-full max-w-[260px] bg-zinc-100 text-zinc-950 p-4 rounded-b-lg shadow-2xl cursor-pointer hover:opacity-95 transition-all mt-1 relative overflow-hidden font-mono text-xs border border-zinc-300"
          >
            {/* Topo Serrilhado */}
            <div className="absolute top-0 left-0 right-0 h-2 receipt-serrated opacity-40" />

            <div className="text-center pt-2">
              <div className="font-extrabold text-[11px] uppercase tracking-wider">
                SMARTPARK ESTACIONAMENTO
              </div>
              <div className="text-[9px] text-zinc-600">
                DANFE NFC-e • COMPROVANTE FISCAL
              </div>
            </div>

            <div className="my-2 border-t border-dashed border-zinc-400" />

            <div className="space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span className="text-zinc-600">Ticket:</span>
                <span className="font-bold">#{ticket.codigoTicket || ticket.id.slice(0, 8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Placa:</span>
                <span className="font-bold">{ticket.placa || 'Sem placa'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Entrada:</span>
                <span>{new Date(ticket.horarioEntrada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Pagamento:</span>
                <span>{ultimoPagamento?.metodo || 'PIX'}</span>
              </div>
              <div className="flex justify-between pt-1 font-bold text-xs border-t border-zinc-300">
                <span>TOTAL PAGO:</span>
                <span>{formatarMoeda(ticket.valorTotal)}</span>
              </div>
            </div>

            <div className="my-2 border-t border-dashed border-zinc-400" />

            <div className="text-center text-[9px] text-zinc-700">
              <div className="font-bold text-[10px] text-zinc-950">
                VALIDADE NA CANCELA: 20 MIN
              </div>
              <div>Obrigado e tenha uma boa viagem!</div>
            </div>

            {/* Fundo Serrilhado */}
            <div className="absolute bottom-0 left-0 right-0 h-2 receipt-serrated opacity-40 rotate-180" />
          </div>
        )}
      </div>
    </div>
  );
};
