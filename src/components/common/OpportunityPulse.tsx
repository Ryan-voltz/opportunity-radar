import React from 'react';
import { OpportunityPulseData } from '../../types';
import {
  Sparkles,
  TrendingUp,
  Layers,
  Zap,
  Box,
  Globe2,
  PlaneTakeoff,
  Briefcase,
  Activity,
} from 'lucide-react';

interface OpportunityPulseProps {
  pulse: OpportunityPulseData;
  onFilterClick?: (filterType: string) => void;
}

export const OpportunityPulse: React.FC<OpportunityPulseProps> = ({
  pulse,
  onFilterClick,
}) => {
  const pulseMetrics = [
    {
      id: 'new',
      label: 'Novas Oportunidades Detectadas',
      value: pulse.newOpportunitiesDetected,
      change: '+18% 24h',
      icon: <Sparkles className="w-4 h-4 text-cyan-400" />,
      subtext: 'Indexadas nas últimas 24 horas',
      color: 'cyan',
    },
    {
      id: 'growing',
      label: 'Oportunidades Crescendo',
      value: pulse.growingOpportunities,
      change: '+32% volume',
      icon: <TrendingUp className="w-4 h-4 text-emerald-400" />,
      subtext: 'Aceleração contínua de tração',
      color: 'emerald',
    },
    {
      id: 'saas',
      label: 'Novos SaaS Identificados',
      value: pulse.newSaasIdentified,
      change: '+14 esta sem',
      icon: <Layers className="w-4 h-4 text-violet-400" />,
      subtext: 'Micro-SaaS e verticais de nicho',
      color: 'violet',
    },
    {
      id: 'trends',
      label: 'Tendências Emergentes',
      value: pulse.emergingTrends,
      change: '19 inflexões',
      icon: <Zap className="w-4 h-4 text-amber-400" />,
      subtext: 'APIs e demandas em pico inicial',
      color: 'amber',
    },
    {
      id: 'products',
      label: 'Novos Produtos Detectados',
      value: pulse.newProductsDetected,
      change: '+9 hoje',
      icon: <Box className="w-4 h-4 text-slate-300" />,
      subtext: 'Extensões e ferramentas lançadas',
      color: 'slate',
    },
    {
      id: 'markets',
      label: 'Mercados com Movimentação',
      value: pulse.activeMarketRegions,
      change: '14 regiões',
      icon: <Globe2 className="w-4 h-4 text-cyan-400" />,
      subtext: 'Focos de volume e fricção ativos',
      color: 'cyan',
    },
    {
      id: 'international',
      label: 'Oportunidades Internacionais',
      value: pulse.internationalOpportunities,
      change: 'Arbitragem',
      icon: <PlaneTakeoff className="w-4 h-4 text-emerald-400" />,
      subtext: 'Prontas para adaptação regional',
      color: 'emerald',
    },
    {
      id: 'remote',
      label: 'Trabalho Remoto & Freelance',
      value: pulse.remoteWorkOpportunities,
      change: 'USD / EUR',
      icon: <Briefcase className="w-4 h-4 text-violet-400" />,
      subtext: 'Contratos globais de alto valor',
      color: 'violet',
    },
  ];

  return (
    <div className="space-y-3.5">
      {/* Pulse Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <h3 className="text-sm font-semibold font-mono text-slate-100 uppercase tracking-tight">
            Opportunity Pulse // Monitoramento Ativo do Mercado
          </h3>
        </div>
        <span className="text-2xs font-mono text-slate-500">
          Última varredura global: <strong className="text-slate-300">Há 4 minutos</strong>
        </span>
      </div>

      {/* 8 Metric Grid Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {pulseMetrics.map((item) => (
          <div
            key={item.id}
            onClick={() => onFilterClick?.(item.id)}
            className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.07] hover:border-white/20 transition-all hover:bg-slate-900/80 cursor-pointer group"
          >
            <div className="flex items-center justify-between gap-1.5 mb-2">
              <span className="p-1 rounded-md bg-white/[0.03] text-slate-400 group-hover:text-white transition-colors">
                {item.icon}
              </span>
              <span className="text-[10px] font-mono font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                {item.change}
              </span>
            </div>

            <div className="text-xl sm:text-2xl font-bold font-mono text-slate-100 mb-0.5">
              {item.value}
            </div>

            <div className="text-xs font-semibold text-slate-300 group-hover:text-cyan-300 transition-colors line-clamp-1 leading-snug">
              {item.label}
            </div>

            <div className="text-[10px] text-slate-500 truncate mt-0.5">
              {item.subtext}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
