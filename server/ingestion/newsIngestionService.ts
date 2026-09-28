import { NormalizedSignal } from './types';
import {
  MarketNewsItem,
  OpportunityHypothesis,
  NewsCategory,
  EmergingTrendItem,
  DailyMarketBrief,
} from '../../src/types';

// ====================================================================
// CATEGORY MAPPING ENGINE
// ====================================================================

const CATEGORY_KEYWORDS: { category: NewsCategory; keywords: string[] }[] = [
  { category: 'IA', keywords: ['ai', 'artificial intelligence', 'llm', 'gpt', 'model', 'neural', 'machine learning', 'deep learning', 'openai', 'gemini', 'claude', 'transformer', 'diffusion'] },
  { category: 'SaaS', keywords: ['saas', 'subscription', 'mrr', 'arr', 'churn', 'b2b software', 'recurring revenue'] },
  { category: 'startups', keywords: ['startup', 'seed', 'yc', 'y combinator', 'funding', 'series a', 'venture', 'founder', 'incubator'] },
  { category: 'e-commerce', keywords: ['commerce', 'shop', 'store', 'retail', 'shopify', 'woocommerce', 'cart', 'checkout', 'marketplace'] },
  { category: 'fintech', keywords: ['fintech', 'payment', 'banking', 'stripe', 'crypto', 'defi', 'wallet', 'transaction', 'financial'] },
  { category: 'trabalho remoto', keywords: ['remote', 'work from home', 'distributed', 'hybrid work', 'telecommut', 'digital nomad'] },
  { category: 'APIs', keywords: ['api', 'sdk', 'endpoint', 'rest', 'graphql', 'webhook', 'oauth'] },
  { category: 'desenvolvimento', keywords: ['developer', 'programming', 'code', 'github', 'open source', 'framework', 'library', 'rust', 'typescript', 'python', 'javascript', 'react', 'vue', 'svelte'] },
  { category: 'novos produtos', keywords: ['product hunt', 'product launch', 'new release', 'announce', 'beta', 'launch'] },
  { category: 'mudanças de plataformas', keywords: ['platform', 'breaking change', 'deprecat', 'migration', 'policy change', 'price increase', 'sunset'] },
  { category: 'automação', keywords: ['automat', 'workflow', 'bot', 'n8n', 'zapier', 'make.com', 'integration', 'pipeline', 'ci/cd'] },
  { category: 'software', keywords: ['software', 'app', 'tool', 'solution', 'platform'] },
  { category: 'produtividade', keywords: ['productivity', 'efficiency', 'time tracking', 'project management', 'notion', 'obsidian'] },
  { category: 'economia digital', keywords: ['digital economy', 'creator economy', 'monetiz', 'market', 'growth', 'trend'] },
];

function classifyCategory(text: string): NewsCategory {
  const lower = text.toLowerCase();
  let bestMatch: NewsCategory = 'tecnologia';
  let bestScore = 0;

  for (const entry of CATEGORY_KEYWORDS) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (lower.includes(kw)) {
        score += kw.length; // Longer keyword matches = higher confidence
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry.category;
    }
  }

  return bestMatch;
}

// ====================================================================
// IMPACT SCORE CALCULATOR
// ====================================================================

function calculateImpactScore(signal: NormalizedSignal): number {
  const upvotes = signal.metrics.scoreOrUpvotes || 0;
  const comments = signal.metrics.commentsCount || 0;
  const sentiment = signal.metrics.sentimentScore || 0;

  const raw = Math.floor(
    (upvotes / 5) +
    (comments / 2) +
    (sentiment * 20) +
    50
  );

  return Math.min(99, Math.max(40, raw));
}

// ====================================================================
// TAG EXTRACTION
// ====================================================================

