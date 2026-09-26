import React, { useState } from 'react';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ApiClient } from '../services/apiClient';
import { Bot, Sparkles, Send, Copy, Check, Layers, Target, ShieldAlert } from 'lucide-react';

export const AiAnalystView: React.FC = () => {
  const [inputQuery, setInputQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const presetPrompts = [
    {
      title: 'Plano de MVP em 48 Horas',
      icon: <Target className="w-3.5 h-3.5 text-cyan-400" />,
      text: 'Gere um plano de validação de 48 horas para um Micro-SaaS de emissão de NF-e para Stripe sem escrever código de prefeituras inicialmente.',
    },
    {
      title: 'Desconstrução de Concorrente (Unbundling)',
      icon: <Layers className="w-3.5 h-3.5 text-violet-400" />,
      text: 'Desconstrua os 3 recursos mais usados do HubSpot Starter e mostre como criar uma alternativa ultra-leve com WhatsApp API.',
    },
    {
      title: 'Estimativa de CAC, LTV e Precificação',
      icon: <Sparkles className="w-3.5 h-3.5 text-emerald-400" />,
      text: 'Calcule a viabilidade de precificar um SaaS B2B a R$ 290/mês para clínicas de saúde considerando CAC de tráfego pago e churn esperado de 3%.',
    },
    {
      title: 'Mapeamento de Riscos e Barreiras',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />,
      text: 'Quais são os 4 maiores riscos regulatórios e técnicos de lançar um produto de faturamento fiscal na América Latina?',
    },
  ];

  const handleRunAnalysis = (queryText: string) => {
    if (!queryText.trim()) return;
    setIsGenerating(true);
    setActiveAnalysis('');

    // Stream from server SSE with graceful completion
    ApiClient.streamAiAnalysis(
      queryText,
      undefined,
      (chunk) => {
        setActiveAnalysis((prev) => (prev !== null ? prev + chunk : chunk));
      },
      () => {
        setIsGenerating(false);
      }
    );
  };

  const handleCopy = () => {
    if (activeAnalysis) {
      navigator.clipboard?.writeText(activeAnalysis);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-violet-950/40 to-slate-900 border border-violet-500/20">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="violet" size="sm">
            Inteligência Sintética Estratégica
          </Badge>
          <span className="text-2xs font-mono text-slate-400">
            Motor com streaming em tempo real e controle de tokens
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
          AI Analyst Workbench
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Simule desconstruções de concorrência, modelos econômicos unitários (CAC/LTV) e planos de validação sem viés otimista.
        </p>
      </div>

      {/* Quick Prompt Presets */}
      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-3">
          Playbooks de Análise Instantânea:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {presetPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => {
                setInputQuery(p.text);
                handleRunAnalysis(p.text);
              }}
              className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.08] hover:border-violet-500/40 text-left transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center gap-2 mb-2">
                {p.icon}
                <span className="text-xs font-semibold text-slate-200 group-hover:text-violet-300">
                  {p.title}
                </span>
              </div>
              <p className="text-2xs text-slate-400 line-clamp-2 leading-relaxed">
                {p.text}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Input Prompt Box */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-white/[0.1] space-y-3">
        <div className="flex items-center justify-between text-2xs font-mono text-slate-500">
          <div className="flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5 text-violet-400" />
            <span>AI Analyst Model v3.8 • Streaming Server SSE Ativo</span>
          </div>
          <span className="text-emerald-400">Tokens Cap: 800 max</span>
        </div>

        <div className="relative">
          <textarea
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Digite a ideia de SaaS, concorrente que deseja desconstruir ou mercado que deseja avaliar..."
            rows={3}
            className="w-full bg-slate-950/60 border border-white/[0.08] rounded-lg p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-violet-500/60 resize-none font-sans"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-2xs text-slate-500">
            A inteligência foca em desconstrução de risco e viabilidade de MVP.
          </span>

          <Button
            variant="primary"
            size="sm"
            iconLeft={<Send className="w-3.5 h-3.5" />}
            isLoading={isGenerating}
            onClick={() => handleRunAnalysis(inputQuery)}
          >
            {isGenerating ? 'Transmitindo Análise...' : 'Gerar Análise Crítica'}
          </Button>
        </div>
      </div>

      {/* Analysis Output Box */}
      {activeAnalysis && (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-violet-500/30 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-xs font-mono font-semibold text-slate-200">
                Relatório de Análise Estratégica
              </span>
              {isGenerating && (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-cyan-400 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Transmitindo...
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="xs"
                iconLeft={copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                onClick={handleCopy}
              >
                {copied ? 'Copiado' : 'Copiar'}
              </Button>
            </div>
          </div>

          <div className="prose prose-invert max-w-none text-xs leading-relaxed space-y-3 whitespace-pre-line font-sans text-slate-300">
            {activeAnalysis}
          </div>
        </div>
      )}
    </div>
  );
};
