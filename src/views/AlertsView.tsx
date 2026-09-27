import React, { useState } from 'react';
import { UserAlert } from '../types';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Bell, Plus, Trash2, Power, Send, CheckCircle2, X } from 'lucide-react';

interface AlertsViewProps {
  alerts: UserAlert[];
  onToggleAlert: (id: string) => void;
  onAddAlert: (alert: Omit<UserAlert, 'id' | 'triggersCount'>) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  onToggleAlert,
  onAddAlert,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [keywords, setKeywords] = useState('');
  const [minScore, setMinScore] = useState(85);
  const [frequency, setFrequency] = useState<'Tempo Real' | 'Digest Diário' | 'Semanal'>('Tempo Real');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddAlert({
      name,
      queryOrKeywords: keywords || 'SaaS, Micro-SaaS',
      minScore,
      channels: ['In-App', 'Email'],
      frequency,
      isActive: true,
      lastTriggered: 'Recém criado',
    });

    setName('');
    setKeywords('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-card-bg border border-card-border shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="neutral" size="sm">
              Sentinela de Mercado
            </Badge>
            <span className="text-2xs font-medium text-slate-500">
              Notificações Automáticas em Tempo Real
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            Alertas & Triggers Proativos
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Configure gatilhos automatizados para ser avisado no instante em que novos sinais de fricção ou picos de demanda superarem seu limite de score definido.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          iconLeft={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Criar Novo Alerta
        </Button>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-5 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              alert.isActive
                ? 'bg-card-bg border-card-border shadow-xs'
                : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-white/[0.04] opacity-60'
            }`}
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant={alert.isActive ? 'neutral' : 'slate'}
                  size="xs"
                >
                  {alert.isActive ? 'Monitoramento Ativo' : 'Pausado'}
                </Badge>
                <span className="text-2xs font-medium text-slate-500">
                  Freq: {alert.frequency}
                </span>
                <span className="text-2xs font-semibold text-slate-700 dark:text-slate-300">
                  Score Mín: ≥ {alert.minScore}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{alert.name}</h3>

              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <span className="text-slate-500">Palavras-chave:</span>
                <span className="text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.04] px-2 py-0.5 rounded border border-slate-200 dark:border-white/[0.06] font-medium">
                  {alert.queryOrKeywords}
                </span>
              </div>
            </div>

            {/* Channels & Toggle */}
            <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-card-border">
              <div className="text-right">
                <span className="text-2xs font-medium text-slate-500 block">
                  Disparos Registrados
                </span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {alert.triggersCount} vezes
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onToggleAlert(alert.id)}
                  className={`p-2 rounded-lg border transition-colors ${
                    alert.isActive
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 dark:border-white shadow-xs'
                      : 'bg-slate-100 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.08] text-slate-500'
                  }`}
                  title={alert.isActive ? 'Pausar monitoramento' : 'Ativar monitoramento'}
                >
                  <Power className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal New Alert */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-fade-in"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-card-bg border border-card-border rounded-2xl p-6 shadow-2xl z-10 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-card-border">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Criar Regra de Alerta Proativo
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Nome do Alerta:
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Picos de reclamação de DocuSign e concorrentes"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/[0.1] text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 font-sans"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Palavras-chave ou Tópico:
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="Ex: DocuSign, assinatura eletrônica, renovação anual"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/[0.1] text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Radar Score Mínimo:
                  </label>
                  <input
                    type="number"
                    min={50}
                    max={100}
                    value={minScore}
                    onChange={(e) => setMinScore(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/[0.1] text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 font-sans"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Frequência de Notificação:
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/[0.1] text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 font-sans"
                  >
                    <option value="Tempo Real">Tempo Real</option>
                    <option value="Digest Diário">Digest Diário</option>
                    <option value="Semanal">Semanal</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-card-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Salvar Regra de Alerta
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