function extractTags(title: string, description: string, category: NewsCategory): string[] {
  const text = `${title} ${description}`.toLowerCase();
  const tags = new Set<string>();

  // Always add the category
  tags.add(category);

  // Extract known tech keywords
  const techKeywords = [
    'IA', 'SaaS', 'APIs', 'React', 'Python', 'TypeScript', 'Rust', 'Go',
    'open source', 'startup', 'fintech', 'blockchain', 'Web3', 'cloud',
    'automação', 'e-commerce', 'mobile', 'DevOps', 'segurança', 'dados',
    'machine learning', 'LLM', 'GPT', 'infraestrutura', 'serverless',
  ];

  for (const kw of techKeywords) {
    if (text.includes(kw.toLowerCase()) && tags.size < 6) {
      tags.add(kw);
    }
  }

  // Ensure at least 3 tags
  if (tags.size < 3) tags.add('tecnologia');
  if (tags.size < 3) tags.add('software');

  return Array.from(tags).slice(0, 5);
}

// ====================================================================
// AI ANALYSIS SUMMARY GENERATOR (heuristic, no API needed)
// ====================================================================

const ANALYSIS_TEMPLATES: Record<string, string> = {
  friccao_cliente: 'Insatisfação crescente detectada neste segmento indica abertura para alternativas mais eficientes e com precificação transparente. Fundadores atentos podem capturar usuários migrando.',
  crescimento_produto: 'Crescimento acelerado desta categoria sugere demanda não atendida e espaço para ferramentas verticais especializadas. O timing é propício para um MVP enxuto.',
  tecnologia_emergente: 'Nova tecnologia em fase de adoção cria janela de oportunidade para soluções e serviços que simplifiquem sua integração e reduzam a curva de aprendizado.',
  lancamento: 'Lançamento recente abre possibilidade de extensões, integrações e serviços complementares neste ecossistema. Primeiros a construir capturam market share.',
  demanda_contratacao: 'Alta demanda por estas competências indica mercado aquecido para ferramentas de produtividade e automação que multiplicam a capacidade individual.',
};

function generateAnalysisSummary(signal: NormalizedSignal): string {
  return ANALYSIS_TEMPLATES[signal.signalType] ||
    'Sinal de mercado relevante identificado. Análise de oportunidades em andamento para mapear possibilidades de negócio.';
}

// ====================================================================
// OPPORTUNITY HYPOTHESIS GENERATOR
// ====================================================================

const HYPOTHESIS_TYPES: OpportunityHypothesis['type'][] = [
  'Criar SaaS',
  'Ferramenta Vertical',
  'Integração de Nicho',
  'Serviço Especializado',
  'Arbitragem Geográfica',
];

function generateHypotheses(signal: NormalizedSignal, category: NewsCategory): OpportunityHypothesis[] {
  const baseId = signal.id.replace(/[^a-z0-9]/gi, '').slice(0, 8);
  const title = signal.title;
  const hypotheses: OpportunityHypothesis[] = [];

  // First hypothesis: always a SaaS
  hypotheses.push({
    id: `hyp-live-${baseId}-a`,
    type: 'Criar SaaS',
    title: `Hipótese: SaaS vertical inspirado em "${title.slice(0, 60)}..."`,
    description: `Construir uma ferramenta SaaS especializada que resolva a dor ou capture a demanda indicada por este sinal de mercado. Foco em MVP enxuto com onboarding em menos de 5 minutos.`,
    confidenceScore: Math.min(92, Math.max(65, calculateImpactScore(signal) - 5)),
    targetAudience: getCategoryAudience(category),
    estimatedEffort: '2-3 semanas',
    monetizationModel: getCategoryPricing(category),
    status: 'Hipótese',
  });

  // Second hypothesis: varies by signal type
  const secondType = signal.signalType === 'friccao_cliente'
    ? 'Ferramenta Vertical'
    : signal.signalType === 'tecnologia_emergente'
    ? 'Integração de Nicho'
    : signal.signalType === 'demanda_contratacao'
    ? 'Serviço Especializado'
    : 'Arbitragem Geográfica';

  hypotheses.push({
    id: `hyp-live-${baseId}-b`,
    type: secondType,
    title: `Hipótese: ${secondType} baseado em "${title.slice(0, 50)}..."`,
    description: getSecondHypothesisDescription(secondType, signal),
    confidenceScore: Math.min(88, Math.max(60, calculateImpactScore(signal) - 12)),
    targetAudience: getCategoryAudience(category),
    estimatedEffort: '1-2 semanas',
    monetizationModel: getSecondPricing(secondType),
    status: 'Hipótese',
  });

  return hypotheses;
}

