import React, { useState, useEffect, useRef } from 'react';
import { Opportunity, PersonalProject } from '../../types';
import { RadarScoreBadge } from './RadarScoreBadge';
import { Badge } from './Badge';
import { Button } from './Button';
import { PersonalProjectService } from '../../services/personalProjectService';
import { useTheme } from '../../context/ThemeContext';
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
  Maximize2,
  Minimize2,
  MoveHorizontal,
  Code2,
  Server,
  CreditCard,
  Send,
  Users,
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
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Navigation & View Mode States
  const [activeTab, setActiveTab] = useState<'playbook' | 'overview' | 'market' | 'signals' | 'swot'>('playbook');
  const [copiedLink, setCopiedLink] = useState(false);
  const [personalProject, setPersonalProject] = useState<PersonalProject | null>(null);

  // Fullscreen & Resizing States
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [drawerWidth, setDrawerWidth] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('opportunity_radar_drawer_width');
      if (stored) return Math.min(Math.max(Number(stored), 480), 1200);
    }
    return 720;
  });
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<{ startX: number; startWidth: number }>({ startX: 0, startWidth: 720 });

  useEffect(() => {
    if (opportunity) {
      const projects = PersonalProjectService.getProjects();
      const found = projects.find((p) => p.opportunityId === opportunity.id);
      setPersonalProject(found || null);
    }
  }, [opportunity, isOpen]);

  // Handle keyboard shortcut for ESC (Exit Fullscreen or Close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, isFullscreen, onClose]);

  // Resizing logic for drawer mode
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isFullscreen) return;
    e.preventDefault();
    setIsResizing(true);
    resizeRef.current = {
      startX: e.clientX,
      startWidth: drawerWidth,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const delta = resizeRef.current.startX - e.clientX;
      const newWidth = Math.min(
        Math.max(resizeRef.current.startWidth + delta, 480),
        Math.min(window.innerWidth - 30, 1280)
      );
      setDrawerWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        localStorage.setItem('opportunity_radar_drawer_width', String(drawerWidth));
      }
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, drawerWidth]);

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

  // Financial, Speed & Investment resolution
  const monthlyProfit = opportunity.financials?.estimatedMonthlyProfit || 'R$ 18.000 - R$ 45.000 / mês ($3,500 - $8,500)';
  const profitMargin = opportunity.financials?.profitMargin || '86%';
  const averageTicket = opportunity.financials?.averageTicket || 'R$ 199 / mês';
  const annualProjection = opportunity.financials?.annualProjection || 'R$ 240.000+ ARR';

  const mvpDays = opportunity.executionSpeed?.mvpDays || opportunity.timeToMvpDays || 10;
  const firstSaleDays = opportunity.executionSpeed?.firstSaleDays || 16;
  const weeklyHours = opportunity.executionSpeed?.weeklyDedicationHours || '12h / semana';

  const capitalEstimated = opportunity.investment?.initialCapitalEstimated || 'R$ 180 - R$ 350 ($35 - $70 USD)';
  const capitalTier = opportunity.investment?.budgetTier || 'Bootstrap ($0 a $100)';
  const capitalBreakdown = opportunity.investment?.capitalBreakdown || [
    { item: 'Domínio personalizado .com / .com.br', cost: 'R$ 40 / ano' },
    { item: 'Hospedagem & Banco (Vercel + Supabase)', cost: 'R$ 0 (Free Tier Vitalício)' },
    { item: 'Automação & E-mails (Resend API)', cost: 'R$ 0 (Até 3.000 envios/mês grátis)' },
    { item: 'APIs sob demanda & Testes de Webhooks', cost: 'R$ 80 - R$ 140 (Após faturamento)' },
  ];

  // Technical Stack Recommendation
  const recommendedStack = [
    { category: 'Frontend', tool: 'React + Vite + Tailwind CSS', role: 'Interface moderna, responsiva e ultrarrápida', cost: 'R$ 0' },
    { category: 'Backend & DB', tool: 'Supabase (PostgreSQL + Auth)', role: 'Banco de dados relacional e autenticação pronta', cost: 'R$ 0' },
    { category: 'Pagamentos', tool: 'Stripe Billing ou Asaas (PIX/Cartão)', role: 'Cobrança recorrente sem taxa fixa mensal', cost: 'Taxa por transação' },
    { category: 'Transacional', tool: 'Resend API', role: 'Envio de onboarding e notificações para usuários', cost: 'R$ 0 (Até 3.000/mês)' },
  ];

  // Financial Scenarios Projection
  const financialScenarios = [
    { name: 'Conservador (Validação)', customers: 15, gross: 'R$ 2.985/mês', costs: 'R$ 80/mês', net: 'R$ 2.905/mês' },
    { name: 'Moderado (MVP Maduro)', customers: 50, gross: 'R$ 9.950/mês', costs: 'R$ 240/mês', net: 'R$ 9.710/mês' },
    { name: 'Consolidado (Escala Micro-SaaS)', customers: 150, gross: 'R$ 29.850/mês', costs: 'R$ 750/mês', net: 'R$ 29.100/mês' },
  ];

  return (
    <div className={`fixed inset-0 z-50 flex ${isFullscreen ? 'items-center justify-center p-0 sm:p-4' : 'justify-end'}`}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={isFullscreen ? () => setIsFullscreen(false) : onClose}
      />

      {/* Main Drawer or Fullscreen Container */}
      <div
        style={{ width: isFullscreen ? '100%' : `${drawerWidth}px` }}
        className={`relative flex flex-col h-full z-10 overflow-hidden transition-all duration-200 shadow-2xl ${
          isFullscreen
            ? 'w-full max-w-7xl h-full sm:h-[95vh] sm:rounded-[24px] border border-white/10 dark:border-white/10 light:border-slate-300 animate-fade-in'
            : 'border-l border-white/10 dark:border-white/10 light:border-slate-200 animate-slide-in-right'
        } ${isLight ? 'bg-white text-slate-900' : 'bg-[#090d16] text-slate-100'}`}
      >
        {/* Resize Handle (Visible only in Drawer Mode on left edge) */}
        {!isFullscreen && (
          <div
            onMouseDown={handleMouseDown}
            title="Arraste para redimensionar a largura da tela"
            className={`absolute top-0 bottom-0 left-0 w-2.5 z-30 cursor-ew-resize flex items-center justify-center group transition-colors ${
              isResizing ? 'bg-cyan-500/50' : 'hover:bg-cyan-500/30'
            }`}
          >
            <div className="w-1 h-8 rounded-full bg-slate-500/40 group-hover:bg-cyan-400 group-hover:scale-y-125 transition-all" />
          </div>
        )}

        {/* TOP HEADER CONTROLS */}
        <div
          className={`px-5 sm:px-7 py-3.5 border-b flex items-center justify-between gap-3 shrink-0 backdrop-blur-md ${
            isLight
              ? 'bg-slate-50/95 border-slate-200'
              : 'bg-[#0e1422]/95 border-white/[0.08]'
          }`}
        >
          {/* Left Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-700 shadow-2xs'
                  : 'bg-white/[0.04] border-white/[0.08] text-slate-200'
              }`}
            >
              <span>{originFlag}</span>
              <span>
                {originCountry} ({originCode})
              </span>
            </span>

            <Badge variant="cyan" size="sm">
              {opportunity.category}
            </Badge>

            <Badge variant="outline" size="sm">
              {opportunity.businessModel || 'SaaS'}
            </Badge>

            {personalProject && (
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${
                  isLight
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Projeto Ativo ({personalProject.progressPercent}%)</span>
              </span>
            )}
          </div>

          {/* Right Action Controls: Preset Widths, Fullscreen & Close */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick Width Presets (Drawer mode only) */}
            {!isFullscreen && (
              <div className="hidden md:flex items-center gap-1 p-0.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/[0.03] text-[11px] font-mono text-slate-600 dark:text-slate-400 mr-1">
                <button
                  onClick={() => setDrawerWidth(580)}
                  className={`px-2 py-0.5 rounded ${drawerWidth <= 600 ? 'bg-white dark:bg-white/10 font-bold text-slate-900 dark:text-white shadow-2xs' : 'hover:text-slate-900 dark:hover:text-white'}`}
                  title="Largura Compacta (580px)"
                >
                  580px
                </button>
                <button
                  onClick={() => setDrawerWidth(760)}
                  className={`px-2 py-0.5 rounded ${drawerWidth > 600 && drawerWidth <= 850 ? 'bg-white dark:bg-white/10 font-bold text-slate-900 dark:text-white shadow-2xs' : 'hover:text-slate-900 dark:hover:text-white'}`}
                  title="Largura Padrão (760px)"
                >
                  760px
                </button>
                <button
                  onClick={() => setDrawerWidth(1020)}
                  className={`px-2 py-0.5 rounded ${drawerWidth > 850 ? 'bg-white dark:bg-white/10 font-bold text-slate-900 dark:text-white shadow-2xs' : 'hover:text-slate-900 dark:hover:text-white'}`}
                  title="Largura Expandida (1020px)"
                >
                  1020px
                </button>
              </div>
            )}

            {/* Share Button */}
            <Button
              variant="outline"
              size="sm"
              iconLeft={<Share2 className="w-3.5 h-3.5" />}
              onClick={handleShare}
              className="text-xs hidden sm:inline-flex"
            >
              {copiedLink ? 'Copiado!' : 'Compartilhar'}
            </Button>

            {/* Save Button */}
            <Button
              variant={isSaved || opportunity.isSaved ? 'emerald' : 'secondary'}
              size="sm"
              iconLeft={<Bookmark className="w-3.5 h-3.5" />}
              onClick={() => onToggleSave?.(opportunity.id)}
              className="text-xs"
            >
              {isSaved || opportunity.isSaved ? 'Salvo' : 'Salvar'}
            </Button>

            {/* Fullscreen Toggle Button */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className={`p-1.5 rounded-lg border transition-all ${
                isLight
                  ? 'border-slate-200 bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-100 shadow-2xs'
                  : 'border-white/10 bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title={isFullscreen ? 'Reduzir para gaveta (Esc)' : 'Expandir em Tela Cheia'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4 text-cyan-400" /> : <Maximize2 className="w-4 h-4 text-cyan-400" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors ml-0.5 ${
                isLight
                  ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
              title="Fechar (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* HERO TITLE & HIGHLIGHT CARDS (Always visible) */}
        <div
          className={`px-5 sm:px-7 py-5 border-b shrink-0 ${
            isLight
              ? 'bg-gradient-to-b from-white to-slate-50/80 border-slate-200'
              : 'bg-gradient-to-b from-[#101626] to-[#0a0e18] border-white/[0.06]'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 max-w-3xl">
              <h2
                className={`text-xl sm:text-2xl font-extrabold tracking-tight leading-snug ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                {opportunity.title}
              </h2>
              <p
                className={`text-xs sm:text-sm leading-relaxed ${
                  isLight ? 'text-slate-600' : 'text-slate-300'
                }`}
              >
                {opportunity.tagline}
              </p>
            </div>
            <RadarScoreBadge score={opportunity.score} size="lg" className="shrink-0" />
          </div>

          {/* 3 HIGHLIGHT METRICS: LUCRO ESTIMADO, VELOCIDADE & INVESTIMENTO (Clean Neutral Layout) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-5">
            {/* 1. ESTIMATIVA DE LUCRO */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans uppercase tracking-wider font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Lucro Líquido Projetado
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-sans font-semibold bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                  Alta Margem
                </span>
              </div>
              <div className="text-xl font-bold font-sans text-slate-900 dark:text-white tracking-tight">
                {monthlyProfit}
              </div>
              <div className="text-xs font-sans flex items-center justify-between pt-1.5 border-t border-slate-200/70 dark:border-white/10 text-slate-600 dark:text-slate-400">
                <span>
                  Margem: <strong className="text-slate-900 dark:text-slate-200 font-semibold">{profitMargin}</strong>
                </span>
                <span>
                  Ticket: <strong className="text-slate-900 dark:text-slate-200 font-semibold">{averageTicket}</strong>
                </span>
              </div>
            </div>

            {/* 2. VELOCIDADE DE EXECUÇÃO */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans uppercase tracking-wider font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-slate-400" /> Velocidade / Prazo MVP
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-sans font-semibold bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                  Ciclo Curto
                </span>
              </div>
              <div className="text-xl font-bold font-sans text-slate-900 dark:text-white tracking-tight">
                MVP em {mvpDays} dias
              </div>
              <div className="text-xs font-sans flex items-center justify-between pt-1.5 border-t border-slate-200/70 dark:border-white/10 text-slate-600 dark:text-slate-400">
                <span>
                  1ª Venda: <strong className="text-slate-900 dark:text-slate-200 font-semibold">{firstSaleDays} dias</strong>
                </span>
                <span>
                  Dedicação: <strong className="text-slate-900 dark:text-slate-200 font-semibold">{weeklyHours}</strong>
                </span>
              </div>
            </div>

            {/* 3. INVESTIMENTO NECESSÁRIO */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans uppercase tracking-wider font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> Investimento Inicial
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-sans font-semibold bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                  Risco Baixo
                </span>
              </div>
              <div className="text-xl font-bold font-sans text-slate-900 dark:text-white tracking-tight">
                {capitalEstimated}
              </div>
              <div className="text-xs font-sans flex items-center justify-between pt-1.5 border-t border-slate-200/70 dark:border-white/10 text-slate-600 dark:text-slate-400">
                <span>
                  Modelo: <strong className="text-slate-900 dark:text-slate-200 font-semibold">{capitalTier}</strong>
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  100% Bootstrap
                </span>
              </div>
            </div>
          </div>

          {/* ACTION CTA BANNER: SALVAR NO WORKSPACE PESSOAL */}
          <div className="mt-4 p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 shadow-2xs">
            <div className="space-y-1">
              <h4 className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white font-sans">
                <Rocket className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                <span>
                  {personalProject
                    ? 'Projeto Ativo no seu Workspace Pessoal'
                    : 'Salvar Projeto e Desbloquear Checklist com AI Coach'}
                </span>
              </h4>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 font-sans">
                {personalProject
                  ? `Você já concluiu ${personalProject.progressPercent}% das etapas. O AI Coach monitora seus prazos e cobra sua execução diária.`
                  : 'Ao salvar, este projeto entra na sua esteira diária com checklist passo a passo e alertas proativos da IA para você não travar.'}
              </p>
            </div>
            <Button
              variant={personalProject ? 'secondary' : 'primary'}
              size="sm"
              onClick={handleSaveAsPersonalProject}
              iconLeft={personalProject ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              className="shrink-0 text-xs font-semibold"
            >
              {personalProject ? 'Checklist Ativo' : 'Iniciar Como Meu Projeto'}
            </Button>
          </div>
        </div>

        {/* TAB NAVIGATION BAR */}
        <div
          className={`flex items-center gap-1 px-5 sm:px-7 border-b overflow-x-auto no-scrollbar shrink-0 ${
            isLight
              ? 'bg-white border-slate-200'
              : 'bg-[#0b101c] border-white/[0.08]'
          }`}
        >
          <button
            onClick={() => setActiveTab('playbook')}
            className={`py-3.5 px-3.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'playbook'
                ? isLight
                  ? 'border-blue-600 text-blue-700'
                  : 'border-cyan-400 text-cyan-300'
                : isLight
                ? 'border-transparent text-slate-500 hover:text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${activeTab === 'playbook' ? (isLight ? 'text-blue-600' : 'text-cyan-400') : ''}`} />
            <span>Passo a Passo de Execução & Checklist</span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3.5 px-3.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'overview'
                ? isLight
                  ? 'border-blue-600 text-blue-700'
                  : 'border-cyan-400 text-cyan-300'
                : isLight
                ? 'border-transparent text-slate-500 hover:text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Dossiê de 6 Dimensões</span>
          </button>

          <button
            onClick={() => setActiveTab('market')}
            className={`py-3.5 px-3.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'market'
                ? isLight
                  ? 'border-blue-600 text-blue-700'
                  : 'border-cyan-400 text-cyan-300'
                : isLight
                ? 'border-transparent text-slate-500 hover:text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Mercado & Concorrência</span>
          </button>

          <button
            onClick={() => setActiveTab('signals')}
            className={`py-3.5 px-3.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'signals'
                ? isLight
                  ? 'border-blue-600 text-blue-700'
                  : 'border-cyan-400 text-cyan-300'
                : isLight
                ? 'border-transparent text-slate-500 hover:text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Sinais de Origem ({opportunity.sources?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('swot')}
            className={`py-3.5 px-3.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'swot'
                ? isLight
                  ? 'border-purple-600 text-purple-700'
                  : 'border-purple-400 text-purple-300'
                : isLight
                ? 'border-transparent text-slate-500 hover:text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span>SWOT IA</span>
          </button>
        </div>

        {/* TAB CONTENT (SCROLLABLE BODY) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* TAB 1: PLAYBOOK & INTERACTIVE DAILY CHECKLIST */}
          {activeTab === 'playbook' && (
            <div className="space-y-6">
              {/* Progress Summary Header */}
              <div
                className={`p-4 rounded-[20px] border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isLight
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-[#0d1322] border-white/[0.08]'
                }`}
              >
                <div>
                  <h4
                    className={`text-sm sm:text-base font-extrabold flex items-center gap-2 ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    <Rocket className={`w-4 h-4 ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
                    Como Conseguiria Fazer: Roteiro & Checklist de Execução Diário
                  </h4>
                  <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    Passo a passo testado com <strong>zero desperdício de tempo e código</strong>. Marque as tarefas diariamente conforme você avança.
                  </p>
                </div>

                {personalProject ? (
                  <div className="shrink-0 text-left sm:text-right">
                    <div className="flex items-center gap-2 sm:justify-end">
                      <span className={`text-xs font-mono font-bold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                        {personalProject.progressPercent}% Concluído
                      </span>
                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${isLight ? 'bg-amber-100 text-amber-800' : 'bg-amber-500/20 text-amber-300'}`}>
                        🔥 Streak: {personalProject.dailyStreak || 1} dias
                      </span>
                    </div>
                    <div className={`w-36 h-2 rounded-full overflow-hidden mt-1.5 ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}>
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-emerald-500 transition-all duration-300 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                        style={{ width: `${personalProject.progressPercent}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveAsPersonalProject}
                    iconLeft={<Plus className="w-4 h-4" />}
                    className="shrink-0 text-xs font-bold"
                  >
                    Ativar Checklist Diário
                  </Button>
                )}
              </div>

              {/* DETALHAMENTO DE INVESTIMENTO INICIAL ITEM A ITEM */}
              <div
                className={`p-4 rounded-[20px] border space-y-2.5 ${
                  isLight
                    ? 'bg-slate-50/70 border-slate-200'
                    : 'bg-[#0d1424] border-white/[0.08]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[11px] font-mono uppercase font-extrabold tracking-wider ${
                      isLight ? 'text-slate-700' : 'text-slate-300'
                    }`}
                  >
                    Detalhamento do Investimento Inicial (Risco Mínimo de Capital):
                  </span>
                  <span className={`text-[11px] font-mono font-bold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                    Total: {capitalEstimated}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  {capitalBreakdown.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                        isLight
                          ? 'bg-white border-slate-200 text-slate-800'
                          : 'bg-white/[0.02] border-white/[0.05] text-slate-300'
                      }`}
                    >
                      <span className="font-medium">{item.item}</span>
                      <strong className={isLight ? 'text-emerald-700 font-extrabold' : 'text-emerald-400 font-extrabold'}>
                        {item.cost}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* TABELA DE PROJEÇÃO DE CENÁRIOS FINANCEIROS */}
              <div
                className={`p-4 rounded-[20px] border space-y-3 ${
                  isLight
                    ? 'bg-white border-slate-200'
                    : 'bg-[#0d1424] border-white/[0.08]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h5
                    className={`text-xs sm:text-sm font-extrabold flex items-center gap-2 ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    Projeção em 3 Cenários Reais (Lucro Líquido no Bolso)
                  </h5>
                  <span className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Ticket Médio: <strong>{averageTicket}</strong>
                  </span>
                </div>

                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className={`border-b ${isLight ? 'border-slate-200 text-slate-500' : 'border-white/10 text-slate-400'}`}>
                        <th className="pb-2 font-semibold">Cenário</th>
                        <th className="pb-2 font-semibold">Assinantes</th>
                        <th className="pb-2 font-semibold">Faturamento Bruto</th>
                        <th className="pb-2 font-semibold">Custos Operacionais</th>
                        <th className="pb-2 font-bold text-right">Lucro Líquido</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                      {financialScenarios.map((sc, i) => (
                        <tr key={i} className={`hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors`}>
                          <td className={`py-2.5 font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {sc.name}
                          </td>
                          <td className={`py-2.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                            {sc.customers} clientes
                          </td>
                          <td className={`py-2.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                            {sc.gross}
                          </td>
                          <td className={`py-2.5 ${isLight ? 'text-rose-700' : 'text-rose-400'}`}>
                            {sc.costs}
                          </td>
                          <td className={`py-2.5 font-black text-right ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                            {sc.net}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* STACK TECNOLÓGICA RECOMENDADA DE BAIXO CUSTO */}
              <div
                className={`p-4 rounded-[20px] border space-y-3 ${
                  isLight
                    ? 'bg-slate-50/70 border-slate-200'
                    : 'bg-[#0d1424] border-white/[0.08]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h5
                    className={`text-xs sm:text-sm font-extrabold flex items-center gap-2 ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    <Code2 className="w-4 h-4 text-cyan-500" />
                    Stack Tecnológica Recomendada (Custo Zero para Construção)
                  </h5>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${isLight ? 'bg-blue-100 text-blue-800' : 'bg-cyan-500/20 text-cyan-300'}`}>
                    100% Free Tier
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {recommendedStack.map((tech, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex flex-col justify-between gap-1 text-xs ${
                        isLight ? 'bg-white border-slate-200' : 'bg-white/[0.02] border-white/[0.05]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] uppercase font-mono font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          {tech.category}
                        </span>
                        <span className={`text-[10px] font-mono font-bold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                          {tech.cost}
                        </span>
                      </div>
                      <div className={`font-bold font-mono text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {tech.tool}
                      </div>
                      <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        {tech.role}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4 PHASES DETAILED PLAYBOOK WITH INTERACTIVE CHECKLIST */}
              {opportunity.executionPlaybook && opportunity.executionPlaybook.length > 0 ? (
                <div className="space-y-5">
                  {opportunity.executionPlaybook.map((phase) => (
                    <div
                      key={phase.phase}
                      className={`rounded-[20px] border overflow-hidden transition-all shadow-sm ${
                        isLight
                          ? 'border-slate-200 bg-white'
                          : 'border-white/[0.08] bg-[#0c1220]'
                      }`}
                    >
                      {/* Phase Header */}
                      <div
                        className={`p-4 border-b flex items-center justify-between gap-3 ${
                          isLight
                            ? 'bg-slate-100/80 border-slate-200'
                            : 'bg-white/[0.03] border-white/[0.06]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded-full text-xs font-mono font-extrabold flex items-center justify-center shrink-0 border ${
                              isLight
                                ? 'bg-blue-100 text-blue-800 border-blue-300'
                                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            }`}
                          >
                            {phase.phase}
                          </span>
                          <div>
                            <h5
                              className={`text-xs sm:text-sm font-extrabold ${
                                isLight ? 'text-slate-900' : 'text-white'
                              }`}
                            >
                              {phase.name}
                            </h5>
                            <p
                              className={`text-[11px] leading-relaxed ${
                                isLight ? 'text-slate-600' : 'text-slate-400'
                              }`}
                            >
                              {phase.description}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border shrink-0 ${
                            isLight
                              ? 'bg-white text-blue-700 border-slate-200 shadow-2xs'
                              : 'bg-white/[0.05] text-cyan-300 border-white/[0.08]'
                          }`}
                        >
                          {phase.timeEstimate}
                        </span>
                      </div>

                      {/* Action Items List */}
                      <div className="p-4 space-y-3">
                        {phase.actionItems.map((item) => {
                          const taskId = `task-${phase.phase}-${item.id}`;
                          const isDone = personalProject?.tasks.find((t) => t.id === taskId)?.completed;

                          return (
                            <div
                              key={item.id}
                              onClick={() => handleToggleTask(taskId)}
                              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 select-none ${
                                isDone
                                  ? isLight
                                    ? 'bg-emerald-50/70 border-emerald-300'
                                    : 'bg-emerald-950/20 border-emerald-500/40'
                                  : isLight
                                  ? 'bg-slate-50/50 border-slate-200 hover:border-blue-400 hover:bg-white'
                                  : 'bg-white/[0.02] border-white/[0.06] hover:border-cyan-500/40 hover:bg-white/[0.04]'
                              }`}
                            >
                              <button
                                type="button"
                                className="mt-0.5 shrink-0 transition-colors"
                              >
                                {isDone ? (
                                  <CheckCircle2
                                    className={`w-5 h-5 ${
                                      isLight
                                        ? 'text-emerald-600 fill-emerald-100'
                                        : 'text-emerald-400 fill-emerald-500/20'
                                    }`}
                                  />
                                ) : (
                                  <Circle
                                    className={`w-5 h-5 ${
                                      isLight
                                        ? 'text-slate-400 hover:text-blue-600'
                                        : 'text-slate-500 hover:text-cyan-400'
                                    }`}
                                  />
                                )}
                              </button>

                              <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <h6
                                    className={`text-xs sm:text-sm font-bold transition-colors ${
                                      isDone
                                        ? isLight
                                          ? 'line-through text-slate-500'
                                          : 'line-through text-slate-500'
                                        : isLight
                                        ? 'text-slate-900'
                                        : 'text-white'
                                    }`}
                                  >
                                    {item.title}
                                  </h6>
                                  {item.recommendedDay && (
                                    <span
                                      className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold shrink-0 ${
                                        isLight
                                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                                          : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                                      }`}
                                    >
                                      {item.recommendedDay}
                                    </span>
                                  )}
                                </div>

                                <div className="text-xs space-y-1.5">
                                  <p
                                    className={`leading-relaxed ${
                                      isLight ? 'text-slate-700' : 'text-slate-300'
                                    }`}
                                  >
                                    <strong
                                      className={`font-mono text-[11px] uppercase mr-1.5 ${
                                        isLight ? 'text-slate-900 font-extrabold' : 'text-slate-400 font-extrabold'
                                      }`}
                                    >
                                      Como Executar:
                                    </strong>
                                    {item.howToExecute}
                                  </p>
                                  <p
                                    className={`text-[11px] font-mono p-2.5 rounded-lg border leading-relaxed ${
                                      isLight
                                        ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                                        : 'bg-emerald-500/[0.06] text-emerald-300 border-emerald-500/20'
                                    }`}
                                  >
                                    <strong
                                      className={`uppercase mr-1.5 ${
                                        isLight ? 'text-emerald-800 font-black' : 'text-emerald-400 font-black'
                                      }`}
                                    >
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
                <div
                  className={`p-6 rounded-[20px] border text-center space-y-3 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.03] border-white/10'
                  }`}
                >
                  <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    Ative este projeto para criar o checklist diário personalizado.
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

          {/* TAB 2: DOSSIÊ DE 6 DIMENSÕES DE OPORTUNIDADE */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* 1. O QUE FOI DETECTADO */}
              <div
                className={`p-4 rounded-[20px] border space-y-1.5 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.03] border-white/[0.08]'
                }`}
              >
                <span
                  className={`text-xs font-mono font-bold uppercase tracking-tight flex items-center gap-2 ${
                    isLight ? 'text-blue-700' : 'text-cyan-400'
                  }`}
                >
                  <Info className="w-3.5 h-3.5" /> 1. O Que Foi Detectado no Mercado:
                </span>
                <p className={`text-xs sm:text-sm leading-relaxed ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  {opportunity.whatDetected || opportunity.tagline}
                </p>
              </div>

              {/* 2. POR QUE É IMPORTANTE */}
              <div
                className={`p-4 rounded-[20px] border space-y-1.5 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.03] border-white/[0.08]'
                }`}
              >
                <span
                  className={`text-xs font-mono font-bold uppercase tracking-tight flex items-center gap-2 ${
                    isLight ? 'text-emerald-700' : 'text-emerald-400'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" /> 2. Por Que é uma Janela de Oportunidade Única:
                </span>
                <p className={`text-xs sm:text-sm leading-relaxed ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  {opportunity.whyImportant ||
                    'Representa uma quebra de modelo nos players tradicionais gerando demanda reprimida imediata e disposição a pagar.'}
                </p>
              </div>

              {/* 3. MERCADOS ENVOLVIDOS */}
              <div
                className={`p-4 rounded-[20px] border space-y-1.5 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.03] border-white/[0.08]'
                }`}
              >
                <span
                  className={`text-xs font-mono font-bold uppercase tracking-tight flex items-center gap-2 ${
                    isLight ? 'text-purple-700' : 'text-violet-400'
                  }`}
                >
                  <Globe2 className="w-3.5 h-3.5" /> 3. Mercados de Origem & Expansão:
                </span>
                <div className={`text-xs space-y-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  <div>
                    País de Validação: <strong>{originFlag} {originCountry} ({opportunity.market?.continent})</strong>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Mercados Receptores:</span>
                    {targetMarkets.map((m) => (
                      <Badge key={m} variant={isLight ? 'slate' : 'outline'} size="xs">
                        {m}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. PROBLEMA REAL */}
              <div
                className={`p-4 rounded-[20px] border space-y-1.5 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.03] border-white/[0.08]'
                }`}
              >
                <span
                  className={`text-xs font-mono font-bold uppercase tracking-tight flex items-center gap-2 ${
                    isLight ? 'text-rose-700' : 'text-rose-400'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" /> 4. Problema Crítico Existente:
                </span>
                <p className={`text-xs sm:text-sm leading-relaxed ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  {opportunity.problemExists || opportunity.primaryProblem}
                </p>
              </div>

              {/* 5. OPORTUNIDADE EXPLORÁVEL */}
              <div
                className={`p-4 rounded-[20px] border space-y-1.5 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.03] border-white/[0.08]'
                }`}
              >
                <span
                  className={`text-xs font-mono font-bold uppercase tracking-tight flex items-center gap-2 ${
                    isLight ? 'text-blue-700' : 'text-cyan-300'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" /> 5. Como Explorar Esta Oportunidade:
                </span>
                <p className={`text-xs sm:text-sm leading-relaxed ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  {opportunity.opportunityExplored || opportunity.proposedSolution}
                </p>
              </div>

              {/* 6. MONETIZAÇÃO */}
              <div
                className={`p-4 rounded-[20px] border space-y-1.5 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.03] border-white/[0.08]'
                }`}
              >
                <span
                  className={`text-xs font-mono font-bold uppercase tracking-tight flex items-center gap-2 ${
                    isLight ? 'text-emerald-700' : 'text-emerald-400'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" /> 6. Estrutura de Monetização:
                </span>
                <p className={`text-xs sm:text-sm leading-relaxed ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  {opportunity.howMonetized || opportunity.monetizationModel}
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: MERCADO & CONCORRÊNCIA */}
          {activeTab === 'market' && (
            <div className="space-y-6">
              <div>
                <h4 className={`text-xs font-mono uppercase tracking-wider font-bold mb-3 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                  Concorrentes Existentes Identificados
                </h4>
                <div className="space-y-2">
                  {opportunity.existingCompetitors?.map((comp) => (
                    <div
                      key={comp}
                      className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                        isLight ? 'bg-white border-slate-200' : 'bg-white/[0.03] border-white/[0.08]'
                      }`}
                    >
                      <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>{comp}</span>
                      <Badge variant="rose" size="xs">
                        Player Estabelecido
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className={`p-4 rounded-[20px] border space-y-2 ${
                  isLight ? 'bg-blue-50/70 border-blue-200' : 'bg-white/[0.03] border-white/[0.08]'
                }`}
              >
                <h4 className={`text-xs font-mono uppercase tracking-wider font-extrabold ${isLight ? 'text-blue-800' : 'text-cyan-400'}`}>
                  Ângulo de Diferenciação Estratégica (Moat):
                </h4>
                <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                  {opportunity.differentiationAngle}
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: SINAIS & ORIGEM AUDITÁVEL */}
          {activeTab === 'signals' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/[0.08]">
                <div>
                  <h4 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Transparência de Inteligência & Auditoria de Fontes
                  </h4>
                  <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    Separação estrita entre fatos observados, análises algorítmicas e hipóteses de negócio.
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold border ${isLight ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'}`}>
                  Origem Auditável
                </span>
              </div>

              {/* Painel de Fontes */}
              <div
                className={`p-4 rounded-[20px] border space-y-3.5 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-blue-500/[0.03] border-blue-500/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-mono font-bold uppercase ${isLight ? 'text-blue-800' : 'text-blue-300'}`}>
                    1. Fato Verificado via API / Feed Oficial
                  </span>
                  <span className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {opportunity.dateDetected}
                  </span>
                </div>

                <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  {opportunity.whatDetected}
                </p>

                <div className="space-y-2 pt-2">
                  <span className={`text-[11px] font-mono uppercase font-bold block ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    Fontes Primárias Coletadas:
                  </span>
                  {opportunity.sources?.map((src, i) => (
                    <div
                      key={i}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                        isLight ? 'bg-white border-slate-200' : 'bg-white/[0.03] border-white/[0.08]'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="cyan" size="xs">
                            {src.platform}
                          </Badge>
                          <span className={`text-2xs font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            {src.timestamp} • {src.volumeOrScore}
                          </span>
                        </div>
                        <p className={`text-xs italic line-clamp-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                          "{src.snippet}"
                        </p>
                      </div>

                      {src.url && (
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-colors shrink-0 ${
                            isLight
                              ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                              : 'bg-blue-500/10 text-blue-300 border-blue-500/30 hover:bg-blue-500/20'
                          }`}
                        >
                          <span>Ver Original</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SWOT IA */}
          {activeTab === 'swot' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={`p-4 rounded-[20px] border space-y-2 ${
                  isLight ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' : 'bg-emerald-950/20 border-emerald-500/30 text-slate-200'
                }`}
              >
                <span className={`text-xs font-mono font-bold uppercase tracking-wider ${isLight ? 'text-emerald-800' : 'text-emerald-400'}`}>
                  Pontos Fortes (Strengths)
                </span>
                <ul className="text-xs space-y-1.5 list-disc list-inside leading-relaxed">
                  {opportunity.aiSwot?.strengths?.map((s, i) => (
                    <li key={i}>{s}</li>
                  )) || <li>Modelo de alta retenção com margem líquida acima de 80%.</li>}
                </ul>
              </div>

              <div
                className={`p-4 rounded-[20px] border space-y-2 ${
                  isLight ? 'bg-rose-50/70 border-rose-200 text-rose-950' : 'bg-rose-950/20 border-rose-500/30 text-slate-200'
                }`}
              >
                <span className={`text-xs font-mono font-bold uppercase tracking-wider ${isLight ? 'text-rose-800' : 'text-rose-400'}`}>
                  Fraquezas (Weaknesses)
                </span>
                <ul className="text-xs space-y-1.5 list-disc list-inside leading-relaxed">
                  {opportunity.aiSwot?.weaknesses?.map((w, i) => (
                    <li key={i}>{w}</li>
                  )) || <li>Necessidade de educar os primeiros clientes sobre a facilidade do setup.</li>}
                </ul>
              </div>

              <div
                className={`p-4 rounded-[20px] border space-y-2 ${
                  isLight ? 'bg-blue-50/70 border-blue-200 text-blue-950' : 'bg-cyan-950/20 border-cyan-500/30 text-slate-200'
                }`}
              >
                <span className={`text-xs font-mono font-bold uppercase tracking-wider ${isLight ? 'text-blue-800' : 'text-cyan-400'}`}>
                  Oportunidades (Opportunities)
                </span>
                <ul className="text-xs space-y-1.5 list-disc list-inside leading-relaxed">
                  {opportunity.aiSwot?.opportunities?.map((o, i) => (
                    <li key={i}>{o}</li>
                  )) || <li>Expansão rápida para outros países latino-americanos e europeus.</li>}
                </ul>
              </div>

              <div
                className={`p-4 rounded-[20px] border space-y-2 ${
                  isLight ? 'bg-amber-50/70 border-amber-200 text-amber-950' : 'bg-amber-950/20 border-amber-500/30 text-slate-200'
                }`}
              >
                <span className={`text-xs font-mono font-bold uppercase tracking-wider ${isLight ? 'text-amber-800' : 'text-amber-400'}`}>
                  Ameaças (Threats)
                </span>
                <ul className="text-xs space-y-1.5 list-disc list-inside leading-relaxed">
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
