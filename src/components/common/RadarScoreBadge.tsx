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
        bg: 'bg-slate-100 dark:bg-white/[0.06]',
        border: 'border-slate-200 dark:border-white/10',
        text: 'text-slate-900 dark:text-slate-100',
        indicator: 'bg-emerald-500',
        level: 'Prime',
      };
    }
    if (val >= 80) {
      return {
        bg: 'bg-slate-100 dark:bg-white/[0.06]',
        border: 'border-slate-200 dark:border-white/10',
        text: 'text-slate-900 dark:text-slate-100',
        indicator: 'bg-blue-500',
        level: 'Forte',
      };
    }
    if (val >= 70) {
      return {
        bg: 'bg-slate-100 dark:bg-white/[0.06]',
        border: 'border-slate-200 dark:border-white/10',
        text: 'text-slate-900 dark:text-slate-100',
        indicator: 'bg-amber-500',
        level: 'Moderado',
      };
    }
    return {
      bg: 'bg-slate-100 dark:bg-white/[0.06]',
      border: 'border-slate-200 dark:border-white/10',
      text: 'text-slate-700 dark:text-slate-300',
      indicator: 'bg-slate-400',
      level: 'Monitorar',
    };
  };

  const theme = getTheme(score);

  if (size === 'lg') {
    return (
      <div
        className={`inline-flex items-center gap-3 px-3.5 py-2 rounded-xl border shadow-xs ${theme.bg} ${theme.border} ${className}`}
      >
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${theme.indicator}`} />
            <span className="text-[11px] font-sans font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Score Radar
            </span>
          </div>
          <span className={`text-xl font-bold font-sans ${theme.text} leading-tight`}>
            {score}
            <span className="text-xs font-normal text-slate-400">/100</span>
          </span>
        </div>
      </div>
    );
  }

  if (size === 'sm') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-sans font-semibold ${theme.bg} ${theme.border} ${theme.text} ${className}`}
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
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-sans font-semibold ${theme.bg} ${theme.border} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${theme.indicator}`} />
      <span className={theme.text}>{score}</span>
      {showLabel && <span className="text-slate-400 text-[11px] font-normal">Score</span>}
    </div>
  );
};
