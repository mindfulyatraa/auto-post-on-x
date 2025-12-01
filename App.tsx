import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Queue } from './pages/Queue';
import { Chat } from './pages/Chat';

import { Settings } from './pages/Settings';
import { Tweet, BotConfig, LogEntry, EngagementMetric } from './types';

// Mock Data Initialization
const INITIAL_QUEUE: Tweet[] = [
  { id: '1', content: "Systems check complete. The galaxy awaits. #SpaceRunner", scheduledTime: new Date(Date.now() - 86400000).toISOString(), status: 'posted', likes: 124, retweets: 18 },
  { id: '2', content: "Gravity is just a suggestion. Push your limits today. #RunTheGalaxy", scheduledTime: new Date(Date.now() + 3600000).toISOString(), status: 'queued' },
  { id: '3', content: "Orbit achieved. Next stop: Your personal best. #FutureFitness", scheduledTime: new Date(Date.now() + 90000000).toISOString(), status: 'queued' },
  { id: '4', content: "Systems check complete. The galaxy awaits. #SpaceRunner", scheduledTime: new Date(Date.now() - 86400000).toISOString(), status: 'posted', likes: 124, retweets: 18 },
];

const INITIAL_LOGS: LogEntry[] = [
  { id: '1', timestamp: new Date(Date.now() - 10000).toISOString(), level: 'info', message: 'Cron trigger received' },
  { id: '2', timestamp: new Date(Date.now() - 8000).toISOString(), level: 'info', message: 'Authenticating with Twitter API v2...' },
  { id: '3', timestamp: new Date(Date.now() - 7500).toISOString(), level: 'success', message: 'Authentication successful' },
  { id: '4', timestamp: new Date(Date.now() - 7000).toISOString(), level: 'info', message: 'Checking queue for scheduled items...' },
];

const INITIAL_METRICS: EngagementMetric[] = Array.from({ length: 15 }, (_, i) => ({
  date: `Day ${i + 1}`,
  impressions: Math.floor(Math.random() * 5000) + 1000,
  likes: Math.floor(Math.random() * 500) + 50,
  retweets: Math.floor(Math.random() * 100) + 10,
}));

// Backend API URL - relative path for Vercel
const API_URL = '/api';

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [queue, setQueue] = useState<Tweet[]>([]);

  // Fetch queue from backend
  const fetchQueue = async () => {
    try {
      const response = await fetch(`${API_URL}/api/queue`);
      if (response.ok) {
        const data = await response.json();
        setQueue(data);
      }
    } catch (error) {
      console.error('Error fetching queue:', error);
    }
  };

  // Poll queue every 5 seconds
  useEffect(() => {
    fetchQueue(); // Initial fetch
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, []);


  const [config, setConfig] = useState<BotConfig>({
    twitterApiKey: 'j2whhxv3SVZkUmERGoc148yt5',
    twitterApiSecret: 'FeRKb7tVq6bNaXsZx77PoXurFNYToIWUggSYrijf0Hjgm3vcAZ',
    accessToken: '1995057623360761857-oCClWVYc92siHfdgymtargyAV0jl4V',
    accessSecret: 'Uv6Xxqp6N0PpahxkTJijgxEwJCzrlSsM3SvRImnNhozxI',
    scheduleTime: '14:00',
    frequency: 'daily',
    autoRetry: true,
  });

  // Google Gemini API Key - hardcoded
  const [geminiKey, setGeminiKey] = useState<string>('AIzaSyBilT1xbamME8zBS2ztJGidOA2Ghy5ON6I');

  const handleNavigate = (page: string) => {
    setActivePage(page);
    window.location.hash = `/${page}`;
  };

  // Sync hash with active page on load/change
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '') || 'dashboard';
      setActivePage(hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleAddGeneratedToQueue = async (content: string, scheduledTime?: string) => {
    try {
      const response = await fetch(`${API_URL}/api/queue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          scheduledTime: scheduledTime || new Date(Date.now() + 60000).toISOString()
        })
      });

      if (response.ok) {
        await fetchQueue(); // Refresh queue
        handleNavigate('queue');
      }
    } catch (error) {
      console.error('Error adding to queue:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-50 font-sans selection:bg-indigo-500/30">
      <Sidebar currentPage={activePage} onNavigate={handleNavigate} />

      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto">
          {activePage === 'dashboard' && <Dashboard queue={queue} logs={INITIAL_LOGS} metrics={INITIAL_METRICS} />}
          {activePage === 'queue' && <Queue queue={queue} setQueue={setQueue} />}

          {activePage === 'chat' && (
            <Chat
              geminiKey={geminiKey}
              setGeminiKey={setGeminiKey}
              onAddToQueue={handleAddGeneratedToQueue}
            />
          )}
          {activePage === 'settings' && <Settings config={config} setConfig={setConfig} />}
          {activePage === 'logs' && (
            <div className="animate-in fade-in duration-500">
              <h2 className="text-2xl font-bold text-slate-100 mb-6">System Logs</h2>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-sm space-y-2 h-[600px] overflow-y-auto">
                {INITIAL_LOGS.map(log => (
                  <div key={log.id} className="flex gap-4 border-b border-slate-900 pb-2 mb-2 last:border-0">
                    <span className="text-slate-500 shrink-0">{new Date(log.timestamp).toISOString()}</span>
                    <span className={`uppercase font-bold shrink-0 w-16 ${log.level === 'error' ? 'text-red-500' :
                      log.level === 'success' ? 'text-emerald-500' :
                        log.level === 'warn' ? 'text-amber-500' : 'text-blue-500'
                      }`}>{log.level}</span>
                    <span className="text-slate-300">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;