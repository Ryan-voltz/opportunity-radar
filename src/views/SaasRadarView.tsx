import React, { useState } from 'react';
import { Opportunity } from '../types';
import { OpportunityCard } from '../components/common/OpportunityCard';
import { Badge } from '../components/common/Badge';
import { CurrencyValue } from '../components/common/CurrencyValue';
import { Layers, Split, Store, Cpu, CheckCircle } from 'lucide-react';

interface SaasRadarViewProps {
  opportunities: Opportunity[];
  onSelectOpportunity: (opportunity: Opportunity) => void;
  onToggleSave: (id: string) => void;
}

export const SaasRadarView: React.FC<SaasRadarViewProps> = ({
  opportunities,
  onSelectOpportunity,
  onToggleSave,
}) => {
  const [subCategory, setSubCategory] = useState<'all' | 'micro' | 'unbundling' | 'plugins'>('all');

  const saasItems = opportunities.filter((o) =>
    ['Micro-SaaS', 'B2B Software', 'API / Developer Tool'].includes(o.category)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Intro Header */}
      <div className="p-6 rounded-2xl bg-card-bg border border-card-border shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="neutral" size="sm">
            Especialização de Software
          </Badge>
          <span className="text-2xs font-medium text-slate-500 dark:text-slate-400">
            Foco em MRR previsível e baixo CAC
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
          SaaS Radar & Estratégias de Micro-SaaS
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Monitoramento específico de desagregação (unbundling) de ferramentas monolíticas e oportunidades de plugins para ecossistemas de alta distribuição.
        </p>
      </div>

      {/* Strategic Playbooks Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => setSubCategory('micro')}
          className={`p-4 rounded-xl border transition-all cursor-pointer shadow-sm ${
            subCategory === 'micro'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white'
              : 'bg-card-bg border-card-border text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 opacity-75" />
            <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
              <span>Micro-SaaS Solo (</span>
              <CurrencyValue value="$5k - $20k MRR" inline />
              <span>)</span>
            </span>
          </div>
          <p className="text-xs opacity-75 leading-relaxed font-sans">
            Aplicações hiper-focadas com 1 função essencial que resolvem 1 dor específica com alta retenção.
          </p>
        </div>

        <div
          onClick={() => setSubCategory('unbundling')}
          className={`p-4 rounded-xl border transition-all cursor-pointer shadow-sm ${
            subCategory === 'unbundling'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white'
              : 'bg-card-bg border-card-border text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Split className="w-4 h-4 opacity-75" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Unbundling de Legados
            </span>
          </div>
          <p className="text-xs opacity-75 leading-relaxed font-sans">
            Extração de módulos superdimensionados do Salesforce, HubSpot ou Jira em ferramentas leves para nichos verticais.
          </p>
        </div>

        <div
          onClick={() => setSubCategory('plugins')}
          className={`p-4 rounded-xl border transition-all cursor-pointer shadow-sm ${
            subCategory === 'plugins'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white'
              : 'bg-card-bg border-card-border text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Store className="w-4 h-4 opacity-75" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Marketplaces de Plataforma
            </span>
          </div>
          <p className="text-xs opacity-75 leading-relaxed font-sans">
            Extensões para Shopify, Notion, Chrome e Stripe aproveitando a distribuição orgânica dos gigantes.
          </p>
        </div>
      </div>

      {/* Grid of Targeted Opportunities */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 font-sans">
            <Layers className="w-4 h-4 text-slate-500" />
            Oportunidades de Software Mapeadas ({saasItems.length})
          </h3>
          <span className="text-2xs text-slate-500 font-medium">
            Tempo Médio para MVP: 18 dias
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {saasItems.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              onSelect={onSelectOpportunity}
              onToggleSave={(id, e) => {
                e.stopPropagation();
                onToggleSave(id);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
