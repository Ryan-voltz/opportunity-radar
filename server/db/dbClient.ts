import fs from 'fs';
import path from 'path';
import pg from 'pg';
import {
  MOCK_OPPORTUNITIES,
  MOCK_PULSE_DATA,
  MOCK_COUNTRY_SIGNALS,
  MOCK_LIVE_SIGNALS,
  MOCK_ALERTS,
  MOCK_HYPOTHESES,
} from '../../src/data/mockData';
import {
  MOCK_MARKET_NEWS,
  MOCK_EMERGING_TRENDS,
  MOCK_DAILY_BRIEF,
} from '../../src/data/newsData';
import { Opportunity, PersonalProject } from '../../src/types';

const { Pool } = pg;

export type DbEngineType = 'postgres' | 'supabase' | 'local_persistent';

interface DbStatusResponse {
  connected: boolean;
  engine: DbEngineType;
  provider: string;
  isProduction: boolean;
  databaseName?: string;
  counts: {
    opportunities: number;
    personalProjects: number;
    hypotheses: number;
    alerts: number;
    news: number;
  };
  details: {
    persistenceLocation: string;
    connectionType: string;
    isFreeTierReady: boolean;
  };
  setupGuide: {
    supabaseInstructions: string;
    neonInstructions: string;
    docUrl: string;
  };
}

