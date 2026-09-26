import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'emerald' | 'violet' | 'amber' | 'rose' | 'slate' | 'outline';
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
    cyan: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/25',
    emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
    violet: 'bg-violet-500/10 text-violet-300 border-violet-500/25',
    amber: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
    rose: 'bg-rose-500/10 text-rose-300 border-rose-500/25',
    slate: 'bg-slate-800/80 text-slate-300 border-white/10',
    outline: 'bg-transparent text-slate-400 border-white/15',
  };

  const sizeStyles = {
    xs: 'text-[10px] px-1.5 py-0.5 font-medium tracking-wide',
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border leading-none font-mono ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {icon && <span className="opacity-80 shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
