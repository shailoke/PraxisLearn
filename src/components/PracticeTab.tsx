"use client";

import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, ArrowRight, RefreshCw, Trophy, Play } from 'lucide-react';

interface Question {
  type: 'mcq' | 'fill_blank';
  question: string;
  options: string[] | null;
  correct_answer: string;
  explanation: string;
}

interface PracticeTabProps {
  questions: Question[];
  topicId: string;
}

interface SavedProgress {
  current: number;
  score: number;
  done: boolean;
  timestamp: number;
}

export default function PracticeTab({ questions, topicId }: PracticeTabProps) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [fillValue, setFillValue] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasResume, setHasResume] = useState(false);

  // 1. LOAD PROGRESS ON MOUNT
  useEffect(() => {
    const saved = localStorage.getItem("practice_progress_" + topicId);
    if (saved) {
      try {
        const parsed: SavedProgress = JSON.parse(saved);
        if (!parsed.done) {
          setHasResume(true);
        } else {
          // If already done, show the result screen immediately
          setCurrent(parsed.current);
          setScore(parsed.score);
          setDone(true);
        }
      } catch (e) {
        console.error("Failed to parse saved progress", e);
      }
    }
    setIsInitialized(true);
  }, [topicId]);

  // 2. SAVE PROGRESS ON CHANGE
  useEffect(() => {
    if (!isInitialized) return;
    
    const state: SavedProgress = {
      current,
      score,
      done,
      timestamp: Date.now()
    };
    localStorage.setItem("practice_progress_" + topicId, JSON.stringify(state));

    // 3. UPDATE GLOBAL SCORES ON COMPLETION
    if (done) {
      updateGlobalScores(topicId, score, questions.length);
      updateDailyProgress();
      markAsCompleted(topicId);
    }
  }, [current, score, done, isInitialized, topicId, questions.length]);

  const markAsCompleted = (tid: string) => {
    try {
      const saved = localStorage.getItem("completed_topics");
      let completed = saved ? JSON.parse(saved) : [];
      if (!completed.includes(tid)) {
        completed.push(tid);
        localStorage.setItem("completed_topics", JSON.stringify(completed));
        window.dispatchEvent(new Event('storage'));
      }
    } catch (e) {
      console.error("Failed to mark topic as completed", e);
    }
  };

  const updateDailyProgress = () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const saved = localStorage.getItem("practice_daily_progress");
      let daily = saved ? JSON.parse(saved) : { date: today, topics: [] };
      
      if (daily.date !== today) {
        daily = { date: today, topics: [] };
      }
      
      if (!daily.topics.includes(topicId)) {
        daily.topics.push(topicId);
        localStorage.setItem("practice_daily_progress", JSON.stringify(daily));
        window.dispatchEvent(new Event('storage'));
      }
    } catch (e) {
      console.error("Failed to update daily progress", e);
    }
  };

  const updateGlobalScores = (tid: string, s: number, total: number) => {
    try {
      const saved = localStorage.getItem("practice_scores");
      let scores = saved ? JSON.parse(saved) : { topics: {}, total_score: 0, total_questions: 0 };
      
      const prevScore = scores.topics[tid]?.score || 0;
      const prevTotal = scores.topics[tid]?.total || 0;

      // Update topic record
      scores.topics[tid] = { score: s, total: total };

      // Re-calculate totals across all topics
      let newTotalScore = 0;
      let newTotalQuestions = 0;
      Object.values(scores.topics).forEach((t: any) => {
        newTotalScore += t.score;
        newTotalQuestions += t.total;
      });

      scores.total_score = newTotalScore;
      scores.total_questions = newTotalQuestions;

      localStorage.setItem("practice_scores", JSON.stringify(scores));
    } catch (e) {
      console.error("Failed to update global scores", e);
    }
  };

  const handleResume = () => {
    const saved = localStorage.getItem("practice_progress_" + topicId);
    if (saved) {
      const parsed: SavedProgress = JSON.parse(saved);
      setCurrent(parsed.current);
      setScore(parsed.score);
      setDone(parsed.done);
    }
    setHasResume(false);
  };

  const handleCheck = (answer: string) => {
    const correct = answer.trim().toLowerCase() === q.correct_answer.trim().toLowerCase();
    setIsCorrect(correct);
    setShowResult(true);
    if (correct) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (current + 1 >= total) {
      setDone(true);
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setFillValue('');
      setShowResult(false);
      setIsCorrect(false);
    }
  };

  const handleRestart = () => {
    setCurrent(0);
    setSelected(null);
    setFillValue('');
    setShowResult(false);
    setIsCorrect(false);
    setScore(0);
    setDone(false);
    setHasResume(false);
  };

  if (!isInitialized) return null;

  if (!questions || questions.length === 0) {
    return (
      <div className="glass-card p-8 text-center text-slate-500">
        <p className="text-xl font-semibold">No practice questions yet for this topic.</p>
        <p className="mt-2 text-slate-400">Check back after the full textbook is processed!</p>
      </div>
    );
  }

  // Resume Overlay
  if (hasResume) {
    return (
      <div className="glass-card p-8 sm:p-12 text-center bg-white border-2 border-indigo-100 shadow-xl">
        <div className="w-20 h-20 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-6">
          <Play size={40} className="ml-1" />
        </div>
        <h2 className="text-3xl font-black text-slate-800 mb-2">Welcome Back!</h2>
        <p className="text-xl text-slate-500 mb-8">You have a practice session in progress for this topic.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
           <button
             onClick={handleResume}
             className="px-8 py-4 rounded-full bg-indigo-600 text-white font-bold hover:bg-indigo-700 hover:scale-105 transition-all shadow-lg flex items-center justify-center gap-3 text-lg"
           >
             Resume Practice
           </button>
           <button
             onClick={handleRestart}
             className="px-8 py-4 rounded-full bg-white border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-3 text-lg"
           >
             Start Over
           </button>
        </div>
      </div>
    );
  }

  const q = questions[current];
  const total = questions.length;

  // Completion screen
  if (done) {
    const pct = Math.round((score / total) * 100);
    const great = pct >= 80;
    return (
      <div className="glass-card p-8 sm:p-12 text-center bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100">
        <div className="w-20 h-20 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-6 text-4xl">
          {great ? '🎉' : '💪'}
        </div>
        <h2 className="text-3xl font-black text-slate-800 mb-2">Practice Complete!</h2>
        <p className="text-xl text-slate-500 mb-6">You scored <span className="font-black text-indigo-600">{score}/{total}</span> ({pct}%)</p>
        {great
          ? <p className="text-lg font-semibold text-emerald-600 mb-8">Excellent work! You really know this topic.</p>
          : <p className="text-lg font-semibold text-amber-500 mb-8">Good effort! Try again to improve your score.</p>
        }
        <button
          onClick={handleRestart}
          className="px-8 py-4 rounded-full bg-indigo-600 text-white font-bold hover:bg-indigo-700 hover:scale-105 transition-all shadow-lg flex items-center gap-3 mx-auto text-lg"
        >
          <RefreshCw size={20} /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Practice</span>
          <span className="text-sm font-bold text-indigo-600">{current + 1}/{total} completed</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5">
          <div
            className="bg-indigo-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: ((current) / total * 100) + '%' }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="glass-card p-6 sm:p-8 bg-white border-2 border-slate-100 shadow-md">
        <div className="flex items-start gap-3 mb-6">
          <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shrink-0 mt-1">
            {q.type === 'mcq' ? 'Multiple Choice' : 'Fill in the Blank'}
          </span>
        </div>
        <p className="text-xl sm:text-2xl font-bold text-slate-800 leading-relaxed mb-8">
          {q.question}
        </p>

        {/* MCQ Options */}
        {q.type === 'mcq' && q.options && (
          <div className="grid gap-3">
            {q.options.map((opt, i) => {
              const isSelected = selected === opt;
              const isAnswer = opt === q.correct_answer;
              let cls = 'w-full p-5 rounded-2xl text-left font-semibold text-lg border-2 transition-all duration-200 flex items-center justify-between ';
              if (!showResult) {
                cls += isSelected
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50 cursor-pointer';
              } else {
                if (isAnswer) cls += 'border-emerald-500 bg-emerald-50 text-emerald-800';
                else if (isSelected && !isAnswer) cls += 'border-red-400 bg-red-50 text-red-700';
                else cls += 'border-slate-200 bg-slate-50 text-slate-400';
              }
              return (
                <button
                  key={i}
                  className={cls}
                  disabled={showResult}
                  onClick={() => {
                    if (!showResult) { setSelected(opt); handleCheck(opt); }
                  }}
                >
                  <span>{opt}</span>
                  {showResult && isAnswer && <CheckCircle2 className="text-emerald-500 shrink-0" size={24} />}
                  {showResult && isSelected && !isAnswer && <XCircle className="text-red-400 shrink-0" size={24} />}
                </button>
              );
            })}
          </div>
        )}

        {/* Fill in the Blank */}
        {q.type === 'fill_blank' && (
          <div className="space-y-4">
            <input
              type="text"
              value={fillValue}
              onChange={e => setFillValue(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && fillValue.trim() && !showResult) handleCheck(fillValue); }}
              disabled={showResult}
              placeholder="Type your answer here..."
              className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none font-medium text-slate-700 text-xl transition-all disabled:bg-slate-50"
            />
            {!showResult && (
              <button
                onClick={() => { if (fillValue.trim()) handleCheck(fillValue); }}
                disabled={!fillValue.trim()}
                className="px-8 py-4 rounded-full bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-md"
              >
                Check Answer
              </button>
            )}
          </div>
        )}
      </div>

      {/* Feedback */}
      {showResult && (
        <div className={'p-6 rounded-2xl border-2 animate-in fade-in slide-in-from-bottom-2 duration-300 ' + (isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-red-100 bg-red-50')}>
          <div className="flex items-center gap-3 mb-3">
            {isCorrect
              ? <><CheckCircle2 className="text-emerald-500" size={28} /><span className="text-xl font-black text-emerald-700">Correct! Well done! 🎉</span></>
              : <><XCircle className="text-red-400" size={28} /><span className="text-xl font-black text-red-600">Not quite!</span></>
            }
          </div>
          <p className="text-slate-700 font-medium text-lg">{q.explanation}</p>
        </div>
      )}

      {/* Next Button */}
      {showResult && (
        <div className="flex justify-end animate-in fade-in duration-500">
          <button
            onClick={handleNext}
            className="px-8 py-4 rounded-full bg-indigo-600 text-white font-bold hover:bg-indigo-700 hover:scale-105 transition-all shadow-lg flex items-center gap-3 text-lg"
          >
            {current + 1 >= total ? <><Trophy size={22} /> See Results</> : <>Next <ArrowRight size={22} /></>}
          </button>
        </div>
      )}
    </div>
  );
}
