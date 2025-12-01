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
