import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  MarketNewsItem,
  EmergingTrendItem,
  DailyMarketBrief,
  NewsCategory,
  UserInterest,
  OpportunityHypothesis,
} from '../types';
import { MOCK_MARKET_NEWS, MOCK_EMERGING_TRENDS, MOCK_DAILY_BRIEF } from '../data/newsData';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Sparkline } from '../components/common/Sparkline';
import {
  Sparkles,
  TrendingUp,
  Bookmark,
  ExternalLink,
  Bot,
  Lightbulb,
  PlusCircle,
  Search,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  X,
  Compass,
  Zap,
  ArrowRight,
  Activity,
  Calendar,
  Share2,
  Check,
  Flame,
  LayoutGrid,
  List,
  RefreshCw,
} from 'lucide-react';
import { API_BASE_URL } from '../services/apiConfig';

const ALL_CATEGORIES: NewsCategory[] = [
  'IA',
  'tecnologia',
  'SaaS',
  'startups',
  'economia digital',
  'e-commerce',
  'software',
  'automação',
  'fintech',
  'produtividade',
  'trabalho remoto',
  'APIs',
  'desenvolvimento',
  'novos produtos',
  'mudanças de plataformas',
];

const AVAILABLE_INTERESTS: UserInterest[] = [
  'SaaS',
  'IA',
  'programação',
  'e-commerce',
  'marketing',
  'fintech',
  'automação',
  'trabalho remoto',
  'APIs',
];

interface MarketNewsViewProps {
  onNavigateToMyLab?: () => void;
}

