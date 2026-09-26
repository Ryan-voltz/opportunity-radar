import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { securityHeaders, createRateLimiter, sanitizeString } from './middleware/security';
import { aiAnalystService } from './services/aiAnalystService';
import { globalCache } from './services/cacheService';
import { pipelineManager } from './ingestion/pipelineManager';

// Import domain mock data for seed
import {
  MOCK_OPPORTUNITIES,
  MOCK_PULSE_DATA,
  MOCK_COUNTRY_SIGNALS,
  MOCK_LIVE_SIGNALS,
  MOCK_ALERTS,
  MOCK_HYPOTHESES,
} from '../src/data/mockData';
import {
  MOCK_MARKET_NEWS,
  MOCK_EMERGING_TRENDS,
  MOCK_DAILY_BRIEF,
} from '../src/data/newsData';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';

// 1. Core Security Middlewares
app.use(securityHeaders);
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin) return callback(null, true);
      if (
        origin === ALLOWED_ORIGIN ||
        origin === 'http://localhost:5173' ||
        origin === 'http://127.0.0.1:5173' ||
        origin.endsWith('.vercel.app') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
  })
);
app.use(express.json({ limit: '100kb' })); // Mitigate body flood attacks

// 2. Global Rate Limiter: 200 requests per 15 min
const globalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 200,
  message: 'Limite global de requisições excedido. Tente novamente em alguns minutos.',
});
app.use('/api/', globalLimiter);

// 3. Strict AI Route Limiter: 25 requests per minute
const aiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 25,
  message: 'Limite de análises de IA por minuto atingido. Aguarde 60 segundos.',
});

// In-Memory Data Store (ready for PostgreSQL swap)
let opportunitiesDb = [...MOCK_OPPORTUNITIES];
let alertsDb = [...MOCK_ALERTS];
let hypothesesDb = [...MOCK_HYPOTHESES];
let newsDb = [...MOCK_MARKET_NEWS];

// ====================================================================
// API ROUTES
// ====================================================================

// Health Check & Telemetry
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'production',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
  });
});

// Opportunity Pulse (Heartbeat)
app.get('/api/pulse', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'public, max-age=60'); // 1 min HTTP cache
  res.json(MOCK_PULSE_DATA);
});

// Global Market Signals (8 Geopolitical Nodes)
app.get('/api/countries', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'public, max-age=120'); // 2 min HTTP cache
  res.json(MOCK_COUNTRY_SIGNALS);
});

// Opportunities (with search, country filter, pagination & deduplication)
app.get('/api/opportunities', async (req: Request, res: Response) => {
  const { search, country, category, limit = '50', offset = '0' } = req.query;
  const cacheKey = `opps:${search || ''}:${country || ''}:${category || ''}:${limit}:${offset}`;

  const result = await globalCache.deduplicate(
    cacheKey,
    async () => {
      const realOpps = pipelineManager.getQualifiedOpportunities();
      // Real ingested opportunities take priority and appear first
      let combined = [
        ...realOpps,
        ...opportunitiesDb.filter((o) => !realOpps.some((ro) => ro.id === o.id)),
      ];
      let filtered = [...combined];

      if (typeof search === 'string' && search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (o) =>
            o.title.toLowerCase().includes(q) ||
            o.whatDetected.toLowerCase().includes(q) ||
            o.problemExists.toLowerCase().includes(q)
        );
      }

      if (typeof country === 'string' && country !== 'all') {
        filtered = filtered.filter((o) => o.market?.originCode === country);
      }

      if (typeof category === 'string' && category !== 'all') {
        filtered = filtered.filter((o) => o.category === category);
      }

      const numLimit = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 50));
      const numOffset = Math.max(0, parseInt(offset as string, 10) || 0);

      return {
        data: filtered.slice(numOffset, numOffset + numLimit),
        total: filtered.length,
        limit: numLimit,
        offset: numOffset,
      };
    },
    30000 // 30s cache
  );

  res.setHeader('Cache-Control', 'public, max-age=15');
  res.json(result);
});

