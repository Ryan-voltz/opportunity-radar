import React, { useState } from 'react';
import { HypothesisCard } from '../types';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { FlaskConical, Plus, X } from 'lucide-react';

interface MyLabViewProps {
  hypotheses: HypothesisCard[];
  onAddHypothesis: (hyp: Omit<HypothesisCard, 'id' | 'createdAt'>) => void;
}

export const MyLabView: React.FC<MyLabViewProps> = ({
  hypotheses,
  onAddHypothesis,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newHypothesisText, setNewHypothesisText] = useState('');
  const [newSuccessMetric, setNewSuccessMetric] = useState('');

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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/20">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="emerald" size="sm">
              Sandbox de Validação Pré-Código
            </Badge>
            <span className="text-2xs font-mono text-slate-400">
              Metodologia de Redução de Risco
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
            My Lab: Gestão de Hipóteses
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Nunca construa um software sem antes validar a intenção real de pagamento. Acompanhe suas hipóteses passo a passo da ideia à validação financeira.
          </p>
        </div>

        <Button
          variant="emerald"
          size="md"
          iconLeft={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Nova Hipótese
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageCards = hypotheses.filter((h) => h.status === stage);

          return (
            <div
              key={stage}
              className="rounded-xl bg-slate-900/40 border border-white/[0.06] p-3 flex flex-col min-w-[240px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-mono font-semibold text-slate-300">
                  {stage}
                </span>
                <span className="w-5 h-5 rounded-full bg-white/[0.04] text-slate-400 flex items-center justify-center text-[10px] font-mono">
                  {stageCards.length}
                </span>
              </div>

              {/* Cards in Column */}
              <div className="space-y-3 flex-1">
                {stageCards.map((card) => (
                  <div
                    key={card.id}
                    className="p-3.5 rounded-lg bg-slate-900/90 border border-white/[0.08] hover:border-emerald-500/30 transition-all space-y-2 group shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-emerald-400">
                        Confiança: {card.confidenceScore}%
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {card.createdAt}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-slate-100 group-hover:text-emerald-300 transition-colors leading-snug">
                      {card.title}
                    </h4>

                    <p className="text-2xs text-slate-400 line-clamp-2 leading-relaxed">
                      {card.hypothesisText}
                    </p>

                    <div className="p-2 rounded bg-white/[0.02] border border-white/[0.04] text-[11px] text-slate-300">
                      <span className="text-[9px] uppercase font-mono text-slate-500 block">
                        Métrica de Sucesso:
                      </span>
                      {card.successMetric}
                    </div>
                  </div>
                ))}

                {stageCards.length === 0 && (
                  <div className="h-28 rounded-lg border border-dashed border-white/[0.06] flex items-center justify-center text-slate-600 text-2xs font-mono">
                    Vazio
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Hypothesis Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-slate-950 border border-white/10 rounded-2xl p-6 shadow-2xl z-10 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">
                  Criar Nova Hipótese de Validação
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1.5">
                  Título da Oportunidade / Produto:
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Assinatura de documentos para subempreiteiros via WhatsApp"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/[0.1] text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1.5">
                  Declaração da Hipótese:
                </label>
                <textarea
                  rows={3}
                  value={newHypothesisText}
                  onChange={(e) => setNewHypothesisText(e.target.value)}
                  placeholder="Acreditamos que [público] pagará [valor] porque [dor crônica]..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/[0.1] text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1.5">
                  Critério de Sucesso Mensurável:
                </label>
                <input
                  type="text"
                  value={newSuccessMetric}
                  onChange={(e) => setNewSuccessMetric(e.target.value)}
                  placeholder="Ex: 10 reuniões agendadas ou R$ 1.500 em depósitos de pré-venda"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/[0.1] text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="emerald" size="sm">
                  Salvar no My Lab
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