function getCategoryAudience(category: NewsCategory): string {
  const map: Partial<Record<NewsCategory, string>> = {
    'IA': 'Desenvolvedores e empresas que integram IA em produtos',
    'SaaS': 'Fundadores de Micro-SaaS e B2B',
    'startups': 'Empreendedores e investidores early-stage',
    'e-commerce': 'Lojistas digitais e marketplaces',
    'fintech': 'Fintechs, bancos digitais e prestadores financeiros',
    'trabalho remoto': 'Profissionais remotos e empresas distribuídas',
    'APIs': 'Desenvolvedores e times de engenharia',
    'desenvolvimento': 'Engenheiros de software e DevOps',
    'novos produtos': 'Early adopters e product managers',
    'automação': 'Times de operações e growth hacking',
  };
  return map[category] || 'Profissionais de tecnologia e negócios digitais';
}

function getCategoryPricing(category: NewsCategory): string {
  const map: Partial<Record<NewsCategory, string>> = {
    'IA': 'US$ 49 - US$ 199/mês',
    'SaaS': 'US$ 29 - US$ 149/mês',
    'fintech': 'R$ 97 - R$ 490/mês',
    'e-commerce': 'R$ 149 - R$ 590/mês',
    'trabalho remoto': 'US$ 19 - US$ 79/mês',
    'automação': 'US$ 39 - US$ 129/mês',
  };
  return map[category] || 'R$ 79 - R$ 290/mês';
}

function getSecondHypothesisDescription(type: OpportunityHypothesis['type'], signal: NormalizedSignal): string {
  switch (type) {
    case 'Ferramenta Vertical':
      return `Ferramenta especializada que endereça diretamente a fricção detectada, oferecendo uma experiência superior e preço competitivo frente às soluções genéricas existentes.`;
    case 'Integração de Nicho':
      return `Plugin ou conector que facilita a adoção desta nova tecnologia em ferramentas já utilizadas pelo público-alvo, reduzindo a barreira de entrada.`;
    case 'Serviço Especializado':
      return `Serviço produtizado de consultoria ou implementação para empresas que precisam capitalizar rapidamente esta tendência.`;
    case 'Arbitragem Geográfica':
      return `Adaptar modelo já validado nos EUA/Europa para mercados latino-americanos onde a demanda está crescendo mas a oferta local é escassa.`;
    default:
      return `Oportunidade de negócio identificada a partir deste sinal de mercado com potencial de validação rápida.`;
  }
}

function getSecondPricing(type: OpportunityHypothesis['type']): string {
  switch (type) {
    case 'Ferramenta Vertical': return 'R$ 49 - R$ 197/mês';
    case 'Integração de Nicho': return 'US$ 29 - US$ 99/mês';
    case 'Serviço Especializado': return 'R$ 2.500 - R$ 8.000 por projeto';
    case 'Arbitragem Geográfica': return 'R$ 97 - R$ 390/mês';
    default: return 'R$ 79 - R$ 290/mês';
  }
}

// ====================================================================
// DATE FORMATTING (Portuguese)
// ====================================================================

const MONTH_NAMES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function formatDatePt(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return new Date().toLocaleDateString('pt-BR');
  }
}

function formatDateFullPt(date: Date): string {
  return `${date.getDate()} de ${MONTH_NAMES_PT[date.getMonth()]} de ${date.getFullYear()}`;
}

// ====================================================================
// MAIN TRANSFORM: NormalizedSignal → MarketNewsItem
// ====================================================================

