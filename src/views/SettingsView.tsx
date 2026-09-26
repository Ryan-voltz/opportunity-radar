import React, { useState } from 'react';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  Settings,
  Key,
  Bell,
  Database,
  Download,
  Check,
  Shield,
  Layers,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'workspace' | 'apikeys' | 'sources' | 'export'>('workspace');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form states
  const [workspaceName, setWorkspaceName] = useState('Ryan Solo SaaS Lab');
  const [currency, setCurrency] = useState('BRL / USD');
  const [apiKeyGemini, setApiKeyGemini] = useState('sk-live-••••••••••••••••••••38f9');
  const [webhookUrl, setWebhookUrl] = useState('https://discord.com/api/webhooks/12345/abcde');

  const [enabledSources, setEnabledSources] = useState({
    reddit: true,
    g2: true,
    github: true,
    googleTrends: true,
    productHunt: true,
    upwork: true,
  });

  const toggleSource = (key: keyof typeof enabledSources) => {
    setEnabledSources((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-white/[0.08]">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="slate" size="sm">
            Painel de Controle
          </Badge>
          <span className="text-2xs font-mono text-slate-400">
            Versão 1.0.0-pro • Build Production Ready
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
          Configurações do Opportunity Radar
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Gerencie integrações de APIs externas, preferências de faturamento, webhooks e fontes de monitoramento ativas.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-white/[0.08] pb-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('workspace')}
          className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'workspace'
              ? 'bg-white/[0.08] text-cyan-300 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Workspace & Perfil</span>
        </button>

        <button
          onClick={() => setActiveTab('apikeys')}
          className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'apikeys'
              ? 'bg-white/[0.08] text-cyan-300 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>Chaves de APIs & LLMs</span>
        </button>

        <button
          onClick={() => setActiveTab('sources')}
          className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'sources'
              ? 'bg-white/[0.08] text-cyan-300 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Fontes de Ingestão</span>
        </button>

        <button
          onClick={() => setActiveTab('export')}
          className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'export'
              ? 'bg-white/[0.08] text-cyan-300 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Backup & Exportação</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/[0.08]">
        {activeTab === 'workspace' && (
          <form onSubmit={handleSave} className="space-y-5">
            <h3 className="text-sm font-bold text-slate-100 mb-4 pb-2 border-b border-white/[0.06]">
              Preferências do Workspace
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1.5">
                  Nome do Workspace:
                </label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950/70 border border-white/[0.1] text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1.5">
                  Padrão de Moeda para MRR:
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950/70 border border-white/[0.1] text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="BRL / USD">BRL (R$) e USD ($)</option>
                  <option value="USD">Apenas USD ($)</option>
                  <option value="EUR">Apenas EUR (€)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1.5">
                Webhook de Alertas (Discord / Slack):
              </label>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950/70 border border-white/[0.1] text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
              {savedSuccess ? (
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> Alterações salvas com sucesso!
                </span>
              ) : (
                <span className="text-2xs text-slate-500">
                  Os dados são mantidos em armazenamento local seguro.
                </span>
              )}

              <Button type="submit" variant="primary" size="sm">
                Salvar Alterações
              </Button>
            </div>
          </form>
        )}

        {activeTab === 'apikeys' && (
          <form onSubmit={handleSave} className="space-y-5">
            <h3 className="text-sm font-bold text-slate-100 mb-4 pb-2 border-b border-white/[0.06]">
              Conectores de Inteligência Artificial & APIs
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono text-slate-400">
                    Chave de API do Modelo (OpenAI / Gemini / Anthropic):
                  </label>
                  <span className="text-2xs font-mono text-emerald-400">Ativa e Conectada</span>
                </div>
                <input
                  type="password"
                  value={apiKeyGemini}
                  onChange={(e) => setApiKeyGemini(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950/70 border border-white/[0.1] text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1.5">
                  Proxy de Scraping / BrightData / Apify (Opcional):
                </label>
                <input
                  type="text"
                  placeholder="https://proxy.exemplo.com:8080"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950/70 border border-white/[0.1] text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-end">
              <Button type="submit" variant="primary" size="sm">
                Atualizar Chaves
              </Button>
            </div>
          </form>
        )}

        {activeTab === 'sources' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-100 mb-2 pb-2 border-b border-white/[0.06]">
              Canais de Ingestão de Dados Globais
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: 'reddit' as const, name: 'Reddit (r/SaaS, r/Entrepreneur, r/webdev)', desc: 'Monitora queixas e cancelamentos' },
                { key: 'g2' as const, name: 'G2 & Capterra Reviews', desc: 'Avaliações de 1 a 3 estrelas em ERPs e CRMs' },
                { key: 'github' as const, name: 'GitHub Trending Repositories', desc: 'Ferramentas de código que explodem em stars' },
                { key: 'googleTrends' as const, name: 'Google Trends & Search Velocity', desc: 'Consultas com crescimento de buscas > 100%' },
                { key: 'productHunt' as const, name: 'Product Hunt Launch Discussions', desc: 'Comentários de novos lançamentos de SaaS' },
                { key: 'upwork' as const, name: 'Upwork Global Job Postings', desc: 'Demandas recorrentes de integrações e scripts' },
              ].map((item) => (
                <div
                  key={item.key}
                  onClick={() => toggleSource(item.key)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    enabledSources[item.key]
                      ? 'bg-slate-950/70 border-cyan-500/30'
                      : 'bg-white/[0.01] border-white/[0.04] opacity-50'
                  }`}
                >
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200">{item.name}</h4>
                    <p className="text-2xs text-slate-500">{item.desc}</p>
                  </div>
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center ${
                      enabledSources[item.key]
                        ? 'bg-cyan-500 border-cyan-400 text-slate-950'
                        : 'border-white/20'
                    }`}
                  >
                    {enabledSources[item.key] && <Check className="w-3 h-3" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'export' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-100 mb-2 pb-2 border-b border-white/[0.06]">
              Backup e Exportação de Inteligência
            </h3>
            <p className="text-xs text-slate-400">
              Exporte todos os dossiês de oportunidades, hipóteses do My Lab e configurações de alertas em formato JSON compatível para integração externa.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                iconLeft={<Download className="w-3.5 h-3.5" />}
                onClick={() => alert('Download do arquivo opportunities-radar-backup.json iniciado!')}
              >
                Exportar Catálogo em JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                iconLeft={<Download className="w-3.5 h-3.5" />}
                onClick={() => alert('Download do arquivo opportunities.csv iniciado!')}
              >
                Exportar Tabela em CSV
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