// Single Opportunity
app.get('/api/opportunities/:id', (req: Request, res: Response) => {
  const allOpps = [...pipelineManager.getQualifiedOpportunities(), ...opportunitiesDb];
  const opp = allOpps.find((o) => o.id === req.params.id);
  if (!opp) {
    return res.status(404).json({ error: 'Oportunidade não encontrada' });
  }
  res.json(opp);
});

// Live Signals Stream
app.get('/api/signals', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'public, max-age=15'); // 15s cache
  res.json(MOCK_LIVE_SIGNALS);
});

// AI Analyst — Standard Analysis
app.post('/api/ai/analyze', aiLimiter, async (req: Request, res: Response) => {
  const { query, opportunityContext } = req.body;

  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ error: 'Query de análise é obrigatória.' });
  }

  const sanitizedQuery = sanitizeString(query);
  const result = await aiAnalystService.analyze({
    query: sanitizedQuery,
    opportunityContext,
  });

  res.json(result);
});

// AI Analyst — Streaming SSE Route
app.get('/api/ai/stream', aiLimiter, async (req: Request, res: Response) => {
  const query = (req.query.q as string) || 'Plano de MVP';
  const oppId = req.query.oppId as string;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const context = oppId ? opportunitiesDb.find((o) => o.id === oppId) : undefined;

  await aiAnalystService.streamAnalysis(
    {
      query: sanitizeString(query),
      opportunityContext: context,
    },
    (chunk) => {
      res.write(`data: ${JSON.stringify({ chunk, done: false })}\n\n`);
    },
    () => {
      res.write(`data: ${JSON.stringify({ chunk: '', done: true })}\n\n`);
      res.end();
    }
  );
});

// Hypotheses Creation (My Lab)
app.post('/api/hypotheses', (req: Request, res: Response) => {
  const { title, hypothesisText, successMetric } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Título da hipótese é obrigatório.' });
  }

  const newHyp = {
    id: `hyp-${Date.now().toString().slice(-4)}`,
    title: sanitizeString(title),
    opportunityRefId: 'custom',
    status: 'Backlog' as const,
    hypothesisText: sanitizeString(hypothesisText || ''),
    successMetric: sanitizeString(successMetric || ''),
    confidenceScore: 80,
    notes: 'Criada via API segura.',
    createdAt: new Date().toISOString().split('T')[0],
  };

  hypothesesDb.unshift(newHyp);
  res.status(201).json(newHyp);
});

// Alerts Creation
app.post('/api/alerts', (req: Request, res: Response) => {
  const { name, queryOrKeywords, minScore, frequency } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Nome do alerta é obrigatório.' });
  }

  const newAlert = {
    id: `alt-${Date.now().toString().slice(-4)}`,
    name: sanitizeString(name),
    queryOrKeywords: sanitizeString(queryOrKeywords || 'SaaS'),
    minScore: Number(minScore) || 85,
    channels: ['In-App' as const, 'Email' as const],
    frequency: frequency || 'Tempo Real',
    isActive: true,
    triggersCount: 0,
    lastTriggered: 'Recém criado',
  };

  alertsDb.unshift(newAlert);
  res.status(201).json(newAlert);
});

// ====================================================================
// MARKET NEWS & DISCOVERY ENDPOINTS
// ====================================================================