function transformSignalToNews(signal: NormalizedSignal): MarketNewsItem {
  const combinedText = `${signal.title} ${signal.description} ${signal.category}`;
  const category = classifyCategory(combinedText);
  const impactScore = calculateImpactScore(signal);
  const isTrending = impactScore >= 80 || (signal.metrics.scoreOrUpvotes || 0) >= 200;

  const sourceTypeMap: Record<string, 'official_api' | 'rss_feed' | 'curated_intel'> = {
    'official_api': 'official_api',
    'rss_feed': 'rss_feed',
    'public_endpoint': 'curated_intel',
  };

  return {
    id: `news-live-${signal.id}`,
    title: signal.title,
    summary: signal.description.slice(0, 400) || signal.title,
    source: signal.source,
    sourceType: sourceTypeMap[signal.sourceType] || 'rss_feed',
    date: formatDatePt(signal.publishedAt),
    timestamp: signal.publishedAt,
    country: signal.country || 'Global',
    countryFlag: signal.countryFlag || '🌐',
    countryCode: signal.countryCode || 'GL',
    category,
    originalUrl: signal.url,
    readTimeMinutes: Math.max(2, Math.min(8, Math.ceil((signal.description?.length || 100) / 500))),
    impactScore,
    isTrending,
    isSaved: false,
    tags: extractTags(signal.title, signal.description, category),
    aiQuestion: 'Existe uma oportunidade de negócio escondida aqui?',
    aiAnalysisSummary: generateAnalysisSummary(signal),
    possibleOpportunities: generateHypotheses(signal, category),
  };
}

// ====================================================================
// BATCH TRANSFORM WITH DEDUPLICATION
// ====================================================================

function normalizeForDedup(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60);
}

function transformSignalsToNews(signals: NormalizedSignal[]): MarketNewsItem[] {
  const seen = new Set<string>();
  const results: MarketNewsItem[] = [];

  for (const signal of signals) {
    const fingerprint = normalizeForDedup(signal.title);
    if (seen.has(fingerprint)) continue;
    seen.add(fingerprint);

    try {
      results.push(transformSignalToNews(signal));
    } catch (err) {
      console.warn(`[NewsIngestion] Falha ao transformar sinal "${signal.title}":`, (err as Error).message);
    }
  }

  // Sort by impact score descending
  results.sort((a, b) => b.impactScore - a.impactScore);

  return results;
}

// ====================================================================
// DYNAMIC DAILY BRIEF GENERATOR
// ====================================================================

function generateDailyBrief(news: MarketNewsItem[]): DailyMarketBrief {
  const now = new Date();
  const sortedByImpact = [...news].sort((a, b) => b.impactScore - a.impactScore);
  const top3 = sortedByImpact.slice(0, 3);

  const saasCount = news.filter(n =>
    n.tags.some(t => t.toLowerCase().includes('saas')) || n.category === 'SaaS'
  ).length;

  const globalCount = news.filter(n => n.countryCode !== 'BR').length;

  const keyTakeaways = top3.map(n =>
    `${n.title.slice(0, 80)} — impacto ${n.impactScore}/100 no segmento de ${n.category}.`
  );

  const topTitle = top3[0]?.title || 'Monitoramento ativo';
  const topCategory = top3[0]?.category || 'tecnologia';

  return {
    date: formatDateFullPt(now),
    todaySignalsCount: news.length,
    emergingTrendsCount: news.filter(n => n.impactScore > 85).length,
    saasOpportunitiesCount: saasCount,
    globalOpportunitiesCount: globalCount,
    newsWorthWatchingCount: news.filter(n => n.impactScore > 75).length,
    aiExecutiveInsight: {
      highlightTitle: `Destaque: ${topCategory.charAt(0).toUpperCase() + topCategory.slice(1)} — ${topTitle.slice(0, 60)}`,
      overview: `Análise de ${news.length} sinais de mercado coletados em tempo real de Hacker News, GitHub, Reddit e feeds RSS. ${news.filter(n => n.isTrending).length} sinais classificados como trending com alto potencial de oportunidade.`,
      keyTakeaways: keyTakeaways.length > 0 ? keyTakeaways : [
        'Nenhum sinal de alto impacto detectado neste ciclo. Continue monitorando.',
      ],
      recommendedNextStep: top3[0]
        ? `Investigue a oportunidade em "${top3[0].title.slice(0, 50)}" e valide com 5 potenciais clientes esta semana.`
        : 'Sincronize as fontes de dados para obter sinais frescos do mercado.',
    },
    topNewsIds: top3.map(n => n.id),
    spotlightTrendId: '',
  };
}

// ====================================================================
// DYNAMIC TRENDS GENERATOR
// ====================================================================

