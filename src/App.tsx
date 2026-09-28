import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { NavSection, Opportunity, LiveSignal, UserAlert, HypothesisCard } from './types';
import {
  MOCK_OPPORTUNITIES,
  MOCK_LIVE_SIGNALS,
  MOCK_TRENDS,
  MOCK_GEO_ARBITRAGE,
  MOCK_REMOTE_WORK,
  MOCK_ALERTS,
  MOCK_HYPOTHESES,
} from './data/mockData';
import { ApiClient } from './services/apiClient';
import { PersonalProjectService } from './services/personalProjectService';

// Core UI Layout Components (Immediate load)
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DetailDrawer } from './components/common/DetailDrawer';
import { CommandPalette } from './components/common/CommandPalette';
import { LoadingSkeleton } from './components/common/LoadingSkeleton';

// Code-Splitting: Lazy load all 14 views on demand
const DashboardView = React.lazy(() =>
  import('./views/DashboardView').then((m) => ({ default: m.DashboardView }))
);
const RadarView = React.lazy(() =>
  import('./views/RadarView').then((m) => ({ default: m.RadarView }))
);
const MarketNewsView = React.lazy(() =>
  import('./views/MarketNewsView').then((m) => ({ default: m.MarketNewsView }))
);
const OpportunitiesView = React.lazy(() =>
  import('./views/OpportunitiesView').then((m) => ({ default: m.OpportunitiesView }))
);
const SaasRadarView = React.lazy(() =>
  import('./views/SaasRadarView').then((m) => ({ default: m.SaasRadarView }))
);
const MarketTrendsView = React.lazy(() =>
  import('./views/MarketTrendsView').then((m) => ({ default: m.MarketTrendsView }))
);
const GlobalOpportunitiesView = React.lazy(() =>
  import('./views/GlobalOpportunitiesView').then((m) => ({ default: m.GlobalOpportunitiesView }))
);
const RemoteWorkView = React.lazy(() =>
  import('./views/RemoteWorkView').then((m) => ({ default: m.RemoteWorkView }))
);
const ResearchView = React.lazy(() =>
  import('./views/ResearchView').then((m) => ({ default: m.ResearchView }))
);
const AiAnalystView = React.lazy(() =>
  import('./views/AiAnalystView').then((m) => ({ default: m.AiAnalystView }))
);
const MyLabView = React.lazy(() =>
  import('./views/MyLabView').then((m) => ({ default: m.MyLabView }))
);
const AlertsView = React.lazy(() =>
  import('./views/AlertsView').then((m) => ({ default: m.AlertsView }))
);
const SavedView = React.lazy(() =>
  import('./views/SavedView').then((m) => ({ default: m.SavedView }))
);
const ExecutionPlansView = React.lazy(() =>
  import('./views/ExecutionPlansView').then((m) => ({ default: m.ExecutionPlansView }))
);
const SettingsView = React.lazy(() =>
  import('./views/SettingsView').then((m) => ({ default: m.SettingsView }))
);
const AdminSourcesView = React.lazy(() =>
  import('./views/AdminSourcesView').then((m) => ({ default: m.AdminSourcesView }))
);

const VALID_SECTIONS: NavSection[] = [
  'dashboard',
  'radar',
  'opportunities',
  'saas-radar',
  'market-trends',
  'global-opportunities',
  'remote-work',
  'research',
  'ai-analyst',
  'my-lab',
  'alerts',
  'saved',
  'execution-plans',
  'admin',
  'market-news',
  'settings',
];

