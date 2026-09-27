export type NavSection =
  | 'dashboard'
  | 'radar'
  | 'market-news'
  | 'opportunities'
  | 'saas-radar'
  | 'market-trends'
  | 'global-opportunities'
  | 'remote-work'
  | 'research'
  | 'ai-analyst'
  | 'my-lab'
  | 'alerts'
  | 'saved'
  | 'execution-plans'
  | 'admin'
  | 'settings';

export type OpportunityCategory =
  | 'Micro-SaaS'
  | 'B2B Software'
  | 'AI Agent / Tool'
  | 'Market Arbitrage'
  | 'Remote / Freelance'
  | 'API / Developer Tool'
  | 'Digital Product'
  | 'Customer Friction';

export type Continent =
  | 'América do Norte'
  | 'Europa'
  | 'América Latina'
  | 'Ásia-Pacífico'
  | 'Global';

export type Currency = 'USD' | 'EUR' | 'BRL' | 'GBP' | 'JPY';

export type BusinessModelType =
  | 'SaaS B2B'
  | 'Micro-SaaS'
  | 'Marketplace'
  | 'API / Dev Tool'
  | 'Extensão / Add-on'
  | 'Serviço Produtizado'
  | 'B2C Digital';

export type EffortLevel = 'Baixo (1-2 sem)' | 'Médio (1 mês)' | 'Alto (2-3 meses)';
export type MarketPotential = '$5k - $20k MRR' | '$20k - $80k MRR' | '$80k+ MRR';
export type ConfidenceLevel = 'Muito Alta' | 'Alta' | 'Média';
export type InvestmentLevel = 'Bootstrapped (Baixo)' | 'Médio ($2k-$10k)' | 'Elevado';

export interface SignalSource {
  platform: 'Reddit' | 'G2 Crowd' | 'GitHub' | 'Product Hunt' | 'Google Trends' | 'Upwork' | 'X / Twitter' | 'G2' | 'X';
  snippet: string;
  url?: string;
  timestamp: string;
  volumeOrScore: string;
}

export interface OpportunityMarketData {
  originCountry: string; // Ex: "Alemanha", "Estados Unidos"
  originFlag: string; // Ex: "🇩🇪", "🇺🇸"
  originCode: string; // Ex: "DE", "US"
  targetMarkets: string[]; // Ex: ["Brasil", "América Latina", "Espanha"]
  continent: Continent;
  currency: Currency;
}

export interface Opportunity {
  id: string;
  title: string;
  tagline: string;
  category: OpportunityCategory;
  score: number; // 0 to 100
  confidence: ConfidenceLevel;
  potentialMrr: MarketPotential;
  effort: EffortLevel;
  difficulty: 'Baixa' | 'Média' | 'Alta';
  timeToMvpDays: number;
  
  // Market & Geo Data
  market: OpportunityMarketData;
  targetMarkets: string[]; // backwards compatible array

  // The 6 Fundamental Radar Intelligence Dimensions
  whatDetected: string;        // O QUE FOI DETECTADO
  whyImportant: string;        // POR QUE É IMPORTANTE
  problemExists: string;       // QUAL PROBLEMA EXISTE
  primaryProblem: string;      // Backwards compatible
  proposedSolution: string;    // Backwards compatible
  opportunityExplored: string; // QUAL OPORTUNIDADE PODE SER EXPLORADA
  howMonetized: string;        // COMO PODERIA SER MONETIZADA
  monetizationModel: string;   // Backwards compatible

  businessModel: BusinessModelType;
  productType: 'SaaS' | 'Extensão' | 'API' | 'Produto Digital' | 'Plataforma';
  targetAudience: 'B2B' | 'B2C' | 'B2B2C';
  isAiRelated: boolean;
  isRemoteWork: boolean;
  investmentRequired: InvestmentLevel;

  unservedNiche: string;
  sources: SignalSource[];
  competitionLevel: 'Baixa' | 'Média' | 'Alta';
  existingCompetitors: string[];
  differentiationAngle: string;
  tags: string[];
  techStack: string[];

  // Growth & Freshness Metrics
  freshness: 'Detectado há 2h' | 'Detectado há 6h' | 'Detectado há 1d' | 'Detectado há 3d' | 'Em Alta' | 'Novo';
  trendingGrowth: string; // e.g. "+184% 30d"
  sparkline: number[];    // e.g. [12, 18, 26, 35, 48, 62, 85]
  dateDetected: string;
  isSaved?: boolean;
  status: 'Novo' | 'Em Análise' | 'Validando' | 'Arquivado';

  aiSwot?: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  validationRoadmap?: {
    step: number;
    title: string;
    description: string;
    estimatedHours: number;
  }[];

