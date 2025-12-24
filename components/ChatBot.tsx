
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Volume2 } from 'lucide-react';
import { chatWithCoach, generateSpeech } from '../services/geminiService';
import { playRawAudio } from '../services/audioHelper';
import ReactMarkdown from 'react-markdown';

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; content: string }[]>([
    { role: 'model', content: "Hey! I'm your Skidmore Senior mentor. Ask me anything about finding an internship, fixing your resume, or prepping for an interview. We're in the peak Nov 2025 window right now!" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [speakingId, setSpeakingId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user' as const, content: input }];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      const response = await chatWithCoach(history, input);
      setMessages([...newMessages, { role: 'model', content: response }]);
    } catch (error) {
      setMessages([...newMessages, { role: 'model', content: "Sorry, I lost my train of thought. Try again?" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSpeak = async (text: string, id: number) => {
    if (speakingId !== null) return;
    setSpeakingId(id);
    try {
      const audioBase64 = await generateSpeech(text.substring(0, 500)); // Limit for speed
      await playRawAudio(audioBase64);
    } catch (error) {
      console.error("Speech failed", error);
    } finally {
      setSpeakingId(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 h-[600px] flex flex-col overflow-hidden">
        <div className="bg-emerald-600 p-4 text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            <h2 className="font-bold">Coach Chat (Nov 2025 Context)</h2>
        </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-4 relative ${
              msg.role === 'user' 
                ? 'bg-emerald-600 text-white rounded-br-none' 
                : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
            }`}>
              {msg.role === 'model' && (
                <button 
                  onClick={() => handleSpeak(msg.content, idx)}
                  disabled={speakingId !== null}
                  className={`absolute -top-2 -left-2 p-1.5 rounded-full bg-white border border-indigo-100 shadow-sm transition-all hover:scale-110 ${speakingId === idx ? 'text-emerald-600 animate-pulse' : 'text-gray-400'}`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              )}
              {msg.role === 'model' ? (
                <div className="prose prose-sm max-w-none text-gray-800 pt-1">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none p-4 shadow-sm flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black caret-black text-black bg-white focus:outline-none"
            placeholder="Ask about Summer 2026 apps..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={isTyping}
            className="bg-black text-white p-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
