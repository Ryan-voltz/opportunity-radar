import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { securityHeaders, createRateLimiter, sanitizeString } from './middleware/security';
import { aiAnalystService } from './services/aiAnalystService';
import { globalCache } from './services/cacheService';
import { pipelineManager } from './ingestion/pipelineManager';
import { dbClient } from './db/dbClient';

// Import domain seed data for pulse and geography
import {
  MOCK_PULSE_DATA,
  MOCK_COUNTRY_SIGNALS,
  MOCK_LIVE_SIGNALS,
} from '../src/data/mockData';
import {
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

// 1.1 Safe JSON body parser (supports pre-parsed Vercel serverless bodies)
app.use((req: Request, res: Response, next: NextFunction) => {
  if (typeof req.body === 'string') {
    try {
      req.body = JSON.parse(req.body);
    } catch {
      // ignore
    }
  } else if (Buffer.isBuffer(req.body)) {
    try {
      req.body = JSON.parse(req.body.toString('utf8'));
    } catch {
      // ignore
    }
  }

  // If body is already set or stream has already been consumed by serverless runtime, do not attach body-parser
  if (req.body !== undefined || req.readableEnded || (req as any)._readableState?.ended) {
    return next();
  }

  return express.json({ limit: '100kb' })(req, res, (err) => {
    if (err) {
      if (req.body !== undefined) return next();
      return res.status(400).json({ error: 'Payload JSON inválido.' });
    }
    next();
  });
});

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

// ====================================================================
// API ROUTES
// ====================================================================

// API Gateway Root
app.get('/api', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Opportunity Radar Intelligence API (Persistent Backend)',
    version: '1.1.0',
    endpoints: [
      '/api/health',
      '/api/db-status',
      '/api/pulse',
      '/api/countries',
      '/api/opportunities',
      '/api/personal-projects',
      '/api/news',
      '/api/news/trends',
      '/api/news/daily-brief',
      '/api/alerts',
      '/api/signals',
      '/api/hypotheses',
      '/api/admin/sources',
      '/api/ai/analyze',
      '/api/ai/stream'
    ],
    timestamp: new Date().toISOString()
  });
});

