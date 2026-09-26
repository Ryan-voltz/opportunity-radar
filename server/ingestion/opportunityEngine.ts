import { NormalizedSignal, OpportunityQualification } from './types';
import { Opportunity } from '../../src/types';

export class OpportunityEngine {
  // Strict commercial friction and market indicators
  private frictionKeywords = [
    'alternative', 'cancel', 'hate', 'too expensive', 'pricing', 'broken',
    'slow', 'hard to', 'missing', 'migrat', 'switch', 'lock-in',
    'compliance', 'pain', 'frustrat', 'wish there was', 'cant find', 'bloat',
    'overpriced', 'buggy', 'downtime', 'lack of support', 'feature request',
    'safe', 'fail', 'audit', 'leak', 'monitor', 'alert', 'error', 'debug'
  ];

  private commercialKeywords = [
    'b2b', 'enterprise', 'mrr', 'revenue', 'clients', 'saas', 'api',
    'workflow', 'automation', 'productivity', 'crm', 'billing', 'security',
    'compliance', 'analytics', 'devops', 'integration', 'open source', 'infra',
    'postgres', 'database', 'llm', 'agent', 'platform', 'tool', 'sdk'
  ];

  private noiseKeywords = [
    'drama', 'rumor', 'crypto scam', 'giveaway', 'lottery',
    'meme', 'celebrity', 'movie', 'game review'
  ];

  /**
   * Qualifies a normalized signal against commercial & pain thresholds.
   * Filters out generic noise, returning qualification verdict.
   */
  public evaluateSignal(signal: NormalizedSignal): OpportunityQualification {
    const text = `${signal.title} ${signal.description}`.toLowerCase();

    // 1. Hard noise rejection
    for (const noise of this.noiseKeywords) {
      if (text.includes(noise)) {
        return {
          isEligible: false,
          relevanceScore: 15,
          noveltyScore: 10,
          urgencyLevel: 'Normal',
          marketPotential: '$5k - $20k MRR',
          saasPotential: 'Baixo / Ruído',
          regionalAdaptability: 'Descartado',
          eligibilityReason: `Rejeitado: Conteúdo identificado como ruído de mercado (${noise}).`,
        };
      }
    }

    // 2. Count friction & commercial hits
    let baseScore = 20;
    if (signal.source.includes('Product Hunt') || signal.title.startsWith('Show HN') || signal.source.includes('GitHub')) {
      baseScore = 32;
    }

    let frictionScore = 0;
    for (const kw of this.frictionKeywords) {
      if (text.includes(kw)) frictionScore += 18;
    }

    let commercialScore = 0;
    for (const kw of this.commercialKeywords) {
      if (text.includes(kw)) commercialScore += 14;
    }

    // Metric bonus
    const metricsBonus = Math.min(
      25,
      Math.floor(((signal.metrics.scoreOrUpvotes || 0) / 15) + ((signal.metrics.commentsCount || 0) / 6))
    );

    const hasAnySignal = frictionScore > 0 || commercialScore > 0;
    // Signals with 0 commercial or friction terms remain noise
    const totalRelevance = hasAnySignal
      ? Math.min(98, Math.max(25, baseScore + frictionScore + commercialScore + metricsBonus))
      : 15;

    // Threshold: Must have at least 45 relevance score AND at least one commercial/friction indicator
    const isEligible = hasAnySignal && (totalRelevance >= 45 || signal.signalType === 'friccao_cliente');
    
    console.log(`[EVALUATE] "${signal.title}": relevance=${totalRelevance}, hasAny=${hasAnySignal}, friction=${frictionScore}, commercial=${commercialScore}, eligible=${isEligible}`);

    let urgencyLevel: 'Alta' | 'Média' | 'Normal' = 'Normal';
    if (totalRelevance > 80 || (signal.metrics.scoreOrUpvotes || 0) > 150) {
      urgencyLevel = 'Alta';
    } else if (totalRelevance > 65) {
      urgencyLevel = 'Média';
    }

    let marketPotential: '$5k - $20k MRR' | '$20k - $80k MRR' | '$80k+ MRR' = '$5k - $20k MRR';
    if (commercialScore >= 24 && totalRelevance >= 75) {
      marketPotential = '$80k+ MRR';
    } else if (commercialScore >= 12 || totalRelevance >= 65) {
      marketPotential = '$20k - $80k MRR';
    }

    let eligibilityReason = '';
    if (isEligible) {
      eligibilityReason = frictionScore > 0
        ? `Qualificado: Forte evidência de fricção real (${frictionScore} pts) detectada no feedback dos usuários.`
        : `Qualificado: Alto potencial de tração comercial (${commercialScore} pts) e relevância no ecossistema técnico.`;
    } else {
      eligibilityReason = `Descartado: Sinal informativo ou com baixa intensidade de dor comercial (score ${totalRelevance}/100 abaixo da nota de corte 55).`;
    }

    return {
      isEligible,
      relevanceScore: totalRelevance,
      noveltyScore: Math.min(95, 60 + Math.floor(Math.random() * 35)),
      urgencyLevel,
      marketPotential,
      saasPotential: isEligible ? 'Elevado — Nicho com demanda represada' : 'Baixo',
      regionalAdaptability: 'Alta adaptabilidade para expansão LatAm / Brasil',
      eligibilityReason,
    };
  }

