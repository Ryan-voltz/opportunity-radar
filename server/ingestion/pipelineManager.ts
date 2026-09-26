import { IngestionSource, IngestionStats, NormalizedSignal } from './types';
import { hackerNewsCollector } from './collectors/hackerNewsCollector';
import { githubCollector } from './collectors/githubCollector';
import { redditCollector } from './collectors/redditCollector';
import { rssCollector } from './collectors/rssCollector';
import { Deduplicator } from './deduplicator';
import { opportunityEngine } from './opportunityEngine';
import { Opportunity } from '../../src/types';

export class PipelineManager {
  private sources: Map<string, IngestionSource> = new Map();
  private collectedSignals: NormalizedSignal[] = [];
  private generatedOpportunities: Opportunity[] = [];
  private stats: IngestionStats = {
    totalCollected: 0,
    totalDeduplicated: 0,
    totalQualifiedOpportunities: 0,
    activeSourcesCount: 0,
    lastPipelineRun: new Date().toISOString(),
  };

  constructor() {
    this.registerDefaultSources();
  }

  private registerDefaultSources() {
    const defaultSources: IngestionSource[] = [
      {
        id: 'src-hackernews',
        name: 'Hacker News (Top & Show HN)',
        type: 'official_api',
        status: 'online',
        endpointUrl: 'https://hacker-news.firebaseio.com/v0/topstories.json',
        documentationUrl: 'https://github.com/HackerNews/API',
        frequencyMinutes: 15,
        lastSync: null,
        recordsCollected: 0,
        errorCount: 0,
        lastError: null,
        rateLimit: {
          limit: 10000,
          remaining: 9980,
          resetTime: 'Sem restrição rígida (Fair Use)',
        },
        complianceNotes: 'API oficial pública do Firebase YC. Sem necessidade de scraping ou chaves.',
        isEnabled: true,
      },
      {
        id: 'src-github',
        name: 'GitHub Trending Repositories',
        type: 'official_api',
        status: 'online',
        endpointUrl: 'https://api.github.com/search/repositories',
        documentationUrl: 'https://docs.github.com/en/rest/search',
        frequencyMinutes: 30,
        lastSync: null,
        recordsCollected: 0,
        errorCount: 0,
        lastError: null,
        rateLimit: {
          limit: 60,
          remaining: 60,
          resetTime: 'A cada 60 minutos',
        },
        complianceNotes: 'REST API oficial v3. Respeita headers x-ratelimit-remaining e User-Agent com contato.',
        isEnabled: true,
      },
      {
        id: 'src-reddit-saas',
        name: 'Reddit r/SaaS (Discussões e Dores)',
        type: 'public_endpoint',
        status: 'online',
        endpointUrl: 'https://www.reddit.com/r/SaaS/hot.json',
        documentationUrl: 'https://www.reddit.com/dev/api',
        frequencyMinutes: 20,
        lastSync: null,
        recordsCollected: 0,
        errorCount: 0,
        lastError: null,
        rateLimit: {
          limit: 60,
          remaining: 58,
          resetTime: '60 req/min',
        },
        complianceNotes: 'Endpoint público JSON com User-Agent descritivo e estrito respeito a robots.txt.',
        isEnabled: true,
      },
      {
        id: 'src-reddit-entrepreneur',
        name: 'Reddit r/Entrepreneur (Validação de Mercado)',
        type: 'public_endpoint',
        status: 'online',
        endpointUrl: 'https://www.reddit.com/r/Entrepreneur/hot.json',
        documentationUrl: 'https://www.reddit.com/dev/api',
        frequencyMinutes: 20,
        lastSync: null,
        recordsCollected: 0,
        errorCount: 0,
        lastError: null,
        rateLimit: {
          limit: 60,
          remaining: 58,
          resetTime: '60 req/min',
        },
        complianceNotes: 'Endpoint público JSON conforme diretrizes oficiais de acesso comunitário da Reddit.',
        isEnabled: true,
      },
      {
        id: 'src-techcrunch-rss',
        name: 'TechCrunch Startups Syndication',
        type: 'rss_feed',
        status: 'online',
        endpointUrl: 'https://techcrunch.com/category/startups/feed/',
        documentationUrl: 'https://techcrunch.com/pages/rss-feeds/',
        frequencyMinutes: 30,
        lastSync: null,
        recordsCollected: 0,
        errorCount: 0,
        lastError: null,
        rateLimit: {
          limit: 120,
          remaining: 120,
          resetTime: 'Sem restrição',
        },
        complianceNotes: 'Feed RSS público distribuído oficialmente para sindicação e agregadores.',
        isEnabled: true,
      },
      {
        id: 'src-weworkremotely-rss',
        name: 'WeWorkRemotely Software Demand',
        type: 'rss_feed',
        status: 'online',
        endpointUrl: 'https://weworkremotely.com/categories/remote-programming-jobs.rss',
        documentationUrl: 'https://weworkremotely.com/',
        frequencyMinutes: 60,
        lastSync: null,
        recordsCollected: 0,
        errorCount: 0,
        lastError: null,
        rateLimit: {
          limit: 120,
          remaining: 120,
          resetTime: 'Sem restrição',
        },
        complianceNotes: 'Feed de vagas público para monitoramento de habilidades técnicas de alta demanda.',
        isEnabled: true,
      },
      {
        id: 'src-producthunt-rss',
        name: 'Product Hunt Daily Ingestion',
        type: 'rss_feed',
        status: 'online',
        endpointUrl: 'https://www.producthunt.com/feed',
        documentationUrl: 'https://www.producthunt.com',
        frequencyMinutes: 30,
        lastSync: null,
        recordsCollected: 0,
        errorCount: 0,
        lastError: null,
        rateLimit: {
          limit: 300,
          remaining: 300,
          resetTime: 'Sem restrição (Syndicated Atom Feed)',
        },
        complianceNotes: 'Feed Atom oficial público para sindicação diária de novos lançamentos de produtos.',
        isEnabled: true,
      },
    ];

    for (const src of defaultSources) {
      this.sources.set(src.id, src);
    }
    this.updateActiveSourcesCount();
  }

