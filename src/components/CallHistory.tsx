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
