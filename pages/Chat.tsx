import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2, Key, Loader2, Sparkles, Plus, Copy, X, Check, MessageSquare, Wand2, Languages, Rocket } from 'lucide-react';

interface ChatProps {
  geminiKey: string;
  setGeminiKey: (key: string) => void;
  onAddToQueue: (content: string, scheduledTime?: string) => void;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  isStreaming?: boolean;
  isJson?: boolean;
}

const SENTIMENT_OPTIONS = [
  { value: 'inspiring, energetic, and slightly futuristic', label: 'Space Runner (Default)' },
  { value: 'highly motivational and aggressive', label: 'High Intensity' },
  { value: 'mysterious and cryptic', label: 'Deep Space' },
  { value: 'humorous and witty', label: 'Witty / Fun' },
  { value: 'calm and philosophical', label: 'Zen Recovery' },
  { value: 'urgent and alert-like', label: 'Mission Alert' },
];

const LANGUAGE_OPTIONS = [
  { value: 'English', label: 'English' },
  { value: 'Hindi', label: 'Hindi' },
  { value: 'Hinglish', label: 'Hinglish (Mix)' },
];

const STORAGE_KEY = 'space_runner_chat_history';

const INITIAL_MESSAGE: Message = {
  id: 'init',
  role: 'model',
  text: "Greetings, Commander! 🚀 I am your Mission Control AI.\n\nI'm here to help you strategize and deploy your social transmissions.\n\n**Mission Protocols:**\n✨ **Creator Mode** (Sparkles icon): Generate batches of structured tweet ideas.\n📅 **Queue**: Click the + button on any tweet card to schedule it instantly.\n🗣️ **Language**: I am fluent in English, Hindi, and Hinglish.\n\nReady to launch? What's on your mind?"
};

// Helper to ensure consistent persona across initial load and resets
const getSystemInstruction = (language: string) => `You are the Space Runner Mission Control AI, a helpful and conversational assistant for a futuristic sci-fi fitness brand. Your mission is to assist the user in crafting the perfect social media presence.

Guidelines:
1.  **Persona**: Be professional yet conversational, like a supportive co-pilot. Use space/mission control metaphors occasionally but keep it grounded and helpful.
2.  **Tweet Generation**: When asked to write tweets, ALWAYS provide a brief strategy or theory explanation first. THEN, provide the tweet content wrapped in <tweet> tags.
    Example:
    "Here is a strategy based on high-intensity interval training...
    <tweet>Gravity is just a suggestion. #SpaceRunner</tweet>"
3.  **Challenge Mode**: If the user asks for a "Challenge" (e.g., "30 days, 2 posts/day"), you MUST generate a structured JSON plan.
    -   Format:
    \`\`\`json
    {
      "type": "challenge",
      "title": "Challenge Name",
      "duration": 30,
      "tweets": [
        { "day": 1, "slot": "morning", "content": "Tweet 1..." },
        { "day": 1, "slot": "night", "content": "Tweet 2..." }
      ]
    }
    \`\`\`
    -   Do NOT wrap this JSON in <tweet> tags. Output it as a raw JSON block.
4.  **Feature Guidance**: If the user seems stuck or asks for multiple ideas, politely suggest using the 'Creator Mode' (sparkles icon) for structured output.
5.  **Scheduling**: The user can schedule tweets directly from your response if they are wrapped in <tweet> tags or if a Challenge JSON is provided.
6.  **Language**: The user has selected '${language}'. You MUST converse and generate content primarily in this language. If 'Hinglish', mix Hindi and English naturally.

Input Handling:
- If the user sends a request via the Creator Mode (detected by specific prompt structure requesting JSON), strictly follow the JSON output format required for the UI.
- For normal chat, just be helpful and conversational, but ALWAYS wrap suggested tweet content in <tweet> tags.`;