  // Detailed Financials, Speed & Investment Specs
  financials?: {
    estimatedMonthlyProfit: string; // Ex: "R$ 15.000 - R$ 38.000/mês" ($3,000 - $7,500/mo)
    profitMargin: string;           // Ex: "82% - 88%"
    averageTicket: string;          // Ex: "R$ 149/mês" ($29/mo)
    annualProjection: string;       // Ex: "R$ 180.000 - R$ 450.000 ARR"
    paybackDays: number;            // Ex: 14 a 30 dias
  };
  executionSpeed?: {
    mvpDays: number;                // Ex: 7 dias
    firstSaleDays: number;          // Ex: 14 dias
    weeklyDedicationHours: string;  // Ex: "10-15h / semana"
    speedRating: 'Ultra Rápido (1 sem)' | 'Rápido (2 sem)' | 'Moderado (3-4 sem)';
  };
  investment?: {
    initialCapitalEstimated: string; // Ex: "R$ 200 - R$ 450" ($40 - $90 USD)
    capitalBreakdown: { item: string; cost: string }[];
    budgetTier: 'Bootstrap ($0 a $100)' | 'Baixo ($100 a $500)' | 'Médio';
  };
  executionPlaybook?: {
    phase: number;
    name: string;
    timeEstimate: string;
    description: string;
    actionItems: {
      id: string;
      title: string;
      howToExecute: string;
      deliverable: string;
      recommendedDay?: string;
      isDailyRoutine?: boolean;
    }[];
  }[];
}

export interface ProjectTaskItem {
  id: string;
  phaseId: number;
  phaseName: string;
  title: string;
  howToExecute: string;
  deliverable: string;
  recommendedDay?: string;
  completed: boolean;
  completedAt?: string;
}

export interface PersonalProject {
  id: string;
  opportunityId: string;
  title: string;
  tagline: string;
  category: OpportunityCategory;
  score: number;
  financialMetrics: {
    estimatedMonthlyProfit: string;
    profitMargin: string;
    averageTicket: string;
    annualProjection: string;
  };
  speedMetrics: {
    mvpDays: number;
    firstSaleDays: number;
    weeklyDedicationHours: string;
    speedRating: string;
  };
  investmentMetrics: {
    initialCapitalEstimated: string;
    capitalBreakdown: { item: string; cost: string }[];
  };
  tasks: ProjectTaskItem[];
  progressPercent: number;
  startedAt: string;
  targetCompletionDate: string;
  lastCheckinAt: string;
  dailyStreak: number;
  checkedInToday: boolean;
  status: 'em_andamento' | 'quase_pronto' | 'estagnado' | 'lancado';
  userNotes?: string;
}

export interface AiCoachAlert {
  id: string;
  projectId: string;
  projectTitle: string;
  type: 'stagnation_warning' | 'focus_conflict' | 'streak_encouragement' | 'launch_ready';
  severity: 'urgent' | 'warning' | 'info' | 'kudos';
  headline: string;
  message: string;
  recommendedAction: string;
  actionButtonText: string;
  progressPercent: number;
}

export interface LiveSignal {
  id: string;
  source: 'Reddit' | 'G2' | 'GitHub' | 'HackerNews' | 'X' | 'GoogleTrends' | 'Upwork';
  title: string;
  excerpt: string;
  category: string;
  urgency: 'Alta' | 'Média' | 'Normal';
  scoreImpact: number;
  detectedAt: string;
  geoScope: string;
  countryCode?: string;
  countryFlag?: string;
  sentiment: 'Frustração' | 'Demanda Alta' | 'Crescimento Rápido' | 'Gap de Produto';
}

export interface CountryMarketSignal {
  code: string;
  name: string;
  flag: string;
  continent: Continent;
  currency: Currency;
  activeSignals: number;
  momentum: string;
  growthRate: number; // percentage
  topCategory: string;
  arbitrageIndex: 'Alto' | 'Muito Alto' | 'Moderado';
  avgMrrPotential: string;
  keyTrend: string;
}

export interface OpportunityPulseData {
  newOpportunitiesDetected: number;
  growingOpportunities: number;
  newSaasIdentified: number;
  emergingTrends: number;
  newProductsDetected: number;
  activeMarketRegions: number;
  internationalOpportunities: number;
  remoteWorkOpportunities: number;
}

export interface TrendTopic {
  id: string;
  name: string;
  growthPercentage: number;
  searchVolume: string;
  category: string;
  maturity: 'Emergente' | 'Acelerando' | 'Pico Inicial' | 'Consolidando';
  relevanceToSaaS: 'Crítica' | 'Alta' | 'Média';
  description: string;
  signalOrigin: string;
}

export interface GeoArbitrageOpportunity {
  id: string;
  originalModel: string;
  originalMarket: string;
  originalAnnualRevenue: string;
  targetMarket: string;
  adaptationBarrier: 'Baixa' | 'Média' | 'Alta';
  reasonForGap: string;
  estimatedTAMInTarget: string;
  keyLocalizationNeeds: string[];
}

export interface RemoteWorkInsight {
  id: string;
  roleOrSkill: string;
  averageRateHourUsd: string;
  demandGrowth: string;
  topHiringGeos: string[];
  arbitrageMultiplier: string;
  requiredStack: string[];
  openContractsVolume: number;
}

