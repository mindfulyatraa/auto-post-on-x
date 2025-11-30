import React, { useState } from 'react';
import { BotConfig } from '../types';
import { Save, Shield, Clock, RotateCcw } from 'lucide-react';

interface SettingsProps {
  config: BotConfig;
  setConfig: React.Dispatch<React.SetStateAction<BotConfig>>;
}

export const Settings: React.FC<SettingsProps> = ({ config, setConfig }) => {
  const [localConfig, setLocalConfig] = useState<BotConfig>(config);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setConfig(localConfig);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl">
      <header>
        <h2 className="text-2xl font-bold text-slate-100">System Configuration</h2>
        <p className="text-slate-400">Manage API credentials and operational parameters.</p>
      </header>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <Shield className="w-5 h-5 text-indigo-400" />
          <h3 className="font-semibold text-slate-100">Twitter API Credentials (OAuth 1.0a)</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm text-slate-400">API Key (Consumer Key)</label>
            <input
              type="password"
              value={localConfig.twitterApiKey}
              onChange={(e) => setLocalConfig({...localConfig, twitterApiKey: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-400">API Secret</label>
            <input
              type="password"
              value={localConfig.twitterApiSecret}
              onChange={(e) => setLocalConfig({...localConfig, twitterApiSecret: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-400">Access Token</label>
            <input
              type="password"
              value={localConfig.accessToken}
              onChange={(e) => setLocalConfig({...localConfig, accessToken: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-400">Access Secret</label>
            <input
              type="password"
              value={localConfig.accessSecret}
              onChange={(e) => setLocalConfig({...localConfig, accessSecret: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <Clock className="w-5 h-5 text-emerald-400" />
          <h3 className="font-semibold text-slate-100">Scheduler & Behavior</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-2">
            <label className="text-sm text-slate-400">Daily Post Time (UTC)</label>
            <input
              type="time"
              value={localConfig.scheduleTime}
              onChange={(e) => setLocalConfig({...localConfig, scheduleTime: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:ring-1 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-400">Frequency</label>
            <select
              value={localConfig.frequency}
              onChange={(e) => setLocalConfig({...localConfig, frequency: e.target.value as 'daily' | 'twice-daily'})}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:ring-1 focus:ring-emerald-500 outline-none"
            >
              <option value="daily">Daily (Once per 24h)</option>
              <option value="twice-daily">High Intensity (Twice daily)</option>
            </select>
          </div>
          <div className="md:col-span-2 flex items-center justify-between p-4 bg-slate-950 rounded-lg border border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-slate-400" />
                <span className="text-slate-200 font-medium">Auto-Retry on Failure</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Automatically retry failed posts up to 3 times with exponential backoff.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={localConfig.autoRetry} 
                onChange={(e) => setLocalConfig({...localConfig, autoRetry: e.target.checked})}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg shadow-indigo-500/20"
        >
          {saved ? (
             <span className="text-white">Changes Saved!</span>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Configuration
            </>
          )}
        </button>
      </div>
    </div>
  );
};
