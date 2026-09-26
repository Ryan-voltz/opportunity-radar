import React, { useState, useEffect, useCallback } from 'react';
import { IngestionSource, IngestionStats, NormalizedSignal } from '../types';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  Database,
  RefreshCw,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  ShieldCheck,
  Activity,
  Layers,
  Sparkles,
  Check,
  X,
  Radio,
} from 'lucide-react';
import { API_BASE_URL } from '../services/apiConfig';

export const AdminSourcesView: React.FC = () => {
  const [sources, setSources] = useState<IngestionSource[]>([]);
  const [stats, setStats] = useState<IngestionStats | null>(null);
  const [rawSignals, setRawSignals] = useState<NormalizedSignal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncingSourceId, setSyncingSourceId] = useState<string | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [activeTab, setActiveTab] = useState<'sources' | 'signals'>('sources');
  const [signalsFilter, setSignalsFilter] = useState<'all' | 'qualified' | 'noise'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // New source form state
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceType, setNewSourceType] = useState<'rss_feed' | 'official_api'>('rss_feed');
  const [newEndpointUrl, setNewEndpointUrl] = useState('');
  const [newDocUrl, setNewDocUrl] = useState('');
  const [newCompliance, setNewCompliance] = useState('');

  const fetchSourcesAndStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/sources`);
      if (res.ok) {
        const data = await res.json();
        setSources(data.sources || []);
        setStats(data.stats || null);
      }
    } catch (err) {
      console.error('Falha ao carregar fontes:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSignals = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/signals`);
      if (res.ok) {
        const data = await res.json();
        setRawSignals(data || []);
      }
    } catch (err) {
      console.error('Falha ao carregar sinais:', err);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      if (!mounted) return;
      await Promise.all([fetchSourcesAndStats(), fetchSignals()]);
    })();
    return () => {
      mounted = false;
    };
  }, [fetchSourcesAndStats, fetchSignals]);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleSyncSource = async (id: string) => {
    setSyncingSourceId(id);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/sources/${id}/sync`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Fonte sincronizada: ${data.recordsCount} sinais coletados, ${data.qualifiedCount} oportunidades qualificadas.`);
      } else {
        showToast(`Aviso: ${data.error || 'Falha ao sincronizar fonte'}`);
      }
      await fetchSourcesAndStats();
      await fetchSignals();
    } catch {
      showToast('Erro de conexão ao sincronizar fonte.');
    } finally {
      setSyncingSourceId(null);
    }
  };

  const handleSyncAll = async () => {
    setIsSyncingAll(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/sources/sync-all`, {
        method: 'POST',
      });
      const data = await res.json();
      showToast(`Ciclo de ingestão concluído: ${data.totalCollected} sinais coletados, ${data.totalQualified} oportunidades qualificadas.`);
      await fetchSourcesAndStats();
      await fetchSignals();
    } catch {
      showToast('Erro ao executar sincronização global.');
    } finally {
      setIsSyncingAll(false);
    }
  };

  const handleToggleSource = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/sources/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnabled: !currentStatus }),
      });
      if (res.ok) {
        setSources((prev) =>
          prev.map((s) => (s.id === id ? { ...s, isEnabled: !currentStatus } : s))
        );
      }
    } catch (err) {
      console.error('Erro ao alterar status:', err);
    }
  };

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceName || !newEndpointUrl) return;

    try {
      const res = await fetch(`${API_BASE_URL}/admin/sources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSourceName,
          type: newSourceType,
          endpointUrl: newEndpointUrl,
          documentationUrl: newDocUrl,
          complianceNotes: newCompliance || 'Fonte pública oficial configurada manualmente.',
        }),
      });

      if (res.ok) {
        showToast('Nova fonte cadastrada com sucesso!');
        setIsAddModalOpen(false);
        setNewSourceName('');
        setNewEndpointUrl('');
        setNewDocUrl('');
        setNewCompliance('');
        await fetchSourcesAndStats();
      }
    } catch {
      showToast('Erro ao cadastrar nova fonte.');
    }
  };

  const getStatusBadge = (status: IngestionSource['status']) => {
    switch (status) {
      case 'online':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Online
          </span>
        );
      case 'syncing':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/25">
            <RefreshCw className="w-2.5 h-2.5 animate-spin" />
            Sincronizando
          </span>
        );
      case 'rate_limited':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/25">
            <AlertTriangle className="w-2.5 h-2.5" />
            Rate Limited
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/25">
            Erro
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-500/10 text-slate-400 border border-slate-500/25">
            Ociosa
          </span>
        );
    }
  };

  const filteredSignals = rawSignals.filter((sig) => {
    if (signalsFilter === 'qualified') return sig.isOpportunityEligible === true;
    if (signalsFilter === 'noise') return sig.isOpportunityEligible === false;
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-slate-900 border border-cyan-500/40 shadow-2xl text-xs font-mono text-cyan-300 flex items-center gap-2 animate-slide-in-right">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/25 text-cyan-400">
              <Database className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100">
              Gerenciador de Fontes & Ingestão Real
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Pipeline de inteligência conectada a APIs oficiais, feeds de sindicação pública e compliance estrito a rate limits e robots.txt.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            iconLeft={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Adicionar Fonte
          </Button>

          <Button
            variant="primary"
            size="sm"
            iconLeft={<RefreshCw className={`w-4 h-4 ${isSyncingAll ? 'animate-spin' : ''}`} />}
            disabled={isSyncingAll}
            onClick={handleSyncAll}
          >
            {isSyncingAll ? 'Sincronizando Todas...' : 'Sincronizar Todas'}
          </Button>
        </div>
      </div>

      {/* Pipeline Telemetry Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.08] space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase">Fontes Ativas</span>
            <Radio className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            {stats?.activeSourcesCount || sources.filter((s) => s.isEnabled).length} / {sources.length}
          </div>
          <p className="text-2xs text-slate-500">Monitoradas continuamente</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.08] space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase">Sinais Coletados</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-300">
            {stats?.totalCollected || rawSignals.length}
          </div>
          <p className="text-2xs text-slate-500">Registros brutos normalizados</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.08] space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase">Oportunidades Qualificadas</span>
            <Sparkles className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {stats?.totalQualifiedOpportunities || 0}
          </div>
          <p className="text-2xs text-slate-500">Filtro de dor & fricção aprovado</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.08] space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase">Taxa de Compliance</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-300">
            100%
          </div>
          <p className="text-2xs text-slate-500">Robots.txt & Termos oficiais</p>
        </div>
      </div>

      {/* Tabs: Sources Table vs. Signals Audit Stream */}
      <div className="flex items-center gap-2 border-b border-white/[0.08]">
        <button
          onClick={() => setActiveTab('sources')}
          className={`py-3 px-4 text-xs font-mono font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'sources'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Fontes de Ingestão ({sources.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('signals')}
          className={`py-3 px-4 text-xs font-mono font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'signals'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Auditoria de Sinais Brutos ({rawSignals.length})</span>
        </button>
      </div>

      {/* Tab 1: Sources Management Table */}
      {activeTab === 'sources' && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-slate-900/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-white/[0.08] text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Fonte & Tipo</th>
                  <th className="py-3.5 px-4">Status & Limite de Taxa</th>
                  <th className="py-3.5 px-4">Registros</th>
                  <th className="py-3.5 px-4">Última Sincronização</th>
                  <th className="py-3.5 px-4">Compliance & Garantia</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] font-sans text-slate-300">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-mono">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-cyan-400" />
                      Carregando fontes de inteligência...
                    </td>
                  </tr>
                ) : sources.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-mono">
                      Nenhuma fonte configurada.
                    </td>
                  </tr>
                ) : (
                  sources.map((src) => {
                    const isSyncing = syncingSourceId === src.id;
                    const ratePercent = Math.min(
                      100,
                      Math.round((src.rateLimit.remaining / Math.max(1, src.rateLimit.limit)) * 100)
                    );

                    return (
                      <tr key={src.id} className="hover:bg-slate-800/40 transition-colors">
                        {/* Name & Type */}
                        <td className="py-4 px-4">
                          <div className="font-semibold text-slate-100 flex items-center gap-2">
                            <span>{src.name}</span>
                          {src.documentationUrl && (
                            <a
                              href={src.documentationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-500 hover:text-cyan-400 transition-colors"
                              title="Ver documentação oficial"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                          {src.type === 'official_api'
                            ? 'REST API Oficial'
                            : src.type === 'rss_feed'
                            ? 'Feed Sindicação RSS/Atom'
                            : 'Endpoint Público Permitido'}
                        </div>
                      </td>

                      {/* Status & Rate Limit */}
                      <td className="py-4 px-4">
                        <div className="space-y-1.5">
                          <div>{getStatusBadge(src.status)}</div>
                          <div className="w-36">
                            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-0.5">
                              <span>Restante: {src.rateLimit.remaining}</span>
                              <span>{src.rateLimit.resetTime || 'fair use'}</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  ratePercent > 50
                                    ? 'bg-emerald-400'
                                    : ratePercent > 20
                                    ? 'bg-amber-400'
                                    : 'bg-rose-400'
                                }`}
                                style={{ width: `${ratePercent}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Records */}
                      <td className="py-4 px-4 font-mono font-semibold text-slate-200">
                        {src.recordsCollected.toLocaleString()}
                      </td>

                      {/* Last Sync */}
                      <td className="py-4 px-4 font-mono text-slate-400 text-[11px]">
                        {src.lastSync ? (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>{new Date(src.lastSync).toLocaleTimeString('pt-BR')}</span>
                          </div>
                        ) : (
                          <span className="text-slate-600">Nunca</span>
                        )}
                      </td>

                      {/* Compliance Notes */}
                      <td className="py-4 px-4 max-w-xs">
                        <p className="text-2xs text-slate-400 line-clamp-2 leading-relaxed font-sans">
                          {src.complianceNotes}
                        </p>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleSource(src.id, src.isEnabled)}
                            className={`p-1.5 rounded-lg border text-xs font-mono transition-colors ${
                              src.isEnabled
                                ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                                : 'border-slate-700 text-slate-500 hover:bg-slate-800'
                            }`}
                            title={src.isEnabled ? 'Desativar Fonte' : 'Ativar Fonte'}
                          >
                            {src.isEnabled ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          </button>

                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={isSyncing || !src.isEnabled}
                            onClick={() => handleSyncSource(src.id)}
                            iconLeft={
                              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                            }
                          >
                            {isSyncing ? 'Coletando...' : 'Sincronizar'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                }))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Raw Signals Audit Stream */}
      {activeTab === 'signals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap pb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Filtrar Sinais:</span>
              <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-900 border border-white/[0.08]">
                <button
                  onClick={() => setSignalsFilter('all')}
                  className={`px-2.5 py-1 rounded text-2xs font-mono transition-colors ${
                    signalsFilter === 'all'
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Todos ({rawSignals.length})
                </button>
                <button
                  onClick={() => setSignalsFilter('qualified')}
                  className={`px-2.5 py-1 rounded text-2xs font-mono transition-colors ${
                    signalsFilter === 'qualified'
                      ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Qualificados ({rawSignals.filter((s) => s.isOpportunityEligible).length})
                </button>
                <button
                  onClick={() => setSignalsFilter('noise')}
                  className={`px-2.5 py-1 rounded text-2xs font-mono transition-colors ${
                    signalsFilter === 'noise'
                      ? 'bg-rose-500/20 text-rose-300 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Ruído Descartado ({rawSignals.filter((s) => !s.isOpportunityEligible).length})
                </button>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              iconLeft={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={fetchSignals}
            >
              Atualizar Feed
            </Button>
          </div>

          <div className="space-y-3">
            {filteredSignals.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs font-mono rounded-xl border border-white/[0.08] bg-slate-900/40">
                Nenhum sinal encontrado com os filtros selecionados. Clique em "Sincronizar Todas" para capturar novos dados.
              </div>
            ) : (
              filteredSignals.map((sig) => (
                <div
                  key={sig.id}
                  className={`p-4 rounded-xl border transition-all ${
                    sig.isOpportunityEligible
                      ? 'bg-slate-900/80 border-emerald-500/30 hover:border-emerald-500/60'
                      : 'bg-slate-900/40 border-white/[0.06] opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Badge variant="cyan" size="xs">
                        {sig.source}
                      </Badge>

                      {sig.isOpportunityEligible ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          QUALIFICADO (Oportunidade Gerada)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-white/[0.08]">
                          Ruído Descartado pelo Filtro de Fricção
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-2xs font-mono text-slate-400">
                      <span>Upvotes/Score: {sig.metrics.scoreOrUpvotes || 0}</span>
                      <span>Comentários: {sig.metrics.commentsCount || 0}</span>
                      <span>{new Date(sig.publishedAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-100 mb-1">
                    {sig.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-sans mb-3">
                    {sig.description}
                  </p>

                  <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-white/[0.04]">
                    <span className="text-slate-500 text-[11px]">ID: {sig.id}</span>
                    {sig.url && (
                      <a
                        href={sig.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <span>Ver Publicação Original</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add Custom Source Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsAddModalOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-6 z-10 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-slate-100">
                  Cadastrar Nova Fonte Conforme
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSource} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-300 font-mono text-[11px] uppercase mb-1.5">
                  Nome da Fonte *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Changelog Dev Feed"
                  value={newSourceName}
                  onChange={(e) => setNewSourceName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-white/10 text-slate-100 focus:outline-none focus:border-cyan-400 font-sans"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-mono text-[11px] uppercase mb-1.5">
                  Tipo de Ingestão *
                </label>
                <select
                  value={newSourceType}
                  onChange={(e) => setNewSourceType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-white/10 text-slate-100 focus:outline-none focus:border-cyan-400 font-mono"
                >
                  <option value="rss_feed">Feed de Sindicação RSS / Atom Público</option>
                  <option value="official_api">REST API Oficial com Documentação</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-mono text-[11px] uppercase mb-1.5">
                  Endpoint URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://exemplo.com/feed.xml"
                  value={newEndpointUrl}
                  onChange={(e) => setNewEndpointUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-white/10 text-slate-100 focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-mono text-[11px] uppercase mb-1.5">
                  URL da Documentação Oficial / Termos
                </label>
                <input
                  type="url"
                  placeholder="https://exemplo.com/terms"
                  value={newDocUrl}
                  onChange={(e) => setNewDocUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-white/10 text-slate-100 focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-mono text-[11px] uppercase mb-1.5">
                  Nota de Compliance & Respeito a Rate Limits
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Endpoint oficial para agregadores de notícias. Respeita robots.txt."
                  value={newCompliance}
                  onChange={(e) => setNewCompliance(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-white/10 text-slate-100 focus:outline-none focus:border-cyan-400 font-sans"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/[0.08]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Salvar Fonte
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
