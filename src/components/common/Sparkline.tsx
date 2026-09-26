import React from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: 'emerald' | 'cyan' | 'violet' | 'amber';
  className?: string;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  width = 72,
  height = 24,
  color = 'emerald',
  className = '',
}) => {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Build SVG path
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * (width - 4) + 2;
    const y = height - 3 - ((val - min) / range) * (height - 6);
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const areaD = `M ${points[0]} L ${points.join(' L ')} L ${width - 2},${height} L 2,${height} Z`;

  const colorStyles = {
    emerald: {
      stroke: '#34D399',
      fill: 'rgba(52, 211, 153, 0.15)',
    },
    cyan: {
      stroke: '#38BDF8',
      fill: 'rgba(56, 189, 248, 0.15)',
    },
    violet: {
      stroke: '#A78BFA',
      fill: 'rgba(167, 139, 250, 0.15)',
    },
    amber: {
      stroke: '#FBBF24',
      fill: 'rgba(251, 191, 36, 0.15)',
    },
  }[color];

  return (
    <svg
      width={width}
      height={height}
      className={`overflow-visible shrink-0 ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`sparkline-grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colorStyles.stroke} stopOpacity="0.25" />
          <stop offset="100%" stopColor={colorStyles.stroke} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#sparkline-grad-${color})`} />
      <path
        d={pathD}
        fill="none"
        stroke={colorStyles.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
