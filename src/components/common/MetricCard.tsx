import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  subtitle?: string;
  icon?: React.ReactNode;
  accentColor?: 'cyan' | 'emerald' | 'violet' | 'amber';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType = 'positive',
  subtitle,
  icon,
  accentColor = 'cyan',
}) => {
  const accentBorderHover = {
    cyan: 'hover:border-cyan-500/30',
    emerald: 'hover:border-emerald-500/30',
    violet: 'hover:border-violet-500/30',
    amber: 'hover:border-amber-500/30',
  }[accentColor];

  return (
    <div
      className={`relative p-4 rounded-xl bg-slate-900/60 border border-white/[0.07] backdrop-blur-sm transition-all duration-200 ${accentBorderHover} hover:bg-slate-900/80 group`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-medium text-slate-400 tracking-tight">{title}</span>
        {icon && (
          <span className="p-1.5 rounded-lg bg-white/[0.04] text-slate-400 group-hover:text-slate-200 transition-colors">
            {icon}
          </span>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-3">
        <span className="text-2xl font-bold font-mono text-slate-100 tracking-tight">
          {value}
        </span>
        {change && (
          <div
            className={`inline-flex items-center gap-0.5 text-xs font-mono font-medium ${
              changeType === 'positive'
                ? 'text-emerald-400'
                : changeType === 'negative'
                ? 'text-rose-400'
                : 'text-slate-400'
            }`}
          >
            {changeType === 'positive' && <ArrowUpRight className="w-3.5 h-3.5" />}
            {changeType === 'negative' && <ArrowDownRight className="w-3.5 h-3.5" />}
            {changeType === 'neutral' && <Minus className="w-3.5 h-3.5" />}
            <span>{change}</span>
          </div>
        )}
      </div>

      {subtitle && (
        <div className="mt-2 text-2xs text-slate-500 flex items-center gap-1.5 border-t border-white/[0.04] pt-2">
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
};
