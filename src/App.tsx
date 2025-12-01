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