// Get Market News Feed (with search, category, interest, and country filters)
app.get('/api/news', (req: Request, res: Response) => {
  const { search, category, country, interest, onlyWithHypotheses } = req.query;

  let filtered = [...newsDb];

  if (typeof search === 'string' && search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.summary.toLowerCase().includes(q) ||
        n.source.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (typeof category === 'string' && category !== 'all') {
    filtered = filtered.filter((n) => n.category.toLowerCase() === category.toLowerCase());
  }

  if (typeof country === 'string' && country !== 'all') {
    filtered = filtered.filter((n) => n.countryCode.toLowerCase() === country.toLowerCase());
  }

  if (typeof interest === 'string' && interest.trim()) {
    const interests = interest.toLowerCase().split(',');
    filtered = filtered.filter(
      (n) =>
        interests.includes(n.category.toLowerCase()) ||
        n.tags.some((t) => interests.includes(t.toLowerCase()))
    );
  }

  if (onlyWithHypotheses === 'true') {
    filtered = filtered.filter((n) => n.possibleOpportunities && n.possibleOpportunities.length > 0);
  }

  res.setHeader('Cache-Control', 'public, max-age=30');
  res.json({
    data: filtered,
    total: filtered.length,
    trendingCount: filtered.filter((n) => n.isTrending).length,
  });
});

// Get Daily Market Brief
app.get('/api/news/daily-brief', (req: Request, res: Response) => {
  const stats = pipelineManager.getStats();
  const brief = {
    ...MOCK_DAILY_BRIEF,
    todaySignalsCount: stats.totalCollected || MOCK_DAILY_BRIEF.todaySignalsCount,
    saasOpportunitiesCount: stats.totalQualifiedOpportunities || MOCK_DAILY_BRIEF.saasOpportunitiesCount,
  };
  res.setHeader('Cache-Control', 'public, max-age=60');
  res.json(brief);
});

// Get Emerging Trends
app.get('/api/news/trends', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'public, max-age=60');
  res.json(MOCK_EMERGING_TRENDS);
});

// Single News Item
app.get('/api/news/:id', (req: Request, res: Response) => {
  const item = newsDb.find((n) => n.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Notícia não encontrada.' });
  }
  res.json(item);
});

// Toggle Save on News Item
app.post('/api/news/:id/save', (req: Request, res: Response) => {
  const item = newsDb.find((n) => n.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Notícia não encontrada.' });
  }
  item.isSaved = !item.isSaved;
  res.json({ success: true, isSaved: item.isSaved });
});

// Create Project in My Lab from News Hypothesis
app.post('/api/news/:id/create-project', (req: Request, res: Response) => {
  const { hypothesisId } = req.body;
  const newsItem = newsDb.find((n) => n.id === req.params.id);

  if (!newsItem) {
    return res.status(404).json({ error: 'Notícia não encontrada.' });
  }

  const hypothesis = newsItem.possibleOpportunities.find((h) => h.id === hypothesisId);
  if (!hypothesis) {
    return res.status(404).json({ error: 'Hipótese de oportunidade não encontrada.' });
  }

  hypothesis.status = 'Promovido a Projeto';

  const newProject = {
    id: `proj-hyp-${Date.now().toString().slice(-4)}`,
    title: hypothesis.title.replace(/^Hipótese:\s*/i, ''),
    opportunityRefId: newsItem.id,
    status: 'Pesquisando' as const,
    hypothesisText: `${hypothesis.description} (Inspirado em: "${newsItem.title}")`,
    successMetric: `Validar MVP com 20 clientes do público: ${hypothesis.targetAudience}`,
    confidenceScore: hypothesis.confidenceScore,
    notes: `Monetização esperada: ${hypothesis.monetizationModel}. Esforço estimado: ${hypothesis.estimatedEffort}. Fonte original: ${newsItem.source}.`,
    createdAt: new Date().toISOString().split('T')[0],
  };

  hypothesesDb.unshift(newProject);
  res.status(201).json({ success: true, project: newProject, hypothesis });
});