// Database Telemetry & Cloud Connection Status
app.get('/api/db-status', async (req: Request, res: Response) => {
  try {
    const status = await dbClient.getDbStatus();
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Health Check & Telemetry
app.get('/api/health', async (req: Request, res: Response) => {
  const dbStatus = await dbClient.getDbStatus();
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'production',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      engine: dbStatus.engine,
      provider: dbStatus.provider,
      connected: dbStatus.connected,
    },
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

// ====================================================================
// OPPORTUNITIES ENDPOINTS (Persistent Database + Ingestion Pipeline)
// ====================================================================

// Opportunities (with search, country filter, pagination & deduplication)
app.get('/api/opportunities', async (req: Request, res: Response) => {
  const { search, country, category, limit = '50', offset = '0' } = req.query;
  const cacheKey = `opps:${search || ''}:${country || ''}:${category || ''}:${limit}:${offset}`;

  const result = await globalCache.deduplicate(
    cacheKey,
    async () => {
      const realOpps = pipelineManager.getQualifiedOpportunities();
      const dbResult = await dbClient.getOpportunities({
        search: typeof search === 'string' ? search : undefined,
        country: typeof country === 'string' ? country : undefined,
        category: typeof category === 'string' ? category : undefined,
        limit: parseInt(limit as string, 10) || 50,
        offset: parseInt(offset as string, 10) || 0,
      });

      // Real ingested opportunities take priority and appear first
      let combined = [
        ...realOpps,
        ...dbResult.data.filter((o) => !realOpps.some((ro) => ro.id === o.id)),
      ];

      return {
        data: combined,
        total: dbResult.total + realOpps.length,
        limit: dbResult.limit,
        offset: dbResult.offset,
      };
    },
    15000 // 15s cache
  );

  res.setHeader('Cache-Control', 'public, max-age=15');
  res.json(result);
});

// Single Opportunity
app.get('/api/opportunities/:id', async (req: Request, res: Response) => {
  const realOpps = pipelineManager.getQualifiedOpportunities();
  const fromPipeline = realOpps.find((o) => o.id === req.params.id);
  if (fromPipeline) {
    return res.json(fromPipeline);
  }

  const opp = await dbClient.getOpportunityById(req.params.id);
  if (!opp) {
    return res.status(404).json({ error: 'Oportunidade não encontrada' });
  }
  res.json(opp);
});

// Create Custom Opportunity
app.post('/api/opportunities', async (req: Request, res: Response) => {
  try {
    const opp = req.body;
    if (!opp.title || !opp.category) {
      return res.status(400).json({ error: 'Título e categoria são obrigatórios.' });
    }
    if (!opp.id) {
      opp.id = `opp-custom-${Date.now().toString().slice(-6)}`;
    }
    const saved = await dbClient.createOpportunity(opp);
    globalCache.clear();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Update Opportunity Status or Bookmark
app.patch('/api/opportunities/:id/status', async (req: Request, res: Response) => {
  try {
    const { isSaved, status } = req.body;
    const updated = await dbClient.updateOpportunity(req.params.id, {
      ...(isSaved !== undefined ? { isSaved: Boolean(isSaved) } : {}),
      ...(status ? { status } : {}),
    });
    if (!updated) {
      return res.status(404).json({ error: 'Oportunidade não encontrada' });
    }
    globalCache.clear();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ====================================================================
// PERSONAL TRACKED PROJECTS (My Lab & AI Daily Coach)
// ====================================================================

// List all personal tracked projects
app.get('/api/personal-projects', async (req: Request, res: Response) => {
  try {
    const projects = await dbClient.getPersonalProjects();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Save or Upsert Personal Project
app.post('/api/personal-projects', async (req: Request, res: Response) => {
  try {
    const project = req.body;
    if (!project.title || !project.opportunityId) {
      return res.status(400).json({ error: 'Título e ID de oportunidade são obrigatórios.' });
    }
    if (!project.id) {
      project.id = `proj-personal-${Date.now().toString().slice(-6)}`;
    }
    const saved = await dbClient.savePersonalProject(project);
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Update Personal Project Metadata / Notes
app.patch('/api/personal-projects/:id', async (req: Request, res: Response) => {
  try {
    const updated = await dbClient.updatePersonalProject(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Projeto pessoal não encontrado.' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Toggle / Complete Task in Personal Project
app.patch('/api/personal-projects/:id/tasks/:taskId', async (req: Request, res: Response) => {
  try {
    const { completed } = req.body;
    const updated = await dbClient.updateProjectTask(req.params.id, req.params.taskId, Boolean(completed));
    if (!updated) {
      return res.status(404).json({ error: 'Projeto ou tarefa não encontrada.' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Delete Personal Project
app.delete('/api/personal-projects/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await dbClient.deletePersonalProject(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Projeto pessoal não encontrado.' });
    }
    res.json({ success: true, message: 'Projeto pessoal excluído com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ====================================================================
// LIVE SIGNALS & AI ANALYST
// ====================================================================

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

  const context = oppId ? await dbClient.getOpportunityById(oppId) : undefined;

  await aiAnalystService.streamAnalysis(
    {
      query: sanitizeString(query),
      opportunityContext: context || undefined,
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

// ====================================================================
// HYPOTHESES (MY LAB)
// ====================================================================

// List Hypotheses
app.get('/api/hypotheses', async (req: Request, res: Response) => {
  const list = await dbClient.getHypotheses();
  res.json(list);
});

// Hypotheses Creation
app.post('/api/hypotheses', async (req: Request, res: Response) => {
  try {
    const { title, hypothesisText, successMetric } = req.body || {};
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

    const saved = await dbClient.createHypothesis(newHyp);
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Hypotheses Deletion
app.delete('/api/hypotheses/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await dbClient.deleteHypothesis(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Hipótese não encontrada.' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ====================================================================
// ALERTS ENGINE
// ====================================================================

// List Alerts
app.get('/api/alerts', async (req: Request, res: Response) => {
  const list = await dbClient.getAlerts();
  res.json(list);
});

// Alerts Creation
app.post('/api/alerts', async (req: Request, res: Response) => {
  try {
    const { name, queryOrKeywords, minScore, frequency } = req.body || {};
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

    const saved = await dbClient.createAlert(newAlert);
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Toggle Alert Active
app.patch('/api/alerts/:id/toggle', async (req: Request, res: Response) => {
  const updated = await dbClient.toggleAlert(req.params.id);
  if (!updated) {
    return res.status(404).json({ error: 'Alerta não encontrado.' });
  }
  res.json(updated);
});

// Delete Alert
app.delete('/api/alerts/:id', async (req: Request, res: Response) => {
  const deleted = await dbClient.deleteAlert(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Alerta não encontrado.' });
  }
  res.json({ success: true });
});

// ====================================================================
// MARKET NEWS & DISCOVERY ENDPOINTS
// ====================================================================

// Get Market News Feed (with search, category, interest, and country filters)
app.get('/api/news', async (req: Request, res: Response) => {
  const { search, category, country, interest, onlyWithHypotheses } = req.query;

  const result = await dbClient.getNews({
    search: typeof search === 'string' ? search : undefined,
    category: typeof category === 'string' ? category : undefined,
    country: typeof country === 'string' ? country : undefined,
    interest: typeof interest === 'string' ? interest : undefined,
    onlyWithHypotheses: onlyWithHypotheses === 'true',
  });

  res.setHeader('Cache-Control', 'public, max-age=30');
  res.json(result);
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
app.get('/api/news/:id', async (req: Request, res: Response) => {
  const item = await dbClient.getNewsById(req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Notícia não encontrada.' });
  }
  res.json(item);
});

// Toggle Save on News Item
app.post('/api/news/:id/save', async (req: Request, res: Response) => {
  const isSaved = await dbClient.toggleNewsSaved(req.params.id);
  if (isSaved === null) {
    return res.status(404).json({ error: 'Notícia não encontrada.' });
  }
  res.json({ success: true, isSaved });
});

// Create Project in My Lab from News Hypothesis
app.post('/api/news/:id/create-project', async (req: Request, res: Response) => {
  const { hypothesisId } = req.body;
  const result = await dbClient.createProjectFromNewsHypothesis(req.params.id, hypothesisId);

  if (!result) {
    return res.status(404).json({ error: 'Notícia ou hipótese de oportunidade não encontrada.' });
  }

  res.status(201).json({ success: true, ...result });
});

// Deep AI Analysis of a News Item
app.post('/api/news/:id/analyze', aiLimiter, async (req: Request, res: Response) => {
  const newsItem = await dbClient.getNewsById(req.params.id);
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

// Central Error Handling Middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[API ERROR]', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'Ocorreu um erro interno no servidor.',
  });
});

// Start standalone HTTP listener only when not running inside a serverless runtime
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[Opportunity Radar API] Server running on port ${PORT}`);
  });
}

export default app;
