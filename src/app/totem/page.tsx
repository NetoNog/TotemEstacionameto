'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Settings,
  Volume2,
  VolumeX,
  AlertTriangle,
  X,
  Maximize2,
  Minimize2,
  Accessibility,
  Eye,
  Mic,
  MicOff,
  Car
} from 'lucide-react';
import { TicketScanner } from '@/components/totem/TicketScanner';
import { DirectPaymentView } from '@/components/totem/DirectPaymentView';
import { MinimalReleaseScreen } from '@/components/totem/MinimalReleaseScreen';
import { AttractModeScreen } from '@/components/totem/AttractModeScreen';
import { CalculoTarifa, MetodoPagamento, TarifaConfig, Ticket } from '@/types/parking';
import { sound } from '@/lib/soundEffects';
import { speechVoice } from '@/lib/speechVoice';
import { Language, translations } from '@/lib/translations';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';

import { BrandLogo } from '@/components/ui/BrandLogo';

type TotemFlowStep = 'ATTRACT' | 'SCAN' | 'PAYMENT' | 'RELEASE';

export default function TotemPage() {
  const [step, setStep] = useState<TotemFlowStep>('ATTRACT');
  const [lang, setLang] = useState<Language>('pt');
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [calculo, setCalculo] = useState<CalculoTarifa | null>(null);
  const [tarifa, setTarifa] = useState<TarifaConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Estados de Acessibilidade e Preferências
  const [wheelchairMode, setWheelchairMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [soundActive, setSoundActive] = useState(true);
  const [voiceActive, setVoiceActive] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  const t = translations[lang].header;

  // Relógio Digital em tempo real
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      const langLocale = lang === 'en' ? 'en-US' : lang === 'es' ? 'es-ES' : 'pt-BR';
      setCurrentDate(now.toLocaleDateString(langLocale, { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [lang]);

  const handleResetToAttract = useCallback(() => {
    setStep('ATTRACT');
    setTicket(null);
    setCalculo(null);
    setTarifa(null);
    setErrorMessage(null);
  }, []);

  // Proteção do Totem para uso público: desativa menus de contexto de clique direito/toque longo
  useEffect(() => {
    const disableContextMenu = (e: MouseEvent) => e.preventDefault();
    const disableSelect = (e: Event) => e.preventDefault();

    window.addEventListener('contextmenu', disableContextMenu);
    window.addEventListener('selectstart', disableSelect);

    return () => {
      window.removeEventListener('contextmenu', disableContextMenu);
      window.removeEventListener('selectstart', disableSelect);
    };
  }, []);

  // Detector de inatividade geral para as etapas SCAN e PAYMENT: retorna ao modo de descanso após 45 segundos sem toques
  // Nota: A etapa RELEASE possui seu próprio cronômetro visual dedicado de 30 segundos
  useEffect(() => {
    if (step === 'ATTRACT' || step === 'RELEASE') return;

    let timeoutId: NodeJS.Timeout;

    const onActivity = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handleResetToAttract();
      }, 45000);
    };

    onActivity();

    window.addEventListener('pointerdown', onActivity);
    window.addEventListener('keydown', onActivity);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('pointerdown', onActivity);
      window.removeEventListener('keydown', onActivity);
    };
  }, [step, handleResetToAttract]);

  const handleStartFromAttract = () => {
    setStep('SCAN');
  };

  const toggleSound = () => {
    const next = sound.toggleSound();
    setSoundActive(next);
  };

  const toggleVoice = () => {
    const next = speechVoice.toggle();
    setVoiceActive(next);
  };

  const toggleWheelchair = () => {
    sound.playKeyClick();
    setWheelchairMode((prev) => !prev);
  };

  const toggleHighContrast = () => {
    sound.playKeyClick();
    setHighContrast((prev) => !prev);
  };

  const toggleFullscreen = () => {
    sound.playKeyClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Processa leitura de ticket (seja da tela de Scan ou enquanto no descanso)
  const handleScanTicket = async (ticketCode: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/tickets/consultar?codigo=${encodeURIComponent(ticketCode)}`);
      const data = await res.json();

      if (!res.ok || !data.encontrado) {
        sound.playErrorSound();
        setErrorMessage(data.error || 'Ticket não localizado na leitora. Tente novamente.');
        if (step === 'ATTRACT') setStep('SCAN');
        return;
      }

      setTicket(data.ticket);
      setCalculo(data.calculo);
      setTarifa(data.tarifa);
      sound.playSuccessSound();

      // Transição automática para pagamento
      setStep('PAYMENT');
    } catch (err) {
      console.error(err);
      sound.playErrorSound();
      setErrorMessage('Falha na comunicação com o leitor ótico.');
      if (step === 'ATTRACT') setStep('SCAN');
    } finally {
      setIsLoading(false);
    }
  };

  // Se o cliente bipar o ticket enquanto no modo descanso, acorda o totem e processa imediatamente
  useBarcodeScanner({
    onScan: (code) => {
      if (step === 'ATTRACT') {
        handleScanTicket(code);
      }
    },
    enabled: step === 'ATTRACT' && !isLoading,
  });

  const handleProcessPayment = async (metodo: MetodoPagamento) => {
    if (!ticket || !calculo) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/tickets/pagar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: ticket.id,
          metodo,
          valor: calculo.valorCalculado,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.sucesso) {
        sound.playErrorSound();
        setErrorMessage(data.error || 'Erro ao processar pagamento. Tente novamente.');
        return;
      }

      setTicket(data.ticket);
      setStep('RELEASE');
    } catch (err) {
      console.error(err);
      sound.playErrorSound();
      setErrorMessage('Falha de conexão bancária.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFreeRelease = async () => {
    if (!ticket) return;
    sound.playSuccessSound();
    setStep('RELEASE');
  };

  return (
    <div
      className={`relative min-h-screen text-zinc-100 flex flex-col justify-between overflow-x-hidden font-sans select-none transition-colors duration-300 ${
        highContrast ? 'kiosk-high-contrast' : 'bg-[#050507]'
      }`}
    >
      {/* Top Header Industrial com Controles Avançados */}
      <header className="w-full bg-zinc-950/90 backdrop-blur-md border-b border-zinc-850 px-3 sm:px-6 py-2.5 flex items-center justify-between z-30">
        {/* Identificação do Terminal e Status Online */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetToAttract}
            className="kiosk-btn-active text-left cursor-pointer transition-transform"
            title="Reiniciar Atendimento / Modo de Descanso"
          >
            <BrandLogo size="sm" layout="horizontal" showTagline={false} />
          </button>
          <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-zinc-800">
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
              {t.terminalNumber}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-tight hidden sm:inline">
                {t.opticalActive}
              </span>
            </div>
            {currentTime && (
              <span className="text-[11px] font-mono text-zinc-400 pl-2 border-l border-zinc-800 tracking-tight font-medium">
                {currentDate} {currentTime}
              </span>
            )}
          </div>
        </div>

        {/* Indicador de Passos do Fluxo (Oculto no Modo Descanso) */}
        {step !== 'ATTRACT' && (
          <div className="hidden md:flex items-center gap-2 font-mono text-xs">
            <span className={`px-2.5 py-1 rounded-md transition-all ${
              step === 'SCAN' 
                ? 'bg-zinc-100 text-zinc-950 font-bold shadow' 
                : 'text-zinc-500 bg-zinc-900/60'
            }`}>
              {t.stepScan}
            </span>
            <span className="text-zinc-700">→</span>
            <span className={`px-2.5 py-1 rounded-md transition-all ${
              step === 'PAYMENT' 
                ? 'bg-zinc-100 text-zinc-950 font-bold shadow' 
                : 'text-zinc-500 bg-zinc-900/60'
            }`}>
              {t.stepPayment}
            </span>
            <span className="text-zinc-700">→</span>
            <span className={`px-2.5 py-1 rounded-md transition-all ${
              step === 'RELEASE' 
                ? 'bg-zinc-100 text-zinc-950 font-bold shadow' 
                : 'text-zinc-500 bg-zinc-900/60'
            }`}>
              {t.stepRelease}
            </span>
          </div>
        )}

        {/* Barra de Ferramentas: Idiomas, Acessibilidade, Áudio e Tela Cheia */}
        <div className="flex items-center gap-2">
          {/* Seletor Multi-idioma Rápido */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-[11px] font-mono">
            <button
              type="button"
              onClick={() => { sound.playKeyClick(); setLang('pt'); }}
              className={`px-1.5 py-0.5 rounded transition-all ${lang === 'pt' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'}`}
              title="Português"
            >
              🇧🇷 PT
            </button>
            <button
              type="button"
              onClick={() => { sound.playKeyClick(); setLang('en'); }}
              className={`px-1.5 py-0.5 rounded transition-all ${lang === 'en' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'}`}
              title="English"
            >
              🇺🇸 EN
            </button>
            <button
              type="button"
              onClick={() => { sound.playKeyClick(); setLang('es'); }}
              className={`px-1.5 py-0.5 rounded transition-all ${lang === 'es' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'}`}
              title="Español"
            >
              🇪🇸 ES
            </button>
          </div>

          {/* Botão Modo Cadeirante (ABNT) */}
          <button
            type="button"
            onClick={toggleWheelchair}
            className={`kiosk-btn-active p-2 rounded-lg border text-xs flex items-center transition-all cursor-pointer ${
              wheelchairMode
                ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border-zinc-800'
            }`}
            title={t.wheelchairTooltip}
          >
            <Accessibility className="w-4 h-4" />
          </button>

          {/* Botão Alto Contraste */}
          <button
            type="button"
            onClick={toggleHighContrast}
            className={`kiosk-btn-active p-2 rounded-lg border text-xs flex items-center transition-all cursor-pointer ${
              highContrast
                ? 'bg-yellow-400 text-black border-yellow-300 font-bold'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border-zinc-800'
            }`}
            title={t.contrastTooltip}
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Botão Locução de Voz Sintetizada */}
          <button
            type="button"
            onClick={toggleVoice}
            className={`kiosk-btn-active p-2 rounded-lg border text-xs flex items-center transition-all cursor-pointer ${
              voiceActive
                ? 'bg-zinc-900 text-zinc-300 border-zinc-800'
                : 'bg-zinc-900 text-zinc-600 border-zinc-800'
            }`}
            title={t.voiceTooltip}
          >
            {voiceActive ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4 text-zinc-600" />}
          </button>

          {/* Botão de Som */}
          <button
            type="button"
            onClick={toggleSound}
            className="kiosk-btn-active p-2 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-400 border border-zinc-800 text-xs flex items-center transition-all cursor-pointer"
            title={t.soundTooltip}
          >
            {soundActive ? <Volume2 className="w-4 h-4 text-zinc-200" /> : <VolumeX className="w-4 h-4 text-zinc-600" />}
          </button>

          {/* Botão Modo Kiosk Fullscreen */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="kiosk-btn-active p-2 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800 text-xs flex items-center transition-all cursor-pointer hidden sm:flex"
            title={t.fullscreenTooltip}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <Link
            href="/simulador"
            className="kiosk-btn-active p-2 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800 text-xs flex items-center transition-all"
            title={t.simulatorTooltip}
          >
            <Settings className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Alerta de Erro Global (se houver) */}
      {errorMessage && (
        <div className="mx-auto mt-4 w-full max-w-xl px-4 z-40 animate-fadeIn">
          <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-800/80 text-red-200 flex items-center justify-between text-xs font-mono shadow-lg">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="p-1 text-red-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Conteúdo Central com Suporte a Modo Cadeirante */}
      <main className={`flex-1 flex flex-col justify-center items-center relative z-10 w-full px-2 sm:px-4 ${
        wheelchairMode ? 'kiosk-wheelchair-mode' : ''
      }`}>
        {/* PASSO 0: Modo de Descanso (Attract Screen) */}
        {step === 'ATTRACT' && (
          <AttractModeScreen
            onStart={handleStartFromAttract}
            lang={lang}
          />
        )}

        {/* PASSO 1: Leitura de Ticket */}
        {step === 'SCAN' && (
          <TicketScanner
            onScan={handleScanTicket}
            isLoading={isLoading}
            errorMessage={errorMessage}
            lang={lang}
          />
        )}

        {/* PASSO 2: HUD Financeiro e Pagamento */}
        {step === 'PAYMENT' && ticket && calculo && (
          <DirectPaymentView
            ticket={ticket}
            calculo={calculo}
            onPay={handleProcessPayment}
            onFreeRelease={handleFreeRelease}
            onCancel={handleResetToAttract}
            isLoading={isLoading}
            lang={lang}
          />
        )}

        {/* PASSO 3: Saída e Regra dos 20 Minutos */}
        {step === 'RELEASE' && ticket && (
          <MinimalReleaseScreen
            ticket={ticket}
            validadeMinutos={tarifa?.toleranciaSaidaMin || 20}
            onFinish={handleResetToAttract}
            lang={lang}
          />
        )}
      </main>

      {/* Rodapé Industrial Minimalista com Lotação de Vagas */}
      <footer className="w-full py-2.5 px-6 bg-zinc-950/90 border-t border-zinc-850 flex items-center justify-between text-[11px] text-zinc-500 font-mono print:hidden">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <Car className="w-3.5 h-3.5" />
            <span>142 VAGAS LIVRES</span>
          </div>
          <span className="text-zinc-700 hidden sm:inline">|</span>
          <span className="hidden md:inline">PCI DSS SECURITY COMPLIANT</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-zinc-400 font-semibold">TOLERÂNCIA DE SAÍDA: 20 MIN</span>
          <span className="hidden md:inline text-zinc-700">|</span>
          <span className="hidden md:inline">AJUDA: RAMAL 100</span>
        </div>
      </footer>
    </div>
  );
}