// Initial seeded personal projects
const DEFAULT_PERSONAL_PROJECTS: PersonalProject[] = [
  {
    id: 'proj-personal-gong-alt',
    opportunityId: 'opp-002',
    title: 'Gong / Chorus Light para SMBs Globais',
    tagline: 'Inteligência de conversação em vendas e transcrição com IA sem contratos abusivos de US$ 10k/ano.',
    category: 'SalesTech & RevOps',
    score: 95,
    financialMetrics: {
      estimatedMonthlyProfit: 'R$ 32.000 - R$ 78.000 / mês ($6,500 - $15,000)',
      profitMargin: '88%',
      averageTicket: 'R$ 380 / mês ($79/mo)',
      annualProjection: 'R$ 480.000+ ARR',
    },
    speedMetrics: {
      mvpDays: 14,
      firstSaleDays: 20,
      weeklyDedicationHours: '14h / semana',
      speedRating: 'Rápido (2 sem)',
    },
    investmentMetrics: {
      initialCapitalEstimated: 'R$ 290 ($60 USD)',
      capitalBreakdown: [
        { item: 'Domínio .com oficial', cost: 'R$ 65 / ano' },
        { item: 'Hospedagem Vercel & Supabase', cost: 'R$ 0 (Free)' },
        { item: 'Créditos OpenAI Whisper / Claude API', cost: 'R$ 150 (uso real)' },
        { item: 'Resend (E-mails transacionais)', cost: 'R$ 0 (Gratuito)' },
      ],
    },
    tasks: [
      {
        id: 't-gong-1',
        phaseId: 1,
        phaseName: 'Fase 1: Validação & Pré-Venda',
        title: 'Entrevistar 10 líderes de Inside Sales sobre o custo exorbitante do Gong',
        howToExecute: 'Abordar Head de Vendas no LinkedIn perguntando quanto gastam com gravação de reuniões.',
        deliverable: '10 entrevistas concluídas e 4 cartas de intenção de compra assinadas.',
        recommendedDay: 'Dia 1',
        completed: true,
        completedAt: '2026-09-25T14:30:00Z',
      },
      {
        id: 't-gong-2',
        phaseId: 1,
        phaseName: 'Fase 1: Validação & Pré-Venda',
        title: 'Publicar Landing Page com calculadora de economia versus Gong/Chorus',
        howToExecute: 'Mostrar que um time de 5 vendedores economiza US$ 12.000/ano.',
        deliverable: 'Landing page no ar com 48 inscritos na lista de espera.',
        recommendedDay: 'Dia 3',
        completed: true,
        completedAt: '2026-09-26T10:00:00Z',
      },
      {
        id: 't-gong-3',
        phaseId: 2,
        phaseName: 'Fase 2: Construção do MVP Enxuto',
        title: 'Integrar bot de reunião via Recall.ai ou gravação de áudio do Zoom',
        howToExecute: 'Conectar webhook que recebe gravação de áudio em formato MP3.',
        deliverable: 'Áudio gravado e armazenado com segurança no bucket S3/Supabase.',
        recommendedDay: 'Dias 5 a 8',
        completed: true,
        completedAt: '2026-09-27T08:15:00Z',
      },
      {
        id: 't-gong-4',
        phaseId: 2,
        phaseName: 'Fase 2: Construção do MVP Enxuto',
        title: 'Pipeline de transcrição com Whisper e extração de objeções com LLM',
        howToExecute: 'Enviar áudio para transcrição e rodar prompt de detecção de objeções de preço e concorrência.',
        deliverable: 'JSON com resumo da call, pontos de ação e sentimento do prospect.',
        recommendedDay: 'Dias 9 a 11',
        completed: true,
        completedAt: '2026-09-27T18:00:00Z',
      },
      {
        id: 't-gong-5',
        phaseId: 2,
        phaseName: 'Fase 2: Construção do MVP Enxuto',
        title: 'Dashboard de visualização das calls gravadas com player sincronizado',
        howToExecute: 'Interface web com busca por termos falados na call e resumo executivo.',
        deliverable: 'Dashboard responsivo testado em 5 calls reais.',
        recommendedDay: 'Dias 12 a 14',
        completed: false,
      },
      {
        id: 't-gong-6',
        phaseId: 3,
        phaseName: 'Fase 3: Lançamento & Primeiros Pagantes',
        title: 'Ativar os 4 clientes da carta de intenção no plano Beta com 50% de desconto vitalício',
        howToExecute: 'Onboarding 1 a 1 via Google Meet instalando nas contas Zoom/Meet deles.',
        deliverable: 'Primeiros R$ 1.520 em MRR faturados via Stripe/Asaas.',
        recommendedDay: 'Dias 15 a 18',
        completed: false,
      },
    ],
    progressPercent: 67,
    startedAt: '2026-09-24T00:00:00Z',
    targetCompletionDate: '2026-10-08T00:00:00Z',
    lastCheckinAt: '2026-09-27T18:00:00Z',
    dailyStreak: 3,
    checkedInToday: true,
    status: 'quase_pronto',
    userNotes: 'Feedback inicial dos 4 clientes da lista de espera foi excelente. Estão dispostos a pagar R$ 380/mês.',
  },
  {
    id: 'proj-personal-eu-compliance',
    opportunityId: 'opp-001',
    title: 'AuditFlow AI — EU AI Act Compliance Engine',
    tagline: 'Auditoria contínua de conformidade com a regulamentação europeia de IA para scale-ups de tecnologia.',
    category: 'RegTech & Compliance',
    score: 98,
    financialMetrics: {
      estimatedMonthlyProfit: 'R$ 45.000 - R$ 110.000 / mês ($9,000 - $22,000)',
      profitMargin: '85%',
      averageTicket: 'R$ 1.450 / mês ($290/mo)',
      annualProjection: 'R$ 800.000+ ARR',
    },
    speedMetrics: {
      mvpDays: 21,
      firstSaleDays: 30,
      weeklyDedicationHours: '16h / semana',
      speedRating: 'Moderado (3-4 sem)',
    },
    investmentMetrics: {
      initialCapitalEstimated: 'R$ 450 ($90 USD)',
      capitalBreakdown: [
        { item: 'Domínio .eu e .com', cost: 'R$ 120 / ano' },
        { item: 'Supabase Database Pro Tier (Free no início)', cost: 'R$ 0' },
        { item: 'Consultoria de validação com especialista de dados EU', cost: 'R$ 330' },
      ],
    },
    tasks: [
      {
        id: 't-eu-1',
        phaseId: 1,
        phaseName: 'Fase 1: Mapeamento de Requisitos EU AI Act',
        title: 'Compilar checklist de 42 artigos de alto risco da diretiva europeia',
        howToExecute: 'Baixar texto oficial consolidado do parlamento europeu e estruturar JSON de regras.',
        deliverable: 'Tabela de conformidade com 42 checagens automáticas e manuais.',
        recommendedDay: 'Dias 1 a 4',
        completed: true,
        completedAt: '2026-09-25T11:00:00Z',
      },
      {
        id: 't-eu-2',
        phaseId: 1,
        phaseName: 'Fase 1: Mapeamento de Requisitos EU AI Act',
        title: 'Criar Landing Page direcionada a CTOs de empresas SaaS da Alemanha e França',
        howToExecute: 'Campanha de Cold Outreach e anúncios focados na data limite de conformidade de 2026.',
        deliverable: '18 reuniões agendadas com lideranças técnicas de tech companies europeias.',
        recommendedDay: 'Dias 5 a 8',
        completed: true,
        completedAt: '2026-09-26T16:00:00Z',
      },
      {
        id: 't-eu-3',
        phaseId: 2,
        phaseName: 'Fase 2: Motor de Varredura de Repositórios & LLMs',
        title: 'Criar CLI/GitHub Action que escaneia prompts e modelos em busca de dados sensíveis',
        howToExecute: 'Parser AST em TypeScript que detecta chamadas a OpenAI/Anthropic e verifica logs de consentimento.',
        deliverable: 'Script testado no repositório de teste acusando violações comuns.',
        recommendedDay: 'Dias 9 a 14',
        completed: false,
      },
      {
        id: 't-eu-4',
        phaseId: 2,
        phaseName: 'Fase 2: Motor de Varredura de Repositórios & LLMs',
        title: 'Gerador automático de Relatório de Risco em PDF para envio aos reguladores',
        howToExecute: 'Template PDF via React-PDF com carimbo de integridade SHA-256.',
        deliverable: 'PDF gerado pronto para submissão à autoridade nacional de proteção de dados.',
        recommendedDay: 'Dias 15 a 17',
        completed: false,
      },
      {
        id: 't-eu-5',
        phaseId: 3,
        phaseName: 'Fase 3: Contratação Piloto',
        title: 'Fechar 3 contratos piloto anuais de € 3.500 cada',
        howToExecute: 'Apresentar relatório da auditoria gratuita da base de código deles com plano de correção.',
        deliverable: 'Primeiros € 10.500 em contratos anuais assinados.',
        recommendedDay: 'Dias 18 a 21',
        completed: false,
      },
    ],
    progressPercent: 40,
    startedAt: '2026-09-22T00:00:00Z',
    targetCompletionDate: '2026-10-15T00:00:00Z',
    lastCheckinAt: '2026-09-26T16:00:00Z',
    dailyStreak: 0,
    checkedInToday: false,
    status: 'em_andamento',
    userNotes: 'Você definiu que ia terminar o escaneador essa semana! Não deixe o projeto estagnar.',
  },
];

