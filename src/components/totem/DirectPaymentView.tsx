'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  QrCode,
  CreditCard,
  Loader2,
  CheckCircle2,
  Clock,
  Zap,
  Radio,
  ShieldCheck,
  Smartphone,
  ChevronRight,
  Receipt,
  Copy
} from 'lucide-react';
import { CalculoTarifa, MetodoPagamento, Ticket } from '@/types/parking';
import { formatarMoeda } from '@/lib/tariffCalculator';
import { sound } from '@/lib/soundEffects';
import { Language, translations } from '@/lib/translations';
import { speechVoice } from '@/lib/speechVoice';
import { PlateBadge } from '../ui/PlateBadge';
import { pixService } from '@/lib/payments/pix/pixService';
import { tefBridge } from '@/lib/payments/tef/tefBridge';

interface DirectPaymentViewProps {
  ticket: Ticket;
  calculo: CalculoTarifa;
  onPay: (metodo: MetodoPagamento) => Promise<void>;
  onFreeRelease: () => void;
  onCancel: () => void;
  isLoading: boolean;
  lang?: Language;
}

export const DirectPaymentView: React.FC<DirectPaymentViewProps> = ({
  ticket,
  calculo,
  onPay,
  onFreeRelease,
  onCancel,
  isLoading,
  lang = 'pt',
}) => {
  const t = translations[lang].payment;
  const [selectedMethod, setSelectedMethod] = useState<MetodoPagamento>('PIX');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [pixCopiaECola, setPixCopiaECola] = useState<string>('');
  const [copiado, setCopiado] = useState(false);
  const [cardStage, setCardStage] = useState<'IDLE' | 'READING' | 'AUTHORIZING' | 'SUCCESS'>('IDLE');
  const [tefMessage, setTefMessage] = useState<string>('');

  const valor = Number(calculo.valorCalculado || 0);

  const handleCopiarPix = () => {
    if (pixCopiaECola && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(pixCopiaECola);
      sound.playKeyClick();
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    }
  };

  // Locução guiada por voz
  useEffect(() => {
    if (calculo.isento) {
      speechVoice.speak(translations[lang].voice.freeRelease, lang);
    } else {
      speechVoice.speak(
        translations[lang].voice.stayDue(calculo.tempoFormatado, formatarMoeda(valor)),
        lang
      );
    }
  }, [calculo.isento, calculo.tempoFormatado, valor, lang]);

  // Gera o QR Code oficial do PIX (Bacen EMVco com CRC16 válido)
  useEffect(() => {
    let isMounted = true;
    if (selectedMethod === 'PIX') {
      pixService
        .gerarCobrancaPix(ticket, valor)
        .then((charge) => {
          if (isMounted) {
            setQrCodeUrl(charge.qrCodeBase64);
            setPixCopiaECola(charge.copiaECola);
          }
        })
        .catch((err) => {
          console.error('Erro ao gerar cobrança PIX oficial:', err);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [selectedMethod, ticket, valor]);

  // Polling em tempo real para detectar recebimento do Pix ou liberação remota
  useEffect(() => {
    if (selectedMethod !== 'PIX') return;

    let cancelado = false;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/tickets/status?ticketId=${encodeURIComponent(ticket.id)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.pago && !cancelado) {
            cancelado = true;
            sound.playSuccessSound();
            await onPay('PIX');
          }
        }
      } catch {
        // Silencioso em caso de instabilidade pontual de rede
      }
    }, 2000);

    return () => {
      cancelado = true;
      clearInterval(interval);
    };
  }, [selectedMethod, ticket.id, onPay]);

  const handleSelectMethod = (metodo: MetodoPagamento) => {
    sound.playKeyClick();
    setSelectedMethod(metodo);
    setCardStage('IDLE');
    setTefMessage('');
  };

  const handlePayPix = async () => {
    sound.playSuccessSound();
    await onPay('PIX');
  };

  const handlePayCard = async () => {
    sound.playKeyClick();
    const tipo = selectedMethod === 'CARTAO_DEBITO' ? 'DEBITO' : 'CREDITO';
    setCardStage('READING');

    try {
      const result = await tefBridge.processarTransacao(
        tipo,
        valor,
        ticket.id,
        (step, msg) => {
          setTefMessage(msg);
          if (step === 'AUTORIZANDO') setCardStage('AUTHORIZING');
          if (step === 'APROVADO') setCardStage('SUCCESS');
        }
      );

      if (result.sucesso) {
        sound.playSuccessSound();
        await onPay(selectedMethod);
      }
    } catch (err) {
      console.error('Erro na transação TEF:', err);
      setCardStage('IDLE');
      setTefMessage('Erro na comunicação com o PinPad. Tente novamente.');
    }
  };

  const formatHora = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col justify-between min-h-[calc(100vh-120px)] py-4 px-4 sm:px-6 select-none animate-fadeIn">
      {/* Barra de Topo do Processo */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
        <button
          type="button"
          onClick={() => {
            sound.playKeyClear();
            onCancel();
          }}
          className="kiosk-btn-active flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-xs font-mono text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t.cancelAndBack}</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-zinc-500 uppercase">{t.activeSession}</span>
          <span className="text-zinc-200 font-bold px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
            #{ticket.codigoTicket || ticket.id.slice(0, 8)}
          </span>
        </div>
      </div>

      {/* Conteúdo Central */}
      <div className="my-auto py-4 flex flex-col gap-5">
        {/* Painel HUD Financeiro / Métricas de Permanência e Valor */}
        <div className="kiosk-panel rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Bloco 1: Permanência */}
            <div className="kiosk-card rounded-xl p-4 flex flex-col justify-between border border-zinc-800/80">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  {t.stayLabel}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950/80 text-zinc-400 border border-zinc-800">
                  {t.entryLabel} {formatHora(ticket.horarioEntrada)}
                </span>
              </div>
              <div className="mt-2">
                <span className="text-3xl sm:text-4xl font-mono font-extrabold text-zinc-100 tracking-tight">
                  {calculo.tempoFormatado}
                </span>
              </div>
              <div className="mt-3 pt-2 border-t border-zinc-850 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">{t.plateLabel}</span>
                  {ticket.placa ? (
                    <PlateBadge placa={ticket.placa} size="sm" />
                  ) : (
                    <span className="text-xs font-mono text-zinc-400">{t.noPlate}</span>
                  )}
                </div>
                <span className="text-[10px] font-mono text-zinc-500">{t.toleranceAfter}</span>
              </div>
            </div>

            {/* Bloco 2: Valor a Pagar */}
            <div className="kiosk-card rounded-xl p-4 flex flex-col justify-between border border-zinc-800/80 bg-zinc-900/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between relative z-10">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-zinc-400" />
                  {t.totalToPay}
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                  calculo.isento 
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                    : 'bg-zinc-950/80 text-zinc-300 border border-zinc-800'
                }`}>
                  {calculo.isento ? t.freeTolerance : t.rotaryTariff}
                </span>
              </div>
              <div className="mt-2 relative z-10">
                <span className={`text-3xl sm:text-4xl font-mono font-black tracking-tight ${
                  calculo.isento ? 'text-emerald-400' : 'text-zinc-100'
                }`}>
                  {formatarMoeda(valor)}
                </span>
              </div>
              <div className="text-[11px] text-zinc-500 mt-2 font-mono relative z-10">
                {calculo.isento 
                  ? t.freeDesc
                  : t.auditedCalc}
              </div>
            </div>
          </div>
        </div>

        {/* CENÁRIO 1: Isenção de Tolerância Gratuita */}
        {calculo.isento ? (
          <div className="kiosk-panel rounded-2xl p-6 text-center flex flex-col items-center border border-emerald-900/30">
            <div className="w-14 h-14 rounded-full bg-emerald-950/50 border border-emerald-800/60 flex items-center justify-center mb-3 text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-zinc-100">{t.freeTitle}</h3>
            <p className="text-xs text-zinc-400 mt-1.5 max-w-md">
              {t.freeDesc}
            </p>
            <button
              type="button"
              onClick={onFreeRelease}
              className="kiosk-btn-active mt-6 w-full max-w-sm py-4 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-sm tracking-wide cursor-pointer shadow-lg shadow-white/5 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t.freeButton}</span>
            </button>
          </div>
        ) : (
          /* CENÁRIO 2: Pagamento Obrigatório - 3 Métodos Solicitados */
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs uppercase tracking-wider text-zinc-400 font-mono font-semibold flex items-center gap-1.5">
                <span>{t.selectMethod}</span>
              </span>
              <span className="text-[11px] text-zinc-500 font-mono">
                {t.touchToSelect}
              </span>
            </div>

            {/* As 3 Opções de Pagamento Solicitadas: PIX, Débito, Crédito */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              {/* Opção 1: PIX */}
              <button
                type="button"
                onClick={() => handleSelectMethod('PIX')}
                className={`kiosk-btn-active relative p-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  selectedMethod === 'PIX'
                    ? 'bg-zinc-900 border-zinc-100 ring-2 ring-zinc-100/20 shadow-lg'
                    : 'kiosk-card hover:border-zinc-700 text-zinc-400'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`p-2 rounded-lg ${
                    selectedMethod === 'PIX' ? 'bg-zinc-100 text-zinc-950' : 'bg-zinc-800 text-zinc-300'
                  }`}>
                    <QrCode className="w-5 h-5" />
                  </div>
                  {selectedMethod === 'PIX' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  )}
                </div>
                <div className="mt-3">
                  <div className={`text-sm font-bold ${selectedMethod === 'PIX' ? 'text-zinc-100' : 'text-zinc-300'}`}>
                    {t.pixTitle}
                  </div>
                  <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                    {t.pixSubtitle}
                  </div>
                </div>
              </button>

              {/* Opção 2: Débito */}
              <button
                type="button"
                onClick={() => handleSelectMethod('CARTAO_DEBITO')}
                className={`kiosk-btn-active relative p-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  selectedMethod === 'CARTAO_DEBITO'
                    ? 'bg-zinc-900 border-zinc-100 ring-2 ring-zinc-100/20 shadow-lg'
                    : 'kiosk-card hover:border-zinc-700 text-zinc-400'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`p-2 rounded-lg ${
                    selectedMethod === 'CARTAO_DEBITO' ? 'bg-zinc-100 text-zinc-950' : 'bg-zinc-800 text-zinc-300'
                  }`}>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  {selectedMethod === 'CARTAO_DEBITO' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  )}
                </div>
                <div className="mt-3">
                  <div className={`text-sm font-bold ${selectedMethod === 'CARTAO_DEBITO' ? 'text-zinc-100' : 'text-zinc-300'}`}>
                    {t.debitTitle}
                  </div>
                  <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                    {t.debitSubtitle}
                  </div>
                </div>
              </button>

              {/* Opção 3: Crédito */}
              <button
                type="button"
                onClick={() => handleSelectMethod('CARTAO_CREDITO')}
                className={`kiosk-btn-active relative p-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  selectedMethod === 'CARTAO_CREDITO'
                    ? 'bg-zinc-900 border-zinc-100 ring-2 ring-zinc-100/20 shadow-lg'
                    : 'kiosk-card hover:border-zinc-700 text-zinc-400'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`p-2 rounded-lg ${
                    selectedMethod === 'CARTAO_CREDITO' ? 'bg-zinc-100 text-zinc-950' : 'bg-zinc-800 text-zinc-300'
                  }`}>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  {selectedMethod === 'CARTAO_CREDITO' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  )}
                </div>
                <div className="mt-3">
                  <div className={`text-sm font-bold ${selectedMethod === 'CARTAO_CREDITO' ? 'text-zinc-100' : 'text-zinc-300'}`}>
                    {t.creditTitle}
                  </div>
                  <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                    {t.creditSubtitle}
                  </div>
                </div>
              </button>
            </div>

            {/* Painel Dinâmico do Método Selecionado */}
            <div className="kiosk-panel rounded-2xl p-5 sm:p-6 border border-zinc-800">
              {selectedMethod === 'PIX' ? (
                /* Layout PIX */
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="flex flex-col items-center">
                    {/* Moldura do QR Code Estilo Kiosk */}
                    <div className="relative flex-shrink-0 p-3 bg-white rounded-2xl shadow-2xl">
                      <div className="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-2 border-l-2 border-zinc-400 rounded-tl-sm pointer-events-none" />
                      <div className="absolute -top-1.5 -right-1.5 w-4 h-4 border-t-2 border-r-2 border-zinc-400 rounded-tr-sm pointer-events-none" />
                      <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 border-b-2 border-l-2 border-zinc-400 rounded-bl-sm pointer-events-none" />
                      <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-2 border-r-2 border-zinc-400 rounded-br-sm pointer-events-none" />

                      {qrCodeUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={qrCodeUrl} alt="QR Code PIX" className="w-44 h-44 sm:w-48 sm:h-48 rounded-lg" />
                      ) : (
                        <div className="w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center">
                          <Loader2 className="w-8 h-8 animate-spin text-zinc-950" />
                        </div>
                      )}
                    </div>

                    {pixCopiaECola && (
                      <button
                        type="button"
                        onClick={handleCopiarPix}
                        className="mt-2 text-[10px] font-mono text-zinc-400 hover:text-zinc-200 underline flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiado ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiado ? 'Código Pix Copiado!' : 'Copiar Chave Pix'}</span>
                      </button>
                    )}

                    <div className="flex items-center gap-1.5 mt-2 text-[10px] font-mono text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Aguardando pagamento no app...</span>
                    </div>
                  </div>

                  {/* Instruções e Ação do PIX */}
                  <div className="flex-1 flex flex-col justify-between w-full text-center sm:text-left">
                    <div>
                      <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-mono font-bold text-zinc-200">
                        <Smartphone className="w-4 h-4 text-emerald-400" />
                        <span>{t.pixHowTo}</span>
                      </div>
                      <ol className="mt-2 space-y-1.5 text-xs text-zinc-400 font-sans">
                        <li className="flex items-start gap-2">
                          <span className="font-mono text-zinc-200 font-bold">1.</span>
                          <span>{t.pixStep1}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-mono text-zinc-200 font-bold">2.</span>
                          <span>{t.pixStep2}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-mono text-zinc-200 font-bold">3.</span>
                          <span>{t.pixStep3}</span>
                        </li>
                      </ol>
                    </div>

                    <div className="mt-5">
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={handlePayPix}
                        className="kiosk-btn-active w-full py-4 px-5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                            <span>{t.pixProcessing}</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 fill-current text-zinc-950" />
                            <span>{t.pixConfirmBtn} ({formatarMoeda(valor)})</span>
                            <ChevronRight className="w-4 h-4 ml-auto text-zinc-600" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Layout Cartão de Débito / Crédito com Simulação NFC Contactless */
                <div className="py-3 flex flex-col items-center text-center">
                  <div className="relative my-3 flex items-center justify-center">
                    <div className="absolute w-24 h-24 rounded-full border border-zinc-700/60 animate-nfc-ring pointer-events-none" />
                    <div className="absolute w-20 h-20 rounded-full border border-zinc-600/40 animate-nfc-ring pointer-events-none" style={{ animationDelay: '0.6s' }} />

                    <div className="w-20 h-20 rounded-2xl bg-zinc-950 border border-zinc-700 flex items-center justify-center relative z-10 shadow-2xl">
                      {cardStage === 'IDLE' && (
                        <Radio className="w-9 h-9 text-zinc-300 animate-pulse" />
                      )}
                      {(cardStage === 'READING' || cardStage === 'AUTHORIZING') && (
                        <Loader2 className="w-9 h-9 animate-spin text-emerald-400" />
                      )}
                      {cardStage === 'SUCCESS' && (
                        <CheckCircle2 className="w-9 h-9 text-emerald-400 animate-bounce" />
                      )}
                    </div>
                  </div>

                  <h4 className="text-base font-bold text-zinc-100 mt-2">
                    {selectedMethod === 'CARTAO_DEBITO' ? t.debitTitle : t.creditTitle}
                  </h4>

                  {tefMessage && (
                    <div className="w-full max-w-md mt-4 p-3 rounded-xl bg-zinc-900/90 border border-zinc-700 text-xs font-mono text-emerald-400 flex items-center justify-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>{tefMessage}</span>
                    </div>
                  )}

                  <div className="w-full max-w-md mt-4">
                    <button
                      type="button"
                      disabled={cardStage !== 'IDLE' || isLoading}
                      onClick={handlePayCard}
                      className="kiosk-btn-active w-full py-4 px-6 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50"
                    >
                      {cardStage === 'READING' && (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                          <span>{t.cardReading}</span>
                        </>
                      )}
                      {cardStage === 'AUTHORIZING' && (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                          <span>{t.cardAuthorizing}</span>
                        </>
                      )}
                      {cardStage === 'SUCCESS' && (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>{t.cardApproved}</span>
                        </>
                      )}
                      {cardStage === 'IDLE' && (
                        <>
                          <CreditCard className="w-4 h-4" />
                          <span>{t.cardSimulateBtn} ({formatarMoeda(valor)})</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-3 mt-4 text-[11px] font-mono text-zinc-500">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                      {t.securityEmv}
                    </span>
                    <span>•</span>
                    <span>Bandeiras: Visa, Mastercard, Elo</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Rodapé de Segurança */}
      <div className="pt-3 border-t border-zinc-900 flex items-center justify-between text-[11px] font-mono text-zinc-600">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
          <span>TERMINAL AUTORIZADO • PAGAMENTO PROTEGIDO</span>
        </div>
        <div>
          <span>TOLERÂNCIA DE SAÍDA: 20 MINUTOS</span>
        </div>
      </div>
    </div>
  );
};
