import { Opportunity, PersonalProject, ProjectTaskItem, AiCoachAlert } from '../types';
import { ApiClient } from './apiClient';

const STORAGE_KEY = 'opportunity_radar_personal_projects';
const STREAK_KEY = 'opportunity_radar_daily_streak';

export class PersonalProjectService {
  /**
   * Sync personal projects from cloud backend into localStorage
   */
  static async syncWithBackend(): Promise<void> {
    try {
      const remote = await ApiClient.getPersonalProjects();
      if (remote && Array.isArray(remote) && remote.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
        window.dispatchEvent(new CustomEvent('personal_projects_updated', { detail: remote }));
      }
    } catch {
      // Graceful offline fallback
    }
  }

  /**
   * Get all user-tracked personal projects
   */
  static getProjects(): PersonalProject[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse personal projects from localStorage', e);
    }

    // Default seeded projects for initial realistic experience if empty
    const initialProjects = this.getDefaultSeededProjects();
    this.saveProjects(initialProjects);
    return initialProjects;
  }

  /**
   * Save projects array to localStorage
   */
  static saveProjects(projects: PersonalProject[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
      window.dispatchEvent(new CustomEvent('personal_projects_updated', { detail: projects }));
    } catch (e) {
      console.error('Failed to save personal projects to localStorage', e);
    }
  }

  /**
   * Convert an Opportunity into a tracked Personal Project
   */
  static createProjectFromOpportunity(opportunity: Opportunity): PersonalProject {
    const existing = this.getProjects();
    const alreadySaved = existing.find((p) => p.opportunityId === opportunity.id);
    if (alreadySaved) return alreadySaved;

    // Convert execution playbook to interactive tasks
    const tasks: ProjectTaskItem[] = [];
    if (opportunity.executionPlaybook && opportunity.executionPlaybook.length > 0) {
      for (const phase of opportunity.executionPlaybook) {
        for (const item of phase.actionItems) {
          tasks.push({
            id: `task-${phase.phase}-${item.id}`,
            phaseId: phase.phase,
            phaseName: phase.name,
            title: item.title,
            howToExecute: item.howToExecute,
            deliverable: item.deliverable,
            recommendedDay: item.recommendedDay,
            completed: false,
          });
        }
      }
    } else {
      // Default 4-phase agile playbook
      tasks.push(
        {
          id: `task-1-validate`,
          phaseId: 1,
          phaseName: 'Fase 1: Validação de Demanda & Pré-Venda',
          title: 'Mapear 20 potenciais clientes e conduzir entrevistas de dor',
          howToExecute: 'Entrar em contato via LinkedIn, Twitter ou subreddits perguntando como resolvem o problema hoje.',
          deliverable: 'Planilha com 15 feedbacks e confirmação de intenção de compra.',
          recommendedDay: 'Dias 1 a 3',
          completed: false,
        },
        {
          id: `task-1-landing`,
          phaseId: 1,
          phaseName: 'Fase 1: Validação de Demanda & Pré-Venda',
          title: 'Publicar Landing Page de Validação com Captura de Pré-Venda',
          howToExecute: 'Usar Carrd ou Framer com oferta clara de Early Adopter (50% desconto no plano anual).',
          deliverable: 'Link ativo recebendo visitantes com meta de 20 inscrições qualificadas.',
          recommendedDay: 'Dia 4',
          completed: false,
        },
        {
          id: `task-2-mvp`,
          phaseId: 2,
          phaseName: 'Fase 2: Construção do MVP Enxuto',
          title: 'Desenvolver fluxo essencial da solução (Single Feature Product)',
          howToExecute: 'Focar exclusivamente na dor primária. Zero firulas ou configurações complexas.',
          deliverable: 'Repositório funcional com deploy ativo na Vercel.',
          recommendedDay: 'Dias 5 a 10',
          completed: false,
        },
        {
          id: `task-3-launch`,
          phaseId: 3,
          phaseName: 'Fase 3: Aquisição dos Primeiros 10 Clientes',
          title: 'Entregar acesso aos inscritos e onboarding assistido 1 a 1',
          howToExecute: 'Acompanhar o cliente pela tela na primeira utilização para garantir sucesso imediato.',
          deliverable: '5 a 10 clientes ativos utilizando a ferramenta diariamente.',
          recommendedDay: 'Dias 11 a 16',
          completed: false,
        },
        {
          id: `task-4-monetize`,
          phaseId: 4,
          phaseName: 'Fase 4: Monetização & Escala Recorrente',
          title: 'Ativar checkout oficial e coletar depoimentos em vídeo/texto',
          howToExecute: 'Converter os primeiros usuários em pagantes fixos com checkout Stripe.',
          deliverable: 'Primeiro faturamento recorrente validado e depoimentos na landing page.',
          recommendedDay: 'Dias 17 a 22',
          completed: false,
        }
      );
    }

    const newProject: PersonalProject = {
      id: `proj-${Date.now()}`,
      opportunityId: opportunity.id,
      title: opportunity.title,
      tagline: opportunity.tagline,
      category: opportunity.category,
      score: opportunity.score,
      financialMetrics: {
        estimatedMonthlyProfit: opportunity.financials?.estimatedMonthlyProfit || 'R$ 18.000 - R$ 35.000 / mês',
        profitMargin: opportunity.financials?.profitMargin || '85%',
        averageTicket: opportunity.financials?.averageTicket || 'R$ 149 / mês',
        annualProjection: opportunity.financials?.annualProjection || 'R$ 180.000+ ARR',
      },
      speedMetrics: {
        mvpDays: opportunity.executionSpeed?.mvpDays || opportunity.timeToMvpDays || 14,
        firstSaleDays: opportunity.executionSpeed?.firstSaleDays || 21,
        weeklyDedicationHours: opportunity.executionSpeed?.weeklyDedicationHours || '10 - 15h / semana',
        speedRating: opportunity.executionSpeed?.speedRating || 'Rápido (2 sem)',
      },
      investmentMetrics: {
        initialCapitalEstimated: opportunity.investment?.initialCapitalEstimated || 'R$ 200 - R$ 400 ($50 - $80 USD)',
        capitalBreakdown: opportunity.investment?.capitalBreakdown || [
          { item: 'Domínio personalizado .com / .com.br', cost: 'R$ 40 / ano' },
          { item: 'Hospedagem & Banco (Vercel + Supabase)', cost: 'R$ 0 (Free Tier)' },
          { item: 'APIs & Webhooks (Stripe / AI)', cost: 'R$ 100 (conforme uso)' },
        ],
      },
      tasks,
      progressPercent: 0,
      startedAt: new Date().toISOString(),
      targetCompletionDate: 'Meta: Terminar esta semana',
      lastCheckinAt: new Date().toISOString(),
      dailyStreak: 1,
      checkedInToday: true,
      status: 'em_andamento',
    };

    const updated = [newProject, ...existing];
    this.saveProjects(updated);
    // Background sync with persistent database
    ApiClient.savePersonalProject(newProject).catch(() => {});
    return newProject;
  }

  /**
   * Toggle task completion in a project
   */
  static toggleTask(projectId: string, taskId: string): PersonalProject | null {
    const projects = this.getProjects();
    const project = projects.find((p) => p.id === projectId);
    if (!project) return null;

    const task = project.tasks.find((t) => t.id === taskId);
    if (!task) return null;

    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date().toISOString() : undefined;

    // Recalculate progress percent
    const completedCount = project.tasks.filter((t) => t.completed).length;
    project.progressPercent = Math.round((completedCount / project.tasks.length) * 100);

    // Update status
    if (project.progressPercent === 100) {
      project.status = 'lancado';
    } else if (project.progressPercent >= 70) {
      project.status = 'quase_pronto';
    } else {
      project.status = 'em_andamento';
    }

    project.lastCheckinAt = new Date().toISOString();
    project.checkedInToday = true;

    this.saveProjects(projects);
    // Background sync task update with persistent database
    ApiClient.updateProjectTask(projectId, taskId, task.completed).catch(() => {});
    return project;
  }

  /**
   * Daily check-in action
   */
  static recordDailyCheckin(projectId: string): PersonalProject | null {
    const projects = this.getProjects();
    const project = projects.find((p) => p.id === projectId);
    if (!project) return null;

    project.checkedInToday = true;
    project.dailyStreak = (project.dailyStreak || 0) + 1;
    project.lastCheckinAt = new Date().toISOString();

    this.saveProjects(projects);
    ApiClient.savePersonalProject(project).catch(() => {});
    return project;
  }

  /**
   * Remove project from personal list
   */
  static deleteProject(projectId: string): void {
    const projects = this.getProjects().filter((p) => p.id !== projectId);
    this.saveProjects(projects);
    // Background sync deletion with persistent database
    ApiClient.deletePersonalProject(projectId).catch(() => {});
  }

  /**
   * AI Accountability Engine:
   * Analyzes all saved projects and detects:
   * 1. Stagnant projects (e.g., at 35-50% with other projects ahead or inactive).
   * 2. Focus conflicts ("Você esqueceu desse projeto em que estava em andamento? Você disse que ia terminar essa semana.").
   * 3. Projects close to launch (80%+).
   */
  static generateAiCoachAlerts(projects: PersonalProject[]): AiCoachAlert[] {
    const alerts: AiCoachAlert[] = [];
    if (!projects || projects.length === 0) return alerts;

    // Sort projects by progress descending
    const sorted = [...projects].sort((a, b) => b.progressPercent - a.progressPercent);

    const advancedProject = sorted.find((p) => p.progressPercent >= 65 && p.progressPercent < 100);
    const midStageProject = sorted.find((p) => p.progressPercent >= 20 && p.progressPercent < 60);

    // 1. SPECIFIC SCENARIO REQUESTED BY USER:
    // "Se eu tiver vários projetos para mim e estiver, por exemplo, em metade de um projeto e no outro já estiver quase no final,
    // a inteligência artificial vai me falar: 'opa, você esqueceu desse projeto em que você estava em andamento? Você disse que ia terminar isso essa semana.'"
    if (advancedProject && midStageProject && advancedProject.id !== midStageProject.id) {
      alerts.push({
        id: `coach-alert-conflict-${midStageProject.id}`,
        projectId: midStageProject.id,
        projectTitle: midStageProject.title,
        type: 'focus_conflict',
        severity: 'urgent',
        headline: `Opa, você esqueceu do projeto "${midStageProject.title}"?`,
        message: `Você está na metade deste projeto (${midStageProject.progressPercent}% concluído) e definiu que ia terminar essa semana! Enquanto seu outro projeto "${advancedProject.title}" já está na reta final (${advancedProject.progressPercent}%), não deixe este aqui estagnado.`,
        recommendedAction: `Complete o próximo checkpoint de hoje: "${midStageProject.tasks.find((t) => !t.completed)?.title || 'Avançar na fase atual'}"`,
        actionButtonText: 'Retomar Checklist Diário',
        progressPercent: midStageProject.progressPercent,
      });
    } else if (midStageProject) {
      // Single project in mid stage warning
      alerts.push({
        id: `coach-alert-stagnation-${midStageProject.id}`,
        projectId: midStageProject.id,
        projectTitle: midStageProject.title,
        type: 'stagnation_warning',
        severity: 'warning',
        headline: `Atenção ao prazo: "${midStageProject.title}"`,
        message: `Você está com ${midStageProject.progressPercent}% de progresso. Lembre-se que seu objetivo era colocar o MVP no ar em ${midStageProject.speedMetrics.mvpDays} dias. Mantenha o ritmo para não perder o timing de mercado!`,
        recommendedAction: `Execute a etapa pendente: "${midStageProject.tasks.find((t) => !t.completed)?.title || 'Check-in diário'}"`,
        actionButtonText: 'Executar Próxima Tarefa',
        progressPercent: midStageProject.progressPercent,
      });
    }

    // 2. Launch Ready Alert
    if (advancedProject) {
      alerts.push({
        id: `coach-alert-launch-${advancedProject.id}`,
        projectId: advancedProject.id,
        projectTitle: advancedProject.title,
        type: 'launch_ready',
        severity: 'kudos',
        headline: `🚀 Reta Final: "${advancedProject.title}" está em ${advancedProject.progressPercent}%!`,
        message: `Falta muito pouco para lançar seu produto e gerar os primeiros dólares! Finalize os últimos itens do checklist para abrir o checkout e captar clientes pagantes.`,
        recommendedAction: 'Finalizar últimos testes e disparar e-mails de lançamento.',
        actionButtonText: 'Ver Reta Final',
        progressPercent: advancedProject.progressPercent,
      });
    }

    return alerts;
  }

  /**
   * Seeded default projects for instant realistic display
   */
  private static getDefaultSeededProjects(): PersonalProject[] {
    return [
      {
        id: 'proj-whatsapp-ai',
        opportunityId: 'opp-03',
        title: 'Auditoria de Chamadas e Conformidade Comercial com IA para Vendas B2B',
        tagline: 'Alternativa enxuta e self-service ao Gong para equipes comerciais que não podem pagar contratos de $15.000.',
        category: 'AI Agent / Tool',
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
            howToExecute: 'Prompt estruturado retornando: Dores citadas, objeção de preço, e nota de 0 a 10.',
            deliverable: 'Resumo executivo enviado por e-mail 3 minutos após o término da reunião.',
            recommendedDay: 'Dias 9 a 12',
            completed: true,
            completedAt: '2026-09-27T16:00:00Z',
          },
          {
            id: 't-gong-5',
            phaseId: 3,
            phaseName: 'Fase 3: Lançamento & Primeiros Clientes',
            title: 'Onboarding com os 4 clientes da carta de intenção',
            howToExecute: 'Acompanhar a primeira reunião comercial ao vivo e validar se o relatório foi útil.',
            deliverable: '4 contas ativas e gerando dados diários.',
            recommendedDay: 'Dias 13 a 16',
            completed: false,
          },
          {
            id: 't-gong-6',
            phaseId: 4,
            phaseName: 'Fase 4: Monetização Recorrente',
            title: 'Ativação do Checkout Stripe de US$ 79/mês por vendedor',
            howToExecute: 'Cobrança automatizada no cartão de crédito corporativo.',
            deliverable: 'US$ 1.580 MRR atingidos.',
            recommendedDay: 'Dias 17 a 20',
            completed: false,
          },
        ],
        progressPercent: 80,
        startedAt: '2026-09-24T00:00:00Z',
        targetCompletionDate: 'Meta: Lançar nos próximos 2 dias',
        lastCheckinAt: '2026-09-27T16:00:00Z',
        dailyStreak: 4,
        checkedInToday: true,
        status: 'quase_pronto',
      },
      {
        id: 'proj-nfe-stripe',
        opportunityId: 'opp-01',
        title: 'Gateway Fiscal e Faturamento Automático para Creators e SaaS',
        tagline: 'Infraestrutura de emissão de NF-e e checkout multi-moeda sem a complexidade de ERPs legados.',
        category: 'Micro-SaaS',
        score: 96,
        financialMetrics: {
          estimatedMonthlyProfit: 'R$ 22.000 - R$ 52.000 / mês',
          profitMargin: '84%',
          averageTicket: 'R$ 199 / mês',
          annualProjection: 'R$ 280.000+ ARR',
        },
        speedMetrics: {
          mvpDays: 10,
          firstSaleDays: 16,
          weeklyDedicationHours: '12h / semana',
          speedRating: 'Rápido (2 sem)',
        },
        investmentMetrics: {
          initialCapitalEstimated: 'R$ 180 ($35 USD)',
          capitalBreakdown: [
            { item: 'Domínio .com.br', cost: 'R$ 40 / ano' },
            { item: 'Hospedagem e Banco', cost: 'R$ 0 (Free)' },
            { item: 'Ambiente de testes prefeitura / Focus NFe', cost: 'R$ 50' },
          ],
        },
        tasks: [
          {
            id: 't-nfe-1',
            phaseId: 1,
            phaseName: 'Fase 1: Validação & Pré-Venda',
            title: 'Mapear 30 fundadores no Twitter/LinkedIn reclamando de emissão de NF-e',
            howToExecute: 'Coletar queixas reais de fundadores usando Stripe ou Paddle no Brasil.',
            deliverable: 'Planilha com 30 contatos e 8 respostas positivas imediatas.',
            recommendedDay: 'Dia 1',
            completed: true,
            completedAt: '2026-09-24T18:00:00Z',
          },
          {
            id: 't-nfe-2',
            phaseId: 1,
            phaseName: 'Fase 1: Validação & Pré-Venda',
            title: 'Criar Landing Page de Validação no Framer com botão de Pré-Venda R$ 99',
            howToExecute: 'Apresentar a proposta de conectar o Stripe e emitir NF-e com 1 clique.',
            deliverable: 'URL ativa e 6 pré-vendas garantidas com pagamento.',
            recommendedDay: 'Dia 2',
            completed: true,
            completedAt: '2026-09-25T11:00:00Z',
          },
          {
            id: 't-nfe-3',
            phaseId: 2,
            phaseName: 'Fase 2: Construção do MVP Enxuto',
            title: 'Criar Webhook que escuta charge.succeeded do Stripe e dispara a API da prefeitura',
            howToExecute: 'Endpoint seguro em Node.js com validação de assinatura do Stripe.',
            deliverable: 'NF-e de teste emitida automaticamente em ambiente de homologação.',
            recommendedDay: 'Dias 4 a 7',
            completed: false,
          },
          {
            id: 't-nfe-4',
            phaseId: 2,
            phaseName: 'Fase 2: Construção do MVP Enxuto',
            title: 'Painel simples do cliente para cadastrar Certificado Digital A1',
            howToExecute: 'Upload encriptado com KMS e validação de validade do certificado.',
            deliverable: 'Cliente consegue subir o certificado e selecionar a alíquota municipal.',
            recommendedDay: 'Dias 8 a 10',
            completed: false,
          },
          {
            id: 't-nfe-5',
            phaseId: 3,
            phaseName: 'Fase 3: Aquisição & Primeiros 10 Clientes',
            title: 'Onboarding concierge com os 6 compradores da pré-venda',
            howToExecute: 'Emitir as primeiras 50 notas reais e validar com o contador do cliente.',
            deliverable: 'Depoimentos gravados e clientes 100% satisfeitos sem trabalho manual.',
            recommendedDay: 'Dias 11 a 14',
            completed: false,
          },
        ],
        progressPercent: 40,
        startedAt: '2026-09-23T00:00:00Z',
        targetCompletionDate: 'Meta: Terminar esta semana',
        lastCheckinAt: '2026-09-25T11:00:00Z',
        dailyStreak: 2,
        checkedInToday: false,
        status: 'em_andamento',
      },
    ];
  }
}
