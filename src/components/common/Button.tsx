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
    'relative inline-flex items-center justify-center font-sans font-medium transition-all duration-150 rounded-xl select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400';

  const variantStyles = {
    primary:
      'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 font-semibold shadow-sm border border-slate-900 dark:border-white',
    cyan:
      'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 font-semibold shadow-sm border border-slate-900 dark:border-white',
    emerald:
      'bg-emerald-700 text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 font-semibold shadow-sm',
    amber:
      'bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 font-semibold shadow-sm',
    secondary:
      'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/10 shadow-2xs',
    ghost:
      'bg-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-transparent',
    outline:
      'bg-transparent text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/15 hover:bg-slate-100 dark:hover:bg-white/[0.04]',
    danger:
      'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-500/30',
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
