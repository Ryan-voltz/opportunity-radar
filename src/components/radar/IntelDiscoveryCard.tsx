import React, { useState } from 'react';
import { Opportunity } from '../../types';
import { Badge } from '../common/Badge';
import { RadarScoreBadge } from '../common/RadarScoreBadge';
import { Sparkline } from '../common/Sparkline';
import { Button } from '../common/Button';
import {
  Bookmark,
  TrendingUp,
  Globe2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  AlertTriangle,
  Lightbulb,
  DollarSign,
  Info,
  Clock,
  Code2,
  ShieldCheck,
} from 'lucide-react';

interface IntelDiscoveryCardProps {
  opportunity: Opportunity;
  onOpenDrawer: (opportunity: Opportunity) => void;
  onToggleSave: (id: string) => void;
  isSaved?: boolean;
}

export const IntelDiscoveryCard: React.FC<IntelDiscoveryCardProps> = ({
  opportunity,
  onOpenDrawer,
  onToggleSave,
  isSaved = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Baixa':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Média':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default:
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    }
  };

  const originCountry = opportunity.market?.originCountry || 'Global';
  const originFlag = opportunity.market?.originFlag || '🌐';
  const originCode = opportunity.market?.originCode || 'GL';
  const targetMarketsStr =
    opportunity.market?.targetMarkets?.join(', ') ||
    opportunity.targetMarkets?.join(', ') ||
    'Global';

  return (
    <div
      className={`rounded-[20px] border transition-all duration-200 overflow-hidden shadow-card-subtle ${
        isExpanded
          ? 'bg-slate-900 border-blue-500/50 shadow-xl'
          : 'bg-slate-900/90 border-white/[0.08] hover:border-blue-500/40 hover:-translate-y-0.5'
      }`}
    >
      {/* Card Primary Header */}
      <div className="p-5 sm:p-6 space-y-4">
        {/* Timeline, Meta & Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Timeline Tag */}
            <div className="inline-flex items-center gap-1.5 text-2xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
              <Clock className="w-3 h-3" />
              <span>{opportunity.freshness || 'Detectado recentemente'}</span>
            </div>

            {/* Country Node */}
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-200"
              title={`Mercado de Origem: ${originCountry}`}
            >
              <span>{originFlag}</span>
              <strong className="font-semibold">{originCountry}</strong>
              <span className="text-slate-500">({originCode})</span>
            </span>

            {/* Category */}
            <Badge variant="cyan" size="xs">
              {opportunity.category}
            </Badge>

            {/* Business Model */}
            <Badge variant="slate" size="xs">
              {opportunity.businessModel || 'SaaS'}
            </Badge>

            {/* AI badge if applicable */}
            {opportunity.isAiRelated && (
              <Badge variant="violet" size="xs">
                IA Nativa
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <RadarScoreBadge score={opportunity.score} size="md" />

            <button
              onClick={() => onToggleSave(opportunity.id)}
              className={`p-2 rounded-lg border transition-colors ${
                isSaved || opportunity.isSaved
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                  : 'bg-white/[0.03] border-white/[0.08] text-slate-500 hover:text-slate-200'
              }`}
              title={isSaved || opportunity.isSaved ? 'Oportunidade Salva' : 'Salvar no Pipeline'}
            >
              <Bookmark className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        </div>

        {/* Title & Tagline (Clickable to open detailed step-by-step drawer) */}
        <div
          onClick={() => onOpenDrawer(opportunity)}
          className="cursor-pointer group/title"
          title="Clique para abrir detalhes completos, checklist passo a passo e estimativas"
        >
          <h3 className="text-lg font-bold text-slate-100 group-hover/title:text-cyan-300 transition-colors leading-snug flex items-center justify-between">
            <span>{opportunity.title}</span>
            <span className="text-xs font-mono text-cyan-400 font-normal opacity-0 group-hover/title:opacity-100 transition-opacity shrink-0 ml-2">
              Ver Passo a Passo →
            </span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
            {opportunity.tagline}
          </p>
        </div>

        {/* 3 User-Requested Highlighted Metrics: Lucro, Velocidade, Investimento */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-gradient-to-r from-white/[0.03] to-white/[0.01] border border-white/[0.06]">
          <div className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/20">
            <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold flex items-center gap-1">
              <DollarSign className="w-3 h-3" /> Lucro Estimado
            </span>
            <span className="text-xs font-bold font-mono text-emerald-300 block truncate mt-0.5" title={opportunity.financials?.estimatedMonthlyProfit || opportunity.potentialMrr}>
              {opportunity.financials?.estimatedMonthlyProfit || opportunity.potentialMrr}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Margem: {opportunity.financials?.profitMargin || '85%'}
            </span>
          </div>

          <div className="p-2 rounded-lg bg-cyan-950/20 border border-cyan-500/20">
            <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold flex items-center gap-1">
              <Clock className="w-3 h-3" /> Velocidade / Prazo
            </span>
            <span className="text-xs font-bold font-mono text-cyan-200 block truncate mt-0.5">
              MVP em {opportunity.executionSpeed?.mvpDays || opportunity.timeToMvpDays} dias
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              1ª Venda: {opportunity.executionSpeed?.firstSaleDays || 18}d
            </span>
          </div>

          <div className="p-2 rounded-lg bg-violet-950/20 border border-violet-500/20">
            <span className="text-[10px] font-mono uppercase text-violet-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Investimento
            </span>
            <span className="text-xs font-bold font-mono text-violet-200 block truncate mt-0.5" title={opportunity.investment?.initialCapitalEstimated || 'R$ 180'}>
              {opportunity.investment?.initialCapitalEstimated || 'R$ 180 ($35 USD)'}
            </span>
            <span className="text-[10px] font-mono text-slate-400 truncate block">
              {opportunity.investment?.budgetTier || 'Bootstrap'}
            </span>
          </div>
        </div>

        {/* Brief Hook: What was detected preview */}
        <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-white/[0.04]">
          <strong className="text-cyan-400 font-mono text-[11px] uppercase mr-1">
            Síntese do Sinal:
          </strong>
          {opportunity.whatDetected}
        </div>
      </div>

      {/* Progressive Disclosure Section: 6 Complete Intelligence Dimensions */}
      {isExpanded && (
        <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-white/[0.06] bg-slate-950/60 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Dossiê Estruturado de Inteligência (Framework de 6 Dimensões)
            </span>
            <span className="text-2xs font-mono text-slate-500">ID: {opportunity.id}</span>
          </div>

          {/* 6 Structured Dimensions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* 1. O QUE FOI DETECTADO */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/[0.07] space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-cyan-400 uppercase tracking-tight">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                1. O que foi detectado:
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {opportunity.whatDetected}
              </p>
              {opportunity.sources?.[0] && (
                <div className="pt-1 text-[11px] font-mono text-slate-500 border-t border-white/[0.04]">
                  Fonte: {opportunity.sources[0].platform} • "{opportunity.sources[0].snippet}"
                </div>
              )}
            </div>

            {/* 2. POR QUE É IMPORTANTE */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/[0.07] space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-400 uppercase tracking-tight">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                2. Por que é importante:
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {opportunity.whyImportant}
              </p>
            </div>

            {/* 3. QUAL MERCADO ESTÁ ENVOLVIDO */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/[0.07] space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-violet-400 uppercase tracking-tight">
                <Globe2 className="w-3.5 h-3.5 text-violet-400" />
                3. Mercado envolvido:
              </div>
              <div className="text-xs text-slate-200 space-y-1 font-sans">
                <div>
                  <span className="text-slate-400">Origem do Sinal:</span>{' '}
                  <strong className="text-white">
                    {originFlag} {originCountry} ({opportunity.market?.continent})
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400">Mercados de Adaptação / Expansão:</span>{' '}
                  <span className="text-cyan-300 font-medium">{targetMarketsStr}</span>
                </div>
              </div>
            </div>

            {/* 4. QUAL PROBLEMA EXISTE */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/[0.07] space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-rose-400 uppercase tracking-tight">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                4. Qual problema existe:
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {opportunity.problemExists}
              </p>
            </div>

            {/* 5. QUAL OPORTUNIDADE PODE SER EXPLORADA */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-400 uppercase tracking-tight">
                <Lightbulb className="w-3.5 h-3.5 text-emerald-400" />
                5. Oportunidade a explorar:
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {opportunity.opportunityExplored}
              </p>
            </div>

            {/* 6. COMO PODERIA SER MONETIZADA */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-400 uppercase tracking-tight">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                6. Como monetizar:
              </div>
              <p className="text-xs text-emerald-300 font-medium leading-relaxed font-mono">
                {opportunity.howMonetized}
              </p>
            </div>
          </div>

          {/* Tech Stack Tags */}
          {opportunity.techStack && opportunity.techStack.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-2xs font-mono text-slate-500 flex items-center gap-1">
                <Code2 className="w-3 h-3 text-cyan-400" /> Stack Recomendada:
              </span>
              {opportunity.techStack.map((tech, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[11px] font-mono text-slate-300"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer Controls: Progressive Disclosure Toggle & Actions */}
      <div className="px-5 py-3.5 bg-slate-950/80 border-t border-white/[0.06] flex items-center justify-between gap-3">
        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          className="text-xs font-mono text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4 text-cyan-400" />
              <span>Recolher Análise de Inteligência</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 text-cyan-400" />
              <span>Expandir Análise Completa (6 Dimensões)</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="xs"
            onClick={() => onOpenDrawer(opportunity)}
            iconRight={<ExternalLink className="w-3 h-3" />}
          >
            Abrir Dossiê
          </Button>
        </div>
      </div>
    </div>
  );
};
