import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'emerald' | 'amber' | 'cyan' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  iconLeft,
  iconRight,
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50';

  const variantStyles = {
    primary:
      'bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-semibold shadow-sm hover:shadow-glow-cyan border border-cyan-400/40',
    cyan:
      'bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-semibold shadow-sm hover:shadow-glow-cyan border border-cyan-400/40',
    emerald:
      'bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-semibold shadow-sm hover:shadow-glow-emerald border border-emerald-400/40',
    amber:
      'bg-amber-500 text-slate-950 hover:bg-amber-400 font-semibold shadow-sm hover:shadow-glow-amber border border-amber-400/40',
    secondary:
      'bg-slate-900/90 text-slate-200 hover:text-white hover:bg-slate-800/90 border border-white/10 hover:border-white/20 shadow-card-subtle',
    ghost:
      'bg-transparent text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] border border-transparent',
    outline:
      'bg-transparent text-slate-300 hover:text-white border border-white/15 hover:border-white/30 hover:bg-white/[0.04]',
    danger:
      'bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/30',
  };

  const sizeStyles = {
    xs: 'text-xs px-2.5 py-1 gap-1.5 rounded-md',
    sm: 'text-xs px-3 py-1.5 gap-2 rounded-md',
    md: 'text-sm px-3.5 py-2 gap-2 rounded-lg',
    lg: 'text-sm px-4 py-2.5 gap-2.5 rounded-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : (
        iconLeft && <span className="shrink-0">{iconLeft}</span>
      )}
      <span>{children}</span>
      {!isLoading && iconRight && <span className="shrink-0">{iconRight}</span>}
    </button>
  );
};
