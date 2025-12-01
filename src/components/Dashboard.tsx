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