const getInitialSection = (): NavSection => {
  if (typeof window === 'undefined') return 'dashboard';
  const rawHash = window.location.hash.replace(/^#\/?/, '') as NavSection;
  return VALID_SECTIONS.includes(rawHash) ? rawHash : 'dashboard';
};

export function App() {
  const [currentSection, setCurrentSection] = useState<NavSection>(getInitialSection);
  const [opportunities, setOpportunities] = useState<Opportunity[]>(MOCK_OPPORTUNITIES);
  const [liveSignals, setLiveSignals] = useState<LiveSignal[]>(MOCK_LIVE_SIGNALS);
  const [alerts, setAlerts] = useState<UserAlert[]>(MOCK_ALERTS);
  const [hypotheses, setHypotheses] = useState<HypothesisCard[]>(MOCK_HYPOTHESES);

  // Drawer & Modal States
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sync state with URL hash (supports bookmarks, direct links, and browser back/forward buttons)
  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash.replace(/^#\/?/, '') as NavSection;
      if (VALID_SECTIONS.includes(rawHash)) {
        setCurrentSection(rawHash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = useCallback((sec: NavSection) => {
    setCurrentSection(sec);
    if (window.location.hash !== `#${sec}`) {
      window.location.hash = sec;
    }
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Initial Load from API client with fallback
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        PersonalProjectService.syncWithBackend();
        const [oppsData, signalsData] = await Promise.all([
          ApiClient.getOpportunities(),
          ApiClient.getSignals(),
        ]);
        if (isMounted) {
          if (oppsData && oppsData.length > 0) setOpportunities(oppsData);
          if (signalsData && signalsData.length > 0) setLiveSignals(signalsData);
        }
      } catch {
        // Fallback is automatically handled in ApiClient
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        if (isDrawerOpen) setIsDrawerOpen(false);
        if (isCommandPaletteOpen) setIsCommandPaletteOpen(false);
        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, isCommandPaletteOpen, isMobileMenuOpen]);

  // Memoized Handlers to prevent downstream re-renders
  const handleSelectOpportunity = useCallback((opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setIsDrawerOpen(true);
  }, []);

  const handleToggleSave = useCallback((id: string) => {
    setOpportunities((prev) =>
      prev.map((opp) => (opp.id === id ? { ...opp, isSaved: !opp.isSaved } : opp))
    );
    setSelectedOpportunity((prev) =>
      prev && prev.id === id ? { ...prev, isSaved: !prev.isSaved } : prev
    );
  }, []);

  const handlePromoteSignalToOpportunity = useCallback((signal: LiveSignal) => {
    const countryCode = signal.countryCode || 'US';
    const countryFlag = signal.countryFlag || '🇺🇸';

    const newOpp: Opportunity = {
      id: `opp-promoted-${Date.now().toString().slice(-4)}`,
      title: signal.title,
      tagline: signal.excerpt,
      category: signal.category.includes('Micro-SaaS')
        ? 'Micro-SaaS'
        : signal.category.includes('Tecnologia')
        ? 'AI Agent / Tool'
        : 'B2B Software',
      score: signal.scoreImpact,
      confidence: 'Alta',
      potentialMrr: '$20k - $80k MRR',
      effort: 'Médio (1 mês)',
      difficulty: 'Média',
      timeToMvpDays: 18,

      market: {
        originCountry: signal.geoScope.split('/')[0].trim(),
        originFlag: countryFlag,
        originCode: countryCode,
        targetMarkets: ['Brasil', 'América Latina', 'Global'],
        continent: countryCode === 'BR' ? 'América Latina' : 'América do Norte',
        currency: 'USD',
      },
      targetMarkets: ['Brasil', 'Global'],

      whatDetected: `Sinal urgente identificado em ${signal.source}: "${signal.title}".`,
      whyImportant: 'Demanda real reprimida com alto volume de reclamações e buscas ativas por alternativas no mercado.',
      problemExists: signal.excerpt,
      primaryProblem: signal.excerpt,
      proposedSolution: 'Solução enxuta de autosserviço eliminando taxas de contratos anuais obrigatórios.',
      opportunityExplored: 'Construir produto focado e leve com pagamento mensal e integração direta.',
      howMonetized: '$49 a $149/mês modelo de assinatura recorrente sem contrato anual.',
      monetizationModel: '$49/mês modelo de assinatura self-service.',

      businessModel: 'Micro-SaaS',
      productType: 'SaaS',
      targetAudience: 'B2B',
      isAiRelated: signal.category.includes('Tecnologia'),
      isRemoteWork: signal.category.includes('Remoto'),
      investmentRequired: 'Bootstrapped (Baixo)',

      unservedNiche: 'Pequenos times e fundadores insatisfeitos com soluções corporativas monolíticas',
      competitionLevel: 'Média',
      existingCompetitors: ['Concorrentes consolidados mencionados na queixa'],
      differentiationAngle: 'Preço justo, onboarding em 3 minutos e sem travas de contrato enterprise.',
      tags: [signal.source, 'Live Promoted', 'Fricção Crítica'],
      techStack: ['Next.js', 'PostgreSQL', 'Tailwind', 'Stripe'],

      freshness: 'Detectado há 2h',
      trendingGrowth: '+140% menções recentes',
      sparkline: [20, 28, 42, 59, 78, 96, 120],
      dateDetected: '2026-09-26',
      isSaved: true,
      status: 'Em Análise',
      sources: [
        {
          platform: signal.source as any,
          snippet: signal.excerpt,
          timestamp: signal.detectedAt,
          volumeOrScore: `Impacto ${signal.scoreImpact}`,
        },
      ],
      aiSwot: {
        strengths: ['Alta intenção de compra originada de dor real.', 'Público ativo procurando alternativas.'],
        weaknesses: ['Requer validação rápida para não perder o timing do mercado.'],
        opportunities: ['Lançamento como first-mover com canal orgânico no Reddit/Twitter.'],
        threats: ['O player criticado atualizar seus termos ou preços.'],
      },
      validationRoadmap: [
        { step: 1, title: 'Smoke Test em Comunidades', description: 'Postar resposta técnica onde o sinal foi detectado.', estimatedHours: 4 },
        { step: 2, title: 'Lista de Espera com Mockup', description: 'Criar página rápida demonstrando o fluxo sem código.', estimatedHours: 8 },
      ],
    };

    setOpportunities((prev) => [newOpp, ...prev]);
    setSelectedOpportunity(newOpp);
    setIsDrawerOpen(true);
  }, []);

  const handleAddHypothesis = useCallback((hyp: Omit<HypothesisCard, 'id' | 'createdAt'>) => {
    const newHyp: HypothesisCard = {
      ...hyp,
      id: `hyp-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setHypotheses((prev) => [newHyp, ...prev]);
  }, []);

  const handleToggleAlert = useCallback((id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a))
    );
  }, []);

  const handleAddAlert = useCallback((alertData: Omit<UserAlert, 'id' | 'triggersCount'>) => {
    const newAlert: UserAlert = {
      ...alertData,
      id: `alt-${Date.now().toString().slice(-4)}`,
      triggersCount: 0,
    };
    setAlerts((prev) => [newAlert, ...prev]);
  }, []);

  const savedCount = useMemo(() => opportunities.filter((o) => o.isSaved).length, [opportunities]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-[#F8FAFC] flex font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Desktop & Tablet Sidebar */}
      <Sidebar
        currentSection={currentSection}
        onNavigate={handleNavigate}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        savedCount={savedCount}
        liveSignalCount={liveSignals.length}
      />

      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 md:hidden animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="w-72 max-w-[80vw] h-full bg-slate-950 border-r border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar
              currentSection={currentSection}
              onNavigate={handleNavigate}
              isCollapsed={false}
              onToggleCollapse={() => {}}
              savedCount={savedCount}
              liveSignalCount={liveSignals.length}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isSidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
        }`}
      >
        {/* Sticky Header */}
        <Header
          currentSection={currentSection}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
          onQuickAction={() => handleNavigate('ai-analyst')}
          unhandledAlertsCount={3}
        />

        {/* Dynamic Section View Content with Suspense Code Splitting */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Suspense fallback={<LoadingSkeleton />}>
            {currentSection === 'dashboard' && (
              <DashboardView
                opportunities={opportunities}
                liveSignals={liveSignals}
                onSelectOpportunity={handleSelectOpportunity}
                onNavigate={handleNavigate}
                onToggleSave={handleToggleSave}
              />
            )}

            {currentSection === 'radar' && (
              <RadarView
                opportunities={opportunities}
                signals={liveSignals}
                onSelectOpportunity={handleSelectOpportunity}
                onPromoteToOpportunity={handlePromoteSignalToOpportunity}
                onToggleSave={handleToggleSave}
              />
            )}

            {currentSection === 'market-news' && (
              <MarketNewsView onNavigateToMyLab={() => handleNavigate('my-lab')} />
            )}

            {currentSection === 'opportunities' && (
              <OpportunitiesView
                opportunities={opportunities}
                onSelectOpportunity={handleSelectOpportunity}
                onToggleSave={handleToggleSave}
              />
            )}

            {currentSection === 'saas-radar' && (
              <SaasRadarView
                opportunities={opportunities}
                onSelectOpportunity={handleSelectOpportunity}
                onToggleSave={handleToggleSave}
              />
            )}

            {currentSection === 'market-trends' && (
              <MarketTrendsView trends={MOCK_TRENDS} />
            )}

            {currentSection === 'global-opportunities' && (
              <GlobalOpportunitiesView geoOpportunities={MOCK_GEO_ARBITRAGE} />
            )}

            {currentSection === 'remote-work' && (
              <RemoteWorkView insights={MOCK_REMOTE_WORK} />
            )}

            {currentSection === 'research' && <ResearchView />}

            {currentSection === 'ai-analyst' && <AiAnalystView />}

            {currentSection === 'my-lab' && (
              <MyLabView
                hypotheses={hypotheses}
                onAddHypothesis={handleAddHypothesis}
                opportunities={opportunities}
                onSelectOpportunity={handleSelectOpportunity}
                onNavigate={handleNavigate}
              />
            )}

            {currentSection === 'alerts' && (
              <AlertsView
                alerts={alerts}
                onToggleAlert={handleToggleAlert}
                onAddAlert={handleAddAlert}
              />
            )}

            {currentSection === 'saved' && (
              <SavedView
                opportunities={opportunities}
                onSelectOpportunity={handleSelectOpportunity}
                onToggleSave={handleToggleSave}
                onNavigate={handleNavigate}
              />
            )}

            {currentSection === 'execution-plans' && <ExecutionPlansView />}

            {currentSection === 'admin' && <AdminSourcesView />}

            {currentSection === 'settings' && <SettingsView />}
          </Suspense>
        </main>
      </div>

      {/* Slide-over Detail Drawer */}
      <DetailDrawer
        opportunity={selectedOpportunity}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onToggleSave={handleToggleSave}
        isSaved={selectedOpportunity?.isSaved}
      />

      {/* Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={handleNavigate}
        onSelectOpportunity={handleSelectOpportunity}
        opportunities={opportunities}
      />
    </div>
  );
}

export default App;
