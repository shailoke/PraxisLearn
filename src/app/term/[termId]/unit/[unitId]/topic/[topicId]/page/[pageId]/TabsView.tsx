"use client";

import { useState } from 'react';
import { Lightbulb, Sparkles, BookOpen, Quote, Target, Brain, ArrowRight, CheckCircle2 } from 'lucide-react';
import PracticeTab from '@/components/PracticeTab';

export default function TabsView({ data, questions }: { data: any; questions: any[] }) {
  const [activeTab, setActiveTab] = useState<'learn' | 'deepDive' | 'practice' | 'challenge'>('learn');

  const tabs = [
    { id: 'learn', label: 'Learn', icon: <BookOpen size={18} /> },
    { id: 'deepDive', label: 'Deep Dive', icon: <Lightbulb size={18} /> },
    { id: 'practice', label: 'Practice', icon: <Target size={18} /> },
    { id: 'challenge', label: 'Challenge', icon: <Brain size={18} /> },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex overflow-x-auto hide-scrollbar bg-white/50 backdrop-blur-md p-2 rounded-2xl shadow-sm border border-slate-100/50">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={"flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all duration-300 " + 
              (activeTab === tab.id
                ? "bg-primary text-white shadow-md transform scale-[1.02]"
                : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900")
            }
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Areas */}
      <div className="min-h-[400px]">
        {/* LEARN TAB */}
        {activeTab === 'learn' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-6">
            <div className="glass-card p-6 sm:p-8 bg-white border border-primary/10 shadow-lg shadow-primary/5">
              <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">1</span>
                The Basics
              </h2>
              <p className="text-xl text-slate-700 leading-relaxed font-medium">
                {data.simple_explanation}
              </p>
            </div>

            {data.key_points && data.key_points.length > 0 && (
              <div className="glass-card p-6 border-t-4 border-t-accent bg-gradient-to-br from-white to-slate-50">
                <h3 className="flex items-center gap-2 text-xl font-bold text-slate-800 mb-4">
                  <Sparkles className="text-accent" /> Key Points
                </h3>
                <ul className="space-y-4">
                  {data.key_points.map((pt: string, i: number) => (
                    <li key={i} className="flex items-start gap-4 text-lg text-slate-700 font-medium bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                      <CheckCircle2 className="text-green-500 shrink-0 mt-1" size={24} />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* DEEP DIVE TAB */}
        {activeTab === 'deepDive' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-6">
            {data.detailed_explanation && (
              <div className="glass-card p-6 sm:p-8 bg-blue-50/50 border border-blue-100">
                <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                   <Lightbulb className="text-blue-500" size={28} /> Further Details
                </h2>
                <p className="text-lg md:text-xl text-slate-700 leading-relaxed font-medium">
                  {data.detailed_explanation}
                </p>
              </div>
            )}

            {data.examples_expanded && data.examples_expanded.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-800 mt-2 mb-4 px-2">Real Examples</h3>
                {data.examples_expanded.map((ex: any, i: number) => (
                  <div key={i} className="glass-card p-6 border-l-4 border-l-amber-400 bg-white">
                    <div className="flex gap-4">
                       <Quote className="text-amber-200 shrink-0" size={32} />
                       <div className="space-y-2">
                         <p className="text-slate-800 font-bold text-xl">{ex.text}</p>
                         <p className="text-slate-500 font-medium text-md">{ex.context}</p>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PRACTICE TAB */}
        {activeTab === 'practice' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <PracticeTab questions={questions} />
          </div>
        )}

        {/* CHALLENGE TAB */}
        {activeTab === 'challenge' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-6">
            <div className="glass-card p-6 sm:p-10 bg-gradient-to-br from-indigo-900 to-slate-900 border-none shadow-2xl relative overflow-hidden">
               <div className="absolute -top-10 -right-10 opacity-10">
                 <Brain size={250} className="text-white" />
               </div>
               
               <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-3 relative z-10">
                 <Brain className="text-accent" size={32} /> The Master Challenge
               </h2>
               
               <div className="space-y-6 relative z-10">
                 {data.challenge_tasks?.map((task: string, i: number) => (
                   <div key={i} className="p-6 rounded-2xl bg-white/10 backdrop-blur text-white border border-white/20 hover:bg-white/20 transition-colors">
                     <p className="text-xl font-medium leading-relaxed">{task}</p>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
