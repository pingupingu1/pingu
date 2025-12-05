# VITALLIC - COMPLETE SOURCE CODE (SINGLE PAGE)

## Table of Contents
1. [App Component](#app-component)
2. [Components](#components)
3. [Services](#services)
4. [Library](#library)
5. [Entry Point](#entry-point)
6. [Configuration](#configuration)

---

## APP COMPONENT

### src/App.tsx (188 lines)

```typescript
import { useState, useEffect } from 'react';
import { Headphones, LayoutDashboard, LogOut } from 'lucide-react';
import VoiceAssistant from './components/VoiceAssistant';
import Dashboard from './components/Dashboard';
import VoiceProfileSelector from './components/VoiceProfileSelector';
import LoginPage from './components/LoginPage';
import { ConversationService } from './services/conversationService';
import { supabase } from './lib/supabase';
import type { VoiceProfile } from './lib/supabase';

function App() {
  const [activeTab, setActiveTab] = useState<'assistant' | 'dashboard'>('assistant');
  const [voiceProfiles, setVoiceProfiles] = useState<VoiceProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<VoiceProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const conversationService = new ConversationService();

  useEffect(() => {
    checkAuth();
    const subscription = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        loadVoiceProfiles();
      } else {
        setLoading(false);
      }
    });

    return () => {
      subscription.data?.subscription?.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    const { data } = await supabase.auth.getSession();
    setUser(data?.session?.user || null);
    if (data?.session?.user) {
      await loadVoiceProfiles();
    } else {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const handleLoginSuccess = async () => {
    const { data } = await supabase.auth.getSession();
    setUser(data?.session?.user || null);
    await loadVoiceProfiles();
  };

  const loadVoiceProfiles = async () => {
    try {
      const profiles = await conversationService.getVoiceProfiles();
      setVoiceProfiles(profiles);
      if (profiles.length > 0) {
        setSelectedProfile(profiles[0]);
      }
    } catch (error) {
      console.error('Error loading voice profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Vitallic laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 rounded-lg p-2">
                <Headphones className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Vitallic</h1>
                <p className="text-sm text-gray-600">Nederlandse AI Stem Assistent</p>
              </div>
            </div>

            <nav className="flex gap-2 items-center">
              <button
                onClick={() => setActiveTab('assistant')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'assistant'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Headphones className="w-4 h-4" />
                Assistent
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
              <div className="border-l border-gray-200 pl-4 ml-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'assistant' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <VoiceProfileSelector
                profiles={voiceProfiles}
                selectedProfile={selectedProfile}
                onSelectProfile={setSelectedProfile}
              />

              <div className="mt-6 bg-white rounded-xl shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Over Vitallic</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Vitallic is een geavanceerde Nederlandse AI stem assistent met:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Real-time spraakherkenning</li>
                    <li>Natuurlijke Nederlandse stem</li>
                    <li>Meerdere gespreksmodi</li>
                    <li>Volledige gespreksgeschiedenis</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              {selectedProfile ? (
                <VoiceAssistant voiceProfile={selectedProfile} />
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                  <p className="text-gray-600">Selecteer een stem profiel om te beginnen</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <Dashboard />
        )}
      </main>

      <footer className="mt-12 py-6 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-600">
            Vitallic - Nederlandse AI Stem Assistent | Gebouwd met moderne webtechnologie
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
```

---

## COMPONENTS

### src/components/LoginPage.tsx (154 lines)

```typescript
import { useState } from 'react';
import { Headphones, Mail, Lock, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}`,
          },
        });

        if (signUpError) throw signUpError;
        setSuccessMessage('Check your email to confirm your account');
        setEmail('');
        setPassword('');
        setIsSignUp(false);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;
        onLoginSuccess();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 rounded-lg p-3">
              <Headphones className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Vitallic
          </h1>
          <p className="text-sm text-gray-600 text-center mb-8">
            Nederlandse AI Stem Assistent
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="text-sm">{error}</div>
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {successMessage}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 rounded-lg transition-colors"
            >
              {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setSuccessMessage(null);
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-600 text-center">
              Protected application. Contact your administrator for access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### src/components/VoiceAssistant.tsx (243 lines)

```typescript
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
```

### src/components/VoiceProfileSelector.tsx (63 lines)

```typescript
import { Radio } from 'lucide-react';
import type { VoiceProfile } from '../lib/supabase';

interface VoiceProfileSelectorProps {
  profiles: VoiceProfile[];
  selectedProfile: VoiceProfile | null;
  onSelectProfile: (profile: VoiceProfile) => void;
}

export default function VoiceProfileSelector({
  profiles,
  selectedProfile,
  onSelectProfile,
}: VoiceProfileSelectorProps) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Kies Stem Profiel</h2>
      <p className="text-sm text-gray-600 mb-6">
        Selecteer de persoonlijkheid en toon voor je assistent
      </p>

      <div className="space-y-3">
        {profiles.map((profile) => (
          <button
            key={profile.id}
            onClick={() => onSelectProfile(profile)}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
              selectedProfile?.id === profile.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Radio
                    className={`w-4 h-4 ${
                      selectedProfile?.id === profile.id ? 'text-blue-600' : 'text-gray-400'
                    }`}
                  />
                  <h3 className="font-semibold text-gray-900">{profile.name}</h3>
                </div>
                <p className="text-sm text-gray-600 ml-6">{profile.description}</p>
                <div className="flex gap-4 mt-3 ml-6">
                  <div className="text-xs text-gray-500">
                    Toonhoogte: {profile.pitch.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Snelheid: {profile.rate.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Taal: {profile.language}
                  </div>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

### src/components/Dashboard.tsx (126 lines)

```typescript
import { useState, useEffect } from 'react';
import { Phone, Clock, TrendingUp, MessageSquare } from 'lucide-react';
import { ConversationService } from '../services/conversationService';
import type { Call } from '../lib/supabase';
import CallHistory from './CallHistory';
import TranscriptViewer from './TranscriptViewer';

export default function Dashboard() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalCalls: 0,
    totalDuration: 0,
    avgDuration: 0,
    activeCalls: 0,
  });
  const [loading, setLoading] = useState(true);

  const conversationService = new ConversationService();

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const callsData = await conversationService.getCalls(100);
      setCalls(callsData);

      const totalCalls = callsData.length;
      const totalDuration = callsData.reduce((sum, call) => sum + call.duration_seconds, 0);
      const avgDuration = totalCalls > 0 ? totalDuration / totalCalls : 0;
      const activeCalls = callsData.filter(call => call.status === 'active').length;

      setStats({
        totalCalls,
        totalDuration,
        avgDuration,
        activeCalls,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Dashboard laden...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Totaal Gesprekken</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalCalls}</p>
            </div>
            <Phone className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Actieve Gesprekken</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.activeCalls}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Totale Duur</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {formatDuration(stats.totalDuration)}
              </p>
            </div>
            <Clock className="w-10 h-10 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Gem. Duur</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {formatDuration(Math.floor(stats.avgDuration))}
              </p>
            </div>
            <MessageSquare className="w-10 h-10 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CallHistory
          calls={calls}
          onSelectCall={setSelectedCallId}
          selectedCallId={selectedCallId}
        />

        {selectedCallId && (
          <TranscriptViewer callId={selectedCallId} />
        )}
      </div>
    </div>
  );
}
```

### src/components/CallHistory.tsx (104 lines)

```typescript
import { Clock, CheckCircle, XCircle, Radio } from 'lucide-react';
import type { Call } from '../lib/supabase';

