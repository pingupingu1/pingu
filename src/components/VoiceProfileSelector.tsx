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
