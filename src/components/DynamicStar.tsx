"use client";

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';

export default function DynamicStar() {
  const [count, setCount] = useState(0);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    const updateProgress = () => {
      const today = new Date().toISOString().split('T')[0];
      const saved = localStorage.getItem("practice_daily_progress");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.date === today) {
            const topicCount = parsed.topics?.length || 0;
            setCount(topicCount);
            
            if (topicCount === 0) setLevel(1);
            else if (topicCount <= 2) setLevel(2);
            else if (topicCount <= 4) setLevel(3);
            else setLevel(4);
          } else {
            setCount(0);
            setLevel(1);
          }
        } catch (e) {}
      }
    };

    updateProgress();
    window.addEventListener('storage', updateProgress);
    return () => window.removeEventListener('storage', updateProgress);
  }, []);

  // Level 1: Soft pulse, low brightness
  // Level 2: Brighter, bigger
  // Level 3: Strong glow, smooth pulse
  // Level 4: Sparkle/Brightest

  let starClass = "transition-all duration-1000 ease-in-out ";
  let containerClass = "relative ";
  
  if (level === 1) {
    starClass += "text-primary/40 animate-pulse scale-100";
  } else if (level === 2) {
    starClass += "text-primary/70 animate-pulse scale-110 drop-shadow-md";
  } else if (level === 3) {
    starClass += "text-primary animate-pulse scale-125 drop-shadow-[0_0_15px_rgba(79,70,229,0.4)]";
  } else {
    starClass += "text-indigo-600 scale-150 drop-shadow-[0_0_25px_rgba(79,70,229,0.7)] animate-bounce";
  }

  return (
    <div className={containerClass}>
      <Star size={120} className={starClass} fill={level > 1 ? "currentColor" : "none"} />
      
      {/* Visual Feedback text */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">
          {level === 1 && "Start Your Journey"}
          {level === 2 && "Getting Warmer!"}
          {level === 3 && "You're on Fire!"}
          {level === 4 && "Mastery Achieved! 👑"}
        </p>
        <p className="text-[9px] font-bold text-slate-400 mt-1">
          {count} {count === 1 ? 'topic' : 'topics'} finished today
        </p>
      </div>

      {/* Sparkle effects for Level 4 */}
      {level === 4 && (
        <>
          <div className="absolute top-0 left-0 w-2 h-2 bg-indigo-400 rounded-full animate-ping" />
          <div className="absolute bottom-4 right-2 w-3 h-3 bg-indigo-300 rounded-full animate-ping delay-300" />
          <div className="absolute top-6 right-0 w-2 h-2 bg-indigo-500 rounded-full animate-ping delay-700" />
        </>
      )}
    </div>
  );
}
