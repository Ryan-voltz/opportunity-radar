import React from 'react';
import { TrendTopic } from '../types';
import { Badge } from '../components/common/Badge';
import { TrendingUp, ArrowUpRight, Search, Zap, Layers } from 'lucide-react';

interface MarketTrendsViewProps {
  trends: TrendTopic[];
}

export const MarketTrendsView: React.FC<MarketTrendsViewProps> = ({ trends }) => {
  const getMaturityBadge = (maturity: string) => {
    switch (maturity) {
      case 'Emergente':
        return 'cyan';
      case 'Acelerando':
        return 'emerald';
      case 'Pico Inicial':
        return 'amber';
      default:
        return 'slate';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-card-bg border border-card-border shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="neutral" size="sm">
              Sinais Preditivos
            </Badge>
            <span className="text-2xs font-medium text-slate-500 dark:text-slate-400">
              Dados agregados de Google Trends, GitHub e Discussões
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            Market Trends & Tecnologias Emergentes
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Monitore tópicos e APIs que estão sofrendo inflexão exponencial antes de se tornarem saturados no mercado.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-white/[0.08] text-center">
            <span className="text-2xs font-medium text-slate-500 uppercase block">Aceleração Média</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">+243.7%</span>
          </div>
        </div>
      </div>

      {/* Trends List / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {trends.map((trend) => (
          <div
            key={trend.id}
            className="p-5 rounded-xl bg-card-bg border border-card-border hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between group shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <Badge variant={getMaturityBadge(trend.maturity) as any} size="xs">
                  {trend.maturity}
                </Badge>
                <div className="flex items-center gap-1 text-slate-900 dark:text-slate-100 text-xs font-bold">
                  <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>+{trend.growthPercentage}% YoY</span>
                </div>
              </div>

              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 transition-colors mb-2 font-sans">
                {trend.name}
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4 font-sans">
                {trend.description}
              </p>
            </div>

            <div className="pt-4 border-t border-card-border flex items-center justify-between text-2xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span>Volume: {trend.searchVolume}</span>
              </div>
              <div className="truncate max-w-[180px] text-right">
                {trend.signalOrigin}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
