import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse p-2">
      {/* Header skeleton */}
      <div className="h-32 rounded-2xl bg-slate-900/60 border border-white/[0.06] p-6 space-y-3">
        <div className="w-48 h-5 rounded-full bg-white/[0.05]" />
        <div className="w-3/4 h-8 rounded-lg bg-white/[0.07]" />
        <div className="w-1/2 h-4 rounded bg-white/[0.04]" />
      </div>

      {/* Metrics grid skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 rounded-xl bg-slate-900/50 border border-white/[0.05] p-4 space-y-2"
          >
            <div className="w-20 h-3 rounded bg-white/[0.05]" />
            <div className="w-14 h-7 rounded bg-white/[0.08]" />
            <div className="w-28 h-3 rounded bg-white/[0.03]" />
          </div>
        ))}
      </div>

      {/* Content cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-64 rounded-xl bg-slate-900/40 border border-white/[0.05] p-5 space-y-3"
          >
            <div className="flex justify-between">
              <div className="w-24 h-4 rounded-full bg-white/[0.05]" />
              <div className="w-10 h-4 rounded bg-white/[0.07]" />
            </div>
            <div className="w-full h-6 rounded bg-white/[0.08]" />
            <div className="w-5/6 h-4 rounded bg-white/[0.04]" />
            <div className="w-full h-20 rounded bg-white/[0.03] mt-4" />
          </div>
        ))}
      </div>
    </div>
  );
};
