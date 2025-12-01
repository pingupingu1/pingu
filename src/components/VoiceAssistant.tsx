import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { VoiceService } from '../services/voiceService';
import { ConversationService } from '../services/conversationService';
import type { VoiceProfile } from '../lib/supabase';

interface VoiceAssistantProps {
  voiceProfile: VoiceProfile;
  onTranscriptUpdate?: (speaker: 'user' | 'assistant', message: string) => void;
}

export default function VoiceAssistant({ voiceProfile, onTranscriptUpdate }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [lastUserInput, setLastUserInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [callStartTime, setCallStartTime] = useState<number | null>(null);

  const voiceService = useRef(new VoiceService());
  const conversationService = useRef(new ConversationService());
  const currentCallId = useRef<string | null>(null);

  useEffect(() => {
    if (!voiceService.current.isSupported()) {
      setError('Voice features are not supported in this browser. Please use Chrome or Edge.');
    }
  }, []);

  const startConversation = async () => {
    try {
      setError(null);
      const callId = await conversationService.current.startCall(
        voiceProfile.id,
        'default-flow'
      );
      currentCallId.current = callId;
      setCallStartTime(Date.now());

      const greeting = getGreeting(voiceProfile.name);
      await speak(greeting);

      setIsListening(true);
      voiceService.current.startListening({
        onResult: handleSpeechResult,
        onError: (err) => setError(err.message),
        onEnd: () => {
          if (isListening) {
            voiceService.current.startListening({
              onResult: handleSpeechResult,
              onError: (err) => setError(err.message),
            });
          }
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start conversation');
    }
  };

  const stopConversation = async () => {
    setIsListening(false);
    voiceService.current.stopListening();
    voiceService.current.stopSpeaking();
    setIsSpeaking(false);

    if (currentCallId.current && callStartTime) {
      const durationSeconds = Math.floor((Date.now() - callStartTime) / 1000);
      await conversationService.current.endCall(currentCallId.current, durationSeconds);
      currentCallId.current = null;
      setCallStartTime(null);
    }
  };

  const handleSpeechResult = async (transcript: string, isFinal: boolean, confidence: number) => {
    setCurrentTranscript(transcript);

    if (isFinal && transcript.trim()) {
      setLastUserInput(transcript);

      if (currentCallId.current) {
        await conversationService.current.addTranscript(
          currentCallId.current,
          'user',
          transcript,
          confidence
        );
      }

      onTranscriptUpdate?.('user', transcript);

      const response = generateResponse(transcript, voiceProfile.name);
      await speak(response);
    }
  };

  const speak = async (text: string) => {
    setIsSpeaking(true);

    if (currentCallId.current) {
      await conversationService.current.addTranscript(
        currentCallId.current,
        'assistant',
        text
      );
    }

    onTranscriptUpdate?.('assistant', text);

    return new Promise<void>((resolve) => {
      voiceService.current.speak(text, {
        pitch: voiceProfile.pitch,
        rate: voiceProfile.rate,
        volume: voiceProfile.volume,
        onEnd: () => {
          setIsSpeaking(false);
          resolve();
        },
        onError: (err) => {
          setError(err.message);
          setIsSpeaking(false);
          resolve();
        },
      });
    });
  };

  const getGreeting = (profileName: string): string => {
    if (profileName.includes('Friendly')) {
      return 'Hallo! Ik ben Vitallic, je persoonlijke AI assistent. Hoe kan ik je vandaag helpen?';
    }
    return 'Goedendag. U spreekt met Vitallic. Waarmee kan ik u van dienst zijn?';
  };

  const generateResponse = (userInput: string, profileName: string): string => {
    const input = userInput.toLowerCase();

    if (input.includes('hallo') || input.includes('hoi') || input.includes('hey')) {
      return profileName.includes('Friendly')
        ? 'Hallo! Leuk je te horen. Hoe gaat het met je?'
        : 'Goedendag. Waarmee kan ik u helpen?';
    }

    if (input.includes('hoe gaat het') || input.includes('alles goed')) {
      return 'Met mij gaat het uitstekend, dank je! En met jou?';
    }

    if (input.includes('wat kun je') || input.includes('wat kan je')) {
      return 'Ik kan je helpen met verschillende taken, gesprekken voeren, en vragen beantwoorden. Vertel me waar je hulp bij nodig hebt!';
    }

    if (input.includes('bedankt') || input.includes('dank je')) {
      return profileName.includes('Friendly')
        ? 'Graag gedaan! Altijd fijn om te helpen!'
        : 'U bent van harte welkom. Kan ik u nog ergens anders mee helpen?';
    }

    if (input.includes('doei') || input.includes('tot ziens') || input.includes('dag')) {
      return profileName.includes('Friendly')
        ? 'Tot snel! Fijne dag nog!'
        : 'Goedendag. Tot de volgende keer.';
    }

    return profileName.includes('Friendly')
      ? 'Dat is interessant! Vertel me daar eens meer over.'
      : 'Ik begrijp het. Kunt u daar verder op ingaan?';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vitallic</h2>
          <p className="text-sm text-gray-600 mt-1">{voiceProfile.name}</p>
        </div>
        <div className="flex items-center gap-2">
          {isSpeaking && (
            <Volume2 className="w-6 h-6 text-blue-600 animate-pulse" />
          )}
          {!isSpeaking && isListening && (
            <VolumeX className="w-6 h-6 text-gray-400" />
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-6 mb-6 min-h-[200px]">
        <div className="space-y-4">
          {lastUserInput && (
            <div className="flex justify-end">
              <div className="bg-blue-600 text-white rounded-lg px-4 py-2 max-w-[80%]">
                {lastUserInput}
              </div>
            </div>
          )}
          {currentTranscript && !lastUserInput.includes(currentTranscript) && (
            <div className="flex justify-end">
              <div className="bg-blue-400 text-white rounded-lg px-4 py-2 max-w-[80%] opacity-60">
                {currentTranscript}...
              </div>
            </div>
          )}
          {!isListening && !lastUserInput && (
            <div className="text-center text-gray-500">
              Klik op de microfoon om te beginnen
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center">
        {!isListening ? (
          <button
            onClick={startConversation}
            disabled={!!error}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-full p-6 shadow-lg transition-all hover:shadow-xl"
          >
            <Mic className="w-8 h-8" />
          </button>
        ) : (
          <button
            onClick={stopConversation}
            className="bg-red-600 hover:bg-red-700 text-white rounded-full p-6 shadow-lg transition-all hover:shadow-xl animate-pulse"
          >
            <MicOff className="w-8 h-8" />
          </button>
        )}
      </div>

      {isListening && (
        <p className="text-center text-sm text-gray-600 mt-4">
          Luisteren... Spreek duidelijk in het Nederlands
        </p>
      )}
    </div>
  );
}
