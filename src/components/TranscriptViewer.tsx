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