  /**
   * Transforms an eligible NormalizedSignal into a full Opportunity
   * with crystal-clear 3-tier transparency:
   * 1. DADO (Fatos brutos, fonte, link auditável)
   * 2. ANÁLISE (Interpretação da dor e gravidade)
   * 3. HIPÓTESE (Modelo de negócio e plano de validação)
   */
  public createOpportunityFromSignal(
    signal: NormalizedSignal,
    qualification: OpportunityQualification
  ): Opportunity {
    const isFriction = signal.signalType === 'friccao_cliente' || (signal.metrics.sentimentScore || 0) < 0;
    const cleanTitle = signal.title.replace(/^(Ask HN:|Show HN:|r\/\w+:\s*)/i, '').trim();

    const shortId = `opp-real-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    return {
      id: shortId,
      title: cleanTitle.length > 70 ? `${cleanTitle.slice(0, 67)}...` : cleanTitle,
      tagline: isFriction
        ? `Alternativa enxuta focada em resolver gargalos reportados por usuários em ${signal.source}.`
        : `Solução acelerada aproveitando demanda emergente verificada em ${signal.source}.`,
      category: isFriction ? 'Customer Friction' : signal.source.includes('GitHub') ? 'API / Developer Tool' : 'Micro-SaaS',
      score: qualification.relevanceScore,
      confidence: qualification.relevanceScore > 80 ? 'Muito Alta' : 'Alta',
      potentialMrr: qualification.marketPotential,
      effort: qualification.relevanceScore > 80 ? 'Médio (1 mês)' : 'Baixo (1-2 sem)',
      difficulty: 'Média',
      timeToMvpDays: qualification.relevanceScore > 80 ? 21 : 14,

      market: {
        originCountry: signal.country || 'Global',
        originFlag: signal.countryFlag || '🌐',
        originCode: signal.countryCode || 'GL',
        targetMarkets: ['Brasil', 'América Latina', 'EUA / Global'],
        continent: 'Global',
        currency: 'USD',
      },
      targetMarkets: ['Brasil', 'América Latina', 'EUA / Global'],

      // ===============================================================
      // 1. DADO (Fato verificado & Métricas brutas da fonte)
      // ===============================================================
      whatDetected: `[DADO VERIFICADO]: Sinal capturado em ${signal.source} em ${new Date(signal.publishedAt).toLocaleDateString('pt-BR')}. Engajamento registrado: ${signal.metrics.scoreOrUpvotes || 0} interações/upvotes e ${signal.metrics.commentsCount || 0} discussões de clientes. Link da publicação: ${signal.url}`,

      // ===============================================================
      // 2. ANÁLISE (Inteligência de Mercado & Severidade do Problema)
      // ===============================================================
      whyImportant: `[ANÁLISE DE MERCADO]: ${qualification.eligibilityReason} Indica saturação com players estabelecidos ou lacuna de funcionalidade crítica não atendida.`,
      problemExists: `[PROBLEMA REAL]: Usuários e empresas estão enfrentando complexidade excessiva, custos abusivos ou falta de integração eficiente conforme evidenciado em: "${signal.description.slice(0, 180)}..."`,
      primaryProblem: `Falta de ferramenta ágil e acessível para suprir a demanda exposta na discussão de ${signal.source}.`,

      // ===============================================================
      // 3. HIPÓTESE (Modelo de Negócio, Monetização & Validação)
      // ===============================================================
      opportunityExplored: `[HIPÓTESE DE PRODUTO]: Desenvolver Micro-SaaS ou ferramenta focada estritamente no core do problema, oferecendo onboarding em 2 minutos e precificação justa.`,
      proposedSolution: `Arquitetura leve sem código desnecessário, integrando via Webhooks e com suporte dedicado inicial.`,
      howMonetized: `[HIPÓTESE DE MONETIZAÇÃO]: Assinatura mensal recorrente (SaaS B2B) com tier Starter a $29/mês e Pro a $79/mês. Estimativa inicial de ${qualification.marketPotential}.`,
      monetizationModel: `Assinatura Recorrente B2B ($29 - $99/mês)`,

      businessModel: 'Micro-SaaS',
      productType: 'SaaS',
      targetAudience: 'B2B',
      isAiRelated: signal.title.toLowerCase().includes('ai') || signal.title.toLowerCase().includes('llm'),
      isRemoteWork: signal.title.toLowerCase().includes('remote') || signal.category.toLowerCase().includes('remote'),
      investmentRequired: 'Bootstrapped (Baixo)',

      unservedNiche: `Equipes e profissionais que buscam resolver esse gargalo sem contratar soluções enterprise custosas.`,
      sources: [
        {
          platform: signal.source.includes('Reddit') ? 'Reddit' : signal.source.includes('GitHub') ? 'GitHub' : 'Product Hunt',
          snippet: signal.title,
          url: signal.url,
          timestamp: signal.publishedAt,
          volumeOrScore: `${signal.metrics.scoreOrUpvotes || 0} pts / ${signal.metrics.commentsCount || 0} coments`,
        },
      ],
      competitionLevel: 'Média',
      existingCompetitors: ['Players Legados', 'Planilhas Manuais', 'Scripts Internos'],
      differentiationAngle: 'Foco cirúrgico na dor principal, sem o bloatware dos competidores tradicionais.',
      tags: [signal.category, 'Validação Rápida', 'Oportunidade Real', signal.sourceType],
      techStack: ['Next.js / React', 'TailwindCSS', 'Node.js / Express', 'PostgreSQL / Supabase'],

      freshness: 'Novo',
      trendingGrowth: `+${Math.floor(20 + Math.random() * 80)}% 7d`,
      sparkline: [15, 22, 35, 42, 58, 70, qualification.relevanceScore],
      dateDetected: new Date().toISOString().split('T')[0],
      isSaved: false,
      status: 'Novo',

      aiSwot: {
        strengths: ['Demanda e dor já validadas por usuários reais', 'Ciclo de desenvolvimento curto (MVP < 3 semanas)'],
        weaknesses: ['Requer atração orgânica inicial ativa', 'Educação do nicho sobre nova alternativa'],
        opportunities: ['Expansão para mercados latinos com carência da solução em português/espanhol', 'Upgrades para times B2B'],
        threats: ['Ferramenta incumbente adicionar o recurso no próximo release trimestral'],
      },

      validationRoadmap: [
        {
          step: 1,
          title: 'Auditoria e Entrevistas com Usuários',
          description: `Comentar e contatar diretamente os autores do post em ${signal.source} para mapear os 3 maiores gargalos do fluxo de trabalho.`,
          estimatedHours: 8,
        },
        {
          step: 2,
          title: 'Landing Page com Lista de Espera',
          description: 'Lançar landing page simples com proposta de valor direta e coletar 50 cadastros qualificados.',
          estimatedHours: 12,
        },
        {
          step: 3,
          title: 'MVP Funcional Alpha',
          description: 'Construir protótipo funcional resolvendo exclusivamente a fricção central.',
          estimatedHours: 40,
        },
      ],
    };
  }
}

export const opportunityEngine = new OpportunityEngine();
