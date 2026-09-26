import React, { useState } from 'react';
import { Opportunity } from '../../types';
import { RadarScoreBadge } from './RadarScoreBadge';
import { Badge } from './Badge';
import { Button } from './Button';
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
  Lightbulb,
  DollarSign,
  Info,
  TrendingUp,
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
  const [activeTab, setActiveTab] = useState<'overview' | 'market' | 'playbook' | 'signals' | 'swot'>('overview');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !opportunity) return null;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const originCountry = opportunity.market?.originCountry || 'Global';
  const originFlag = opportunity.market?.originFlag || '🌐';
  const originCode = opportunity.market?.originCode || 'GL';
  const targetMarkets =
    opportunity.market?.targetMarkets || opportunity.targetMarkets || ['Global'];

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

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">
                Potencial MRR
              </span>
              <span className="text-sm font-semibold font-mono text-emerald-400">
                {opportunity.potentialMrr}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">
                Tempo de MVP
              </span>
              <span className="text-sm font-semibold font-mono text-slate-200">
                {opportunity.timeToMvpDays} dias
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">
                Nível de Dificuldade
              </span>
              <span className="text-sm font-semibold font-mono text-cyan-300">
                {opportunity.difficulty || opportunity.effort}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">
                Concorrência
              </span>
              <span className="text-sm font-semibold font-mono text-amber-400">
                {opportunity.competitionLevel}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 border-b border-white/[0.08] bg-slate-900/60 overflow-x-auto no-scrollbar shrink-0">
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
            onClick={() => setActiveTab('playbook')}
            className={`py-3 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'playbook'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Plano de Execução</span>
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
              <div className="p-4 rounded-xl bg-slate-900/80 border border-emerald-500/25 space-y-1.5">
                <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-tight flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" /> 5. Oportunidade a explorar:
                </span>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  {opportunity.opportunityExplored || opportunity.proposedSolution}
                </p>
              </div>

              {/* 6. COMO PODERIA SER MONETIZADA */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-emerald-500/25 space-y-1.5">
                <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-tight flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" /> 6. Como monetizar:
                </span>
                <p className="text-xs text-emerald-300 font-mono font-medium leading-relaxed">
                  {opportunity.howMonetized || opportunity.monetizationModel}
                </p>
              </div>
            </div>
          )}

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

          {activeTab === 'playbook' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Roteiro de Validação Rápida (Pré-Código)
                </h4>
                <span className="text-2xs font-mono text-cyan-400">
                  Zero Desperdício de Desenvolvimento
                </span>
              </div>

              {opportunity.validationRoadmap?.length ? (
                <div className="space-y-3">
                  {opportunity.validationRoadmap.map((item) => (
                    <div
                      key={item.step}
                      className="p-4 rounded-xl bg-slate-900/70 border border-white/[0.08] flex items-start gap-3.5"
                    >
                      <div className="w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                        {item.step}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h5 className="text-xs font-semibold text-slate-200">
                            {item.title}
                          </h5>
                          <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.estimatedHours}h
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Nenhum playbook estruturado gerado ainda. Use o AI Analyst para sintetizar um plano instantâneo.
                </p>
              )}
            </div>
          )}

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

              {/* 1. PAINEL DADO (Fatos Brutos e Evidências Coletadas) */}
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

                {/* Sources list with direct external links */}
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

              {/* 2. PAINEL ANÁLISE (Interpretação e Fricção de Mercado) */}
              <div className="p-4 rounded-xl bg-violet-500/[0.04] border border-violet-500/25 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 text-xs font-mono font-bold uppercase">
                      2. Análise (Inteligência & Dor)
                    </span>
                    <span className="text-2xs font-mono text-slate-400">
                      Score de Relevância: {opportunity.score}/100
                    </span>
                  </div>
                  <Badge variant="violet" size="xs">
                    Confiança: {opportunity.confidence}
                  </Badge>
                </div>

                <div className="space-y-2 text-xs text-slate-200">
                  <div>
                    <strong className="text-violet-300 block mb-0.5">Por que isso importa agora:</strong>
                    <p className="text-slate-300 leading-relaxed font-sans">{opportunity.whyImportant}</p>
                  </div>
                  <div>
                    <strong className="text-violet-300 block mb-0.5">Diagnóstico da Fricção:</strong>
                    <p className="text-slate-300 leading-relaxed font-sans">{opportunity.problemExists}</p>
                  </div>
                  <div>
                    <strong className="text-violet-300 block mb-0.5">Nicho Desassistido:</strong>
                    <p className="text-slate-300 leading-relaxed font-sans">{opportunity.unservedNiche}</p>
                  </div>
                </div>
              </div>

              {/* 3. PAINEL HIPÓTESE (Modelo de Negócio e Plano de Validação) */}
              <div className="p-4 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/25 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold uppercase">
                      3. Hipótese (Modelo & Validação)
                    </span>
                    <span className="text-2xs font-mono text-slate-400">
                      Sujestão Acionável
                    </span>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 font-semibold">
                    {opportunity.potentialMrr}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-200">
                  <div>
                    <strong className="text-emerald-300 block mb-0.5">Oportunidade Proposta:</strong>
                    <p className="text-slate-300 leading-relaxed font-sans">{opportunity.opportunityExplored}</p>
                  </div>
                  <div>
                    <strong className="text-emerald-300 block mb-0.5">Hipótese de Monetização:</strong>
                    <p className="text-emerald-200 font-mono font-medium">{opportunity.howMonetized}</p>
                  </div>
                  <div>
                    <strong className="text-emerald-300 block mb-0.5">Diferenciação Recomendada:</strong>
                    <p className="text-slate-300 leading-relaxed font-sans">{opportunity.differentiationAngle}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'swot' && opportunity.aiSwot && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/20 space-y-2">
                <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider">
                  Forças (Strengths)
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                  {opportunity.aiSwot.strengths.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/[0.03] border border-amber-500/20 space-y-2">
                <span className="text-xs font-mono font-semibold text-amber-400 uppercase tracking-wider">
                  Fraquezas (Weaknesses)
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                  {opportunity.aiSwot.weaknesses.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-cyan-500/[0.03] border border-cyan-500/20 space-y-2">
                <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider">
                  Oportunidades (Opportunities)
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                  {opportunity.aiSwot.opportunities.map((o, idx) => (
                    <li key={idx}>{o}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-rose-500/[0.03] border border-rose-500/20 space-y-2">
                <span className="text-xs font-mono font-semibold text-rose-400 uppercase tracking-wider">
                  Ameaças (Threats)
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                  {opportunity.aiSwot.threats.map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Sticky Footer */}
        <div className="px-6 py-4 border-t border-white/[0.08] bg-slate-900/90 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
          <div className="text-2xs font-mono text-slate-500">
            Detectado em: {opportunity.dateDetected}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Fechar
            </Button>
            <Button
              variant="primary"
              size="sm"
              iconRight={<ExternalLink className="w-3.5 h-3.5" />}
              onClick={() => {
                alert(`Iniciando fluxo de validação no My Lab para: ${opportunity.title}`);
              }}
            >
              Criar Hipótese no My Lab
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
