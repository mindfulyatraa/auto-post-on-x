import React, { useState } from 'react';
import { generateTweetIdeas, checkGrammarAndTone } from '../services/geminiService';
import { Tweet } from '../types';
import { Sparkles, RefreshCw, Plus, Key, Wand2 } from 'lucide-react';

interface GeneratorProps {
  onAddToQueue: (content: string) => void;
  geminiKey: string;
  setGeminiKey: (key: string) => void;
}

const SENTIMENT_OPTIONS = [
  { value: 'inspiring, energetic, and slightly futuristic', label: 'Default (Space Runner)' },
  { value: 'highly motivational and aggressive', label: 'High Intensity / Hardcore' },
  { value: 'mysterious and cryptic', label: 'Mysterious / Deep Space' },
  { value: 'humorous and witty', label: 'Witty / Fun' },
  { value: 'calm and philosophical', label: 'Zen / Recovery' },
  { value: 'urgent and alert-like', label: 'Mission Alert / Urgent' },
];

export const Generator: React.FC<GeneratorProps> = ({ onAddToQueue, geminiKey, setGeminiKey }) => {
  const [topic, setTopic] = useState('');
  const [sentiment, setSentiment] = useState(SENTIMENT_OPTIONS[0].value);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [improvingIndices, setImprovingIndices] = useState<Set<number>>(new Set());

  const handleGenerate = async () => {
    if (!geminiKey) {
      setError("Gemini API Key is required to proceed.");
      return;
    }
    if (!topic.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const ideas = await generateTweetIdeas(geminiKey, topic, sentiment);
      setGeneratedIdeas(ideas);
    } catch (e) {
      setError("Failed to generate content. Check API Key or try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImprove = async (index: number, content: string) => {
    if (!geminiKey) return;

    setImprovingIndices(prev => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });

    try {
      const improvedContent = await checkGrammarAndTone(geminiKey, content);
      setGeneratedIdeas(prev => {
        const newIdeas = [...prev];
        newIdeas[index] = improvedContent;
        return newIdeas;
      });
    } catch (err) {
      setError("Failed to improve tone. Please try again.");
    } finally {
      setImprovingIndices(prev => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header>
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-indigo-400" />
          AI Content Fabricator
        </h2>
        <p className="text-slate-400">Generate high-engagement content using Gemini 2.5 Flash.</p>
      </header>

      {/* API Key Input Section (Demo purpose) */}
      {!geminiKey && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-3">
          <Key className="w-5 h-5 text-amber-400 mt-1" />
          <div className="flex-1">
            <h3 className="text-amber-400 font-medium mb-1">Authentication Required</h3>
            <p className="text-sm text-slate-400 mb-3">Please enter your Google Gemini API Key to enable the neural generation engine.</p>
            <input
              type="password"
              placeholder="Paste API Key here..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 text-sm focus:ring-1 focus:ring-amber-400 outline-none"
              onChange={(e) => setGeminiKey(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">Topic or Theme</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Running on Mars, Zero-G Endurance, Cyberpunk Marathon..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none h-32 resize-none"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">Sentiment / Tone</label>
              <select
                value={sentiment}
                onChange={(e) => setSentiment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {SENTIMENT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading || !topic || !geminiKey}
              className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-all ${
                isLoading || !geminiKey
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Computing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Generate Ideas
                </>
              )}
            </button>
            {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
             <h3 className="text-sm font-medium text-slate-300 mb-2">Model Configuration</h3>
             <div className="flex justify-between items-center text-xs text-slate-500 border-b border-slate-800 py-2">
                <span>Model</span>
                <span className="text-slate-300">gemini-2.5-flash</span>
             </div>
             <div className="flex justify-between items-center text-xs text-slate-500 border-b border-slate-800 py-2">
                <span>Creativity (Temp)</span>
                <span className="text-slate-300">0.7</span>
             </div>
             <div className="flex justify-between items-center text-xs text-slate-500 pt-2">
                <span>Tone</span>
                <span className="text-slate-300 truncate max-w-[150px]">{SENTIMENT_OPTIONS.find(o => o.value === sentiment)?.label}</span>
             </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {generatedIdeas.length > 0 ? (
            <div className="grid gap-4">
              {generatedIdeas.map((idea, index) => {
                const isImproving = improvingIndices.has(index);
                return (
                  <div key={index} className="bg-slate-900 border border-slate-800 p-5 rounded-xl group hover:border-indigo-500/50 transition-all">
                    <p className={`text-slate-200 font-mono text-sm leading-relaxed mb-4 ${isImproving ? 'animate-pulse opacity-70' : ''}`}>
                      "{idea}"
                    </p>
                    <div className="flex justify-between items-center border-t border-slate-800 pt-3 opacity-50 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs text-slate-500">{idea.length} chars</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleImprove(index, idea)}
                          disabled={isImproving || !geminiKey}
                          className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded flex items-center gap-1 transition-colors disabled:opacity-50"
                        >
                          {isImproving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                          {isImproving ? 'Refining...' : 'Check Tone'}
                        </button>
                        <button
                          onClick={() => onAddToQueue(idea)}
                          disabled={isImproving}
                          className="text-xs bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 px-3 py-1.5 rounded flex items-center gap-1 transition-colors"
                        >
                          <Plus className="w-3 h-3" /> Add to Queue
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/50">
              <Sparkles className="w-12 h-12 mb-4 opacity-20" />
              <p>Awaiting generation parameters...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};