interface PersistentState {
  opportunities: Opportunity[];
  personalProjects: PersonalProject[];
  hypotheses: any[];
  alerts: any[];
  news: any[];
}

class DatabaseManager {
  private pool: pg.Pool | null = null;
  private engine: DbEngineType = 'local_persistent';
  private providerName = 'Local Persistent Engine (Zero-Cost)';
  private persistentStorePath: string;
  private inMemoryCache: PersistentState;
  private isInitialized = false;

  constructor() {
    // Choose writable directory for storage
    const isVercel = Boolean(process.env.VERCEL);
    const storeDir = isVercel
      ? '/tmp'
      : path.join(process.cwd(), 'server', 'data');

    try {
      if (!fs.existsSync(storeDir)) {
        fs.mkdirSync(storeDir, { recursive: true });
      }
    } catch (e) {
      // fallback
    }

    this.persistentStorePath = path.join(storeDir, 'radar_data_store.json');

    // Initialize with default state
    this.inMemoryCache = {
      opportunities: [...MOCK_OPPORTUNITIES],
      personalProjects: [...DEFAULT_PERSONAL_PROJECTS],
      hypotheses: [...MOCK_HYPOTHESES],
      alerts: [...MOCK_ALERTS],
      news: [...MOCK_MARKET_NEWS],
    };

    // Load from disk if exists
    this.loadFromDisk();

    // Check Postgres connection if DATABASE_URL is provided
    this.setupDatabaseEngine();
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(this.persistentStorePath)) {
        const raw = fs.readFileSync(this.persistentStorePath, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed) {
          if (Array.isArray(parsed.opportunities) && parsed.opportunities.length > 0) {
            this.inMemoryCache.opportunities = parsed.opportunities;
          }
          if (Array.isArray(parsed.personalProjects) && parsed.personalProjects.length > 0) {
            this.inMemoryCache.personalProjects = parsed.personalProjects;
          }
          if (Array.isArray(parsed.hypotheses) && parsed.hypotheses.length > 0) {
            this.inMemoryCache.hypotheses = parsed.hypotheses;
          }
          if (Array.isArray(parsed.alerts) && parsed.alerts.length > 0) {
            this.inMemoryCache.alerts = parsed.alerts;
          }
          if (Array.isArray(parsed.news) && parsed.news.length > 0) {
            this.inMemoryCache.news = parsed.news;
          }
        }
      } else {
        // Save initial seed to disk
        this.saveToDisk();
      }
    } catch (err) {
      console.warn('[DbManager] Falha ao ler cache do disco, usando estado padrão:', (err as Error).message);
    }
  }

  private saveToDisk() {
    try {
      fs.writeFileSync(this.persistentStorePath, JSON.stringify(this.inMemoryCache, null, 2), 'utf8');
    } catch (err) {
      console.warn('[DbManager] Falha ao gravar cache no disco:', (err as Error).message);
    }
  }

  private async setupDatabaseEngine() {
    const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

    if (dbUrl) {
      try {
        const isSupabase = dbUrl.includes('supabase.co');
        const isNeon = dbUrl.includes('neon.tech');

        this.pool = new Pool({
          connectionString: dbUrl,
          ssl: { rejectUnauthorized: false },
          max: 6, // Serverless polite pool size
          connectionTimeoutMillis: 5000,
          idleTimeoutMillis: 10000,
        });

        // Test connection
        const client = await this.pool.connect();
        try {
          await client.query('SELECT 1');
          this.engine = isSupabase ? 'supabase' : isNeon ? 'postgres' : 'postgres';
          this.providerName = isSupabase
            ? 'Supabase PostgreSQL (Cloud Free Tier)'
            : isNeon
            ? 'Neon Serverless PostgreSQL (Cloud Free Tier)'
            : 'PostgreSQL Database';
          console.log(`[DbManager] Conectado com sucesso ao backend: ${this.providerName}`);
          
          // Auto-migrate tables
          await this.initPostgresTables(client);
        } finally {
          client.release();
        }
      } catch (err) {
        console.warn(`[DbManager] Falha ao conectar ao PostgreSQL (${(err as Error).message}). Ativando Engine de Persistência Local Segura.`);
        this.pool = null;
        this.engine = 'local_persistent';
        this.providerName = 'Local Persistent Engine (Zero-Cost Storage)';
      }
    } else {
      this.engine = 'local_persistent';
      this.providerName = 'Local Persistent Engine (Zero-Cost Storage)';
    }

    this.isInitialized = true;
  }

  private async initPostgresTables(client: pg.PoolClient) {
    try {
      // 1. Personal Projects Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS personal_projects (
          id VARCHAR(64) PRIMARY KEY,
          opportunity_id VARCHAR(64) NOT NULL,
          title VARCHAR(255) NOT NULL,
          tagline TEXT NOT NULL,
          category VARCHAR(64) NOT NULL,
          score INTEGER NOT NULL,
          financial_metrics JSONB NOT NULL DEFAULT '{}',
          speed_metrics JSONB NOT NULL DEFAULT '{}',
          investment_metrics JSONB NOT NULL DEFAULT '{}',
          tasks JSONB NOT NULL DEFAULT '[]',
          progress_percent INTEGER NOT NULL DEFAULT 0,
          started_at VARCHAR(64) NOT NULL,
          target_completion_date VARCHAR(64) NOT NULL,
          last_checkin_at VARCHAR(64) NOT NULL,
          daily_streak INTEGER NOT NULL DEFAULT 0,
          checked_in_today BOOLEAN NOT NULL DEFAULT false,
          status VARCHAR(32) NOT NULL DEFAULT 'em_andamento',
          user_notes TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      // 2. Hypotheses Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS hypotheses (
          id VARCHAR(64) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          opportunity_ref_id VARCHAR(64),
          status VARCHAR(32) NOT NULL DEFAULT 'Backlog',
          hypothesis_text TEXT NOT NULL,
          success_metric TEXT NOT NULL,
          confidence_score INTEGER NOT NULL DEFAULT 80,
          notes TEXT,
          created_at DATE NOT NULL DEFAULT CURRENT_DATE
        );
      `);

      // 3. User Alerts Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS user_alerts (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          query_keywords TEXT NOT NULL,
          min_score INTEGER NOT NULL DEFAULT 80,
          channels TEXT[] NOT NULL DEFAULT '{"In-App"}',
          frequency VARCHAR(32) NOT NULL DEFAULT 'Tempo Real',
          is_active BOOLEAN NOT NULL DEFAULT true,
          triggers_count INTEGER NOT NULL DEFAULT 0,
          last_triggered VARCHAR(64),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      // 4. Check if personal_projects has data; if not, seed
      const checkProjects = await client.query('SELECT COUNT(*) FROM personal_projects');
      if (parseInt(checkProjects.rows[0].count, 10) === 0) {
        for (const proj of this.inMemoryCache.personalProjects) {
          await client.query(
            `INSERT INTO personal_projects (
              id, opportunity_id, title, tagline, category, score,
              financial_metrics, speed_metrics, investment_metrics,
              tasks, progress_percent, started_at, target_completion_date,
              last_checkin_at, daily_streak, checked_in_today, status, user_notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            ON CONFLICT (id) DO NOTHING`,
            [
              proj.id,
              proj.opportunityId,
              proj.title,
              proj.tagline,
              proj.category,
              proj.score,
              JSON.stringify(proj.financialMetrics),
              JSON.stringify(proj.speedMetrics),
              JSON.stringify(proj.investmentMetrics),
              JSON.stringify(proj.tasks),
              proj.progressPercent,
              proj.startedAt,
              proj.targetCompletionDate,
              proj.lastCheckinAt,
              proj.dailyStreak,
              proj.checkedInToday,
              proj.status,
              proj.userNotes || '',
            ]
          );
        }
      }
    } catch (e) {
      console.warn('[DbManager] Erro ao sincronizar tabelas no PostgreSQL:', (e as Error).message);
    }
  }

  // ====================================================================
  // TELEMETRY & STATUS
  // ====================================================================
  async getDbStatus(): Promise<DbStatusResponse> {
    return {
      connected: true,
      engine: this.engine,
      provider: this.providerName,
      isProduction: process.env.NODE_ENV === 'production',
      counts: {
        opportunities: this.inMemoryCache.opportunities.length,
        personalProjects: this.inMemoryCache.personalProjects.length,
        hypotheses: this.inMemoryCache.hypotheses.length,
        alerts: this.inMemoryCache.alerts.length,
        news: this.inMemoryCache.news.length,
      },
      details: {
        persistenceLocation: this.pool ? 'PostgreSQL Cloud Database' : this.persistentStorePath,
        connectionType: this.pool ? 'PostgreSQL Connection Pool (SSL Enabled)' : 'Atomic JSON Persistence Engine',
        isFreeTierReady: true,
      },
      setupGuide: {
        supabaseInstructions: '1. Crie uma conta gratuita em supabase.com\n2. Crie um projeto\n3. Copie a Connection String (URI)\n4. Adicione na Vercel como DATABASE_URL',
        neonInstructions: '1. Crie uma conta gratuita em neon.tech\n2. Crie um banco PostgreSQL serverless\n3. Adicione a Connection String na Vercel como DATABASE_URL',
        docUrl: 'https://github.com/Ryan-voltz/opportunity-radar#configuração-do-backend-gratuito',
      },
    };
  }

  // ====================================================================
  // OPPORTUNITIES REPOSITORY
  // ====================================================================
  async getOpportunities(filters?: {
    search?: string;
    country?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: Opportunity[]; total: number; limit: number; offset: number }> {
    let result = [...this.inMemoryCache.opportunities];

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (o) =>
          o.title.toLowerCase().includes(q) ||
          o.whatDetected.toLowerCase().includes(q) ||
          o.problemExists.toLowerCase().includes(q) ||
          o.tagline.toLowerCase().includes(q)
      );
    }

    if (filters?.country && filters.country !== 'all') {
      result = result.filter((o) => o.market?.originCode === filters.country);
    }

    if (filters?.category && filters.category !== 'all') {
      result = result.filter((o) => o.category === filters.category);
    }

    const limit = filters?.limit ? Math.min(100, Math.max(1, filters.limit)) : 50;
    const offset = filters?.offset ? Math.max(0, filters.offset) : 0;

    return {
      data: result.slice(offset, offset + limit),
      total: result.length,
      limit,
      offset,
    };
  }

  async getOpportunityById(id: string): Promise<Opportunity | null> {
    const opp = this.inMemoryCache.opportunities.find((o) => o.id === id);
    return opp || null;
  }

  async createOpportunity(opp: Opportunity): Promise<Opportunity> {
    this.inMemoryCache.opportunities.unshift(opp);
    this.saveToDisk();
    return opp;
  }

  async updateOpportunity(id: string, updates: Partial<Opportunity>): Promise<Opportunity | null> {
    const index = this.inMemoryCache.opportunities.findIndex((o) => o.id === id);
    if (index === -1) return null;

    this.inMemoryCache.opportunities[index] = {
      ...this.inMemoryCache.opportunities[index],
      ...updates,
    };
    this.saveToDisk();
    return this.inMemoryCache.opportunities[index];
  }

  // ====================================================================
  // PERSONAL PROJECTS REPOSITORY (My Lab & AI Daily Coach)
  // ====================================================================
  async getPersonalProjects(): Promise<PersonalProject[]> {
    if (this.pool) {
      try {
        const res = await this.pool.query('SELECT * FROM personal_projects ORDER BY updated_at DESC');
        if (res.rows.length > 0) {
          return res.rows.map((r) => ({
            id: r.id,
            opportunityId: r.opportunity_id,
            title: r.title,
            tagline: r.tagline,
            category: r.category,
            score: r.score,
            financialMetrics: r.financial_metrics,
            speedMetrics: r.speed_metrics,
            investmentMetrics: r.investment_metrics,
            tasks: r.tasks,
            progressPercent: r.progress_percent,
            startedAt: r.started_at,
            targetCompletionDate: r.target_completion_date,
            lastCheckinAt: r.last_checkin_at,
            dailyStreak: r.daily_streak,
            checkedInToday: r.checked_in_today,
            status: r.status,
            userNotes: r.user_notes,
          }));
        }
      } catch (err) {
        console.warn('[DbManager] Falha ao consultar personal_projects no Postgres:', (err as Error).message);
      }
    }
    return this.inMemoryCache.personalProjects;
  }

  async savePersonalProject(project: PersonalProject): Promise<PersonalProject> {
    const existingIndex = this.inMemoryCache.personalProjects.findIndex((p) => p.id === project.id);
    if (existingIndex >= 0) {
      this.inMemoryCache.personalProjects[existingIndex] = project;
    } else {
      this.inMemoryCache.personalProjects.unshift(project);
    }

    this.saveToDisk();

    if (this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO personal_projects (
            id, opportunity_id, title, tagline, category, score,
            financial_metrics, speed_metrics, investment_metrics,
            tasks, progress_percent, started_at, target_completion_date,
            last_checkin_at, daily_streak, checked_in_today, status, user_notes, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW())
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            tagline = EXCLUDED.tagline,
            tasks = EXCLUDED.tasks,
            progress_percent = EXCLUDED.progress_percent,
            last_checkin_at = EXCLUDED.last_checkin_at,
            daily_streak = EXCLUDED.daily_streak,
            checked_in_today = EXCLUDED.checked_in_today,
            status = EXCLUDED.status,
            user_notes = EXCLUDED.user_notes,
            updated_at = NOW()`,
          [
            project.id,
            project.opportunityId,
            project.title,
            project.tagline,
            project.category,
            project.score,
            JSON.stringify(project.financialMetrics),
            JSON.stringify(project.speedMetrics),
            JSON.stringify(project.investmentMetrics),
            JSON.stringify(project.tasks),
            project.progressPercent,
            project.startedAt,
            project.targetCompletionDate,
            project.lastCheckinAt,
            project.dailyStreak,
            project.checkedInToday,
            project.status,
            project.userNotes || '',
          ]
        );
      } catch (err) {
        console.warn('[DbManager] Falha ao persistir no Postgres:', (err as Error).message);
      }
    }

    return project;
  }

  async updatePersonalProject(id: string, updates: Partial<PersonalProject>): Promise<PersonalProject | null> {
    const project = this.inMemoryCache.personalProjects.find((p) => p.id === id);
    if (!project) return null;

    Object.assign(project, updates);

    // Recalculate progress if tasks changed
    if (updates.tasks) {
      const completedCount = project.tasks.filter((t) => t.completed).length;
      project.progressPercent = project.tasks.length > 0 ? Math.round((completedCount / project.tasks.length) * 100) : 0;
      if (project.progressPercent === 100) {
        project.status = 'lancado';
      } else if (project.progressPercent >= 70) {
        project.status = 'quase_pronto';
      } else {
        project.status = 'em_andamento';
      }
    }

    return this.savePersonalProject(project);
  }

  async updateProjectTask(projectId: string, taskId: string, completed: boolean): Promise<PersonalProject | null> {
    const project = this.inMemoryCache.personalProjects.find((p) => p.id === projectId);
    if (!project) return null;

    const task = project.tasks.find((t) => t.id === taskId);
    if (!task) return null;

    task.completed = completed;
    task.completedAt = completed ? new Date().toISOString() : undefined;

    const completedCount = project.tasks.filter((t) => t.completed).length;
    project.progressPercent = project.tasks.length > 0 ? Math.round((completedCount / project.tasks.length) * 100) : 0;

    if (project.progressPercent === 100) {
      project.status = 'lancado';
    } else if (project.progressPercent >= 70) {
      project.status = 'quase_pronto';
    } else {
      project.status = 'em_andamento';
    }

    return this.savePersonalProject(project);
  }

  async deletePersonalProject(id: string): Promise<boolean> {
    const initialLen = this.inMemoryCache.personalProjects.length;
    this.inMemoryCache.personalProjects = this.inMemoryCache.personalProjects.filter((p) => p.id !== id);

    if (this.inMemoryCache.personalProjects.length !== initialLen) {
      this.saveToDisk();

      if (this.pool) {
        try {
          await this.pool.query('DELETE FROM personal_projects WHERE id = $1', [id]);
        } catch (e) {
          console.warn('[DbManager] Falha ao deletar no Postgres:', (e as Error).message);
        }
      }
      return true;
    }
    return false;
  }

  // ====================================================================
  // HYPOTHESES REPOSITORY
  // ====================================================================
  async getHypotheses(): Promise<any[]> {
    return this.inMemoryCache.hypotheses;
  }

  async createHypothesis(hyp: any): Promise<any> {
    this.inMemoryCache.hypotheses.unshift(hyp);
    this.saveToDisk();

    if (this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO hypotheses (id, title, opportunity_ref_id, status, hypothesis_text, success_metric, confidence_score, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (id) DO NOTHING`,
          [
            hyp.id,
            hyp.title,
            hyp.opportunityRefId || null,
            hyp.status || 'Backlog',
            hyp.hypothesisText || '',
            hyp.successMetric || '',
            hyp.confidenceScore || 80,
            hyp.notes || '',
          ]
        );
      } catch (e) {
        console.warn('[DbManager] Erro ao salvar hipótese no Postgres:', (e as Error).message);
      }
    }

    return hyp;
  }

  async updateHypothesis(id: string, updates: any): Promise<any | null> {
    const item = this.inMemoryCache.hypotheses.find((h) => h.id === id);
    if (!item) return null;

    Object.assign(item, updates);
    this.saveToDisk();
    return item;
  }

  async deleteHypothesis(id: string): Promise<boolean> {
    const len = this.inMemoryCache.hypotheses.length;
    this.inMemoryCache.hypotheses = this.inMemoryCache.hypotheses.filter((h) => h.id !== id);
    if (this.inMemoryCache.hypotheses.length !== len) {
      this.saveToDisk();
      return true;
    }
    return false;
  }

  // ====================================================================
  // ALERTS REPOSITORY
  // ====================================================================
  async getAlerts(): Promise<any[]> {
    return this.inMemoryCache.alerts;
  }

  async createAlert(alert: any): Promise<any> {
    this.inMemoryCache.alerts.unshift(alert);
    this.saveToDisk();

    if (this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO user_alerts (id, name, query_keywords, min_score, channels, frequency, is_active, triggers_count, last_triggered)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO NOTHING`,
          [
            alert.id,
            alert.name,
            alert.queryOrKeywords || 'SaaS',
            alert.minScore || 85,
            alert.channels || ['In-App'],
            alert.frequency || 'Tempo Real',
            alert.isActive !== false,
            alert.triggersCount || 0,
            alert.lastTriggered || 'Recém criado',
          ]
        );
      } catch (e) {
        console.warn('[DbManager] Erro ao salvar alerta no Postgres:', (e as Error).message);
      }
    }

    return alert;
  }

  async toggleAlert(id: string): Promise<any | null> {
    const alert = this.inMemoryCache.alerts.find((a) => a.id === id);
    if (!alert) return null;

    alert.isActive = !alert.isActive;
    this.saveToDisk();

    if (this.pool) {
      try {
        await this.pool.query('UPDATE user_alerts SET is_active = $1 WHERE id = $2', [alert.isActive, id]);
      } catch (e) {
        // ignore
      }
    }

    return alert;
  }

  async deleteAlert(id: string): Promise<boolean> {
    const len = this.inMemoryCache.alerts.length;
    this.inMemoryCache.alerts = this.inMemoryCache.alerts.filter((a) => a.id !== id);
    if (this.inMemoryCache.alerts.length !== len) {
      this.saveToDisk();
      return true;
    }
    return false;
  }

  // ====================================================================
  // NEWS REPOSITORY
  // ====================================================================
  async getNews(filters?: {
    search?: string;
    category?: string;
    country?: string;
    interest?: string;
    onlyWithHypotheses?: boolean;
  }): Promise<{ data: any[]; total: number; trendingCount: number }> {
    let result = [...this.inMemoryCache.news];

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.summary.toLowerCase().includes(q) ||
          n.source.toLowerCase().includes(q) ||
          (n.tags && n.tags.some((t: string) => t.toLowerCase().includes(q)))
      );
    }

    if (filters?.category && filters.category !== 'all') {
      result = result.filter((n) => n.category.toLowerCase() === filters.category!.toLowerCase());
    }

    if (filters?.country && filters.country !== 'all') {
      result = result.filter((n) => n.countryCode.toLowerCase() === filters.country!.toLowerCase());
    }

    if (filters?.interest && filters.interest.trim()) {
      const interests = filters.interest.toLowerCase().split(',');
      result = result.filter(
        (n) =>
          interests.includes(n.category.toLowerCase()) ||
          (n.tags && n.tags.some((t: string) => interests.includes(t.toLowerCase())))
      );
    }

    if (filters?.onlyWithHypotheses) {
      result = result.filter((n) => n.possibleOpportunities && n.possibleOpportunities.length > 0);
    }

    return {
      data: result,
      total: result.length,
      trendingCount: result.filter((n) => n.isTrending).length,
    };
  }

  async getNewsById(id: string): Promise<any | null> {
    const item = this.inMemoryCache.news.find((n) => n.id === id);
    return item || null;
  }

  async toggleNewsSaved(id: string): Promise<boolean | null> {
    const item = this.inMemoryCache.news.find((n) => n.id === id);
    if (!item) return null;

    item.isSaved = !item.isSaved;
    this.saveToDisk();
    return item.isSaved;
  }

  async createProjectFromNewsHypothesis(newsId: string, hypothesisId: string): Promise<any | null> {
    const newsItem = this.inMemoryCache.news.find((n) => n.id === newsId);
    if (!newsItem) return null;

    const hypothesis = newsItem.possibleOpportunities?.find((h: any) => h.id === hypothesisId);
    if (!hypothesis) return null;

    hypothesis.status = 'Promovido a Projeto';

    const newProject = {
      id: `proj-hyp-${Date.now().toString().slice(-4)}`,
      title: hypothesis.title.replace(/^Hipótese:\s*/i, ''),
      opportunityRefId: newsItem.id,
      status: 'Pesquisando',
      hypothesisText: `${hypothesis.description} (Inspirado em: "${newsItem.title}")`,
      successMetric: `Validar MVP com 20 clientes do público: ${hypothesis.targetAudience}`,
      confidenceScore: hypothesis.confidenceScore,
      notes: `Monetização esperada: ${hypothesis.monetizationModel}. Esforço estimado: ${hypothesis.estimatedEffort}. Fonte original: ${newsItem.source}.`,
      createdAt: new Date().toISOString().split('T')[0],
    };

    await this.createHypothesis(newProject);
    return { project: newProject, hypothesis };
  }
}

export const dbClient = new DatabaseManager();
