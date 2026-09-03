import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Sparkles, Bot, User } from 'lucide-react';

export default function ChatAssistant({ isOpen, onClose, user, categories, isDarkMode }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Halo! Saya Al Asisten Kosakata. Tanyakan apa saja seputar bahasa Inggris dan saya akan langsung jawab dengan cepat!` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages]);

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    // Simulasi atau integrasi API chat kamu di sini
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `Baik ${user}, saya mengerti pertanyaan tentang "${userMessage}". Fitur AI sedang memprosesnya!` }
      ]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className={`w-full max-w-lg h-[85vh] sm:h-[600px] flex flex-col rounded-3xl shadow-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'} overflow-hidden animate-in fade-in zoom-in-95 duration-200`}>
        
        {/* Header Chat */}
        <div className={`p-4 border-b ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50/50'} flex items-center justify-between shrink-0`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-teal-500 to-emerald-400 rounded-xl text-slate-950 shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold flex items-center gap-1.5">
                AI Asisten Kosakata <Sparkles className="w-3.5 h-3.5 text-teal-500 fill-current" />
              </h3>
              <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Online & Siap Membantu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl border transition ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Pesan Chat */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-500 flex items-center justify-center shrink-0 border border-teal-500/30">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-teal-500 text-slate-950 font-medium rounded-tr-none shadow-sm'
                    : isDarkMode
                    ? 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/50'
                    : 'bg-slate-100 text-slate-800 rounded-tl-none'
                }`}
              >
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-teal-500 text-slate-950 flex items-center justify-center shrink-0 font-bold text-xs shadow-sm">
                  {user.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-2.5 items-center">
              <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-500 flex items-center justify-center shrink-0 border border-teal-500/30">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className={`p-3 rounded-2xl text-xs ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                Sedang mengetik...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Footer Input Chat */}
        <form onSubmit={handleSend} className={`p-3 border-t ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50/50'} flex gap-2 shrink-0`}>
          <input
            type="text"
            placeholder="Tanya apa saja (contoh: bahasa Inggris meja)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={`flex-1 px-4 py-2.5 border rounded-xl text-xs font-medium focus:outline-none transition ${
              isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-teal-500' : 'bg-white border-slate-200 text-slate-900 focus:border-teal-500'
            }`}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center transition shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}