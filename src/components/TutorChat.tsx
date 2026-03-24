"use client";

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, HelpCircle, Loader2, MessageSquare, X, Maximize2, Minimize2 } from 'lucide-react';

interface TutorChatProps {
  topic: string;
  lessonContent: string;
  onHideDesktop?: () => void;
  onExpandDesktop?: () => void;
  isExpanded?: boolean;
}

interface Message {
  id: string;
  role: 'user' | 'tutor';
  content: string;
}

export default function TutorChat({ topic, lessonContent, onHideDesktop, onExpandDesktop, isExpanded }: TutorChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'tutor', content: "Hi! I'm your tutor. What would you like to know about this topic?" }
  ]);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const askTutor = async (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: text }]);
    setQuestion('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, lesson_content: lessonContent, user_question: text }),
      });
      const data = await res.json();
      const answer = res.ok ? data.answer : "Oops! The tutor is taking a break. Try again!";
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'tutor', content: answer }]);
    } catch {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'tutor', content: 'Could not connect to the tutor.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { label: 'Explain simply', icon: <HelpCircle size={14} /> },
    { label: 'More examples', icon: <Sparkles size={14} /> },
    { label: 'Test me', icon: <Bot size={14} /> },
  ];

  const chatUI = (
    <div className="flex flex-col h-full bg-slate-50 border border-slate-200 shadow-xl rounded-2xl overflow-hidden">
      
      {/* Header */}
      <div className="bg-indigo-600 p-4 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-xl">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Ask Your Tutor</h2>
            <p className="text-indigo-100 text-xs font-medium">Always here to help!</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {onExpandDesktop && (
            <button onClick={onExpandDesktop} title={isExpanded ? 'Shrink panel' : 'Expand panel'} className="hidden lg:flex p-1.5 hover:bg-white/20 rounded-lg transition">
              {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          )}
          {onHideDesktop && (
            <button onClick={onHideDesktop} title="Hide tutor panel" className="hidden lg:flex p-1.5 hover:bg-white/20 rounded-lg transition">
              <X size={20} />
            </button>
          )}
          <button onClick={() => setIsOpenMobile(false)} className="lg:hidden p-2 bg-white/10 rounded-full hover:bg-white/20 transition ml-2">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => {
          const isUser = msg.role === 'user';
          const rowClass = 'flex gap-3 ' + (isUser ? 'flex-row-reverse' : '');
          const bubbleClass = 'p-4 rounded-2xl max-w-[85%] text-sm font-medium leading-relaxed ' +
            (isUser
              ? 'bg-indigo-600 text-white rounded-tr-sm shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm whitespace-pre-wrap');
          return (
            <div key={msg.id} className={rowClass}>
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <Bot size={16} className="text-indigo-600" />
                </div>
              )}
              <div className={bubbleClass}>{msg.content}</div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
              <Bot size={16} className="text-indigo-600" />
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-500 rounded-tl-sm flex items-center gap-2">
              <Loader2 className="animate-spin" size={16} /> Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-200 shrink-0">
        <div className="flex flex-wrap gap-2 mb-3">
          {quickActions.map((a, i) => (
            <button key={i} onClick={() => askTutor(a.label)} disabled={isLoading}
              className="px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold hover:bg-indigo-100 transition-colors flex items-center gap-1.5 text-xs disabled:opacity-50">
              {a.icon}{a.label}
            </button>
          ))}
        </div>
        <form onSubmit={e => { e.preventDefault(); askTutor(question); }} className="flex gap-2">
          <input
            type="text" placeholder="Ask a question..." value={question}
            onChange={e => setQuestion(e.target.value)} disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none font-medium text-slate-700 text-sm disabled:opacity-50"
          />
          <button type="submit" disabled={isLoading || !question.trim()}
            className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-50 flex items-center justify-center">
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile FAB */}
      <button onClick={() => setIsOpenMobile(true)} className="lg:hidden fixed bottom-6 right-6 z-40 bg-indigo-600 text-white p-4 rounded-full shadow-2xl flex items-center gap-2 font-bold hover:bg-indigo-700 hover:scale-105 transition-all">
        <MessageSquare size={24} />
      </button>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/20 backdrop-blur-sm">
          <div className="h-[80vh] w-full">{chatUI}</div>
        </div>
      )}

      {/* Desktop Sticky Panel */}
      <div className="hidden lg:block h-[calc(100vh-2rem)] sticky top-4 w-full">
        {chatUI}
      </div>
    </>
  );
}
