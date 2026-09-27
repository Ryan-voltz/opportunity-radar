import React, { useState } from 'react';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  FileCheck2,
  CheckCircle2,
  Clock,
  Code2,
  Layers,
  ArrowRight,
  ShieldAlert,
  ChevronDown,
} from 'lucide-react';

export const ExecutionPlansView: React.FC = () => {
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({
    '1-1': true,
    '1-2': true,
  });

  const toggleStep = (id: string) => {
    setCompletedSteps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const phases = [
    {
      phaseNumber: 1,
      name: 'Fase 1: Validação Pré-Código & Demanda Financeira',
      timeline: 'Dias 1 a 5 (20 horas)',
      description: 'Garantir que pessoas reais estão dispostas a passar o cartão ou cadastrar dados antes de escrever qualquer linha de software.',
      tasks: [
        { id: '1-1', title: 'Landing Page com proposta de valor clara e cópia focada na dor', hours: 4 },
        { id: '1-2', title: 'Gravação de demonstração conceitual no Loom (2 min)', hours: 2 },
        { id: '1-3', title: 'Disparo de mensagem direta para 20 potenciais clientes no LinkedIn ou comunidades', hours: 6 },
        { id: '1-4', title: 'Validação de intenção: 5 pessoas assinando lista de espera prioritária com desconto', hours: 8 },
      ],
    },
    {
      phaseNumber: 2,
      name: 'Fase 2: Arquitetura de MVP Leve (Speed to Value)',
      timeline: 'Dias 6 a 18 (40 horas)',
      description: 'Construir estritamente o recurso essencial que resolve o problema central. Cortar configurações, relatórios complexos e perfis desnecessários.',
      tasks: [
        { id: '2-1', title: 'Setup de banco de dados simples (PostgreSQL / Supabase)', hours: 4 },
        { id: '2-2', title: 'Construção da tela única de execução do valor prometido', hours: 20 },
        { id: '2-3', title: 'Integração de checkout básico (Stripe / LemonSqueezy)', hours: 8 },
        { id: '2-4', title: 'Testes manuais com os primeiros 3 usuários alfa', hours: 8 },
      ],
    },
    {
      phaseNumber: 3,
      name: 'Fase 3: Concierge Alfa & Otimização de Retenção',
      timeline: 'Dias 19 a 30 (30 horas)',
      description: 'Acompanhar pessoalmente os 10 primeiros clientes. Fazer o suporte via chat direto para identificar atritos de usabilidade imediatamente.',
      tasks: [
        { id: '3-1', title: 'Sessão 1-on-1 de onboarding guiado com 5 clientes', hours: 6 },
        { id: '3-2', title: 'Correção diária de bugs identificados pelos alfas', hours: 14 },
        { id: '3-3', title: 'Coleta do primeiro depoimento / case de sucesso em vídeo ou texto', hours: 10 },
      ],
    },
    {
      phaseNumber: 4,
      name: 'Fase 4: Motor de Aquisição Contínuo',
      timeline: 'Mês 2+',
      description: 'Sistematizar o canal que funcionou na validação para criar fluxo previsível de novos leads.',
      tasks: [
        { id: '4-1', title: 'Publicação de estudo de caso transparente em comunidades de desenvolvedores', hours: 8 },
        { id: '4-2', title: 'Submissão para marketplaces de extensões ou diretórios de SaaS', hours: 6 },
        { id: '4-3', title: 'Automação de emails de reengajamento e alerta de trial expirando', hours: 8 },
      ],
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-card-bg border border-card-border shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="neutral" size="sm">
            Playbook de Lançamento
          </Badge>
          <span className="text-2xs font-medium text-slate-500 dark:text-slate-400">
            Metodologia Enxuta para Solo Founders
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
          Planos de Execução & Roteiros de Lançamento
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
          O maior erro ao identificar uma oportunidade é passar meses programando em segredo. Siga o roteiro em 4 fases para validar tração e faturamento em menos de 30 dias.
        </p>
      </div>

      {/* Recommended Solo Founder Tech Stack */}
      <div className="p-5 rounded-2xl bg-card-bg border border-card-border space-y-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-slate-500" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Stack Técnica Recomendada para Máxima Velocidade:
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-white/[0.06]">
            <span className="text-2xs font-medium text-slate-500 block">Frontend & API</span>
            <strong className="text-slate-900 dark:text-slate-200">Next.js / Vite React</strong>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-white/[0.06]">
            <span className="text-2xs font-medium text-slate-500 block">Estilização</span>
            <strong className="text-slate-900 dark:text-slate-200">Tailwind CSS</strong>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-white/[0.06]">
            <span className="text-2xs font-medium text-slate-500 block">Database & Auth</span>
            <strong className="text-slate-900 dark:text-slate-200">PostgreSQL / Supabase</strong>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-white/[0.06]">
            <span className="text-2xs font-medium text-slate-500 block">Pagamentos</span>
            <strong className="text-slate-900 dark:text-slate-200">Stripe / LemonSqueezy</strong>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-white/[0.06]">
            <span className="text-2xs font-medium text-slate-500 block">Deploy & CDN</span>
            <strong className="text-slate-900 dark:text-slate-200">Vercel / Cloudflare</strong>
          </div>
        </div>
      </div>

      {/* 4 Phases Accordion / Cards */}
      <div className="space-y-4">
        {phases.map((phase) => (
          <div
            key={phase.phaseNumber}
            className="p-6 rounded-2xl bg-card-bg border border-card-border space-y-4 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-card-border">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white flex items-center justify-center text-xs font-bold">
                    {phase.phaseNumber}
                  </span>
                  {phase.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  {phase.description}
                </p>
              </div>

              <span className="text-2xs text-slate-500 shrink-0 font-medium">
                {phase.timeline}
              </span>
            </div>

            {/* Checklists */}
            <div className="space-y-2">
              {phase.tasks.map((task) => {
                const isChecked = !!completedSteps[task.id];
                return (
                  <div
                    key={task.id}
                    onClick={() => toggleStep(task.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isChecked
                        ? 'bg-emerald-500/[0.04] border-emerald-500/30 text-slate-700 dark:text-slate-300'
                        : 'bg-card-bg border-card-border hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          isChecked
                            ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900'
                            : 'border-slate-300 dark:border-white/20 bg-card-bg'
                        }`}
                      >
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>

                      <span
                        className={`text-xs ${
                          isChecked ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>

                    <span className="text-2xs text-slate-500 flex items-center gap-1 shrink-0 font-medium">
                      <Clock className="w-3 h-3" />
                      {task.hours}h
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
