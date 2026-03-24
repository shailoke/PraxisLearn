import Link from 'next/link';
import { Book, Play, Star } from 'lucide-react';
import fs from 'fs';
import path from 'path';

// Force dynamic fetching in dev, but build-time mostly
export const revalidate = 60;

export default async function Home() {
  let indexData = [];
  try {
    const indexPath = path.join(process.cwd(), 'public/data/index.json');
    if (fs.existsSync(indexPath)) {
      indexData = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
    }
  } catch (e) {
    console.error("Failed to load index.json", e);
  }

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
    <div className="space-y-8">
      <div className="glass-card p-8 bg-gradient-to-r from-primary/10 to-secondary/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-20">
          <Star size={120} className="text-primary animate-pulse" />
        </div>
        <div className="relative z-10">
          <h2 className="text-4xl font-extrabold text-slate-800 mb-2">Welcome Back! 🚀</h2>
          <p className="text-lg text-slate-600 max-w-lg mb-6">Ready to learn something new today? Pick a topic below and let's jump right in.</p>
          <div className="flex gap-4">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-primary text-sm font-semibold shadow-sm">
              <Book size={16} /> {indexData.length} Lessons Available
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {units.length === 0 ? (
          <div className="text-center py-12 text-slate-500">Loading lessons... check back in a minute!</div>
        ) : (
          units.map((unit, i) => (
            <div key={i} className="glass-card p-6">
              <div className="mb-4">
                 <span className="text-xs font-bold uppercase tracking-wider text-secondary mb-1 block">{unit.term}</span>
                 <h3 className="text-2xl font-bold text-slate-800">{unit.name}</h3>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from(unit.topics.entries()).map(([topicName, pages]: any, j) => {
                  const firstPageId = pages[0].pageNumber;
                  const uId = encodeURIComponent(unit.name);
                  const tId = encodeURIComponent(topicName);
                  const href = `/term/all/unit/${uId}/topic/${tId}/page/${firstPageId}`;
                  
                  return (
                    <Link key={j} href={href} className="group block">
                      <div className="h-full bounce-hover bg-slate-50 border border-slate-100/50 rounded-xl p-5 hover:bg-white hover:border-primary/30 transition-colors relative overflow-hidden">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3 group-hover:scale-110 transition-transform">
                          <Play size={18} fill="currentColor" />
                        </div>
                        <h4 className="font-bold text-slate-800 mb-1">{topicName}</h4>
                        <p className="text-sm text-slate-500">{pages.length} Pages</p>
                      </div>
                    </Link>
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
