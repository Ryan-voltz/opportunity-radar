import React from 'react';
import { Opportunity } from '../../types';
import { RadarScoreBadge } from './RadarScoreBadge';
import { Badge } from './Badge';
import { Sparkline } from './Sparkline';
import {
  Bookmark,
  TrendingUp,
  DollarSign,
  ChevronRight,
  Gauge,
  Shield,
  Layers,
} from 'lucide-react';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onSelect: (opportunity: Opportunity) => void;
  onToggleSave?: (id: string, e: React.MouseEvent) => void;
  isSaved?: boolean;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  onSelect,
  onToggleSave,
  isSaved = false,
}) => {
  const getCategoryVariant = (cat: string) => {
    switch (cat) {
      case 'Micro-SaaS':
        return 'cyan';
      case 'AI Agent / Tool':
        return 'violet';
      case 'API / Developer Tool':
        return 'emerald';
      case 'Market Arbitrage':
        return 'amber';
      case 'Digital Product':
        return 'slate';
      default:
        return 'slate';
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Baixa':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25';
      case 'Média':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/25';
      default:
        return 'text-rose-400 bg-rose-500/10 border-rose-500/25';
    }
  };

  const getCompetitionColor = (comp: string) => {
    switch (comp) {
      case 'Baixa':
        return 'text-emerald-400';
      case 'Média':
        return 'text-amber-400';
      default:
        return 'text-rose-400';
    }
  };

  const primarySource = opportunity.sources?.[0]?.platform || 'Radar Intel';

  return (
    <div
      onClick={() => onSelect(opportunity)}
      className="group relative rounded-[20px] bg-slate-900/90 border border-white/[0.08] hover:border-blue-500/40 hover:bg-slate-900 transition-all duration-200 p-5 cursor-pointer flex flex-col justify-between shadow-card-subtle hover:-translate-y-1 hover:shadow-xl"
    >
      <div>
        {/* Top Meta Header: Freshness, Category, Country & Score */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Country Flag & Code */}
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-2xs font-mono text-slate-300"
              title={`País de Origem: ${opportunity.market?.originCountry || 'Global'}`}
            >
              <span role="img" aria-label="country">
                {opportunity.market?.originFlag || '🌐'}
              </span>
              <span>{opportunity.market?.originCode || 'GL'}</span>
            </span>

            {/* Category Badge */}
            <Badge
              variant={getCategoryVariant(opportunity.category) as any}
              size="xs"
            >
              {opportunity.category}
            </Badge>

            {/* Freshness Badge */}
            {opportunity.freshness && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {opportunity.freshness}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <RadarScoreBadge score={opportunity.score} size="sm" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave?.(opportunity.id, e);
              }}
              className={`p-1.5 rounded-md border border-white/5 hover:border-white/20 transition-colors ${
                isSaved || opportunity.isSaved
                  ? 'text-cyan-400 bg-cyan-500/10'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title={isSaved || opportunity.isSaved ? 'Salva' : 'Salvar oportunidade'}
            >
              <Bookmark className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        </div>

        {/* Title & Tagline */}
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-cyan-300 transition-colors leading-snug mb-1.5">
          {opportunity.title}
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3.5">
          {opportunity.tagline}
        </p>

        {/* 3 Core Highlighted Metrics: Lucro, Velocidade, Investimento */}
        <div className="grid grid-cols-3 gap-2 mb-3.5">
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/20">
            <span className="text-[9px] font-mono uppercase text-emerald-700 dark:text-emerald-400 font-bold block truncate">
              Lucro Estimado
            </span>
            <span className="text-xs font-bold font-mono text-emerald-800 dark:text-emerald-300 truncate block">
              {opportunity.financials?.estimatedMonthlyProfit.split(' ')[0] || opportunity.potentialMrr.split(' ')[0]} {opportunity.financials?.estimatedMonthlyProfit.split(' ')[1] || 'MRR'}
            </span>
          </div>

          <div className="p-2 rounded-lg bg-blue-50 dark:bg-cyan-950/20 border border-blue-200 dark:border-cyan-500/20">
            <span className="text-[9px] font-mono uppercase text-blue-700 dark:text-cyan-400 font-bold block truncate">
              Velocidade
            </span>
            <span className="text-xs font-bold font-mono text-blue-800 dark:text-cyan-200 truncate block">
              MVP {opportunity.executionSpeed?.mvpDays || opportunity.timeToMvpDays} dias
            </span>
          </div>

          <div className="p-2 rounded-lg bg-purple-50 dark:bg-violet-950/20 border border-purple-200 dark:border-violet-500/20">
            <span className="text-[9px] font-mono uppercase text-purple-700 dark:text-violet-400 font-bold block truncate">
              Investimento
            </span>
            <span className="text-xs font-bold font-mono text-purple-800 dark:text-violet-200 truncate block">
              {opportunity.investment?.initialCapitalEstimated.split(' ')[0] || 'R$ 180'}
            </span>
          </div>
        </div>

        {/* 3-Tier Intelligence Badge Row (DADO | ANÁLISE | HIPÓTESE) */}
        <div className="flex items-center gap-1.5 mb-3.5 flex-wrap">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-800 dark:text-blue-300 border border-blue-500/20">
            <span className="font-bold text-[9px] px-1 py-0.2 rounded bg-blue-500/20 text-blue-900 dark:text-blue-200 uppercase">Dado</span>
            <span className="truncate max-w-[90px]">{primarySource}</span>
          </span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-violet-500/10 text-purple-800 dark:text-violet-300 border border-violet-500/20">
            <span className="font-bold text-[9px] px-1 py-0.2 rounded bg-violet-500/20 text-purple-900 dark:text-violet-200 uppercase">Análise</span>
            <span>{opportunity.score}/100</span>
          </span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
            <span className="font-bold text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 uppercase">Hipótese</span>
            <span className="truncate max-w-[80px]">{opportunity.businessModel || 'Micro-SaaS'}</span>
          </span>
        </div>

        {/* Momentum & Sparkline */}
        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-800 dark:text-cyan-300">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">{opportunity.trendingGrowth.split(' ')[0]}</span>
            <span className="text-[10px] text-slate-500">tração</span>
          </div>
          <Sparkline data={opportunity.sparkline || [20, 30, 45, 60, 80, 110]} color="emerald" width={80} height={20} />
        </div>
      </div>

      {/* Footer Metrics, Date, Source Link & Action */}
      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-emerald-400 font-bold" title="Potencial de Monetização">
            <DollarSign className="w-3.5 h-3.5" />
            <span>{opportunity.potentialMrr.split(' ')[0]}</span>
          </div>
          <span className="text-slate-600">•</span>
          {opportunity.sources?.[0]?.url ? (
            <a
              href={opportunity.sources[0].url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 transition-colors"
              title="Abrir publicação original na fonte oficial"
            >
              <span>{primarySource}</span>
              <span className="text-[9px]">↗</span>
            </a>
          ) : (
            <span className="text-[11px] text-slate-500">via {primarySource}</span>
          )}
        </div>

        <div className="inline-flex items-center gap-1 font-sans text-xs font-medium text-slate-400 group-hover:text-cyan-300 transition-colors">
          <span>Dossiê</span>
          <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </div>
  );
};