// Deep AI Analysis of a News Item
app.post('/api/news/:id/analyze', aiLimiter, async (req: Request, res: Response) => {
  const newsItem = newsDb.find((n) => n.id === req.params.id);
  if (!newsItem) {
    return res.status(404).json({ error: 'Notícia não encontrada.' });
  }

  const analysisQuery = `Analise a notícia "${newsItem.title}" (${newsItem.source}, ${newsItem.category}). Identifique oportunidades ocultas de SaaS, nível de concorrência e o plano recomendado de MVP em 3 semanas.`;

  const analysisResult = await aiAnalystService.analyze({
    query: analysisQuery,
    opportunityContext: {
      id: newsItem.id,
      title: newsItem.title,
      tagline: newsItem.summary,
      category: newsItem.category as any,
      score: newsItem.impactScore,
      whatDetected: newsItem.summary,
      whyImportant: newsItem.aiAnalysisSummary,
      problemExists: newsItem.aiQuestion,
      howMonetized: newsItem.possibleOpportunities?.[0]?.monetizationModel || 'SaaS Recorrente',
    } as any,
  });

  res.json({
    newsId: newsItem.id,
    title: newsItem.title,
    analysis: analysisResult,
    hypotheses: newsItem.possibleOpportunities,
  });
});

// ====================================================================
// ADMIN & DATA INGESTION PIPELINE ENDPOINTS
// ====================================================================

// List All Ingestion Sources
app.get('/api/admin/sources', (req: Request, res: Response) => {
  res.json({
    sources: pipelineManager.getSources(),
    stats: pipelineManager.getStats(),
  });
});

// Sync Single Source
app.post('/api/admin/sources/:id/sync', async (req: Request, res: Response) => {
  const result = await pipelineManager.syncSource(req.params.id);
  if (!result.success && result.error === 'Fonte não encontrada') {
    return res.status(404).json(result);
  }
  // Invalidate opportunities cache after new ingestion
  globalCache.clear();
  res.json(result);
});

// Sync All Sources (Polite Sequenced Pipeline)
app.post('/api/admin/sources/sync-all', async (req: Request, res: Response) => {
  const result = await pipelineManager.syncAll();
  globalCache.clear();
  res.json(result);
});

// Ingestion Pipeline Telemetry
app.get('/api/admin/stats', (req: Request, res: Response) => {
  res.json(pipelineManager.getStats());
});

// Toggle Source Active/Inactive
app.patch('/api/admin/sources/:id/toggle', (req: Request, res: Response) => {
  const { isEnabled } = req.body;
  const updated = pipelineManager.toggleSource(req.params.id, Boolean(isEnabled));
  if (!updated) {
    return res.status(404).json({ error: 'Fonte não encontrada.' });
  }
  res.json({ success: true, isEnabled });
});

// Add New Custom Syndicated/API Source
app.post('/api/admin/sources', (req: Request, res: Response) => {
  const { name, type, endpointUrl, documentationUrl, frequencyMinutes, complianceNotes } = req.body;
  if (!name || !endpointUrl) {
    return res.status(400).json({ error: 'Nome e URL do endpoint são obrigatórios.' });
  }

  const id = `src-custom-${Date.now().toString().slice(-4)}`;
  const newSource = {
    id,
    name: sanitizeString(name),
    type: (type || 'rss_feed') as any,
    status: 'online' as const,
    endpointUrl: sanitizeString(endpointUrl),
    documentationUrl: sanitizeString(documentationUrl || endpointUrl),
    frequencyMinutes: Number(frequencyMinutes) || 30,
    lastSync: null,
    recordsCollected: 0,
    errorCount: 0,
    lastError: null,
    rateLimit: {
      limit: 120,
      remaining: 120,
      resetTime: 'Sem restrição rígida',
    },
    complianceNotes: sanitizeString(complianceNotes || 'Fonte configurada pelo administrador com respeito a robots.txt.'),
    isEnabled: true,
  };

  pipelineManager.addSource(newSource);
  res.status(201).json(newSource);
});

// Get Raw Ingested Signals for Transparency Audit
app.get('/api/admin/signals', (req: Request, res: Response) => {
  res.json(pipelineManager.getRawSignals());
});

// Central Error Handling Middleware (never leaks stack traces)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[API ERROR]', err.message);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Ocorreu um erro interno seguro no servidor.',
  });
});

// Start standalone HTTP listener only when not running inside a serverless runtime
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[Opportunity Radar API] Server running on port ${PORT}`);
  });
}

export default app;
