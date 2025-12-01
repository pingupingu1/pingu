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
