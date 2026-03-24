"use client";

import { useEffect, useState } from 'react';
import { Play, CheckCircle2, Star } from 'lucide-react';
import Link from 'next/link';

interface TopicCardProps {
  topicName: string;
  pagesCount: number;
  href: string;
  topicId: string;
}

export default function TopicCard({ topicName, pagesCount, href, topicId }: TopicCardProps) {
  const [status, setStatus] = useState<{ completed: boolean; stellar: boolean }>({
    completed: false,
    stellar: false
  });

  useEffect(() => {
    const syncStatus = () => {
      let isCompleted = false;
      let isStellar = false;

      const completedSaved = localStorage.getItem("completed_topics");
      if (completedSaved) {
        try {
          const completed = JSON.parse(completedSaved);
          if (completed.includes(topicId.toString())) isCompleted = true;
        } catch (e) {}
      }

      const scoresSaved = localStorage.getItem("practice_scores");
      if (scoresSaved) {
        try {
          const scores = JSON.parse(scoresSaved);
          const topicScore = scores.topics[topicId.toString()];
          if (topicScore && topicScore.score === topicScore.total && topicScore.total > 0) {
            isStellar = true;
            isCompleted = true; // High score implies completion
          }
        } catch (e) {}
      }

      setStatus({ completed: isCompleted, stellar: isStellar });
    };

    syncStatus();
    window.addEventListener('storage', syncStatus);
    return () => window.removeEventListener('storage', syncStatus);
  }, [topicId]);

  const { completed, stellar } = status;

  return (
    <Link href={href} className="group block h-full">
      <div className={"h-full bounce-hover border border-slate-100/50 rounded-2xl p-6 transition-all relative overflow-hidden " + 
        (completed ? "bg-emerald-50/40 border-emerald-100" : "bg-white hover:bg-slate-50 hover:border-primary/30 shadow-sm shadow-slate-100")
      }>
        <div className="flex items-start justify-between mb-4">
          <div className={"w-12 h-12 rounded-2xl flex items-center justify-center transition-all " + 
            (completed ? "bg-emerald-100 text-emerald-600 shadow-inner" : "bg-primary/10 text-primary group-hover:scale-110")
          }>
            {completed ? <CheckCircle2 size={24} /> : <Play size={20} fill="currentColor" />}
          </div>
          
          {stellar && (
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center animate-in zoom-in spin-in-12 duration-500 shadow-sm border border-amber-200">
              <Star size={18} fill="currentColor" />
            </div>
          )}
        </div>

        <h4 className={"text-xl font-black transition-colors " + (completed ? "text-emerald-800" : "text-slate-800 group-hover:text-primary")}>
          {topicName}
        </h4>
        <p className="text-sm text-slate-500 font-bold mt-1 uppercase tracking-wider">
          {pagesCount} {pagesCount === 1 ? 'Page' : 'Pages'}
        </p>

        {completed && !stellar && (
          <div className="absolute bottom-2 right-4 text-[10px] uppercase font-black text-emerald-500 tracking-tighter">
            Completed
          </div>
        )}
      </div>
    </Link>
  );
}
