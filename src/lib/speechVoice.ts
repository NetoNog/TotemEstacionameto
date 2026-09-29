import { Language } from './translations';

class SpeechVoiceManager {
  private enabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('totem_voice_enabled');
      if (saved !== null) {
        this.enabled = saved === 'true';
      }
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public toggle(): boolean {
    this.enabled = !this.enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('totem_voice_enabled', String(this.enabled));
      if (!this.enabled) {
        this.cancel();
      }
    }
    return this.enabled;
  }

  public speak(text: string, lang: Language = 'pt') {
    if (typeof window === 'undefined' || !this.enabled) return;
    if (!('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel(); // interrompe fala anterior

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      const langMap: Record<Language, string> = {
        pt: 'pt-BR',
        en: 'en-US',
        es: 'es-ES',
      };
      utterance.lang = langMap[lang] || 'pt-BR';

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis not available:', err);
    }
  }

  public cancel() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // noop
      }
    }
  }
}

export const speechVoice = new SpeechVoiceManager();
