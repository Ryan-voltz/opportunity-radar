import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'emerald' | 'violet' | 'amber' | 'rose' | 'slate' | 'neutral' | 'outline';
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'sm',
  className = '',
  icon,
}) => {
  const variantStyles = {
    cyan: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-white/10',
    emerald: 'bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-500/20',
    violet: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-white/10',
    amber: 'bg-amber-50/80 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-200/60 dark:border-amber-500/20',
    rose: 'bg-rose-50/80 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 border-rose-200/60 dark:border-rose-500/20',
    slate: 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10',
    neutral: 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10',
    outline: 'bg-transparent text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/15',
  };

  const sizeStyles = {
    xs: 'text-[11px] px-2 py-0.5 font-medium tracking-normal',
    sm: 'text-xs px-2.5 py-0.5 font-medium tracking-normal',
    md: 'text-xs px-3 py-1 font-semibold tracking-normal',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border leading-none font-sans ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {icon && <span className="opacity-70 shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
