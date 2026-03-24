"use client";

import { useEffect, useState } from 'react';
import { Trophy, Star } from 'lucide-react';

export default function PracticeScore({ compact = false }: { compact?: boolean }) {
  const [scores, setScores] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("practice_scores");
    if (saved) {
      try {
        setScores(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse scores", e);
      }
    }
    setIsInitialized(true);

    // Listen for storage changes in other tabs
    const handleStorage = () => {
      const updated = localStorage.getItem("practice_scores");
      if (updated) setScores(JSON.parse(updated));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  if (!isInitialized || !scores || scores.total_questions === 0) {
    if (compact) return null;
    return (
       <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
         <Trophy size={16} /> Start practicing to earn points!
       </div>
    );
  }

  const percentage = Math.round((scores.total_score / scores.total_questions) * 100);

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-black shadow-sm border border-amber-200 animate-in fade-in scale-in duration-500">
        <Trophy size={12} /> {scores.total_score} pts
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 animate-in fade-in slide-in-from-left duration-700">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-400 text-white flex items-center justify-center shadow-lg shadow-amber-200">
          <Trophy size={20} />
        </div>
        <div>
          <h4 className="text-sm font-black text-slate-500 uppercase tracking-tighter leading-none mb-1">Total Mastery</h4>
          <div className="flex items-baseline gap-1">
             <span className="text-3xl font-black text-slate-800">{scores.total_score}</span>
             <span className="text-lg font-bold text-slate-400">/ {scores.total_questions}</span>
          </div>
        </div>
      </div>
      <div className="w-full mt-2 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
        <div 
          className="bg-gradient-to-r from-amber-400 to-orange-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
          style={{ width: percentage + '%' }}
        />
      </div>
      <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mt-1 text-right">
        {percentage}% Global Proficiency
      </p>
    </div>
  );
}