interface CallHistoryProps {
  calls: Call[];
  onSelectCall: (callId: string) => void;
  selectedCallId: string | null;
}

export default function CallHistory({ calls, onSelectCall, selectedCallId }: CallHistoryProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Radio className="w-4 h-4 text-green-600 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Actief';
      case 'completed':
        return 'Voltooid';
      case 'failed':
        return 'Mislukt';
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Gespreksgeschiedenis</h2>
        <p className="text-sm text-gray-600 mt-1">Recente gesprekken en hun status</p>
      </div>

      <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
        {calls.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nog geen gesprekken
          </div>
        ) : (
          calls.map((call) => (
            <button
              key={call.id}
              onClick={() => onSelectCall(call.id)}
              className={`w-full p-4 hover:bg-gray-50 transition-colors text-left ${
                selectedCallId === call.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(call.status)}
                    <span className="text-sm font-medium text-gray-900">
                      {getStatusText(call.status)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {formatDate(call.started_at)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Session: {call.session_id.substring(0, 20)}...
                  </p>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {formatDuration(call.duration_seconds)}
                  </span>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
```

### src/components/TranscriptViewer.tsx (102 lines)

```typescript
import { useState, useEffect } from 'react';
import { MessageSquare, User, Bot } from 'lucide-react';
import { ConversationService } from '../services/conversationService';
import type { Transcript } from '../lib/supabase';

interface TranscriptViewerProps {
  callId: string;
}

export default function TranscriptViewer({ callId }: TranscriptViewerProps) {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [loading, setLoading] = useState(true);

  const conversationService = new ConversationService();

  useEffect(() => {
    loadTranscripts();
  }, [callId]);

  const loadTranscripts = async () => {
    try {
      setLoading(true);
      const data = await conversationService.getCallTranscripts(callId);
      setTranscripts(data);
    } catch (error) {
      console.error('Error loading transcripts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('nl-NL', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-xl shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Transcript</h2>
        </div>
        <p className="text-sm text-gray-600 mt-1">Gespreksverloop en berichtgeschiedenis</p>
      </div>

      <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
        {loading ? (
          <div className="text-center text-gray-500">Transcript laden...</div>
        ) : transcripts.length === 0 ? (
          <div className="text-center text-gray-500">Geen berichten gevonden</div>
        ) : (
          transcripts.map((transcript) => (
            <div
              key={transcript.id}
              className={`flex gap-3 ${
                transcript.speaker === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {transcript.speaker === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-blue-600" />
                </div>
              )}

              <div
                className={`max-w-[70%] ${
                  transcript.speaker === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                } rounded-lg p-4`}
              >
                <p className="text-sm">{transcript.message}</p>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-xs opacity-70">
                    {formatTime(transcript.timestamp)}
                  </p>
                  {transcript.confidence < 1 && (
                    <p className="text-xs opacity-70">
                      {Math.round(transcript.confidence * 100)}% vertrouwen
                    </p>
                  )}
                </div>
              </div>

              {transcript.speaker === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

---

## SERVICES

### src/services/voiceService.ts (115 lines)

```typescript
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
```

### src/services/conversationService.ts (97 lines)

```typescript
import { supabase, type Call, type Transcript, type VoiceProfile } from '../lib/supabase';

export class ConversationService {
  private currentCallId: string | null = null;

  async startCall(voiceProfileId: string, conversationFlowId: string): Promise<string> {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const { data, error } = await supabase
      .from('calls')
      .insert({
        session_id: sessionId,
        voice_profile_id: voiceProfileId,
        conversation_flow_id: conversationFlowId,
        status: 'active',
        started_at: new Date().toISOString(),
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to create call');

    this.currentCallId = data.id;
    return data.id;
  }

  async endCall(callId: string, durationSeconds: number): Promise<void> {
    const { error } = await supabase
      .from('calls')
      .update({
        status: 'completed',
        ended_at: new Date().toISOString(),
        duration_seconds: durationSeconds,
      })
      .eq('id', callId);

    if (error) throw error;
    this.currentCallId = null;
  }

  async addTranscript(
    callId: string,
    speaker: 'assistant' | 'user',
    message: string,
    confidence: number = 1.0
  ): Promise<void> {
    const { error } = await supabase
      .from('transcripts')
      .insert({
        call_id: callId,
        speaker,
        message,
        confidence,
        timestamp: new Date().toISOString(),
      });

    if (error) throw error;
  }

  async getCalls(limit: number = 50): Promise<Call[]> {
    const { data, error } = await supabase
      .from('calls')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async getCallTranscripts(callId: string): Promise<Transcript[]> {
    const { data, error } = await supabase
      .from('transcripts')
      .select('*')
      .eq('call_id', callId)
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getVoiceProfiles(): Promise<VoiceProfile[]> {
    const { data, error } = await supabase
      .from('voice_profiles')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  }

  getCurrentCallId(): string | null {
    return this.currentCallId;
  }
}
```

---

## LIBRARY

### src/lib/supabase.ts (59 lines)

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type VoiceProfile = {
  id: string;
  name: string;
  description: string | null;
  tone: string;
  language: string;
  pitch: number;
  rate: number;
  volume: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ConversationFlow = {
  id: string;
  name: string;
  description: string | null;
  flow_type: string;
  voice_profile_id: string | null;
  script_content: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Call = {
  id: string;
  session_id: string;
  voice_profile_id: string | null;
  conversation_flow_id: string | null;
  status: string;
  duration_seconds: number;
  started_at: string;
  ended_at: string | null;
  created_at: string;
};

export type Transcript = {
  id: string;
  call_id: string;
  speaker: string;
  message: string;
  timestamp: string;
  confidence: number;
  created_at: string;
};
```

---

## ENTRY POINT

### src/main.tsx (10 lines)

```typescript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

---

## CONFIGURATION

### index.html (16 lines)

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vitallic Dutch AI Voice Assistant</title>
    <meta property="og:image" content="https://bolt.new/static/og_default.png">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="https://bolt.new/static/og_default.png">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### package.json

```json
{
  "name": "vite-react-typescript-starter",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit -p tsconfig.app.json"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.57.4",
    "lucide-react": "^0.344.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@eslint/js": "^9.9.1",
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.18",
    "eslint": "^9.9.1",
    "eslint-plugin-react-hooks": "^5.1.0-rc.0",
    "eslint-plugin-react-refresh": "^0.4.11",
    "globals": "^15.9.0",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.5.3",
    "typescript-eslint": "^8.3.0",
    "vite": "^5.4.2"
  }
}
```

### vite.config.ts

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### tailwind.config.js

```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### postcss.config.js

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

---

## ENVIRONMENT VARIABLES (.env)

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## DATABASE SCHEMA (PostgreSQL)

```sql
-- Voice Profiles Table
CREATE TABLE IF NOT EXISTS voice_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  tone TEXT,
  language TEXT DEFAULT 'nl-NL',
  pitch DECIMAL DEFAULT 1.0,
  rate DECIMAL DEFAULT 1.0,
  volume DECIMAL DEFAULT 1.0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Calls Table
CREATE TABLE IF NOT EXISTS calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  voice_profile_id UUID REFERENCES voice_profiles(id),
  conversation_flow_id UUID,
  status TEXT DEFAULT 'active',
  duration_seconds INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Transcripts Table
CREATE TABLE IF NOT EXISTS transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  speaker TEXT NOT NULL,
  message TEXT NOT NULL,
  confidence DECIMAL DEFAULT 1.0,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Conversation Flows Table
CREATE TABLE IF NOT EXISTS conversation_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  flow_type TEXT,
  voice_profile_id UUID REFERENCES voice_profiles(id),
  script_content JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE voice_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_flows ENABLE ROW LEVEL SECURITY;
```

---

## QUICK START GUIDE

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Create Environment File**
   ```bash
   echo "VITE_SUPABASE_URL=your_url" > .env
   echo "VITE_SUPABASE_ANON_KEY=your_key" >> .env
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

5. **Preview Production Build**
   ```bash
   npm run preview
   ```

---

## KEY FEATURES

- Voice conversation in Dutch (nl-NL)
- User authentication via Supabase
- Call history tracking
- Transcript storage and viewing
- Analytics dashboard
- Multiple voice profiles
- Real-time conversation display
- Responsive design
- Error handling
- Type-safe with TypeScript

---

## BROWSER SUPPORT

- Chrome 90+
- Edge 90+
- Brave
- Opera

---

**End of Complete Source Code Document**