  private updateActiveSourcesCount() {
    this.stats.activeSourcesCount = Array.from(this.sources.values()).filter((s) => s.isEnabled).length;
  }

  public getSources(): IngestionSource[] {
    return Array.from(this.sources.values());
  }

  public getSource(id: string): IngestionSource | undefined {
    return this.sources.get(id);
  }

  public addSource(source: IngestionSource): void {
    this.sources.set(source.id, source);
    this.updateActiveSourcesCount();
  }

  public toggleSource(id: string, isEnabled: boolean): boolean {
    const src = this.sources.get(id);
    if (!src) return false;
    src.isEnabled = isEnabled;
    this.updateActiveSourcesCount();
    return true;
  }

  public getStats(): IngestionStats {
    return {
      ...this.stats,
      totalCollected: this.collectedSignals.length,
      totalQualifiedOpportunities: this.generatedOpportunities.length,
    };
  }

  public getQualifiedOpportunities(): Opportunity[] {
    return this.generatedOpportunities;
  }

  public getRawSignals(): NormalizedSignal[] {
    return this.collectedSignals;
  }

  /**
   * Sync a single source by ID
   */
  public async syncSource(sourceId: string): Promise<{
    success: boolean;
    recordsCount: number;
    qualifiedCount: number;
    error?: string;
  }> {
    const src = this.sources.get(sourceId);
    if (!src) {
      return { success: false, recordsCount: 0, qualifiedCount: 0, error: 'Fonte não encontrada' };
    }

    src.status = 'syncing';
    let rawSignals: NormalizedSignal[] = [];

    try {
      if (sourceId === 'src-hackernews') {
        rawSignals = await hackerNewsCollector.collect(15);
      } else if (sourceId === 'src-github') {
        const ghResult = await githubCollector.collect(12);
        rawSignals = ghResult.signals;
        src.rateLimit.remaining = ghResult.rateLimitRemaining;
        if (ghResult.rateLimitRemaining <= 2) {
          src.status = 'rate_limited';
        }
      } else if (sourceId === 'src-reddit-saas') {
        rawSignals = await redditCollector.collectFromSubreddit('SaaS', 15);
      } else if (sourceId === 'src-reddit-entrepreneur') {
        rawSignals = await redditCollector.collectFromSubreddit('Entrepreneur', 15);
      } else if (sourceId === 'src-techcrunch-rss') {
        rawSignals = await rssCollector.collectFeed(
          src.endpointUrl,
          'TechCrunch Startups',
          src.id,
          'Ecossistema de Startups',
          'lancamento',
          12
        );
      } else if (sourceId === 'src-weworkremotely-rss') {
        rawSignals = await rssCollector.collectFeed(
          src.endpointUrl,
          'We Work Remotely',
          src.id,
          'Demanda de Contratação Tech',
          'demanda_contratacao',
          12
        );
      } else if (sourceId === 'src-producthunt-rss') {
        rawSignals = await rssCollector.collectFeed(
          src.endpointUrl,
          'Product Hunt Feed',
          src.id,
          'Novo Produto & SaaS',
          'lancamento',
          15
        );
      } else if (src.type === 'rss_feed') {
        rawSignals = await rssCollector.collectFeed(src.endpointUrl, src.name, src.id, 'RSS Externo', 'lancamento', 10);
      }

      // Deduplicate against existing signals
      const { uniqueSignals, duplicatesCount } = Deduplicator.deduplicate([
        ...rawSignals,
        ...this.collectedSignals,
      ]);

      this.collectedSignals = uniqueSignals;
      this.stats.totalDeduplicated += duplicatesCount;

      // Qualify new signals through Opportunity Engine
      let newQualifiedCount = 0;
      for (const sig of rawSignals) {
        const qualification = opportunityEngine.evaluateSignal(sig);
        sig.isOpportunityEligible = qualification.isEligible;

        if (qualification.isEligible) {
          const opp = opportunityEngine.createOpportunityFromSignal(sig, qualification);
          // Prepend to generated opportunities (avoid duplicate titles)
          const alreadyExists = this.generatedOpportunities.some(
            (o) => o.title.toLowerCase() === opp.title.toLowerCase()
          );
          if (!alreadyExists) {
            this.generatedOpportunities.unshift(opp);
            newQualifiedCount++;
          }
        }
      }

      src.status = src.status === 'rate_limited' ? 'rate_limited' : 'online';
      src.lastSync = new Date().toISOString();
      src.recordsCollected += rawSignals.length;
      src.lastError = null;

      this.stats.lastPipelineRun = new Date().toISOString();

      return {
        success: true,
        recordsCount: rawSignals.length,
        qualifiedCount: newQualifiedCount,
      };
    } catch (err) {
      src.status = 'error';
      src.errorCount += 1;
      src.lastError = (err as Error).message;
      return {
        success: false,
        recordsCount: 0,
        qualifiedCount: 0,
        error: (err as Error).message,
      };
    }
  }

  /**
   * Sync all enabled sources in sequence with polite delay
   */
  public async syncAll(): Promise<{
    totalCollected: number;
    totalQualified: number;
    results: Record<string, { success: boolean; records: number; qualified: number; error?: string }>;
  }> {
    const results: Record<string, { success: boolean; records: number; qualified: number; error?: string }> = {};
    let totalCollected = 0;
    let totalQualified = 0;

    for (const [id, src] of this.sources.entries()) {
      if (!src.isEnabled) continue;

      const outcome = await this.syncSource(id);
      results[id] = {
        success: outcome.success,
        records: outcome.recordsCount,
        qualified: outcome.qualifiedCount,
        error: outcome.error,
      };

      if (outcome.success) {
        totalCollected += outcome.recordsCount;
        totalQualified += outcome.qualifiedCount;
      }

      // Small 250ms spacing between distinct domain queries
      await new Promise((r) => setTimeout(r, 250));
    }

    return { totalCollected, totalQualified, results };
  }
}

export const pipelineManager = new PipelineManager();
