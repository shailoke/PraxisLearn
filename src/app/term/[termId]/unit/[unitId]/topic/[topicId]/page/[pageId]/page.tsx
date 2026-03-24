import fs from 'fs';
import path from 'path';
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import Link from 'next/link';

// Import our new Interactive Client Components
import TabsView from './TabsView';
import InteractiveLayout from '@/components/InteractiveLayout';
import PracticeScore from '@/components/PracticeScore';

export default async function Page({
  params,
}: {
  params: Promise<{ termId: string, unitId: string, topicId: string, pageId: string }>
}) {
  const { termId, unitId, topicId, pageId } = await params;

  // READ FROM ENRICHED DIRECTORY NOW
  const pageFile = path.join(process.cwd(), `public/data/enriched/page_${pageId}.json`);
  
  if (!fs.existsSync(pageFile)) {
    return (
      <div className="text-center py-20 text-slate-500">
        <p className="text-2xl mb-4">Content Not Enriched Yet...</p>
        <p>The AI pipeline is still processing the textbook. Refresh later!</p>
      </div>
    );
  }

  const data = JSON.parse(fs.readFileSync(pageFile, 'utf-8'));

  // Load questions if available
  let questions: any[] = [];
  try {
    const qFile = path.join(process.cwd(), `public/data/questions/page_${pageId}.json`);
    if (fs.existsSync(qFile)) {
      questions = JSON.parse(fs.readFileSync(qFile, 'utf-8')).questions || [];
    }
  } catch(e) {}

  // Load index to find next/prev
  let nextId = null;
  let prevId = null;
  try {
      const indexPath = path.join(process.cwd(), 'public/data/index.json');
      if (fs.existsSync(indexPath)) {
          const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
          const currentIndex = index.findIndex((p: any) => p.pageNumber === parseInt(pageId));
          if (currentIndex > 0) prevId = index[currentIndex - 1].pageNumber;
          if (currentIndex < index.length - 1) nextId = index[currentIndex + 1].pageNumber;
      }
  } catch(e) {}

  const uId = encodeURIComponent(data.unit || unitId);
  const tId = encodeURIComponent(data.topic || topicId);

  return (
    <div className="max-w-7xl mx-auto pb-12">
      
      {/* Top Navigation */}
      <Link href="/" className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary/80 transition-colors mb-4 ml-4 lg:ml-0">
        <ArrowLeft size={18} /> Back to Topics
      </Link>

      <InteractiveLayout topic={data.topic} lessonContent={data.detailed_explanation || data.simple_explanation}>
        
        {/* Header */}
        <div className="glass-card p-6 sm:p-8 bg-gradient-to-r from-primary to-indigo-600 text-white relative overflow-hidden shadow-xl shadow-primary/20">
          <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4">
            <BookOpen size={150} className="text-white" />
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-extrabold uppercase tracking-widest text-primary-100 block opacity-80">
              {data.unit} / {data.topic}
            </span>
            <PracticeScore compact />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-white mb-2 relative z-10">
            {data.title || "Let's Learn!"}
          </h1>
        </div>

        {/* MAIN TABBED LEARNING INTERFACE */}
        <TabsView data={data} questions={questions} topicId={pageId} />

        {/* Bottom Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-slate-200/50 mt-8 mb-8 lg:mb-0 px-4 lg:px-0">
           {prevId ? (
              <Link href={`/term/${termId}/unit/${uId}/topic/${tId}/page/${prevId}`} className="w-full sm:w-auto px-6 py-4 rounded-full bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors flex justify-center items-center gap-2">
                 <ArrowLeft size={20} /> Previous concept
              </Link>
           ) : <div/>}

           {nextId ? (
              <Link href={`/term/${termId}/unit/${uId}/topic/${tId}/page/${nextId}`} className="w-full sm:w-auto px-8 py-4 rounded-full bg-indigo-600 text-white font-bold hover:bg-indigo-700 hover:scale-105 transition-all shadow-lg shadow-indigo-500/30 flex justify-center items-center gap-2">
                 Next concept <ArrowRight size={20} />
              </Link>
           ) : (
              <div className="w-full sm:w-auto px-8 py-4 rounded-full bg-slate-100 text-slate-400 font-bold flex justify-center items-center">
                 End of Unit! 🎉
              </div>
           )}
        </div>

      </InteractiveLayout>
    </div>
  );
}
