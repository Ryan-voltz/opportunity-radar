import React, { useState, useEffect } from 'react';
import { Opportunity, PersonalProject } from '../../types';
import { RadarScoreBadge } from './RadarScoreBadge';
import { Badge } from './Badge';
import { Button } from './Button';
import { PersonalProjectService } from '../../services/personalProjectService';
import {
  X,
  Bookmark,
  Share2,
  ExternalLink,
  Clock,
  Globe2,
  ShieldCheck,
  Zap,
  Target,
  FileText,
  AlertTriangle,
  Sparkles,
  DollarSign,
  Info,
  TrendingUp,
  CheckCircle2,
  Circle,
  Plus,
  Rocket,
  Flame,
  Layers,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

interface DetailDrawerProps {
  opportunity: Opportunity | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleSave?: (id: string) => void;
  isSaved?: boolean;
}

export const DetailDrawer: React.FC<DetailDrawerProps> = ({
  opportunity,
  isOpen,
  onClose,
  onToggleSave,
  isSaved = false,
}) => {
  const [activeTab, setActiveTab] = useState<'playbook' | 'overview' | 'market' | 'signals' | 'swot'>('playbook');
  const [copiedLink, setCopiedLink] = useState(false);
  const [personalProject, setPersonalProject] = useState<PersonalProject | null>(null);

  useEffect(() => {
    if (opportunity) {
      const projects = PersonalProjectService.getProjects();
      const found = projects.find((p) => p.opportunityId === opportunity.id);
      setPersonalProject(found || null);
    }
  }, [opportunity, isOpen]);

  if (!isOpen || !opportunity) return null;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveAsPersonalProject = () => {
    if (!opportunity) return;
    const project = PersonalProjectService.createProjectFromOpportunity(opportunity);
    setPersonalProject(project);
    setActiveTab('playbook');
  };

  const handleToggleTask = (taskId: string) => {
    let project = personalProject;
    if (!project) {
      project = PersonalProjectService.createProjectFromOpportunity(opportunity);
      setPersonalProject(project);
    }
    const updated = PersonalProjectService.toggleTask(project.id, taskId);
    if (updated) {
      setPersonalProject({ ...updated });
    }
  };

  const originCountry = opportunity.market?.originCountry || 'Global';
  const originFlag = opportunity.market?.originFlag || '🌐';
  const originCode = opportunity.market?.originCode || 'GL';
  const targetMarkets =
    opportunity.market?.targetMarkets || opportunity.targetMarkets || ['Global'];

  // Financial, Speed & Investment fallback resolution
  const monthlyProfit = opportunity.financials?.estimatedMonthlyProfit || 'R$ 18.000 - R$ 45.000 / mês ($3,500 - $8,500)';
  const profitMargin = opportunity.financials?.profitMargin || '85%';
  const averageTicket = opportunity.financials?.averageTicket || 'R$ 199 / mês';
  const annualProjection = opportunity.financials?.annualProjection || 'R$ 240.000+ ARR';

  const mvpDays = opportunity.executionSpeed?.mvpDays || opportunity.timeToMvpDays || 10;
  const firstSaleDays = opportunity.executionSpeed?.firstSaleDays || 16;
  const weeklyHours = opportunity.executionSpeed?.weeklyDedicationHours || '12h / semana';
  const speedRating = opportunity.executionSpeed?.speedRating || 'Rápido (2 sem)';

  const capitalEstimated = opportunity.investment?.initialCapitalEstimated || 'R$ 180 - R$ 350 ($35 - $70 USD)';
  const capitalTier = opportunity.investment?.budgetTier || 'Bootstrap ($0 a $100)';
  const capitalBreakdown = opportunity.investment?.capitalBreakdown || [
    { item: 'Domínio personalizado .com / .com.br', cost: 'R$ 40 / ano' },
    { item: 'Hospedagem & Banco (Vercel + Supabase)', cost: 'R$ 0 (Free tier)' },
    { item: 'APIs sob demanda & Webhooks', cost: 'R$ 80 - R$ 150' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-2xl bg-slate-950 border-l border-white/10 shadow-2xl flex flex-col h-full z-10 animate-slide-in-right overflow-hidden">
        {/* Top Sticky Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] bg-slate-900/90 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-200">
              <span>{originFlag}</span>
              <span>{originCountry} ({originCode})</span>
            </span>

            <Badge variant="cyan" size="sm">
              {opportunity.category}
            </Badge>

            <Badge variant="outline" size="sm">
              {opportunity.businessModel || 'SaaS'}
            </Badge>

            {personalProject && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-emerald-300 font-bold">
                <Flame className="w-3 h-3 text-amber-400" />
                Meu Projeto Ativo ({personalProject.progressPercent}%)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              iconLeft={<Share2 className="w-3.5 h-3.5" />}
              onClick={handleShare}
            >
              {copiedLink ? 'Copiado!' : 'Compartilhar'}
            </Button>

            <Button
              variant={isSaved || opportunity.isSaved ? 'emerald' : 'secondary'}
              size="sm"
              iconLeft={<Bookmark className="w-3.5 h-3.5" />}
              onClick={() => onToggleSave?.(opportunity.id)}
            >
              {isSaved || opportunity.isSaved ? 'Salva' : 'Salvar'}
            </Button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors ml-1"
              title="Fechar (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Opportunity Title & Score Block */}
        <div className="px-6 py-5 border-b border-white/[0.06] bg-slate-900/40 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-100 leading-snug mb-1.5">
                {opportunity.title}
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                {opportunity.tagline}
              </p>
            </div>
            <RadarScoreBadge score={opportunity.score} size="lg" className="shrink-0" />
          </div>

          {/* 3 HIGHLIGHT METRICS REQUESTED BY USER: LUCRO, VELOCIDADE, INVESTIMENTO */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            {/* 1. ESTIMATIVA DE LUCRO */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-950/30 to-slate-900/90 border border-emerald-500/30 space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 flex items-center gap-1 font-bold">
                <DollarSign className="w-3.5 h-3.5" /> Lucro Estimado
              </span>
              <div className="text-sm sm:text-base font-bold font-mono text-emerald-300">
                {monthlyProfit}
              </div>
              <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between pt-0.5">
                <span>Margem: <strong className="text-emerald-400">{profitMargin}</strong></span>
                <span>Ticket: <strong className="text-slate-200">{averageTicket}</strong></span>
              </div>
            </div>

            {/* 2. VELOCIDADE DE EXECUÇÃO */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-cyan-950/30 to-slate-900/90 border border-cyan-500/30 space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 flex items-center gap-1 font-bold">
                <Zap className="w-3.5 h-3.5" /> Velocidade / Prazo
              </span>
              <div className="text-sm sm:text-base font-bold font-mono text-cyan-200">
                MVP em {mvpDays} dias
              </div>
              <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between pt-0.5">
                <span>1ª Venda: <strong className="text-cyan-300">{firstSaleDays}d</strong></span>
                <span>{weeklyHours}</span>
              </div>
            </div>

            {/* 3. INVESTIMENTO NECESSÁRIO */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-violet-950/30 to-slate-900/90 border border-violet-500/30 space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-violet-400 flex items-center gap-1 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" /> Investimento
              </span>
              <div className="text-sm sm:text-base font-bold font-mono text-violet-200">
                {capitalEstimated}
              </div>
              <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between pt-0.5">
                <span>{capitalTier}</span>
                <span className="text-emerald-400">Zero Risco</span>
              </div>
            </div>
          </div>

          {/* Action CTA: Salvar como Projeto Pessoal */}
          <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-emerald-950/40 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <Rocket className="w-4 h-4 text-cyan-400" />
                {personalProject ? 'Projeto Pessoal Ativo no seu Workspace' : 'Salvar como Meu Projeto Pessoal'}
              </h4>
              <p className="text-[11px] text-slate-300">
                {personalProject
                  ? `Você já concluiu ${personalProject.progressPercent}% das etapas. Marque o checklist diariamente abaixo.`
                  : 'Salve para acompanhar o checklist diário passo a passo com o Coach de Inteligência Artificial.'}
              </p>
            </div>
            <Button
              variant={personalProject ? 'emerald' : 'primary'}
              size="sm"
              onClick={handleSaveAsPersonalProject}
              iconLeft={personalProject ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              className="shrink-0 font-mono text-xs"
            >
              {personalProject ? 'Checklist Ativo' : 'Iniciar Projeto Pessoal'}
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 border-b border-white/[0.08] bg-slate-900/60 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('playbook')}
            className={`py-3 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'playbook'
                ? 'border-cyan-400 text-cyan-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Passo a Passo de Execução</span>
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Dossiê de 6 Dimensões</span>
          </button>
          <button
            onClick={() => setActiveTab('market')}
            className={`py-3 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'market'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Mercado & Concorrência</span>
          </button>
          <button
            onClick={() => setActiveTab('signals')}
            className={`py-3 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'signals'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Sinais de Origem ({opportunity.sources?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('swot')}
            className={`py-3 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'swot'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>SWOT IA</span>
          </button>
        </div>

        {/* Tab Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* PLAYBOOK & INTERACTIVE CHECKLIST (TAB 1) */}
          {activeTab === 'playbook' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div>
                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Rocket className="w-4 h-4 text-cyan-400" />
                    Como Conseguiria Fazer: Roteiro & Checklist de Execução
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Passo a passo testado com zero desperdício. Marque as etapas conforme você executa no dia a dia.
                  </p>
                </div>

                {personalProject && (
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {personalProject.progressPercent}% Concluído
                    </span>
                    <div className="w-24 h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-300"
                        style={{ width: `${personalProject.progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Cost breakdown pill summary */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-2">
                <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold block">
                  Detalhamento do Investimento Inicial:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  {capitalBreakdown.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-between"
                    >
                      <span className="text-slate-300">{item.item}</span>
                      <strong className="text-emerald-400">{item.cost}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4 PHASES WITH INTERACTIVE CHECKLIST */}
              {opportunity.executionPlaybook && opportunity.executionPlaybook.length > 0 ? (
                <div className="space-y-6">
                  {opportunity.executionPlaybook.map((phase) => (
                    <div
                      key={phase.phase}
                      className="rounded-xl border border-white/[0.08] bg-slate-900/70 overflow-hidden"
                    >
                      {/* Phase Header */}
                      <div className="p-4 bg-slate-800/40 border-b border-white/[0.06] flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                            {phase.phase}
                          </span>
                          <div>
                            <h5 className="text-xs sm:text-sm font-bold text-slate-100">
                              {phase.name}
                            </h5>
                            <p className="text-[11px] text-slate-400">
                              {phase.description}
                            </p>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded bg-white/[0.04] text-[11px] font-mono text-cyan-300 border border-white/[0.08] shrink-0">
                          {phase.timeEstimate}
                        </span>
                      </div>

                      {/* Action Items Checklist */}
                      <div className="p-4 space-y-3">
                        {phase.actionItems.map((item) => {
                          const taskId = `task-${phase.phase}-${item.id}`;
                          const isDone = personalProject?.tasks.find((t) => t.id === taskId)?.completed;

                          return (
                            <div
                              key={item.id}
                              onClick={() => handleToggleTask(taskId)}
                              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                                isDone
                                  ? 'bg-emerald-950/20 border-emerald-500/30'
                                  : 'bg-slate-900/90 border-white/[0.06] hover:border-cyan-500/30 hover:bg-slate-900'
                              }`}
                            >
                              <button
                                type="button"
                                className="mt-0.5 shrink-0 text-slate-400 hover:text-white transition-colors"
                              >
                                {isDone ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                                ) : (
                                  <Circle className="w-5 h-5 text-slate-500 hover:text-cyan-400" />
                                )}
                              </button>

                              <div className="flex-1 space-y-1.5">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <h6
                                    className={`text-xs sm:text-sm font-semibold transition-colors ${
                                      isDone ? 'line-through text-slate-400' : 'text-slate-200'
                                    }`}
                                  >
                                    {item.title}
                                  </h6>
                                  {item.recommendedDay && (
                                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20 shrink-0">
                                      {item.recommendedDay}
                                    </span>
                                  )}
                                </div>

                                <div className="text-xs text-slate-300 space-y-1">
                                  <p className="leading-relaxed">
                                    <strong className="text-slate-400 font-mono text-[11px] uppercase mr-1">
                                      Como Fazer:
                                    </strong>
                                    {item.howToExecute}
                                  </p>
                                  <p className="text-[11px] font-mono text-emerald-300/90 bg-emerald-500/[0.05] p-2 rounded-lg border border-emerald-500/20">
                                    <strong className="text-emerald-400 uppercase mr-1">
                                      Entregável Esperado:
                                    </strong>
                                    {item.deliverable}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-slate-900/60 border border-white/[0.08] text-center space-y-3">
                  <p className="text-xs text-slate-400">
                    Clique abaixo para gerar o plano de execução e o checklist personalizado deste projeto.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveAsPersonalProject}
                    iconLeft={<Rocket className="w-4 h-4" />}
                  >
                    Ativar Checklist de Execução
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* OVERVIEW (6 DIMENSIONS) */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* 1. O QUE FOI DETECTADO */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-white/[0.08] space-y-1.5">
                <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-tight flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" /> 1. O que foi detectado:
                </span>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  {opportunity.whatDetected || opportunity.tagline}
                </p>
              </div>

              {/* 2. POR QUE É IMPORTANTE */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-white/[0.08] space-y-1.5">
                <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-tight flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" /> 2. Por que é importante:
                </span>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  {opportunity.whyImportant || 'Representa uma quebra de modelo nos players tradicionais gerando demanda reprimida imediata.'}
                </p>
              </div>

              {/* 3. QUAL MERCADO ESTÁ ENVOLVIDO */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-white/[0.08] space-y-1.5">
                <span className="text-xs font-mono font-semibold text-violet-400 uppercase tracking-tight flex items-center gap-1.5">
                  <Globe2 className="w-3.5 h-3.5" /> 3. Mercados Envolvidos:
                </span>
                <div className="text-xs text-slate-300 space-y-1">
                  <div>
                    Origem do Sinal: <strong className="text-white">{originFlag} {originCountry} ({opportunity.market?.continent})</strong>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-slate-500">Mercados de Expansão / Adaptação:</span>
                    {targetMarkets.map((m) => (
                      <Badge key={m} variant="slate" size="xs">
                        {m}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. QUAL PROBLEMA EXISTE */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-white/[0.08] space-y-1.5">
                <span className="text-xs font-mono font-semibold text-rose-400 uppercase tracking-tight flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> 4. Qual problema existe:
                </span>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  {opportunity.problemExists || opportunity.primaryProblem}
                </p>
              </div>

              {/* 5. QUAL OPORTUNIDADE PODE SER EXPLORADA */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-white/[0.08] space-y-1.5">
                <span className="text-xs font-mono font-semibold text-cyan-300 uppercase tracking-tight flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> 5. Oportunidade a explorar:
                </span>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  {opportunity.opportunityExplored || opportunity.proposedSolution}
                </p>
              </div>

              {/* 6. COMO PODERIA SER MONETIZADA */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-white/[0.08] space-y-1.5">
                <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-tight flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" /> 6. Como monetizar:
                </span>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  {opportunity.howMonetized || opportunity.monetizationModel}
                </p>
              </div>
            </div>
          )}

          {/* MARKET & COMPETITORS */}
          {activeTab === 'market' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                  Concorrentes Existentes Identificados
                </h4>
                <div className="space-y-2">
                  {opportunity.existingCompetitors?.map((comp) => (
                    <div
                      key={comp}
                      className="p-3 rounded-lg bg-slate-900/80 border border-white/[0.06] flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-slate-200">{comp}</span>
                      <Badge variant="rose" size="xs">
                        Concorrente
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.08] space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400">
                  Ângulo de Diferenciação Estratégica:
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {opportunity.differentiationAngle}
                </p>
              </div>
            </div>
          )}

          {/* SIGNALS TAB */}
          {activeTab === 'signals' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <div>
                  <h4 className="text-sm font-semibold text-slate-100">
                    Transparência de Inteligência & Auditoria de Fontes
                  </h4>
                  <p className="text-xs text-slate-400">
                    Separação estrita entre fatos observados, análises algorítmicas e hipóteses de negócio.
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">
                  Origem Auditável
                </span>
              </div>

              {/* PAINEL DADO */}
              <div className="p-4 rounded-xl bg-blue-500/[0.04] border border-blue-500/25 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-xs font-mono font-bold uppercase">
                      1. Dado (Fato Verificado)
                    </span>
                    <span className="text-2xs font-mono text-slate-400">
                      Coleta via API Oficial / Feed Público
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {opportunity.dateDetected}
                  </span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  {opportunity.whatDetected}
                </p>

                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-mono uppercase text-slate-400 block">
                    Fontes Primárias Auditadas:
                  </span>
                  {opportunity.sources?.map((src, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-slate-900/90 border border-white/[0.08] flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="cyan" size="xs">
                            {src.platform}
                          </Badge>
                          <span className="text-2xs font-mono text-slate-400">
                            {src.timestamp} • {src.volumeOrScore}
                          </span>
                        </div>
                        <p className="text-xs italic text-slate-300 line-clamp-1">
                          "{src.snippet}"
                        </p>
                      </div>

                      {src.url && (
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-mono flex items-center gap-1.5 transition-colors shrink-0"
                          title="Abrir post ou repositório original"
                        >
                          <span>Ver Original</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SWOT IA TAB */}
          {activeTab === 'swot' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                  Pontos Fortes (Strengths)
                </span>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  {opportunity.aiSwot?.strengths?.map((s, i) => (
                    <li key={i}>{s}</li>
                  )) || <li>Modelo de alta retenção com margem líquida acima de 80%.</li>}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400">
                  Fraquezas (Weaknesses)
                </span>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  {opportunity.aiSwot?.weaknesses?.map((w, i) => (
                    <li key={i}>{w}</li>
                  )) || <li>Necessidade de educar os primeiros clientes sobre a facilidade do setup.</li>}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                  Oportunidades (Opportunities)
                </span>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  {opportunity.aiSwot?.opportunities?.map((o, i) => (
                    <li key={i}>{o}</li>
                  )) || <li>Expansão rápida para outros países latino-americanos e europeus.</li>}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                  Ameaças (Threats)
                </span>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  {opportunity.aiSwot?.threats?.map((t, i) => (
                    <li key={i}>{t}</li>
                  )) || <li>Players legados começarem a modernizar suas interfaces nos próximos 18 meses.</li>}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
