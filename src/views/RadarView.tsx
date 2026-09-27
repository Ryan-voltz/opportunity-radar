import React, { useState, useEffect } from 'react';
import { Opportunity, LiveSignal, AiCoachAlert } from '../types';
import { RadarFilterConsole, RadarFilterState } from '../components/radar/RadarFilterConsole';
import { IntelDiscoveryCard } from '../components/radar/IntelDiscoveryCard';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { AiCoachNotificationBanner } from '../components/common/AiCoachNotificationBanner';
import { PersonalProjectService } from '../services/personalProjectService';
import {
  Radio,
  RefreshCw,
  SlidersHorizontal,
  PlusCircle,
  Copy,
  Check,
  Zap,
  Globe2,
  Terminal,
  Activity,
  Layers,
} from 'lucide-react';

interface RadarViewProps {
  opportunities: Opportunity[];
  signals: LiveSignal[];
  onSelectOpportunity: (opportunity: Opportunity) => void;
  onPromoteToOpportunity: (signal: LiveSignal) => void;
  onToggleSave: (id: string) => void;
}

export const RadarView: React.FC<RadarViewProps> = ({
  opportunities,
  signals,
  onSelectOpportunity,
  onPromoteToOpportunity,
  onToggleSave,
}) => {
  const [activeTab, setActiveTab] = useState<'intel' | 'raw_stream'>('intel');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [coachAlerts, setCoachAlerts] = useState<AiCoachAlert[]>([]);

  useEffect(() => {
    const refreshAlerts = () => {
      const projects = PersonalProjectService.getProjects();
      const alerts = PersonalProjectService.generateAiCoachAlerts(projects);
      setCoachAlerts(alerts);
    };

    refreshAlerts();
    window.addEventListener('personal_projects_updated', refreshAlerts);
    return () => window.removeEventListener('personal_projects_updated', refreshAlerts);
  }, []);

  const handleOpenProjectFromCoach = (projectId: string) => {
    const projects = PersonalProjectService.getProjects();
    const proj = projects.find((p) => p.id === projectId);
    if (proj) {
      const opp = opportunities.find((o) => o.id === proj.opportunityId);
      if (opp) {
        onSelectOpportunity(opp);
      }
    }
  };

  // Multi-parametric Filter State
  const initialFilters: RadarFilterState = {
    searchQuery: '',
    country: 'all',
    continent: 'all',
    currency: 'all',
    category: 'all',
    saasType: 'all',
    productType: 'all',
    technology: 'all',
    isAiOnly: null,
    audience: 'all',
    isRemoteOnly: false,
    investment: 'all',
    difficulty: 'all',
    potential: 'all',
    freshness: 'all',
    sortBy: 'score',
  };

  const [filters, setFilters] = useState<RadarFilterState>(initialFilters);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 700);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Comprehensive Multi-dimensional Filter Engine
  const filteredOpportunities = opportunities
    .filter((opp) => {
      // 1. Text Search across title, problem, solution, tech
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesQuery =
          opp.title.toLowerCase().includes(query) ||
          opp.tagline.toLowerCase().includes(query) ||
          opp.whatDetected.toLowerCase().includes(query) ||
          opp.problemExists.toLowerCase().includes(query) ||
          opp.opportunityExplored.toLowerCase().includes(query) ||
          opp.tags.some((t) => t.toLowerCase().includes(query));
        if (!matchesQuery) return false;
      }

      // 2. Country
      if (filters.country !== 'all' && opp.market?.originCode !== filters.country) {
        return false;
      }

      // 3. Continent
      if (filters.continent !== 'all' && opp.market?.continent !== filters.continent) {
        return false;
      }

      // 4. Currency
      if (filters.currency !== 'all' && opp.market?.currency !== filters.currency) {
        return false;
      }

      // 5. Category
      if (filters.category !== 'all' && opp.category !== filters.category) {
        return false;
      }

      // 6. SaaS / Business Model
      if (filters.saasType !== 'all' && opp.businessModel !== filters.saasType) {
        return false;
      }

      // 7. AI Only / Non-AI
      if (filters.isAiOnly !== null && opp.isAiRelated !== filters.isAiOnly) {
        return false;
      }

      // 8. Audience (B2B / B2C)
      if (filters.audience !== 'all' && opp.targetAudience !== filters.audience) {
        return false;
      }

      // 9. Remote Work
      if (filters.isRemoteOnly && !opp.isRemoteWork) {
        return false;
      }

      // 10. Investment
      if (filters.investment !== 'all' && opp.investmentRequired !== filters.investment) {
        return false;
      }

      // 11. Difficulty
      if (filters.difficulty !== 'all' && opp.difficulty !== filters.difficulty) {
        return false;
      }

      // 12. Potential MRR
      if (filters.potential !== 'all' && opp.potentialMrr !== filters.potential) {
        return false;
      }

      // 13. Freshness / Recência
      if (filters.freshness !== 'all') {
        if (filters.freshness === '24h' && !opp.freshness.includes('2h') && !opp.freshness.includes('6h') && !opp.freshness.includes('1d')) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      if (filters.sortBy === 'score') return b.score - a.score;
      if (filters.sortBy === 'newest') return b.dateDetected.localeCompare(a.dateDetected);
      if (filters.sortBy === 'mvp') return a.timeToMvpDays - b.timeToMvpDays;
      if (filters.sortBy === 'growth') {
        const valA = parseInt(a.trendingGrowth.replace(/\D/g, '') || '0', 10);
        const valB = parseInt(b.trendingGrowth.replace(/\D/g, '') || '0', 10);
        return valB - valA;
      }
      return 0;
    });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Terminal Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/40 to-white dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-none">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-cyan-400 animate-pulse" />
            <span className="text-2xs font-mono uppercase tracking-widest text-blue-700 dark:text-cyan-300 font-bold">
              TERMINAL MILITAR / FINANCEIRO DE OPORTUNIDADES
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono tracking-tight flex items-center gap-2.5">
            <Terminal className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
            Global Opportunity Radar
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Feed contínuo de inteligência de mercado estruturado no modelo de 6 dimensões (O que foi detectado, Por que é importante, Mercado envolvido, Problema, Oportunidade e Monetização).
          </p>
        </div>

        {/* Sync & Live Rate Counter */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            iconLeft={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
            onClick={handleRefresh}
          >
            Sincronizar Feed
          </Button>

          <div className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs font-mono text-slate-300">
            Fluxo: <strong className="text-cyan-400">~14 sinais/min</strong>
          </div>
        </div>
      </div>

      {/* AI Accountability Coach Alerts (Proactive Notification) */}
      <AiCoachNotificationBanner
        alerts={coachAlerts}
        onOpenProject={handleOpenProjectFromCoach}
      />

      {/* Mode Switcher: Intel Dossiers vs Raw Ingestion Stream */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-1">
        <button
          onClick={() => setActiveTab('intel')}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'intel'
              ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Oportunidades Estruturadas ({filteredOpportunities.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('raw_stream')}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'raw_stream'
              ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-cyan-400" />
          <span>Sinais Brutos Ingeridos ({signals.length})</span>
        </button>
      </div>

      {/* TAB 1: Structured Global Intelligence Dossiers */}
      {activeTab === 'intel' && (
        <div className="space-y-6">
          {/* 15-Parameter Filter Console */}
          <RadarFilterConsole
            filters={filters}
            onFilterChange={setFilters}
            onReset={() => setFilters(initialFilters)}
            totalFiltered={filteredOpportunities.length}
            totalAvailable={opportunities.length}
          />

          {/* Discovery Cards List */}
          <div className="space-y-4">
            {filteredOpportunities.map((opportunity) => (
              <IntelDiscoveryCard
                key={opportunity.id}
                opportunity={opportunity}
                onOpenDrawer={onSelectOpportunity}
                onToggleSave={onToggleSave}
                isSaved={opportunity.isSaved}
              />
            ))}

            {/* Empty State */}
            {filteredOpportunities.length === 0 && (
              <div className="p-16 text-center rounded-2xl bg-slate-900/40 border border-white/[0.06] space-y-3 max-w-lg mx-auto">
                <div className="w-12 h-12 rounded-xl bg-white/[0.04] text-slate-500 flex items-center justify-center mx-auto">
                  <SlidersHorizontal className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-200">
                  Nenhuma descoberta corresponde aos filtros aplicados
                </h3>
                <p className="text-xs text-slate-400">
                  Tente relaxar os filtros de país, moeda ou dificuldade para visualizar mais resultados indexados.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setFilters(initialFilters)}
                >
                  Resetar Todos os Filtros
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Raw Signals Ingestion Stream */}
      {activeTab === 'raw_stream' && (
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/[0.06] text-xs font-mono text-slate-400 flex items-center justify-between">
            <span>Discussões brutas monitoradas via WebSockets e APIs de terceiros</span>
            <span className="text-cyan-400">Varredura contínua ativa</span>
          </div>

          {signals.map((sig) => (
            <div
              key={sig.id}
              className="p-5 rounded-xl bg-slate-900/60 border border-white/[0.08] hover:border-cyan-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="slate" size="xs">
                    {sig.source}
                  </Badge>
                  <span className="text-2xs font-mono text-slate-500">
                    {sig.detectedAt}
                  </span>
                  <span className="text-2xs font-mono text-slate-400">
                    Região: {sig.countryFlag || '🌐'} {sig.geoScope}
                  </span>
                  <Badge
                    variant={
                      sig.sentiment === 'Frustração'
                        ? 'rose'
                        : sig.sentiment === 'Demanda Alta'
                        ? 'emerald'
                        : 'cyan'
                    }
                    size="xs"
                  >
                    {sig.sentiment}
                  </Badge>
                </div>

                <h3 className="text-sm font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors">
                  {sig.title}
                </h3>

                <p className="text-xs text-slate-400 font-sans italic bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.04]">
                  "{sig.excerpt}"
                </p>
              </div>

              <div className="flex items-center justify-between md:flex-col md:items-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/[0.04]">
                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">
                    Score Impact
                  </span>
                  <span className="text-base font-mono font-bold text-emerald-400">
                    +{sig.scoreImpact}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(sig.id, `${sig.title} - ${sig.excerpt}`)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]"
                    title="Copiar citação"
                  >
                    {copiedId === sig.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <Button
                    variant="primary"
                    size="xs"
                    iconLeft={<PlusCircle className="w-3.5 h-3.5" />}
                    onClick={() => onPromoteToOpportunity(sig)}
                  >
                    Promover para Oportunidade
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
