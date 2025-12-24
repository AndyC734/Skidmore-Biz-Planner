
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Volume2, Shield, Zap, Terminal, Globe, Cpu, ChevronRight } from 'lucide-react';
import { chatWithCoach, generateSpeech } from '../services/geminiService';
import { playRawAudio } from '../services/audioHelper';
import ReactMarkdown from 'react-markdown';

const THINKING_STEPS = [
  "INITIALIZING THOROUGHBRED PROTOCOLS...",
  "INGESTING STUDENT CONTEXT...",
  "QUERYING GLOBAL RECRUITING DATABASES...",
  "ANALYZING SKIDMORE CDC BENCHMARKS...",
  "SYNTHESIZING STRATEGIC RESPONSE..."
];

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; content: string }[]>([
    { role: 'model', content: "### THOROUGHBRED STRATEGIST INITIALIZED\n\nWelcome to the Command Center. I am your **Skidmore Thoroughbred Strategist**. My protocols are optimized for Summer 2026 placements and Skidmore-specific career pathways. \n\nWhat is our current objective?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [speakingId, setSpeakingId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isTyping]);

  useEffect(() => {
    let interval: any;
    if (isTyping) {
      interval = setInterval(() => {
        setThinkingStep((prev) => (prev + 1) % THINKING_STEPS.length);
      }, 1500);
    } else {
      setThinkingStep(0);
    }
    return () => clearInterval(interval);
  }, [isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      const response = await chatWithCoach(history, userMessage);
      setMessages([...newMessages, { role: 'model', content: response }]);
    } catch (error) {
      setMessages([...newMessages, { role: 'model', content: "CRITICAL ERROR: Connection to Thoroughbred nodes disrupted. Please re-attempt protocol." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSpeak = async (text: string, id: number) => {
    if (speakingId !== null) return;
    setSpeakingId(id);
    try {
      const audioBase64 = await generateSpeech(text.substring(0, 500));
      await playRawAudio(audioBase64);
    } catch (error) {
      console.error("Speech failed", error);
    } finally {
      setSpeakingId(null);
    }
  };

  return (
    <div className="bg-[#0a0c10] rounded-[2.5rem] shadow-2xl border border-white/10 h-[700px] flex flex-col overflow-hidden animate-fade-in relative group">
        {/* Glow Effects */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Command Header */}
        <div className="bg-white/5 backdrop-blur-md p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="bg-emerald-500 p-2.5 rounded-xl shadow-lg shadow-emerald-500/20">
                    <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h2 className="text-white font-black uppercase italic tracking-tighter text-xl">Thoroughbred Strategist</h2>
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                        <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Live Skidmore Feed</span>
                    </div>
                </div>
            </div>
            <div className="flex gap-2">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                    <Globe className="w-4 h-4 text-white/40" />
                </div>
                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                    <Cpu className="w-4 h-4 text-white/40" />
                </div>
            </div>
        </div>
      
      {/* Feed Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-white/10">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`max-w-[85%] relative ${
              msg.role === 'user' 
                ? 'bg-emerald-500 text-white rounded-3xl rounded-br-none p-5 shadow-xl shadow-emerald-500/10 border border-white/20' 
                : 'bg-white/5 border border-white/10 text-emerald-50/90 rounded-3xl rounded-bl-none p-6 shadow-2xl'
            }`}>
              {msg.role === 'model' && (
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
                    <div className="bg-emerald-500/20 p-1.5 rounded-lg">
                        <Zap className="w-3 h-3 text-emerald-400" />
                    </div>
                    <span className="text-[10px] font-black text-emerald-400/60 uppercase tracking-widest">Strategist Response</span>
                    <div className="flex-1"></div>
                    <button 
                      onClick={() => handleSpeak(msg.content, idx)}
                      disabled={speakingId !== null}
                      className={`p-1.5 rounded-lg bg-white/5 border border-white/5 transition-all hover:scale-110 ${speakingId === idx ? 'text-emerald-400 animate-pulse' : 'text-white/40 hover:text-white'}`}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                </div>
              )}

              <div className={`prose prose-invert prose-sm max-w-none ${msg.role === 'user' ? 'text-white' : 'text-emerald-50/90'}
                prose-headings:text-emerald-400 prose-headings:font-black prose-headings:uppercase prose-headings:tracking-widest
                prose-li:marker:text-emerald-400 prose-p:leading-relaxed prose-strong:text-emerald-300`}>
                  {msg.role === 'model' ? <ReactMarkdown>{msg.content}</ReactMarkdown> : msg.content}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-white/5 border border-white/10 rounded-3xl rounded-bl-none p-6 shadow-2xl w-full max-w-[85%]">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] animate-pulse">
                    {THINKING_STEPS[thinkingStep]}
                </span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-emerald-500/50 transition-all duration-1000 ease-in-out" 
                    style={{ width: `${((thinkingStep + 1) / THINKING_STEPS.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Control Input */}
      <div className="p-6 bg-white/5 border-t border-white/10">
        <div className="relative group/input">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-[1.5rem] opacity-0 group-focus-within/input:opacity-100 transition-opacity"></div>
          <div className="relative flex gap-3 bg-[#0a0c10] border border-white/10 rounded-[1.5rem] p-3">
            <div className="flex items-center justify-center pl-3">
                <Terminal className="w-4 h-4 text-emerald-500/50" />
            </div>
            <input
              type="text"
              className="flex-1 bg-transparent text-white placeholder:text-white/20 text-sm font-bold focus:outline-none px-2"
              placeholder="ENTER STRATEGIC COMMAND..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={handleSend}
              disabled={isTyping || !input.trim()}
              className="bg-emerald-500 text-white p-3 rounded-xl hover:bg-emerald-400 disabled:opacity-30 disabled:grayscale transition-all shadow-lg shadow-emerald-500/20"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center mt-4 px-2">
            <p className="text-[8px] font-black text-white/10 uppercase tracking-[0.3em]">Thoroughbred Network v3.0 // Ready</p>
            <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <div className="w-0.5 h-0.5 rounded-full bg-emerald-500"></div>
                 </div>
                 <span className="text-[8px] font-black text-emerald-500/40 uppercase tracking-widest">Secure Uplink</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
