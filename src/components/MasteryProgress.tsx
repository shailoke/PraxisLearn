"use client";

import { useEffect, useState } from 'react';
import { Target, CheckCircle2 } from 'lucide-react';

export default function MasteryProgress({ totalTopics }: { totalTopics: number }) {
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      const saved = localStorage.getItem("completed_topics");
      if (saved) {
        try {
          const completed = JSON.parse(saved);
          setCompletedCount(completed.length);
        } catch (e) {}
      }
    };

    updateCount();
    window.addEventListener('storage', updateCount);
    return () => window.removeEventListener('storage', updateCount);
  }, []);

  const percentage = Math.round((completedCount / totalTopics) * 100);

  return (
    <div className="glass-card p-6 bg-white border border-slate-100 shadow-sm animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Target className="text-primary" size={24} /> Overall Progress
          </h3>
          <p className="text-slate-500 font-bold ml-8">
            {completedCount} of {totalTopics} topics mastered
          </p>
        </div>
        <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-2xl font-black text-2xl shadow-inner">
          {percentage}%
        </div>
      </div>
      
      <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden border border-slate-200">
        <div 
          className="bg-gradient-to-r from-emerald-400 to-indigo-500 h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: (percentage || 2) + '%' }}
        />
      </div>
    </div>
  );
}