export interface UserAlert {
  id: string;
  name: string;
  queryOrKeywords: string;
  minScore: number;
  channels: ('Email' | 'Webhook' | 'Telegram' | 'In-App')[];
  frequency: 'Tempo Real' | 'Digest Diário' | 'Semanal';
  isActive: boolean;
  triggersCount: number;
  lastTriggered?: string;
}

export interface HypothesisCard {
  id: string;
  title: string;
  opportunityRefId: string;
  status: 'Backlog' | 'Pesquisando' | 'Landing Page' | 'Entrevistas' | 'Validado' | 'Descartado';
  hypothesisText: string;
  successMetric: string;
  confidenceScore: number;
  notes: string;
  createdAt: string;
}

export type SourceType = 'official_api' | 'rss_feed' | 'public_endpoint';
export type SourceStatus = 'online' | 'syncing' | 'rate_limited' | 'error' | 'idle';

export interface IngestionSource {
  id: string;
  name: string;
  type: SourceType;
  status: SourceStatus;
  endpointUrl: string;
  documentationUrl: string;
  frequencyMinutes: number;
  lastSync: string | null;
  recordsCollected: number;
  errorCount: number;
  lastError: string | null;
  rateLimit: {
    limit: number;
    remaining: number;
    resetTime?: string;
  };
  complianceNotes: string;
  isEnabled: boolean;
}

export interface IngestionStats {
  totalCollected: number;
  totalDeduplicated: number;
  totalQualifiedOpportunities: number;
  activeSourcesCount: number;
  lastPipelineRun: string;
}

export interface NormalizedSignal {
  id: string;
  title: string;
  description: string;
  source: string;
  sourceType: SourceType;
  sourceId: string;
  url: string;
  publishedAt: string;
  category: string;
  author?: string;
  metrics: {
    scoreOrUpvotes?: number;
    commentsCount?: number;
    sentimentScore?: number;
  };
  isOpportunityEligible?: boolean;
}

// ====================================================================
// MARKET NEWS & DISCOVERY DOMAIN TYPES
// ====================================================================

export type NewsCategory =
  | 'IA'
  | 'tecnologia'
  | 'SaaS'
  | 'startups'
  | 'economia digital'
  | 'e-commerce'
  | 'software'
  | 'automação'
  | 'fintech'
  | 'produtividade'
  | 'trabalho remoto'
  | 'APIs'
  | 'desenvolvimento'
  | 'novos produtos'
  | 'mudanças de plataformas';

export interface OpportunityHypothesis {
  id: string;
  type: 'Criar SaaS' | 'Ferramenta Vertical' | 'Integração de Nicho' | 'Serviço Especializado' | 'Arbitragem Geográfica';
  title: string;
  description: string;
  confidenceScore: number; // 0 a 100
  targetAudience: string;
  estimatedEffort: string;
  monetizationModel: string;
  status: 'Hipótese' | 'Em Exploração' | 'Promovido a Projeto';
}

export interface MarketNewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  sourceType?: 'official_api' | 'rss_feed' | 'curated_intel';
  date: string;
  timestamp: string; // ISO
  country: string;
  countryFlag: string;
  countryCode: string;
  category: NewsCategory;
  originalUrl: string;
  readTimeMinutes?: number;
  impactScore: number; // 0-100 (potencial de gerar oportunidade)
  isTrending?: boolean;
  isSaved?: boolean;
  
  // AI Opportunity Gate
  aiQuestion: string; // "Existe uma oportunidade de negócio escondida aqui?"
  aiAnalysisSummary: string;
  possibleOpportunities: OpportunityHypothesis[]; // Todas identificadas expressamente como hipótese
  relatedTrendId?: string;
  tags: string[];
}

export interface EmergingTrendItem {
  id: string;
  trend: string;               // TREND (Assunto ou comportamento)
  growth: string;              // GROWTH (Taxa de aceleração)
  growthPercentage: number;    // % numérico
  market: string;              // MARKET (Setor ou nicho afetado)
  problem: string;             // PROBLEM (Gargalo ou dor recorrente)
  opportunity: string;         // OPPORTUNITY (Hipótese de solução)
  category: NewsCategory;
  maturity: 'Emergente' | 'Acelerando' | 'Pico Inicial' | 'Consolidando';
  relatedNewsCount: number;
  sparkline: number[];
}

export interface DailyMarketBrief {
  date: string;
  todaySignalsCount: number;
  emergingTrendsCount: number;
  saasOpportunitiesCount: number;
  globalOpportunitiesCount: number;
  newsWorthWatchingCount: number;
  aiExecutiveInsight: {
    highlightTitle: string;
    overview: string;
    keyTakeaways: string[];
    recommendedNextStep: string;
  };
  topNewsIds: string[];
  spotlightTrendId: string;
}

export type UserInterest =
  | 'SaaS'
  | 'IA'
  | 'programação'
  | 'e-commerce'
  | 'marketing'
  | 'fintech'
  | 'automação'
  | 'trabalho remoto'
  | 'APIs';
