import React from 'react';

interface RadarScoreBadgeProps {
  score: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const RadarScoreBadge: React.FC<RadarScoreBadgeProps> = ({
  score,
  showLabel = true,
  size = 'md',
  className = '',
}) => {
  const getTheme = (val: number) => {
    if (val >= 90) {
      return {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        text: 'text-emerald-400',
        glow: 'shadow-[0_0_12px_rgba(16,185,129,0.2)]',
        indicator: 'bg-emerald-400',
        level: 'Prime',
      };
    }
    if (val >= 80) {
      return {
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/30',
        text: 'text-cyan-400',
        glow: 'shadow-[0_0_12px_rgba(6,182,212,0.2)]',
        indicator: 'bg-cyan-400',
        level: 'Forte',
      };
    }
    if (val >= 70) {
      return {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        text: 'text-amber-400',
        glow: 'shadow-[0_0_12px_rgba(245,158,11,0.2)]',
        indicator: 'bg-amber-400',
        level: 'Moderado',
      };
    }
    return {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      text: 'text-rose-400',
      glow: 'shadow-[0_0_12px_rgba(244,63,94,0.2)]',
      indicator: 'bg-rose-400',
      level: 'Monitorar',
    };
  };

  const theme = getTheme(score);

  if (size === 'lg') {
    return (
      <div
        className={`inline-flex items-center gap-3 px-3 py-1.5 rounded-lg border ${theme.bg} ${theme.border} ${theme.glow} ${className}`}
      >
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${theme.indicator} animate-pulse-subtle`} />
            <span className="text-2xs font-mono uppercase tracking-wider text-slate-400">
              Score Radar
            </span>
          </div>
          <span className={`text-xl font-bold font-mono ${theme.text} leading-tight`}>
            {score}
            <span className="text-xs font-normal text-slate-500">/100</span>
          </span>
        </div>
      </div>
    );
  }

  if (size === 'sm') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[11px] font-mono font-semibold ${theme.bg} ${theme.border} ${theme.text} ${className}`}
        title={`Radar Score: ${score}/100 (${theme.level})`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${theme.indicator}`} />
        <span>{score}</span>
      </span>
    );
  }

  // size === 'md'
  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md border text-xs font-mono font-medium ${theme.bg} ${theme.border} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${theme.indicator}`} />
      <span className={`font-semibold ${theme.text}`}>{score}</span>
      {showLabel && <span className="text-slate-400 text-[11px]">Score</span>}
    </div>
  );
};
