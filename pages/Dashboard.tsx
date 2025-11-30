import React from 'react';
import { Tweet, EngagementMetric, LogEntry } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';
import { TrendingUp, Users, Repeat, Heart, AlertCircle, CheckCircle2 } from 'lucide-react';

interface DashboardProps {
  queue: Tweet[];
  logs: LogEntry[];
  metrics: EngagementMetric[];
}

export const Dashboard: React.FC<DashboardProps> = ({ queue, logs, metrics }) => {
  const nextTweet = queue.find(t => t.status === 'queued');
  const recentLogs = logs.slice(0, 4);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header>
        <h2 className="text-2xl font-bold text-slate-100">Mission Overview</h2>
        <p className="text-slate-400">Real-time telemetry and engagement tracking.</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Impressions', value: '142.5K', icon: Users, change: '+12%', color: 'text-blue-400' },
          { label: 'Avg Engagement', value: '4.8%', icon: TrendingUp, change: '+2.1%', color: 'text-emerald-400' },
          { label: 'Queue Status', value: `${queue.filter(t => t.status === 'queued').length} Pending`, icon: CheckCircle2, change: 'Healthy', color: 'text-indigo-400' },
          { label: 'System Health', value: '99.9%', icon: Heart, change: 'Stable', color: 'text-rose-400' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-slate-800 ${stat.change.includes('+') ? 'text-emerald-400' : 'text-slate-400'}`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-slate-100">{stat.value}</h3>
            <p className="text-sm text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-slate-100 mb-6">Engagement Velocity (30 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChartWrapper data={metrics} />
            </ResponsiveContainer>
          </div>
        </div>

        {/* Next Tweet & Status */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Up Next in Queue</h3>
            {nextTweet ? (
              <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-50">
                  <div className="w-16 h-16 bg-indigo-500 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                </div>
                <p className="text-slate-300 text-sm mb-3 font-mono leading-relaxed">
                  "{nextTweet.content}"
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500 mt-2 border-t border-slate-800 pt-3">
                  <span>Scheduled: {new Date(nextTweet.scheduledTime).toLocaleString()}</span>
                  <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded">Auto-Deploy</span>
                </div>
              </div>
            ) : (
              <div className="text-center p-8 border-2 border-dashed border-slate-800 rounded-lg">
                <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-500">Queue Empty</p>
              </div>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Recent System Logs</h3>
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 text-sm">
                  <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                    log.level === 'error' ? 'bg-red-500' : 
                    log.level === 'warn' ? 'bg-amber-500' : 
                    log.level === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                  }`} />
                  <div>
                    <p className="text-slate-300">{log.message}</p>
                    <span className="text-xs text-slate-600">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for Recharts to avoid type issues in main render
const AreaChartWrapper = ({ data }: { data: EngagementMetric[] }) => (
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
    <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
    <Tooltip 
      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
      itemStyle={{ color: '#818cf8' }}
    />
    <Line type="monotone" dataKey="likes" stroke="#818cf8" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
    <Line type="monotone" dataKey="retweets" stroke="#34d399" strokeWidth={2} dot={false} />
  </LineChart>
);
