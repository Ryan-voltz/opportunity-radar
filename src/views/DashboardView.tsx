import React, { useState } from 'react';
import { Opportunity, LiveSignal, NavSection } from '../types';
import { MOCK_PULSE_DATA, MOCK_COUNTRY_SIGNALS } from '../data/mockData';
import { OpportunityPulse } from '../components/common/OpportunityPulse';
import { GlobalMarketGrid } from '../components/common/GlobalMarketGrid';
import { OpportunityCard } from '../components/common/OpportunityCard';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Layers,
  Radio,
  ChevronRight,
  Globe2,
  Filter,
  X,
} from 'lucide-react';

interface DashboardViewProps {
  opportunities: Opportunity[];
  liveSignals: LiveSignal[];
  onSelectOpportunity: (opportunity: Opportunity) => void;
  onNavigate: (section: NavSection) => void;
  onToggleSave: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  opportunities,
  liveSignals,
  onSelectOpportunity,
  onNavigate,
  onToggleSave,
}) => {
  const [selectedCountryFilter, setSelectedCountryFilter] = useState<string>('');

  // Filter opportunities if a country node is selected in the Global Market Signals
  const filteredOpportunities = selectedCountryFilter
    ? opportunities.filter((o) => o.market?.originCode === selectedCountryFilter)
    : opportunities;

  const trendingOpportunities = [...filteredOpportunities]
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  return (
    <div className="space-y-9 animate-fade-in">
      {/* Executive Market Question & Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] p-6 sm:p-8 shadow-card-subtle">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 text-xs font-sans font-medium mb-3.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Terminal de Inteligência em Tempo Real • 142 Fontes Ativas</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight mb-2 font-sans">
            O que está acontecendo no mercado agora e quais oportunidades posso explorar?
          </h2>

          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6 font-sans">
            O Opportunity Radar processa discussões globais, queixas recorrentes em ERPs legados e dados de busca acelerados para entregar teses estruturadas de Micro-SaaS, B2B e arbitragem internacional.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              size="md"
              iconRight={<ArrowRight className="w-4 h-4" />}
              onClick={() => onNavigate('radar')}
            >
              Abrir Global Opportunity Radar
            </Button>
            <Button
              variant="secondary"
              size="md"
              iconLeft={<Layers className="w-4 h-4 text-slate-500" />}
              onClick={() => onNavigate('opportunities')}
            >
              Explorar Catálogo ({opportunities.length})
            </Button>
          </div>
        </div>
      </div>

      {/* 1. Opportunity Pulse Section */}
      <section className="space-y-3">
        <OpportunityPulse
          pulse={MOCK_PULSE_DATA}
          onFilterClick={(type) => {
            if (type === 'remote') onNavigate('remote-work');
            else if (type === 'saas') onNavigate('saas-radar');
            else if (type === 'trends') onNavigate('market-trends');
            else if (type === 'international') onNavigate('global-opportunities');
            else onNavigate('opportunities');
          }}
        />
      </section>

      {/* 2. Global Market Signals Section */}
      <section className="p-6 rounded-2xl bg-slate-900/40 border border-white/[0.08] space-y-4">
        <GlobalMarketGrid
          signals={MOCK_COUNTRY_SIGNALS}
          selectedCountry={selectedCountryFilter}
          onSelectCountry={setSelectedCountryFilter}
        />

        {selectedCountryFilter && (
          <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/[0.08] flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
            <span>
              Filtrando oportunidades originadas em:{' '}
              <strong className="text-slate-900 dark:text-white">
                {MOCK_COUNTRY_SIGNALS.find((c) => c.code === selectedCountryFilter)?.name}
              </strong>
            </span>
            <button
              onClick={() => setSelectedCountryFilter('')}
              className="p-1 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Remover filtro</span>
            </button>
          </div>
        )}
      </section>

      {/* 3. Trending Opportunities Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-slate-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Trending Opportunities
              </h3>
              <Badge variant="neutral" size="xs">
                {trendingOpportunities.length} selecionadas
              </Badge>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Oportunidades em destaque com alto score de viabilidade, demanda comprovada e potencial de monetização
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('opportunities')}
              className="text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>Ver catálogo completo</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Trending Opportunities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {trendingOpportunities.map((opp) => (
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

        {trendingOpportunities.length === 0 && (
          <div className="p-12 text-center rounded-xl bg-slate-900/40 border border-white/[0.06] text-xs text-slate-400 space-y-2">
            <p>Nenhuma oportunidade encontrada para o país selecionado.</p>
            <Button
              variant="outline"
              size="xs"
              onClick={() => setSelectedCountryFilter('')}
            >
              Limpar filtro de país
            </Button>
          </div>
        )}
      </section>

      {/* 4. Live Signals Ticker Preview & Quick Jump */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] p-5 space-y-4 shadow-card-subtle">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h4 className="text-xs font-bold font-sans text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Fluxo Contínuo de Sinais • Últimas Ingestões
              </h4>
            </div>
            <button
              onClick={() => onNavigate('radar')}
              className="text-xs font-sans font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Ver Radar Completo →
            </button>
          </div>

          <div className="space-y-2.5">
            {liveSignals.slice(0, 3).map((sig) => (
              <div
                key={sig.id}
                onClick={() => onNavigate('radar')}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.04] hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer group flex items-start justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="slate" size="xs">
                      {sig.source}
                    </Badge>
                    <span className="text-[11px] font-sans text-slate-400">
                      {sig.detectedAt}
                    </span>
                    <span className="text-[11px] font-sans text-slate-400">
                      {sig.geoScope}
                    </span>
                  </div>
                  <h5 className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-slate-700 dark:group-hover:text-white transition-colors truncate font-sans">
                    {sig.title}
                  </h5>
                  <p className="text-xs text-slate-500 line-clamp-1 italic font-sans">
                    "{sig.excerpt}"
                  </p>
                </div>

                <span className="text-xs font-sans font-bold text-slate-900 dark:text-slate-100 shrink-0">
                  +{sig.scoreImpact}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Strategic Focus */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] p-5 flex flex-col justify-between space-y-4 shadow-card-subtle">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="slate" size="xs">
                AI Playbook
              </Badge>
              <span className="text-xs font-sans text-slate-400">Validação Imediata</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1.5 font-sans">
              Valide antes de programar
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
              Use nossos roteiros enxutos de 4 fases no <strong>My Lab</strong> para testar a disposição a pagar de clientes reais antes de escrever uma única linha de código.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigate('my-lab')}
            iconRight={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Acessar Sandbox de Validação
          </Button>
        </div>
      </section>
    </div>
  );
};