export const Chat: React.FC<ChatProps> = ({ geminiKey, setGeminiKey, onAddToQueue }) => {
  // Initialize state from local storage or default
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [INITIAL_MESSAGE];
    } catch (e) {
      console.error("Failed to load chat history", e);
      return [INITIAL_MESSAGE];
    }
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);

  // Generator State
  const [genTopic, setGenTopic] = useState('');
  const [genSentiment, setGenSentiment] = useState(SENTIMENT_OPTIONS[0].value);
  const [language, setLanguage] = useState(LANGUAGE_OPTIONS[0].value);

  // Scheduling State
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedTextToSchedule, setSelectedTextToSchedule] = useState('');

  // Challenge State
  const [challengeModalOpen, setChallengeModalOpen] = useState(false);
  const [challengePlan, setChallengePlan] = useState<any>(null);

  const chatSessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);

  // Persistence Effect
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  // Initialize conversation history from messages
  useEffect(() => {
    const history = messages
      .filter(m => m.id !== 'init' && !m.isStreaming && !m.text.includes("Connection error"))
      .map(m => ({
        role: m.role === 'model' ? 'assistant' : 'user',
        content: m.text
      }));
    setConversationHistory(history);
  }, []); // Re-init if key or language preference changes.

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string, isGeneratorRequest: boolean = false) => {
    if (!text.trim() || !geminiKey) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: isGeneratorRequest ? `Generate tweets about: ${genTopic} (${language})` : text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Build conversation history for Gemini
      // Gemini expects: { role: "user" | "model", parts: [{ text: "..." }] }
      const contents = conversationHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      // Add current message
      contents.push({
        role: 'user',
        parts: [{ text: text }]
      });

      // Add system instruction as the first part of the first message or use system_instruction field if supported
      // For simplicity with REST, we can prepend it to the first user message or just rely on the prompt context
      if (contents.length > 0 && contents[0].role === 'user') {
        contents[0].parts[0].text = `${getSystemInstruction(language)}\n\n${contents[0].parts[0].text}`;
      } else {
        contents.unshift({
          role: 'user',
          parts: [{ text: getSystemInstruction(language) }]
        });
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: contents,
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 1000,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      let fullText = data.candidates[0].content.parts[0].text;

      // Update conversation history
      setConversationHistory(prev => [...prev,
      { role: 'user', content: text },
      { role: 'assistant', content: fullText }
      ]);

      // Post-processing: Check if JSON
      let isJson = false;

      // Check for Challenge JSON
      try {
        const jsonMatch = fullText.match(/```json\n([\s\S]*?)\n```/) || fullText.match(/{[\s\S]*}/);
        if (jsonMatch) {
          const potentialJson = jsonMatch[1] || jsonMatch[0];
          const parsed = JSON.parse(potentialJson);
          if (parsed.type === 'challenge' && Array.isArray(parsed.tweets)) {
            setChallengePlan(parsed);
            setChallengeModalOpen(true);
            fullText = `I've generated a ${parsed.duration}-day challenge plan for you! Click the card to review and schedule.`;
          }
        }
      } catch (e) {
        // Not a challenge JSON
      }

      if (isGeneratorRequest) {
        try {
          // Attempt to clean markdown if present
          const cleanText = fullText.replace(/```json/g, '').replace(/```/g, '').trim();
          JSON.parse(cleanText);
          isJson = true;
          // Update with clean text if it was markdown wrapped
          fullText = cleanText;
        } catch (e) {
          isJson = false;
        }
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: fullText,
        role: 'model',
        isJson
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Connection error: Unable to reach orbital relay. Please check your API Key." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => sendMessage(input);

  const handleGeneratorSubmit = () => {
    if (!genTopic) return;
    // Strict prompt to ensure JSON output for the UI to parse
    const prompt = `Generate 3 distinct tweet ideas about "${genTopic}". Tone: ${genSentiment}. Language: ${language}.
    Return the response ONLY as a raw JSON array of strings (e.g. ["Tweet 1", "Tweet 2"]). 
    Do not use markdown formatting. Do not include any other text.`;

    sendMessage(prompt, true);
    setShowGenerator(false);
    setGenTopic('');
  };

  const handleRefine = (tweet: string) => {
    const prompt = `Critique and improve this tweet for better engagement and tone (${genSentiment}). Language: ${language}. Tweet: "${tweet}". Return only the improved version.`;
    sendMessage(prompt);
  };

  const handleClear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setMessages([INITIAL_MESSAGE]);
    chatSessionRef.current = null;
    if (geminiKey) {
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      // Re-create the session with the full system instruction to maintain persona
      chatSessionRef.current = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: getSystemInstruction(language),
        }
      });
    }
  };

  const openScheduleModal = (text: string) => {
    setSelectedTextToSchedule(text);
    setScheduleModalOpen(true);
  };

  const confirmSchedule = () => {
    if (selectedTextToSchedule.trim()) {
      onAddToQueue(selectedTextToSchedule);
      setScheduleModalOpen(false);
    }
  };

  const confirmChallengeSchedule = () => {
    if (!challengePlan) return;

    // Batch schedule
    challengePlan.tweets.forEach((tweet: any) => {
      // Calculate date: Start tomorrow
      const date = new Date();
      date.setDate(date.getDate() + tweet.day);
      // Morning: 9 AM, Night: 8 PM
      date.setHours(tweet.slot === 'morning' ? 9 : 20, 0, 0, 0);

      onAddToQueue(tweet.content, date.toISOString());
    });

    setChallengeModalOpen(false);
    setChallengePlan(null);
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500 relative">
      <header className="mb-4 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-indigo-400" />
            AI Assistant
          </h2>
          <p className="text-slate-400">Chat, brainstorm, and schedule tweets directly from mission control.</p>
        </div>
        <button
          onClick={handleClear}
          className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors px-3 py-2 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800"
        >
          <Trash2 className="w-4 h-4" /> Clear Chat
        </button>
      </header>

      {/* API Key Check */}
      {!geminiKey && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-3 mb-6 shrink-0">
          <Key className="w-5 h-5 text-amber-400 mt-1" />
          <div className="flex-1">
            <h3 className="text-amber-400 font-medium mb-1">Authentication Required</h3>
            <p className="text-sm text-slate-400 mb-3">Initialize secure channel via API Key to enable chat.</p>
            <input
              type="password"
              placeholder="Paste API Key here..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 text-sm focus:ring-1 focus:ring-amber-400 outline-none"
              onChange={(e) => setGeminiKey(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-inner relative">
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.map((msg) => {
            let jsonContent: string[] = [];
            if (msg.isJson && !msg.isStreaming) {
              try {
                jsonContent = JSON.parse(msg.text);
              } catch (e) {
                console.error("Failed to parse JSON content", e);
              }
            }

            return (
              <div
                key={msg.id}
                className={`flex gap-3 group ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}>
                  {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-emerald-400" />}
                </div>

                <div className="max-w-[85%] space-y-2">
                  {/* JSON CARD RENDERER */}
                  {jsonContent.length > 0 ? (
                    <div className="grid gap-3 min-w-[300px]">
                      {jsonContent.map((tweet, idx) => (
                        <div key={idx} className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-sm">
                          <p className="text-slate-200 text-sm font-mono mb-3 leading-relaxed">"{tweet}"</p>
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleRefine(tweet)}
                              className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-1.5 rounded transition-colors"
                            >
                              <Wand2 className="w-3 h-3" /> Refine
                            </button>
                            <button
                              onClick={() => openScheduleModal(tweet)}
                              className="text-xs flex items-center gap-1 text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-1.5 rounded transition-colors"
                            >
                              <Plus className="w-3 h-3" /> Queue
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* STANDARD TEXT RENDERER */
                    <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                      }`}>
                      {msg.text.replace(/<tweet>/g, '').replace(/<\/tweet>/g, '')}
                      {msg.isStreaming && (
                        <span className="inline-block w-2 h-4 ml-1 align-middle bg-emerald-500/50 animate-pulse"></span>
                      )}
                    </div>
                  )}

                  {/* Standard Message Actions */}
                  {msg.role === 'model' && !msg.isStreaming && !msg.isJson && msg.id !== 'init' && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity px-2 mt-2">
                      {(() => {
                        const tweetMatch = msg.text.match(/<tweet>(.*?)<\/tweet>/s);
                        const tweetContent = tweetMatch ? tweetMatch[1] : null;
                        return tweetContent ? (
                          <button
                            onClick={() => openScheduleModal(tweetContent)}
                            className="text-xs flex items-center gap-1 text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-1 rounded transition-colors"
                          >
                            <Plus className="w-3 h-3" /> Schedule Tweet
                          </button>
                        ) : null;
                      })()}
                      <button
                        onClick={() => navigator.clipboard.writeText(msg.text.replace(/<\/?tweet>/g, ''))}
                        className="text-xs flex items-center gap-1 text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded transition-colors"
                      >
                        <Copy className="w-3 h-3" /> Copy Full Text
                      </button>
                    </div>
                  )}             </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Generator Panel (Collapsible) */}
        {showGenerator && (
          <div className="bg-slate-900 border-t border-slate-800 p-4 animate-in slide-in-from-bottom-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-indigo-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Creator Mode
              </h3>
              <button onClick={() => setShowGenerator(false)} className="text-slate-500 hover:text-slate-300"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <input
                value={genTopic}
                onChange={(e) => setGenTopic(e.target.value)}
                placeholder="Enter topic (e.g. Mars Marathon)"
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none"
              />
              <select
                value={genSentiment}
                onChange={(e) => setGenSentiment(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                {SENTIMENT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <div className="md:col-span-2 relative">
                <Languages className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none appearance-none"
                >
                  {LANGUAGE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={handleGeneratorSubmit}
              disabled={!genTopic}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg py-2 text-sm font-medium transition-colors flex justify-center items-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Generate Ideas
            </button>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 bg-slate-950 border-t border-slate-800">
          <div className="relative flex items-center gap-2">
            <button
              onClick={() => setShowGenerator(!showGenerator)}
              className={`p-3 rounded-lg border transition-colors ${showGenerator ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/50'}`}
              title="Toggle Creator Tools"
            >
              <Sparkles className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
              placeholder={geminiKey ? "Message Mission Control..." : "Enter API Key to enable transmission"}
              disabled={!geminiKey || isLoading}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg pl-4 pr-12 py-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || !geminiKey || isLoading}
              className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 text-white rounded-md transition-colors disabled:text-slate-500"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Schedule Review Modal */}
      {scheduleModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-indigo-500/50 rounded-xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-100">Review & Schedule</h3>
              <button onClick={() => setScheduleModalOpen(false)} className="text-slate-500 hover:text-slate-300"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-slate-400 mb-2">Edit the content below to finalize the tweet.</p>
            <textarea
              value={selectedTextToSchedule}
              onChange={(e) => setSelectedTextToSchedule(e.target.value)}
              className="w-full h-32 bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none mb-4 font-mono text-sm"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setScheduleModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-slate-200">Cancel</button>
              <button
                onClick={confirmSchedule}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 font-medium"
              >
                <Check className="w-4 h-4" /> Add to Queue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Challenge Review Modal */}
      {challengeModalOpen && challengePlan && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-indigo-500/50 rounded-xl shadow-2xl w-full max-w-4xl p-6 h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <div>
                <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-indigo-400" />
                  {challengePlan.title}
                </h3>
                <p className="text-sm text-slate-400">{challengePlan.tweets.length} Tweets • {challengePlan.duration} Days</p>
              </div>
              <button onClick={() => setChallengeModalOpen(false)} className="text-slate-500 hover:text-slate-300"><X className="w-6 h-6" /></button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {challengePlan.tweets.map((tweet: any, idx: number) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 p-4 rounded-lg flex gap-4">
                  <div className="flex flex-col items-center justify-center w-16 shrink-0 border-r border-slate-800 pr-4">
                    <span className="text-xs text-slate-500 uppercase font-bold">Day</span>
                    <span className="text-xl font-bold text-indigo-400">{tweet.day}</span>
                    <span className="text-[10px] text-slate-500 uppercase mt-1">{tweet.slot}</span>
                  </div>
                  <p className="text-slate-300 text-sm font-mono flex-1">{tweet.content}</p>
                </div>
              ))}
            </div>

            <div className="pt-6 mt-4 border-t border-slate-800 flex justify-end gap-3 shrink-0">
              <button onClick={() => setChallengeModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-slate-200">Cancel</button>
              <button
                onClick={confirmChallengeSchedule}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 font-medium shadow-lg shadow-indigo-500/20"
              >
                <Check className="w-4 h-4" /> Approve & Schedule All ({challengePlan.tweets.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};