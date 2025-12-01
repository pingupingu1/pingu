export class VoiceService {
  private synthesis: SpeechSynthesis;
  private recognition: SpeechRecognition | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.initializeRecognition();
    this.loadVoices();
  }

  private initializeRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'nl-NL';
    }
  }

  private loadVoices() {
    this.voices = this.synthesis.getVoices();
    if (this.voices.length === 0) {
      this.synthesis.onvoiceschanged = () => {
        this.voices = this.synthesis.getVoices();
      };
    }
  }

  getDutchVoices(): SpeechSynthesisVoice[] {
    return this.voices.filter(voice =>
      voice.lang.startsWith('nl') || voice.lang.startsWith('nl-NL')
    );
  }

  speak(text: string, options: {
    pitch?: number;
    rate?: number;
    volume?: number;
    onEnd?: () => void;
    onError?: (error: Error) => void;
  } = {}): void {
    const utterance = new SpeechSynthesisUtterance(text);

    const dutchVoices = this.getDutchVoices();
    if (dutchVoices.length > 0) {
      utterance.voice = dutchVoices[0];
    }

    utterance.lang = 'nl-NL';
    utterance.pitch = options.pitch ?? 1.0;
    utterance.rate = options.rate ?? 1.0;
    utterance.volume = options.volume ?? 1.0;

    if (options.onEnd) {
      utterance.onend = options.onEnd;
    }

    if (options.onError) {
      utterance.onerror = (event) => {
        options.onError!(new Error(event.error));
      };
    }

    this.synthesis.speak(utterance);
  }

  stopSpeaking(): void {
    this.synthesis.cancel();
  }

  startListening(callbacks: {
    onResult: (transcript: string, isFinal: boolean, confidence: number) => void;
    onError?: (error: Error) => void;
    onEnd?: () => void;
  }): void {
    if (!this.recognition) {
      callbacks.onError?.(new Error('Speech recognition not supported'));
      return;
    }

    this.recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        callbacks.onResult(
          result[0].transcript,
          result.isFinal,
          result[0].confidence
        );
      }
    };

    this.recognition.onerror = (event) => {
      callbacks.onError?.(new Error(event.error));
    };

    this.recognition.onend = () => {
      callbacks.onEnd?.();
    };

    this.recognition.start();
  }

  stopListening(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  isSupported(): boolean {
    return !!(this.synthesis && this.recognition);
  }
}