function generateTrendsFromNews(news: MarketNewsItem[]): EmergingTrendItem[] {
  // Group by category
  const groups = new Map<NewsCategory, MarketNewsItem[]>();

  for (const item of news) {
    const existing = groups.get(item.category) || [];
    existing.push(item);
    groups.set(item.category, existing);
  }

  const trends: EmergingTrendItem[] = [];

  for (const [category, items] of groups.entries()) {
    if (items.length < 2) continue; // Need at least 2 items for a trend

    const avgImpact = Math.round(items.reduce((sum, i) => sum + i.impactScore, 0) / items.length);
    const growthPct = Math.round(avgImpact * 1.8 + items.length * 15);

    const maturityMap: Record<number, EmergingTrendItem['maturity']> = {
      2: 'Emergente',
      3: 'Acelerando',
    };
    const maturity = maturityMap[items.length] || (items.length >= 4 ? 'Pico Inicial' : 'Emergente');

    const trendDescriptions: Partial<Record<NewsCategory, { trend: string; market: string; problem: string; opportunity: string }>> = {
      'IA': {
        trend: 'Inteligência Artificial e Modelos Generativos',
        market: 'Startups de IA, SaaS B2B e Ferramentas de Produtividade',
        problem: 'Complexidade de integração e custo de inferência em produção.',
        opportunity: 'Ferramentas que simplificam integração de IA ou reduzem custos de operação.',
      },
      'desenvolvimento': {
        trend: 'Ferramentas e Frameworks de Desenvolvimento',
        market: 'Desenvolvedores Full-stack, DevOps e Indie Hackers',
        problem: 'Sobrecarga de ferramentas e fragmentação do ecossistema.',
        opportunity: 'Plataformas unificadas e kits de componentes prontos para produção.',
      },
      'SaaS': {
        trend: 'Evolução do Modelo SaaS e Micro-SaaS',
        market: 'Fundadores de SaaS, PMEs e times de produto',
        problem: 'Custos crescentes e churn elevado em ferramentas genéricas.',
        opportunity: 'SaaS vertical especializado com onboarding simplificado.',
      },
      'startups': {
        trend: 'Ecossistema de Startups e Investimento',
        market: 'Fundadores, aceleradoras e investidores-anjo',
        problem: 'Dificuldade de validação rápida e acesso a capital semente.',
        opportunity: 'Ferramentas de validação de hipóteses e pitch deck automation.',
      },
      'fintech': {
        trend: 'Inovação em Serviços Financeiros Digitais',
        market: 'Fintechs, bancos digitais e consumidores',
        problem: 'Taxas elevadas e experiência de usuário fragmentada.',
        opportunity: 'Soluções de pagamento e gestão financeira com UX superior.',
      },
      'automação': {
        trend: 'Automação de Processos e Workflows',
        market: 'Times de operações, marketing e vendas',
        problem: 'Processos manuais repetitivos consumindo horas por semana.',
        opportunity: 'Ferramentas de automação no-code com IA integrada.',
      },
    };

    const desc = trendDescriptions[category] || {
      trend: `Crescimento em ${category.charAt(0).toUpperCase() + category.slice(1)}`,
      market: `Profissionais e empresas no segmento de ${category}`,
      problem: `Demanda crescente por soluções especializadas em ${category}.`,
      opportunity: `Ferramentas verticais e serviços focados em ${category}.`,
    };

    trends.push({
      id: `trend-live-${category.replace(/\s+/g, '-').toLowerCase()}`,
      trend: desc.trend,
      growth: `+${growthPct}% em sinais detectados nas últimas 24h`,
      growthPercentage: growthPct,
      market: desc.market,
      problem: desc.problem,
      opportunity: desc.opportunity,
      category,
      maturity,
      relatedNewsCount: items.length,
      sparkline: [
        Math.round(growthPct * 0.15),
        Math.round(growthPct * 0.28),
        Math.round(growthPct * 0.42),
        Math.round(growthPct * 0.58),
        Math.round(growthPct * 0.72),
        avgImpact,
        Math.round(avgImpact * 1.15),
      ],
    });
  }

  // Sort by relatedNewsCount descending
  trends.sort((a, b) => b.relatedNewsCount - a.relatedNewsCount);

  return trends;
}

// ====================================================================
// EXPORTED SERVICE SINGLETON
// ====================================================================

export const newsIngestionService = {
  transformSignalsToNews,
  generateDailyBrief,
  generateTrendsFromNews,
};