export const MarketNewsView: React.FC<MarketNewsViewProps> = ({ onNavigateToMyLab }) => {
  // Main Navigation Tabs
  const [activeTab, setActiveTab] = useState<'feed' | 'trends' | 'brief'>('feed');
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');

  // Data states
  const [news, setNews] = useState<MarketNewsItem[]>(MOCK_MARKET_NEWS);
  const [trends, setTrends] = useState<EmergingTrendItem[]>(MOCK_EMERGING_TRENDS);
  const [dailyBrief, setDailyBrief] = useState<DailyMarketBrief>(MOCK_DAILY_BRIEF);
  const [selectedInterests, setSelectedInterests] = useState<UserInterest[]>([
    'SaaS',
    'IA',
    'APIs',
  ]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [onlyWithHypotheses, setOnlyWithHypotheses] = useState(false);
  const [filterOnlyInterests, setFilterOnlyInterests] = useState(false);

  // Drawer & Interactions
  const [expandedHypotheses, setExpandedHypotheses] = useState<Record<string, boolean>>({});
  const [analysisNewsItem, setAnalysisNewsItem] = useState<MarketNewsItem | null>(null);
  const [deepAnalysis, setDeepAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Fetch live from server API with fallback
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [newsRes, briefRes, trendsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/news`),
          fetch(`${API_BASE_URL}/news/daily-brief`),
          fetch(`${API_BASE_URL}/news/trends`),
        ]);

        if (newsRes.ok && isMounted) {
          const json = await newsRes.json();
          if (json.data && json.data.length > 0) setNews(json.data);
        }
        if (briefRes.ok && isMounted) {
          const json = await briefRes.json();
          setDailyBrief(json);
        }
        if (trendsRes.ok && isMounted) {
          const json = await trendsRes.json();
          setTrends(json);
        }
      } catch {
        // Fallback to MOCK data automatically
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleToggleSave = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setNews((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isSaved: !item.isSaved } : item))
    );

    const target = news.find((n) => n.id === id);
    const willBeSaved = !target?.isSaved;
    showToast(willBeSaved ? 'Notícia salva no seu radar de inteligência!' : 'Notícia removida dos salvos.');

    try {
      await fetch(`${API_BASE_URL}/news/${id}/save`, { method: 'POST' });
    } catch {
      // Ignora erro de rede em fallback
    }
  };

  const handleToggleInterest = (interest: UserInterest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const toggleExpandHypotheses = (id: string) => {
    setExpandedHypotheses((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCreateProject = async (newsItem: MarketNewsItem, hypothesis: OpportunityHypothesis) => {
    try {
      const res = await fetch(`${API_BASE_URL}/news/${newsItem.id}/create-project`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hypothesisId: hypothesis.id }),
      });

      if (res.ok) {
        showToast(`Projeto criado no My Lab: "${hypothesis.title.replace(/^Hipótese:\s*/i, '')}"`);
        setNews((prev) =>
          prev.map((n) =>
            n.id === newsItem.id
              ? {
                  ...n,
                  possibleOpportunities: n.possibleOpportunities.map((h) =>
                    h.id === hypothesis.id ? { ...h, status: 'Promovido a Projeto' } : h
                  ),
                }
              : n
          )
        );
      } else {
        showToast('Projeto adicionado à sua esteira de validação!');
      }
    } catch {
      showToast('Projeto criado localmente na sua sandbox.');
    }
  };

  const handleOpenAnalysis = (item: MarketNewsItem) => {
    setAnalysisNewsItem(item);
    setDeepAnalysis(null);
  };

  const handleRunDeepAnalysis = async (item: MarketNewsItem) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/news/${item.id}/analyze`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setDeepAnalysis(data.analysis);
      } else {
        // Fallback simulated deep intelligence
        setDeepAnalysis({
          executiveVerdict: `A notícia "${item.title}" confirma uma forte inflexão de mercado. O timing é propício para soluções B2B com onboarding rápido e precificação por valor agregado.`,
          marketFriction: 'Média/Alta: Usuários enfrentam sobretaxas ou complexidade nas ferramentas existentes.',
          threeWeekRoadmap: [
            { week: 'Semana 1', focus: 'Validação de Dor', details: 'Entrevistar 10 potenciais compradores do público-alvo mapeado.' },
            { week: 'Semana 2', focus: 'Landing Page & Demo', details: 'Publicar proposta de valor enxuta e coletar 30 signups qualificados.' },
            { week: 'Semana 3', focus: 'MVP Funcional', details: 'Entregar o fluxo central resolvendo exclusivamente o gargalo principal.' },
          ],
        });
      }
    } catch {
      setDeepAnalysis({
        executiveVerdict: `Inflexão relevante de mercado identificada em ${item.category}. Oportunidade viável para modelo Micro-SaaS.`,
        marketFriction: 'Alta demanda reprimida identificada.',
        threeWeekRoadmap: [
          { week: 'Semana 1', focus: 'Validação', details: 'Pesquisa com 10 leads potenciais.' },
          { week: 'Semana 2', focus: 'Landing Page', details: 'Captura de lista de espera.' },
          { week: 'Semana 3', focus: 'Alpha', details: 'Testes do fluxo essencial.' },
        ],
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getCategoryColor = (cat: NewsCategory) => {
    switch (cat) {
      case 'IA':
        return 'violet';
      case 'SaaS':
        return 'cyan';
      case 'APIs':
      case 'desenvolvimento':
        return 'emerald';
      case 'fintech':
        return 'emerald';
      case 'mudanças de plataformas':
        return 'amber';
      case 'e-commerce':
        return 'cyan';
      default:
        return 'slate';
    }
  };

  // Match helper
  const isMatchingInterests = useCallback((item: MarketNewsItem) => {
    return selectedInterests.some(
      (interest) =>
        item.category.toLowerCase().includes(interest.toLowerCase()) ||
        item.tags.some((t) => t.toLowerCase().includes(interest.toLowerCase()))
    );
  }, [selectedInterests]);

  // Filtered News Items
  const filteredNews = useMemo(() => {
    return news.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesSummary = item.summary.toLowerCase().includes(q);
        const matchesTags = item.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesSummary && !matchesTags) return false;
      }

      // Filter only interests
      if (filterOnlyInterests && !isMatchingInterests(item)) {
        return false;
      }

      // Category
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Country
      if (selectedCountry !== 'all' && item.countryCode !== selectedCountry) {
        return false;
      }

      // Only with hypotheses
      if (onlyWithHypotheses && (!item.possibleOpportunities || item.possibleOpportunities.length === 0)) {
        return false;
      }

      return true;
    });
  }, [news, searchQuery, selectedCategory, selectedCountry, onlyWithHypotheses, filterOnlyInterests, isMatchingInterests]);

  const matchingInterestsCount = useMemo(() => {
    return news.filter(isMatchingInterests).length;
  }, [news, isMatchingInterests]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-slate-900 border border-cyan-500/40 shadow-2xl text-xs font-mono text-cyan-300 flex items-center justify-between gap-3 animate-slide-in-right max-w-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          {onNavigateToMyLab && (
            <button
              onClick={onNavigateToMyLab}
              className="text-2xs font-bold uppercase underline hover:text-white shrink-0 ml-2"
            >
              Ver no My Lab →
            </button>
          )}
        </div>
      )}

      {/* Header & Sub-Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              <Compass className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Market News & Discovery
            </h1>
            <span className="px-2 py-0.5 rounded-full text-2xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
              Live Intel
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Monitoramento de notícias globais, mudanças de plataformas e anúncios técnicos convertidos automaticamente em <strong>hipóteses de oportunidade de negócio</strong>.
          </p>
        </div>

        {/* View Tabs Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-white/[0.08] shrink-0">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium font-mono transition-all flex items-center gap-1.5 ${
              activeTab === 'feed'
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Feed Inteligente</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300">
              {news.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('trends')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium font-mono transition-all flex items-center gap-1.5 ${
              activeTab === 'trends'
                ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Emerging Trends</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300">
              {trends.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('brief')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium font-mono transition-all flex items-center gap-1.5 ${
              activeTab === 'brief'
                ? 'bg-violet-500/20 text-violet-300 font-bold border border-violet-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-violet-400" />
            <span>Daily Market Brief</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: FEED INTELIGENTE                                              */}
      {/* ==================================================================== */}
      {activeTab === 'feed' && (
        <div className="space-y-6">
          {/* Personalization / Interests Bar */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between text-xs flex-wrap gap-2">
              <span className="font-mono text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Personalize seu radar clicando nos seus interesses:</span>
              </span>
              <button
                onClick={() => setFilterOnlyInterests(!filterOnlyInterests)}
                className={`px-2.5 py-0.5 rounded-full text-2xs font-mono transition-colors border ${
                  filterOnlyInterests
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                    : 'bg-white/[0.04] text-slate-400 border-white/[0.08] hover:text-slate-200'
                }`}
              >
                {filterOnlyInterests
                  ? `Filtrando pelos meus interesses (${matchingInterestsCount} notícias)`
                  : `Filtrar apenas por meus interesses (${matchingInterestsCount})`}
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {AVAILABLE_INTERESTS.map((interest) => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    onClick={() => handleToggleInterest(interest)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-semibold shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                        : 'bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-cyan-400" />}
                    <span>{interest}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filter Bar & Controls */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar notícias por título, palavra-chave ou API..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-white/[0.08] text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Selects & View Toggle */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Category Select */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-white/[0.08] text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                <option value="all">Todas Categorias ({ALL_CATEGORIES.length})</option>
                {ALL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {/* Country Select */}
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-white/[0.08] text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                <option value="all">Todos os Países</option>
                <option value="US">🇺🇸 Estados Unidos</option>
                <option value="DE">🇩🇪 Alemanha</option>
                <option value="BR">🇧🇷 Brasil</option>
                <option value="CA">🇨🇦 Canadá</option>
                <option value="GB">🇬🇧 Reino Unido</option>
                <option value="FR">🇫🇷 França</option>
                <option value="GL">🌐 Global</option>
              </select>

              {/* Only with Hypotheses Toggle */}
              <button
                onClick={() => setOnlyWithHypotheses(!onlyWithHypotheses)}
                className={`px-3 py-2 rounded-xl text-xs font-mono transition-colors flex items-center gap-1.5 ${
                  onlyWithHypotheses
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                    : 'bg-slate-900 border border-white/[0.08] text-slate-400 hover:text-slate-200'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Com Hipóteses</span>
              </button>

              {/* View Mode Switcher */}
              <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-white/[0.08]">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg text-xs transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-cyan-500/20 text-cyan-300'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title="Visualização em Grade"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`p-1.5 rounded-lg text-xs transition-colors ${
                    viewMode === 'timeline'
                      ? 'bg-cyan-500/20 text-cyan-300'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title="Visualização em Linha do Tempo"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* News Items Feed */}
          {filteredNews.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-white/[0.08] space-y-3">
              <Compass className="w-8 h-8 text-slate-600 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-300">
                Nenhuma notícia encontrada com os filtros selecionados
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Tente limpar os termos de busca ou selecionar "Todas Categorias" para ver o fluxo completo.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedCountry('all');
                  setOnlyWithHypotheses(false);
                  setFilterOnlyInterests(false);
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filteredNews.map((item) => {
                const isInterestMatch = isMatchingInterests(item);
                const isExpanded = expandedHypotheses[item.id] ?? false;

                return (
                  <article
                    key={item.id}
                    className={`rounded-2xl border transition-all duration-200 p-5 flex flex-col justify-between hover:shadow-card-subtle ${
                      isInterestMatch
                        ? 'bg-slate-900/80 border-cyan-500/30 hover:border-cyan-500/60'
                        : 'bg-slate-900/50 border-white/[0.08] hover:border-white/20'
                    }`}
                  >
                    <div>
                      {/* Meta Header */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Country */}
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-2xs font-mono text-slate-300"
                            title={item.country}
                          >
                            <span>{item.countryFlag}</span>
                            <span>{item.countryCode}</span>
                          </span>

                          {/* Category Badge */}
                          <Badge
                            variant={getCategoryColor(item.category) as any}
                            size="xs"
                          >
                            {item.category}
                          </Badge>

                          {/* Personalized Match Pill */}
                          {isInterestMatch && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 flex items-center gap-1 font-semibold">
                              <Sparkles className="w-2.5 h-2.5" />
                              Interesse
                            </span>
                          )}

                          {/* Impact Score */}
                          <span className="text-2xs font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                            Impacto {item.impactScore}
                          </span>
                        </div>

                        {/* Top Action Icons */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => handleToggleSave(item.id, e)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              item.isSaved
                                ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
                                : 'text-slate-500 border-white/[0.06] hover:text-slate-300 hover:bg-white/[0.04]'
                            }`}
                            title={item.isSaved ? 'Notícia Salva' : 'Salvar Notícia'}
                          >
                            <Bookmark className="w-3.5 h-3.5 fill-current" />
                          </button>
                        </div>
                      </div>

                      {/* Title & Summary */}
                      <h3 className="text-base font-semibold text-slate-100 hover:text-cyan-300 transition-colors leading-snug mb-2">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-4 font-sans">
                        {item.summary}
                      </p>

                      {/* Origin Source & Read Time */}
                      <div className="flex items-center justify-between text-2xs font-mono text-slate-400 pb-3 mb-3 border-b border-white/[0.06]">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-300 font-medium">via {item.source}</span>
                          <span>•</span>
                          <span>{item.date}</span>
                        </div>

                        {item.originalUrl && (
                          <a
                            href={item.originalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 transition-colors"
                          >
                            <span>Link Original</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      {/* ======================================================= */}
                      {/* AI OPPORTUNITY DETECTION ENGINE SECTION                 */}
                      {/* ======================================================= */}
                      <div className="p-3.5 rounded-xl bg-violet-950/20 border border-violet-500/25 space-y-2.5 mb-4">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-mono font-bold text-violet-300 flex items-center gap-1.5">
                            <Bot className="w-4 h-4 text-violet-400" />
                            {item.aiQuestion}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-violet-500/20 text-violet-300">
                            {item.possibleOpportunities.length} hipóteses
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed font-sans">
                          {item.aiAnalysisSummary}
                        </p>

                        {/* List of Possible Opportunities (Labeled strictly as "Hipótese de oportunidade") */}
                        <div className="space-y-2 pt-1">
                          {(isExpanded
                            ? item.possibleOpportunities
                            : item.possibleOpportunities.slice(0, 1)
                          ).map((hyp) => (
                            <div
                              key={hyp.id}
                              className="p-3 rounded-lg bg-slate-900/90 border border-white/[0.08] space-y-1.5"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-mono uppercase font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
                                  [Hipótese de oportunidade] • {hyp.type}
                                </span>
                                <span className="text-2xs font-mono text-emerald-400">
                                  Confiança: {hyp.confidenceScore}%
                                </span>
                              </div>

                              <h5 className="text-xs font-semibold text-slate-100">
                                {hyp.title}
                              </h5>
                              <p className="text-2xs text-slate-400 leading-relaxed font-sans">
                                {hyp.description}
                              </p>

                              <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-slate-500">
                                <span>Público: {hyp.targetAudience}</span>
                                <span>Monetização: {hyp.monetizationModel}</span>
                              </div>

                              <div className="pt-2 flex items-center justify-end">
                                <button
                                  onClick={() => handleCreateProject(item, hyp)}
                                  className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 transition-colors"
                                  title="Enviar para sandbox do My Lab"
                                >
                                  <PlusCircle className="w-3 h-3" />
                                  <span>{hyp.status === 'Promovido a Projeto' ? 'No My Lab ✓' : 'Criar Projeto'}</span>
                                </button>
                              </div>
                            </div>
                          ))}

                          {item.possibleOpportunities.length > 1 && (
                            <button
                              onClick={() => toggleExpandHypotheses(item.id)}
                              className="w-full py-1 text-[11px] font-mono text-violet-300 hover:text-violet-200 flex items-center justify-center gap-1 transition-colors"
                            >
                              <span>
                                {isExpanded
                                  ? 'Ocultar outras hipóteses'
                                  : `Ver mais ${item.possibleOpportunities.length - 1} hipóteses`}
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Quick Actions Toolbar */}
                    <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleSave(item.id)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-mono border transition-colors flex items-center gap-1.5 ${
                            item.isSaved
                              ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                              : 'border-white/[0.08] text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                          }`}
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                          <span>{item.isSaved ? 'Salva' : 'Save'}</span>
                        </button>

                        <button
                          onClick={() => handleOpenAnalysis(item)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-mono border border-violet-500/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 transition-colors flex items-center gap-1.5"
                        >
                          <Bot className="w-3.5 h-3.5 text-violet-400" />
                          <span>Analyze</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleExpandHypotheses(item.id)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-mono border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 transition-colors flex items-center gap-1.5"
                        >
                          <Lightbulb className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Find Opportunity</span>
                        </button>

                        <button
                          onClick={() =>
                            handleCreateProject(item, item.possibleOpportunities[0])
                          }
                          className="px-3 py-1.5 rounded-lg text-xs font-mono bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-colors flex items-center gap-1.5 font-medium"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Create Project</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            /* Timeline View with Vertical Chronological Spine */
            <div className="relative pl-6 sm:pl-8 border-l-2 border-cyan-500/25 ml-2 sm:ml-4 space-y-6 max-w-4xl mx-auto py-2">
              {filteredNews.map((item) => {
                const isInterestMatch = isMatchingInterests(item);
                const isExpanded = expandedHypotheses[item.id] ?? false;

                return (
                  <div key={item.id} className="relative">
                    {/* Glowing Timeline Node */}
                    <div className="absolute -left-[31px] sm:-left-[39px] top-6 w-4 h-4 rounded-full bg-slate-950 border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_8px_rgba(6,182,212,0.6)]">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-300" />
                    </div>

                    <article
                      className={`rounded-2xl border transition-all duration-200 p-5 space-y-3 ${
                        isInterestMatch
                          ? 'bg-slate-900/80 border-cyan-500/30'
                          : 'bg-slate-900/50 border-white/[0.08]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-2xs font-mono text-slate-400">
                        <div className="flex items-center gap-2">
                          <span className="text-cyan-400 font-bold">{item.date}</span>
                          <span>•</span>
                          <span>{item.source}</span>
                          <span>•</span>
                          <span>{item.countryFlag} {item.countryCode}</span>
                        </div>
                        <Badge variant={getCategoryColor(item.category) as any} size="xs">
                          {item.category}
                        </Badge>
                      </div>

                      <h3 className="text-base font-semibold text-slate-100 hover:text-cyan-300 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        {item.summary}
                      </p>

                      {/* AI Opportunity Box inline */}
                      <div className="p-3 rounded-xl bg-violet-950/20 border border-violet-500/25 text-xs">
                        <span className="font-mono font-bold text-violet-300 block mb-1">
                          {item.aiQuestion}
                        </span>
                        <p className="text-slate-300 mb-2">{item.aiAnalysisSummary}</p>

                        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                          <button
                            type="button"
                            onClick={() => toggleExpandHypotheses(item.id)}
                            className="text-emerald-400 hover:text-emerald-300 font-mono text-2xs flex items-center gap-1"
                          >
                            <span>{item.possibleOpportunities.length} hipóteses de oportunidade</span>
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenAnalysis(item)}
                              className="text-2xs font-mono text-violet-300 hover:underline"
                            >
                              Análise Completa →
                            </button>
                            <button
                              onClick={() => handleCreateProject(item, item.possibleOpportunities[0])}
                              className="px-2 py-1 rounded text-2xs font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20"
                            >
                              Criar Projeto
                            </button>
                          </div>
                        </div>

                        {/* Collapsible hypotheses cards in timeline */}
                        {isExpanded && (
                          <div className="space-y-2 pt-3 border-t border-white/[0.06]">
                            {item.possibleOpportunities.map((hyp) => (
                              <div
                                key={hyp.id}
                                className="p-2.5 rounded-lg bg-slate-900/90 border border-white/[0.08] flex items-center justify-between gap-3"
                              >
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono font-bold text-emerald-400">
                                      [Hipótese] • {hyp.type}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-mono">
                                      {hyp.targetAudience}
                                    </span>
                                  </div>
                                  <p className="text-2xs text-slate-200 font-medium">{hyp.title}</p>
                                </div>
                                <button
                                  onClick={() => handleCreateProject(item, hyp)}
                                  className="px-2 py-1 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 shrink-0"
                                >
                                  {hyp.status === 'Promovido a Projeto' ? 'No My Lab ✓' : '+ Projeto'}
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </article>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: EMERGING TRENDS (5-Step Pipeline: Trend->Growth->Market->Problem->Opportunity) */}
      {/* ==================================================================== */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.08] flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                Pipeline de Detecção de Tendências Emergentes
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Rastreamento contínuo de assuntos em ascensão, comportamentos de compra e problemas recorrentes mapeados até a oportunidade acionável.
              </p>
            </div>
            <span className="text-xs font-mono text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/25 shrink-0">
              5 Etapas de Validação
            </span>
          </div>

          <div className="space-y-6">
            {trends.map((tr) => (
              <div
                key={tr.id}
                className="p-6 rounded-2xl bg-slate-900/80 border border-white/[0.08] hover:border-amber-500/30 transition-all space-y-5"
              >
                {/* Header with Category and Maturity */}
                <div className="flex items-center justify-between gap-2 flex-wrap pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <Badge variant={getCategoryColor(tr.category) as any} size="sm">
                      {tr.category}
                    </Badge>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/25 font-bold">
                      Fase: {tr.maturity}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-400">
                      {tr.relatedNewsCount} notícias correlacionadas
                    </span>
                    <Sparkline
                      data={tr.sparkline}
                      color="emerald"
                      width={90}
                      height={24}
                    />
                  </div>
                </div>

                {/* The 5-Step Pipeline Visualization with Stylish Connectors */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
                  {/* 1. TREND */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/25 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                          1. Trend
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      </div>
                      <p className="text-xs font-semibold text-slate-100 leading-snug">
                        {tr.trend}
                      </p>
                    </div>
                    <div className="pt-2 text-2xs font-mono text-slate-500">
                      Assunto emergente
                    </div>
                  </div>

                  {/* 2. GROWTH */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-emerald-500/25 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                          2. Growth
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      </div>
                      <div className="flex items-center gap-1 text-sm font-mono font-bold text-emerald-300">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>+{tr.growthPercentage}%</span>
                      </div>
                      <p className="text-2xs text-slate-400 mt-1 leading-relaxed">
                        {tr.growth}
                      </p>
                    </div>
                    <div className="pt-2 text-2xs font-mono text-slate-500">
                      Aceleração de interesse
                    </div>
                  </div>

                  {/* 3. MARKET */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-violet-500/25 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-violet-400">
                          3. Market
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                      </div>
                      <p className="text-xs text-slate-200 leading-snug">
                        {tr.market}
                      </p>
                    </div>
                    <div className="pt-2 text-2xs font-mono text-slate-500">
                      Público & Nicho
                    </div>
                  </div>

                  {/* 4. PROBLEM */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-rose-500/25 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400">
                          4. Problem
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        {tr.problem}
                      </p>
                    </div>
                    <div className="pt-2 text-2xs font-mono text-slate-500">
                      Gargalo recorrente
                    </div>
                  </div>

                  {/* 5. OPPORTUNITY */}
                  <div className="p-3.5 rounded-xl bg-amber-950/20 border-2 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.15)] space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                          5. Opportunity
                        </span>
                        <Sparkles className="w-3 h-3 text-amber-400" />
                      </div>
                      <p className="text-xs font-semibold text-amber-200 leading-snug font-sans">
                        {tr.opportunity}
                      </p>
                    </div>
                    <div className="pt-2 flex justify-end">
                      <Button
                        variant="secondary"
                        size="xs"
                        iconLeft={<PlusCircle className="w-3 h-3" />}
                        onClick={() => {
                          showToast(`Tendência "${tr.trend}" adicionada ao radar do My Lab.`);
                        }}
                      >
                        Explorar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: DAILY MARKET BRIEF                                            */}
      {/* ==================================================================== */}
      {activeTab === 'brief' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Executive Header */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-950/40 via-slate-900 to-slate-950 border border-violet-500/30 space-y-4 shadow-xl">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30 flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-violet-400" />
                  AI Executive Daily Brief
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {dailyBrief.date}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                iconLeft={<Share2 className="w-3.5 h-3.5" />}
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                  showToast('Link do Daily Brief copiado!');
                }}
              >
                {copiedLink ? 'Copiado!' : 'Compartilhar Briefing'}
              </Button>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white mb-2 leading-snug">
                {dailyBrief.aiExecutiveInsight.highlightTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                {dailyBrief.aiExecutiveInsight.overview}
              </p>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-white/[0.08] text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Sinais Hoje</span>
                <span className="text-lg font-bold font-mono text-cyan-400">
                  {dailyBrief.todaySignalsCount} novos
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-white/[0.08] text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Tendências</span>
                <span className="text-lg font-bold font-mono text-amber-400">
                  {dailyBrief.emergingTrendsCount} acelerando
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-white/[0.08] text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Oportunidades SaaS</span>
                <span className="text-lg font-bold font-mono text-emerald-400">
                  {dailyBrief.saasOpportunitiesCount} ativas
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-white/[0.08] text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Transferência Global</span>
                <span className="text-lg font-bold font-mono text-violet-400">
                  {dailyBrief.globalOpportunitiesCount} identificadas
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-white/[0.08] text-center col-span-2 sm:col-span-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Notícias Chave</span>
                <span className="text-lg font-bold font-mono text-slate-200">
                  {dailyBrief.newsWorthWatchingCount} relevantes
                </span>
              </div>
            </div>

            {/* Key Takeaways */}
            <div className="pt-3 border-t border-white/[0.08] space-y-2">
              <span className="text-xs font-mono font-bold text-violet-300 uppercase tracking-wider block">
                Principais Pontos de Atenção para Fundadores:
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300 font-sans">
                {dailyBrief.aiExecutiveInsight.keyTakeaways.map((takeaway, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-violet-400 font-bold">•</span>
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Next Step Callout */}
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-emerald-300 font-sans">
                <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Ação Recomendada:</strong> {dailyBrief.aiExecutiveInsight.recommendedNextStep}
                </span>
              </div>
              <Button
                variant="emerald"
                size="xs"
                onClick={() => {
                  if (onNavigateToMyLab) onNavigateToMyLab();
                  else showToast('Navegando para o My Lab...');
                }}
              >
                Abrir My Lab
              </Button>
            </div>
          </div>

          {/* Spotlight News Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Notícias Essenciais para Acompanhar Hoje
            </h3>

            <div className="space-y-3">
              {news.slice(0, 3).map((n) => (
                <div
                  key={n.id}
                  className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.08] hover:border-cyan-500/30 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={getCategoryColor(n.category) as any} size="xs">
                        {n.category}
                      </Badge>
                      <span className="text-2xs font-mono text-slate-400">
                        {n.source} • {n.countryFlag} {n.countryCode}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-100">
                      {n.title}
                    </h4>
                    <p className="text-2xs text-slate-400 line-clamp-1 font-sans">
                      {n.summary}
                    </p>
                  </div>

                  <button
                    onClick={() => handleOpenAnalysis(n)}
                    className="px-3 py-1.5 rounded-lg text-xs font-mono bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/30 shrink-0 flex items-center gap-1 transition-colors"
                  >
                    <span>Ver Análise</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* DRAWER: DEEP AI ANALYSIS MODAL                                       */}
      {/* ==================================================================== */}
      {analysisNewsItem && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setAnalysisNewsItem(null)}
          />

          <div className="relative w-full max-w-xl bg-slate-950 border-l border-white/10 shadow-2xl flex flex-col h-full z-10 animate-slide-in-right overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-white/[0.08] bg-slate-900/80 backdrop-blur-md flex items-center justify-between gap-3 sticky top-0 z-20">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  <Bot className="w-4 h-4" />
                </span>
                <span className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                  Dossiê de Análise da Notícia
                </span>
              </div>

              <button
                onClick={() => setAnalysisNewsItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant={getCategoryColor(analysisNewsItem.category) as any}
                    size="xs"
                  >
                    {analysisNewsItem.category}
                  </Badge>
                  <span className="text-xs font-mono text-slate-400">
                    {analysisNewsItem.countryFlag} {analysisNewsItem.country} • {analysisNewsItem.date}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white leading-snug mb-2">
                  {analysisNewsItem.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {analysisNewsItem.summary}
                </p>
              </div>

              {/* Source & Audit Link */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.08] flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Fonte: {analysisNewsItem.source}</span>
                {analysisNewsItem.originalUrl && (
                  <a
                    href={analysisNewsItem.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <span>Artigo Original</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* AI Opportunity Verdict */}
              <div className="p-4 rounded-xl bg-violet-950/30 border border-violet-500/30 space-y-2">
                <span className="text-xs font-mono font-bold text-violet-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  {analysisNewsItem.aiQuestion}
                </span>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  {analysisNewsItem.aiAnalysisSummary}
                </p>
              </div>

              {/* Deep AI Analysis Button & Results */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase font-bold text-cyan-300 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    Inteligência Estratégica Avançada
                  </span>

                  <Button
                    variant="secondary"
                    size="xs"
                    disabled={isAnalyzing}
                    onClick={() => handleRunDeepAnalysis(analysisNewsItem)}
                    iconLeft={<RefreshCw className={`w-3 h-3 ${isAnalyzing ? 'animate-spin' : ''}`} />}
                  >
                    {isAnalyzing ? 'Analisando...' : deepAnalysis ? 'Reanalisar' : 'Aprofundar com IA'}
                  </Button>
                </div>

                {deepAnalysis && (
                  <div className="space-y-3 pt-2 text-xs font-sans animate-fade-in">
                    <p className="text-slate-200 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-white/[0.06]">
                      {deepAnalysis.executiveVerdict || deepAnalysis.summary || JSON.stringify(deepAnalysis)}
                    </p>

                    {deepAnalysis.threeWeekRoadmap && (
                      <div className="space-y-1.5 pt-2">
                        <span className="text-[11px] font-mono uppercase text-slate-400 block font-bold">
                          Roadmap de MVP em 3 Semanas:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {deepAnalysis.threeWeekRoadmap.map((w: any, idx: number) => (
                            <div key={idx} className="p-2.5 rounded-lg bg-slate-950/80 border border-white/[0.06] text-2xs">
                              <span className="text-cyan-400 font-mono font-bold block mb-0.5">{w.week}: {w.focus}</span>
                              <span className="text-slate-400">{w.details}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Opportunities Hypotheses Detailed */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Hipóteses de Oportunidades Identificadas:
                </h4>

                {analysisNewsItem.possibleOpportunities.map((h, i) => (
                  <div
                    key={h.id}
                    className="p-4 rounded-xl bg-slate-900/80 border border-white/[0.08] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
                        Hipótese {i + 1}: {h.type}
                      </span>
                      <span className="text-2xs font-mono text-emerald-400">
                        Score: {h.confidenceScore}%
                      </span>
                    </div>

                    <h5 className="text-xs font-semibold text-slate-100">
                      {h.title}
                    </h5>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {h.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-2xs font-mono text-slate-400 pt-2 border-t border-white/[0.04]">
                      <div>Público: {h.targetAudience}</div>
                      <div>Tempo de MVP: {h.estimatedEffort}</div>
                      <div className="col-span-2 text-emerald-300">
                        Monetização: {h.monetizationModel}
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button
                        variant="emerald"
                        size="xs"
                        iconLeft={<PlusCircle className="w-3 h-3" />}
                        onClick={() => {
                          handleCreateProject(analysisNewsItem, h);
                          setAnalysisNewsItem(null);
                        }}
                      >
                        Promover a Projeto no My Lab
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
