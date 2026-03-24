export default function Loading() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-24 animate-pulse">
      {/* Top Nav Skeleton */}
      <div className="h-6 w-32 bg-slate-200 rounded-full mb-4"></div>

      {/* Header Skeleton */}
      <div className="glass-card p-6 border-l-4 border-l-slate-300">
        <div className="h-4 w-24 bg-slate-200 rounded-full mb-4"></div>
        <div className="h-10 w-3/4 bg-slate-300 rounded-xl"></div>
      </div>

      {/* Explanations Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card p-6 sm:p-8">
            <div className="h-5 bg-slate-200 rounded-lg w-full mb-3"></div>
            <div className="h-5 bg-slate-200 rounded-lg w-11/12 mb-3"></div>
            <div className="h-5 bg-slate-200 rounded-lg w-4/5"></div>
          </div>
        ))}
      </div>

    </div>
  )
}
