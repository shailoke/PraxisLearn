import Link from 'next/link';
import { Book, Play, Star } from 'lucide-react';
import PracticeScore from '@/components/PracticeScore';
import DynamicStar from '@/components/DynamicStar';
import MasteryProgress from '@/components/MasteryProgress';
import TopicCard from '@/components/TopicCard';
import fs from 'fs';
import path from 'path';

// Force dynamic fetching in dev, but build-time mostly
export const revalidate = 60;

export default async function Home() {
  let indexData: any[] = [];
  try {
    const indexPath = path.join(process.cwd(), 'public/data/index.json');
    if (fs.existsSync(indexPath)) {
      indexData = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
    }
  } catch (e) {
    console.error("Failed to load index.json", e);
  }

  // Count unique topics
  const topicsSet = new Set();
  indexData.forEach(p => topicsSet.add(p.topic));
  const totalTopics = topicsSet.size;

  // Group by Unit
  const unitsMap = new Map();
  indexData.forEach((page: any) => {
    if (!unitsMap.has(page.unit)) {
      unitsMap.set(page.unit, {
        term: page.term,
        name: page.unit,
        topics: new Map()
      });
    }
    const unitObj = unitsMap.get(page.unit);
    if (!unitObj.topics.has(page.topic)) {
      unitObj.topics.set(page.topic, []);
    }
    unitObj.topics.get(page.topic).push(page);
  });

  const units = Array.from(unitsMap.values());

  return (
    <div className="space-y-8 pb-12">
      {/* HEADER SECTION */}
      <div className="glass-card p-8 bg-gradient-to-r from-primary/10 to-secondary/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 pr-16 opacity-30 mt-4 h-full flex items-center">
          <DynamicStar />
        </div>
        <div className="relative z-10">
          <h2 className="text-4xl font-extrabold text-slate-800 mb-2 font-display">Welcome Back! 🚀</h2>
          <p className="text-lg text-slate-600 max-w-lg mb-6 leading-relaxed">Ready to learn something new today? Pick a topic below and let's jump right in.</p>
          
          <div className="flex flex-col sm:flex-row gap-6 mt-4">
            <div className="flex-1 max-w-sm">
              <PracticeScore />
            </div>
          </div>
        </div>
      </div>

      {/* GLOBAL PROGRESS BAR */}
      <div className="max-w-4xl">
        <MasteryProgress totalTopics={totalTopics} />
      </div>

      {/* TOPICS BY UNIT */}
      <div className="grid gap-8">
        {units.length === 0 ? (
          <div className="text-center py-12 text-slate-500">Loading lessons... check back in a minute!</div>
        ) : (
          units.map((unit, i) => (
            <div key={i} className="space-y-4">
              <div className="px-2">
                 <span className="text-xs font-black uppercase tracking-widest text-secondary opacity-60 mb-1 block">{unit.term}</span>
                 <h3 className="text-2xl font-black text-slate-800 tracking-tight">{unit.name}</h3>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from(unit.topics.entries()).map(([topicName, pages]: any, j) => {
                  const firstPageId = pages[0].pageNumber;
                  const uId = encodeURIComponent(unit.name);
                  const tId = encodeURIComponent(topicName);
                  const href = `/term/all/unit/${uId}/topic/${tId}/page/${firstPageId}`;
                  
                  return (
                    <TopicCard 
                      key={j}
                      topicName={topicName}
                      pagesCount={pages.length}
                      href={href}
                      topicId={firstPageId.toString()}
                    />
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
