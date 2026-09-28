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
import { CurrencyValue } from './CurrencyValue';

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
      className="group relative rounded-[20px] bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/20 transition-all duration-200 p-5 cursor-pointer flex flex-col justify-between shadow-card-subtle hover:-translate-y-1 hover:shadow-md"
    >
      <div>
        {/* Top Meta Header: Freshness, Category, Country & Score */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Country Flag & Code */}
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-xs font-sans text-slate-700 dark:text-slate-300"
              title={`País de Origem: ${opportunity.market?.originCountry || 'Global'}`}
            >
              <span role="img" aria-label="country">
                {opportunity.market?.originFlag || '🌐'}
              </span>
              <span>{opportunity.market?.originCode || 'GL'}</span>
            </span>

            {/* Category Badge */}
            <Badge
              variant="slate"
              size="xs"
            >
              {opportunity.category}
            </Badge>

            {/* Freshness Badge */}
            {opportunity.freshness && (
              <span className="text-[11px] font-sans px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/[0.08]">
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
              className={`p-1.5 rounded-lg border transition-colors ${
                isSaved || opportunity.isSaved
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white'
                  : 'bg-slate-100 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.08] text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title={isSaved || opportunity.isSaved ? 'Salva' : 'Salvar oportunidade'}
            >
              <Bookmark className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        </div>

        {/* Title & Tagline */}
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-slate-700 dark:group-hover:text-white transition-colors leading-snug mb-1.5 font-sans">
          {opportunity.title}
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3.5 font-sans">
          {opportunity.tagline}
        </p>

        {/* 3 Core Highlighted Metrics: Lucro, Velocidade, Investimento (Clean Neutral Grid) */}
        <div className="grid grid-cols-3 gap-2 mb-3.5 p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06]">
          <div className="p-1.5 rounded-lg bg-white dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.06] flex flex-col justify-between">
            <span className="text-[10px] font-sans uppercase text-slate-500 dark:text-slate-400 font-semibold block truncate">
              Lucro Est.
            </span>
            <CurrencyValue
              value={opportunity.financials?.estimatedMonthlyProfit || opportunity.potentialMrr}
              className="text-xs font-bold font-sans text-slate-900 dark:text-slate-100 truncate block mt-0.5"
            />
          </div>

          <div className="p-1.5 rounded-lg bg-white dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.06] flex flex-col justify-between">
            <span className="text-[10px] font-sans uppercase text-slate-500 dark:text-slate-400 font-semibold block truncate">
              Velocidade
            </span>
            <span className="text-xs font-bold font-sans text-slate-900 dark:text-slate-100 truncate block mt-0.5">
              MVP {opportunity.executionSpeed?.mvpDays || opportunity.timeToMvpDays}d
            </span>
            <span className="text-[9px] font-sans text-slate-400 font-medium block mt-0.5 truncate">
              1ª venda {opportunity.executionSpeed?.firstSaleDays || 18}d
            </span>
          </div>

          <div className="p-1.5 rounded-lg bg-white dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.06] flex flex-col justify-between">
            <span className="text-[10px] font-sans uppercase text-slate-500 dark:text-slate-400 font-semibold block truncate">
              Investimento
            </span>
            <CurrencyValue
              value={opportunity.investment?.initialCapitalEstimated || 'R$ 180'}
              className="text-xs font-bold font-sans text-slate-900 dark:text-slate-100 truncate block mt-0.5"
            />
          </div>
        </div>

        {/* 3-Tier Intelligence Badge Row (DADO | ANÁLISE | HIPÓTESE) */}
        <div className="flex items-center gap-1.5 mb-3.5 flex-wrap">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-sans bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.08]">
            <span className="font-semibold text-[10px] text-slate-500 uppercase">Dado</span>
            <span className="truncate max-w-[90px]">{primarySource}</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-sans bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.08]">
            <span className="font-semibold text-[10px] text-slate-500 uppercase">Análise</span>
            <span>{opportunity.score}/100</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-sans bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.08]">
            <span className="font-semibold text-[10px] text-slate-500 uppercase">Hipótese</span>
            <span className="truncate max-w-[80px]">{opportunity.businessModel || 'Micro-SaaS'}</span>
          </span>
        </div>

        {/* Momentum & Sparkline */}
        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.04] flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-1.5 text-xs font-sans text-slate-800 dark:text-slate-200">
            <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-900 dark:text-white font-bold">{opportunity.trendingGrowth.split(' ')[0]}</span>
            <span className="text-[11px] text-slate-500">tração</span>
          </div>
          <Sparkline data={opportunity.sparkline || [20, 30, 45, 60, 80, 110]} color="emerald" width={80} height={20} />
        </div>
      </div>

      {/* Footer Metrics, Date, Source Link & Action */}
      <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between gap-2 text-xs font-sans">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-slate-900 dark:text-slate-100 font-bold" title="Potencial de Monetização">
            <DollarSign className="w-3.5 h-3.5 text-slate-400" />
            <span>{opportunity.potentialMrr.split(' ')[0]}</span>
          </div>
          <span className="text-slate-400">•</span>
          {opportunity.sources?.[0]?.url ? (
            <a
              href={opportunity.sources[0].url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:underline flex items-center gap-1 transition-colors"
              title="Abrir publicação original na fonte oficial"
            >
              <span>{primarySource}</span>
              <span className="text-[10px]">↗</span>
            </a>
          ) : (
            <span className="text-xs text-slate-500">via {primarySource}</span>
          )}
        </div>

        <div className="inline-flex items-center gap-1 font-sans text-xs font-medium text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
          <span>Dossiê</span>
          <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </div>
  );
};
