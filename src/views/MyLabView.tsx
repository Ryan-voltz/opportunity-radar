import React, { useState, useEffect } from 'react';
import { HypothesisCard, Opportunity, PersonalProject, AiCoachAlert } from '../types';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { AiCoachNotificationBanner } from '../components/common/AiCoachNotificationBanner';
import { PersonalProjectService } from '../services/personalProjectService';
import {
  FlaskConical,
  Plus,
  X,
  Flame,
  CheckCircle2,
  Circle,
  Clock,
  DollarSign,
  Zap,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Trash2,
  Target,
  Rocket,
  Check,
  Calendar,
} from 'lucide-react';

interface MyLabViewProps {
  hypotheses: HypothesisCard[];
  onAddHypothesis: (hyp: Omit<HypothesisCard, 'id' | 'createdAt'>) => void;
  opportunities?: Opportunity[];
  onSelectOpportunity?: (opportunity: Opportunity) => void;
  onNavigate?: (section: any) => void;
}

export const MyLabView: React.FC<MyLabViewProps> = ({
  hypotheses,
  onAddHypothesis,
  opportunities = [],
  onSelectOpportunity,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'projects' | 'kanban'>('projects');
  const [projects, setProjects] = useState<PersonalProject[]>([]);
  const [coachAlerts, setCoachAlerts] = useState<AiCoachAlert[]>([]);
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});

  // Kanban modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newHypothesisText, setNewHypothesisText] = useState('');
  const [newSuccessMetric, setNewSuccessMetric] = useState('');

  const refreshProjectsAndAlerts = () => {
    const list = PersonalProjectService.getProjects();
    setProjects(list);
    const alerts = PersonalProjectService.generateAiCoachAlerts(list);
    setCoachAlerts(alerts);
  };

  useEffect(() => {
    refreshProjectsAndAlerts();
    window.addEventListener('personal_projects_updated', refreshProjectsAndAlerts);
    return () => window.removeEventListener('personal_projects_updated', refreshProjectsAndAlerts);
  }, []);

  const toggleProjectAccordion = (id: string) => {
    setExpandedProjects((prev) => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id],
    }));
  };

  const handleToggleTask = (projectId: string, taskId: string) => {
    PersonalProjectService.toggleTask(projectId, taskId);
    refreshProjectsAndAlerts();
  };

  const handleDailyCheckin = (projectId: string) => {
    PersonalProjectService.recordDailyCheckin(projectId);
    refreshProjectsAndAlerts();
  };

  const handleDeleteProject = (projectId: string) => {
    if (window.confirm('Tem certeza que deseja remover este projeto da sua lista pessoal?')) {
      PersonalProjectService.deleteProject(projectId);
      refreshProjectsAndAlerts();
    }
  };

  const handleOpenOpportunity = (opportunityId: string) => {
    const opp = opportunities.find((o) => o.id === opportunityId);
    if (opp && onSelectOpportunity) {
      onSelectOpportunity(opp);
    } else if (onNavigate) {
      onNavigate('radar');
    }
  };

  const stages: HypothesisCard['status'][] = [
    'Backlog',
    'Pesquisando',
    'Landing Page',
    'Entrevistas',
    'Validado',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddHypothesis({
      title: newTitle,
      opportunityRefId: 'custom',
      status: 'Backlog',
      hypothesisText: newHypothesisText || 'Se resolvermos esta fricção, clientes pagarão mensalidade.',
      successMetric: newSuccessMetric || '5 pré-vendas com pagamento ou sinal.',
      confidenceScore: 80,
      notes: 'Hipótese criada no My Lab Sandbox.',
    });

    setNewTitle('');
    setNewHypothesisText('');
    setNewSuccessMetric('');
    setIsModalOpen(false);
  };

  // Global metrics summary
  const totalTasks = projects.reduce((acc, p) => acc + p.tasks.length, 0);
  const completedTasks = projects.reduce(
    (acc, p) => acc + p.tasks.filter((t) => t.completed).length,
    0
  );
  const maxStreak = projects.reduce((max, p) => Math.max(max, p.dailyStreak || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/40 border border-emerald-500/20">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="emerald" size="sm">
              Workspace Pessoal de Execução
            </Badge>
            <span className="text-2xs font-mono text-slate-400">
              Accountability & Checklist Diário
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
            Meus Projetos & My Lab
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Seus projetos salvos com checklist passo a passo de como fazer, estimativa de lucro, velocidade de MVP e investimento. A inteligência artificial acompanha sua disciplina diária.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate?.('radar')}
            iconLeft={<Rocket className="w-4 h-4 text-cyan-400" />}
          >
            Explorar Radar
          </Button>

          <Button
            variant="emerald"
            size="sm"
            iconLeft={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Nova Hipótese
          </Button>
        </div>
      </div>

      {/* AI ACCOUNTABILITY COACH PROACTIVE BANNER */}
      <AiCoachNotificationBanner
        alerts={coachAlerts}
        onOpenProject={(projId) => {
          setExpandedProjects((prev) => ({ ...prev, [projId]: true }));
        }}
      />

      {/* GLOBAL EXECUTION METRICS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 block">
              Sequência Diária
            </span>
            <span className="text-lg font-bold font-mono text-white">
              {maxStreak} {maxStreak === 1 ? 'dia' : 'dias'} 🔥
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 block">
              Projetos Ativos
            </span>
            <span className="text-lg font-bold font-mono text-white">
              {projects.length}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 block">
              Checklist Concluído
            </span>
            <span className="text-lg font-bold font-mono text-white">
              {completedTasks} / {totalTasks}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 block">
              Meta de Faturamento
            </span>
            <span className="text-lg font-bold font-mono text-emerald-400">
              R$ 54k+/mês
            </span>
          </div>
        </div>
      </div>

      {/* TABS SWITCHER: MEUS PROJETOS vs KANBAN DE HIPÓTESES */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-1">
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-4 py-2.5 rounded-lg text-xs font-mono font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'projects'
              ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Rocket className="w-3.5 h-3.5" />
          <span>Meus Projetos & Checklist Diário ({projects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('kanban')}
          className={`px-4 py-2.5 rounded-lg text-xs font-mono font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'kanban'
              ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5" />
          <span>Kanban de Validação ({hypotheses.length})</span>
        </button>
      </div>

      {/* TAB 1: MEUS PROJETOS & CHECKLIST DIÁRIO */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          {projects.length === 0 ? (
            <div className="p-12 rounded-2xl bg-slate-900/40 border border-white/[0.08] text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">
                <Rocket className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  Nenhum projeto salvo para você ainda
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Acesse o Radar Global, clique em qualquer oportunidade de negócio e selecione "Salvar como Meu Projeto" para liberar seu checklist diário.
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={() => onNavigate?.('radar')}
                iconLeft={<Rocket className="w-4 h-4" />}
              >
                Ir para o Radar de Oportunidades
              </Button>
            </div>
          ) : (
            projects.map((proj) => {
              const isExpanded = expandedProjects[proj.id] !== false; // expanded by default
              const doneTasks = proj.tasks.filter((t) => t.completed).length;

              // Group tasks by phase
              const phaseIds = Array.from(new Set(proj.tasks.map((t) => t.phaseId))).sort();

              return (
                <div
                  key={proj.id}
                  className="rounded-[20px] border border-white/[0.08] bg-slate-900/90 overflow-hidden shadow-card-subtle hover:border-blue-500/30 transition-all"
                >
                  {/* Project Main Card Header */}
                  <div className="p-5 sm:p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <Badge variant="cyan" size="xs">
                            {proj.category}
                          </Badge>
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase ${
                              proj.status === 'quase_pronto'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            }`}
                          >
                            {proj.status === 'quase_pronto' ? '🚀 Quase Pronto' : '⚡ Em Andamento'}
                          </span>
                          <span className="text-2xs font-mono text-slate-400">
                            {proj.targetCompletionDate}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-white hover:text-cyan-300 transition-colors">
                          {proj.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                          {proj.tagline}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => handleOpenOpportunity(proj.opportunityId)}
                          iconRight={<ExternalLink className="w-3 h-3" />}
                        >
                          Ver no Radar
                        </Button>

                        <button
                          onClick={() => handleDeleteProject(proj.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Remover projeto pessoal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* 3 User-Requested Highlighted Metrics: Lucro, Velocidade, Investimento */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 space-y-0.5">
                        <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold flex items-center gap-1">
                          <DollarSign className="w-3 h-3" /> Lucro Estimado
                        </span>
                        <div className="text-xs sm:text-sm font-bold font-mono text-emerald-300">
                          {proj.financialMetrics.estimatedMonthlyProfit}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          Margem: {proj.financialMetrics.profitMargin} • Ticket: {proj.financialMetrics.averageTicket}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-cyan-950/20 border border-cyan-500/20 space-y-0.5">
                        <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Velocidade de Execução
                        </span>
                        <div className="text-xs sm:text-sm font-bold font-mono text-cyan-200">
                          MVP em {proj.speedMetrics.mvpDays} dias
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          1ª Venda: {proj.speedMetrics.firstSaleDays}d • {proj.speedMetrics.weeklyDedicationHours}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-violet-950/20 border border-violet-500/20 space-y-0.5">
                        <span className="text-[10px] font-mono uppercase text-violet-400 font-bold flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Investimento
                        </span>
                        <div className="text-xs sm:text-sm font-bold font-mono text-violet-200">
                          {proj.investmentMetrics.initialCapitalEstimated}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          Bootstrap • Baixo Risco
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar & Daily Check-in Button */}
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                            Progresso do Checklist: {proj.progressPercent}%
                          </span>
                          <span className="text-slate-400">
                            {doneTasks} de {proj.tasks.length} etapas concluídas
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-300"
                            style={{ width: `${proj.progressPercent}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant={proj.checkedInToday ? 'emerald' : 'amber'}
                          size="sm"
                          iconLeft={proj.checkedInToday ? <Check className="w-4 h-4" /> : <Flame className="w-4 h-4" />}
                          onClick={() => handleDailyCheckin(proj.id)}
                          className="font-mono text-xs"
                        >
                          {proj.checkedInToday
                            ? `Check-in Diário Feito! (${proj.dailyStreak}d 🔥)`
                            : 'Marcar Check-in de Hoje! 🔥'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* INTERACTIVE CHECKLIST ACCORDION */}
                  <div className="border-t border-white/[0.06] bg-slate-950/80">
                    <button
                      onClick={() => toggleProjectAccordion(proj.id)}
                      className="w-full px-5 py-3 flex items-center justify-between text-xs font-mono text-slate-400 hover:text-white transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-cyan-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-cyan-400" />
                        )}
                        <strong className="text-slate-200">
                          {isExpanded ? 'Recolher Checklist' : 'Ver Checklist Completo & Tarefas Diárias'}
                        </strong>
                        <span>({doneTasks}/{proj.tasks.length} concluídas)</span>
                      </span>
                      <span className="text-cyan-400 font-medium">
                        {isExpanded ? 'Ocultar' : 'Expandir Checklist Passo a Passo'}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="p-5 sm:p-6 space-y-6 pt-2 animate-fade-in">
                        {phaseIds.map((phaseId) => {
                          const phaseTasks = proj.tasks.filter((t) => t.phaseId === phaseId);
                          const phaseName = phaseTasks[0]?.phaseName || `Fase ${phaseId}`;
                          const phaseDone = phaseTasks.filter((t) => t.completed).length;

                          return (
                            <div
                              key={phaseId}
                              className="rounded-xl border border-white/[0.06] bg-slate-900/60 overflow-hidden"
                            >
                              <div className="px-4 py-2.5 bg-slate-800/40 border-b border-white/[0.06] flex items-center justify-between text-xs font-mono">
                                <span className="font-bold text-slate-200">
                                  {phaseName}
                                </span>
                                <span className="text-[11px] text-cyan-400">
                                  {phaseDone}/{phaseTasks.length} concluídos
                                </span>
                              </div>

                              <div className="p-3.5 space-y-2.5">
                                {phaseTasks.map((task) => (
                                  <div
                                    key={task.id}
                                    onClick={() => handleToggleTask(proj.id, task.id)}
                                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                                      task.completed
                                        ? 'bg-emerald-950/20 border-emerald-500/30'
                                        : 'bg-slate-900/80 border-white/[0.05] hover:border-cyan-500/30 hover:bg-slate-900'
                                    }`}
                                  >
                                    <button
                                      type="button"
                                      className="mt-0.5 shrink-0 text-slate-400 hover:text-white transition-colors"
                                    >
                                      {task.completed ? (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                                      ) : (
                                        <Circle className="w-5 h-5 text-slate-500 hover:text-cyan-400" />
                                      )}
                                    </button>

                                    <div className="flex-1 space-y-1">
                                      <div className="flex items-center justify-between gap-2 flex-wrap">
                                        <h5
                                          className={`text-xs sm:text-sm font-semibold transition-colors ${
                                            task.completed ? 'line-through text-slate-400' : 'text-slate-100'
                                          }`}
                                        >
                                          {task.title}
                                        </h5>
                                        {task.recommendedDay && (
                                          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                                            {task.recommendedDay}
                                          </span>
                                        )}
                                      </div>

                                      <div className="text-xs text-slate-300 space-y-1">
                                        <p className="leading-relaxed">
                                          <strong className="text-slate-400 font-mono text-[10px] uppercase mr-1">
                                            Como Executar:
                                          </strong>
                                          {task.howToExecute}
                                        </p>
                                        <p className="text-[11px] font-mono text-emerald-300/90 bg-emerald-500/[0.05] p-2 rounded-lg border border-emerald-500/20">
                                          <strong className="text-emerald-400 uppercase mr-1">
                                            Entregável:
                                          </strong>
                                          {task.deliverable}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: ORIGINAL KANBAN DE HIPÓTESES */}
      {activeTab === 'kanban' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
            {stages.map((stage) => {
              const stageCards = hypotheses.filter((h) => h.status === stage);

              return (
                <div
                  key={stage}
                  className="rounded-xl bg-slate-900/40 border border-white/[0.06] p-3 flex flex-col min-w-[240px]"
                >
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-xs font-mono font-semibold text-slate-300">
                      {stage}
                    </span>
                    <span className="w-5 h-5 rounded-full bg-white/[0.04] text-slate-400 flex items-center justify-center text-[10px] font-mono">
                      {stageCards.length}
                    </span>
                  </div>

                  <div className="space-y-3 flex-1">
                    {stageCards.map((card) => (
                      <div
                        key={card.id}
                        className="rounded-lg bg-slate-900/80 border border-white/[0.08] p-3 space-y-2 shadow-sm hover:border-emerald-500/30 transition-colors"
                      >
                        <h4 className="text-xs font-semibold text-slate-200 leading-snug">
                          {card.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {card.hypothesisText}
                        </p>
                        <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] font-mono text-slate-500">
                          <span>{card.createdAt}</span>
                          <span className="text-emerald-400 font-semibold">
                            {card.confidenceScore}% conf.
                          </span>
                        </div>
                      </div>
                    ))}

                    {stageCards.length === 0 && (
                      <div className="h-24 border border-dashed border-white/[0.06] rounded-lg flex items-center justify-center text-2xs text-slate-600 font-mono">
                        Vazio
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Nova Hipótese */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl relative space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-slate-100">
                  Nova Hipótese de Validação
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-mono uppercase text-slate-400 block mb-1.5">
                  Título da Hipótese / Oportunidade
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Micro-SaaS de Conciliação Bancária para Clínicas"
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-white/10 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-slate-400 block mb-1.5">
                  Declaração da Hipótese
                </label>
                <textarea
                  value={newHypothesisText}
                  onChange={(e) => setNewHypothesisText(e.target.value)}
                  placeholder="Se criarmos um bot de WhatsApp que confirma consultas, clínicas reduzirão no-show em 25% e pagarão R$ 390/mês."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-white/10 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-slate-400 block mb-1.5">
                  Métrica de Sucesso (Critério de Validação)
                </label>
                <input
                  type="text"
                  value={newSuccessMetric}
                  onChange={(e) => setNewSuccessMetric(e.target.value)}
                  placeholder="Ex: 5 clínicas assinarem pré-contrato de R$ 199."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-white/10 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="emerald" size="sm">
                  Salvar Hipótese
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
