"use client";

import { useState, useRef, useEffect } from 'react';
import TutorChat from '@/components/TutorChat';
import { MessageSquare } from 'lucide-react';

interface InteractiveLayoutProps {
  children: React.ReactNode;
  topic: string;
  lessonContent: string;
}

export default function InteractiveLayout({ children, topic, lessonContent }: InteractiveLayoutProps) {
  const [tutorWidth, setTutorWidth] = useState(30);
  const [isTutorOpen, setIsTutorOpen] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      let pct = ((rect.right - e.clientX) / rect.width) * 100;
      if (pct < 25) pct = 25;
      if (pct > 60) pct = 60;
      setTutorWidth(pct);
    };
    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const toggleExpand = () => setTutorWidth(prev => (prev > 45 ? 30 : 55));

  const leftWidth = isTutorOpen ? (100 - tutorWidth) + '%' : '100%';
  const rightWidth = tutorWidth + '%';
  const dividerClass = 'h-16 w-1 rounded-full transition-colors ' + (isDragging ? 'bg-indigo-500' : 'bg-slate-200 group-hover:bg-indigo-400');
  const rightColClass = 'shrink-0 overflow-hidden transition-all duration-300 ease-in-out ' + (isTutorOpen ? 'lg:block hidden' : 'hidden');

  return (
    <div ref={containerRef} className="flex flex-col lg:flex-row lg:gap-0 gap-6 relative items-start w-full">
      
      {/* LEFT: Content */}
      <div style={{ width: leftWidth }} className="transition-all duration-300 ease-in-out min-w-0 flex-shrink-0 space-y-6">
        {children}
      </div>

      {/* DRAG DIVIDER */}
      {isTutorOpen && (
        <div
          className="hidden lg:flex w-4 cursor-col-resize items-center justify-center z-10 hover:bg-indigo-100/50 transition-colors h-screen sticky top-0 rounded-full group shrink-0"
          onMouseDown={() => setIsDragging(true)}
        >
          <div className={dividerClass} />
        </div>
      )}

      {/* RIGHT: Tutor Panel */}
      <div style={{ width: isTutorOpen ? rightWidth : '0%' }} className={rightColClass}>
        <div className="w-full">
          <TutorChat
            topic={topic}
            lessonContent={lessonContent}
            onHideDesktop={() => setIsTutorOpen(false)}
            onExpandDesktop={toggleExpand}
            isExpanded={tutorWidth > 45}
          />
        </div>
      </div>

      {/* FLOATING RE-OPEN BUTTON */}
      {!isTutorOpen && (
        <button
          onClick={() => setIsTutorOpen(true)}
          className="hidden lg:flex fixed bottom-6 right-6 z-40 bg-indigo-600 text-white px-6 py-4 rounded-full shadow-2xl items-center gap-3 font-bold hover:bg-indigo-700 hover:scale-105 transition-all text-lg"
        >
          <MessageSquare size={24} />
          Open Tutor
        </button>
      )}
    </div>
  );
}
