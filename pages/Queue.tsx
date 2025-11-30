import React, { useState } from 'react';
import { Tweet } from '../types';
import { Trash2, Calendar, Edit2, Image as ImageIcon, Plus } from 'lucide-react';

interface QueueProps {
  queue: Tweet[];
  setQueue: React.Dispatch<React.SetStateAction<Tweet[]>>;
}

export const Queue: React.FC<QueueProps> = ({ queue, setQueue }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTweetContent, setNewTweetContent] = useState('');
  const [newTweetDate, setNewTweetDate] = useState('');

  const handleDelete = (id: string) => {
    setQueue(prev => prev.filter(t => t.id !== id));
  };

  const handleAddTweet = () => {
    if (!newTweetContent || !newTweetDate) return;

    const newTweet: Tweet = {
      id: Date.now().toString(),
      content: newTweetContent,
      scheduledTime: new Date(newTweetDate).toISOString(),
      status: 'queued',
      likes: 0,
      retweets: 0
    };

    setQueue(prev => [...prev, newTweet].sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()));
    setIsAdding(false);
    setNewTweetContent('');
    setNewTweetDate('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Transmission Queue</h2>
          <p className="text-slate-400">Manage and schedule outgoing communications.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Manual Entry
        </button>
      </div>

      {isAdding && (
        <div className="bg-slate-900 border border-indigo-500/50 p-6 rounded-xl mb-6 shadow-lg shadow-indigo-500/10">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">New Transmission</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Content</label>
              <textarea
                value={newTweetContent}
                onChange={(e) => setNewTweetContent(e.target.value)}
                maxLength={280}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
                placeholder="Enter tweet content..."
              />
              <div className="text-right text-xs text-slate-500 mt-1">{newTweetContent.length}/280</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Schedule Time</label>
              <input
                type="datetime-local"
                value={newTweetDate}
                onChange={(e) => setNewTweetDate(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-400 hover:text-slate-200">Cancel</button>
              <button onClick={handleAddTweet} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">Schedule</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {queue.map((tweet) => (
          <div 
            key={tweet.id} 
            className={`bg-slate-900 border ${tweet.status === 'posted' ? 'border-emerald-500/20' : 'border-slate-800'} p-5 rounded-xl flex flex-col md:flex-row gap-4 justify-between items-start md:items-center group hover:border-slate-700 transition-colors`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  tweet.status === 'posted' ? 'bg-emerald-500/10 text-emerald-400' :
                  tweet.status === 'failed' ? 'bg-red-500/10 text-red-400' :
                  'bg-blue-500/10 text-blue-400'
                }`}>
                  {tweet.status}
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Calendar className="w-3 h-3" />
                  {new Date(tweet.scheduledTime).toLocaleString()}
                </span>
                {tweet.mediaUrl && (
                  <span className="flex items-center gap-1 text-xs text-indigo-400">
                    <ImageIcon className="w-3 h-3" /> Media Attached
                  </span>
                )}
              </div>
              <p className="text-slate-200 font-mono text-sm leading-relaxed">{tweet.content}</p>
            </div>
            
            {tweet.status === 'queued' && (
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-400 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(tweet.id)}
                  className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
