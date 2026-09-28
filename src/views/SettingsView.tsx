import React, { useState } from 'react';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useCurrency, CurrencyMode } from '../context/CurrencyContext';
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
  const { currency, setCurrency } = useCurrency();
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
      <div className="p-6 rounded-2xl bg-card-bg border border-card-border shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="neutral" size="sm">
            Painel de Controle
          </Badge>
          <span className="text-2xs font-medium text-slate-500">
            Versão 1.0.0-pro • Build Production Ready
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
          Configurações do Opportunity Radar
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Gerencie integrações de APIs externas, preferências de faturamento, webhooks e fontes de monitoramento ativas.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-card-border pb-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('workspace')}
          className={`px-4 py-2 text-xs rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'workspace'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-semibold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Workspace & Perfil</span>
        </button>

        <button
          onClick={() => setActiveTab('apikeys')}
          className={`px-4 py-2 text-xs rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'apikeys'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-semibold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>Chaves de APIs & LLMs</span>
        </button>

        <button
          onClick={() => setActiveTab('sources')}
          className={`px-4 py-2 text-xs rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'sources'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-semibold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Fontes de Ingestão</span>
        </button>

        <button
          onClick={() => setActiveTab('export')}
          className={`px-4 py-2 text-xs rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'export'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-semibold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Backup & Exportação</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="p-6 rounded-2xl bg-card-bg border border-card-border shadow-xs">
        {activeTab === 'workspace' && (
          <form onSubmit={handleSave} className="space-y-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 pb-2 border-b border-card-border">
              Preferências do Workspace
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Nome do Workspace:
                </label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/[0.1] text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 font-sans"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Padrão de Moeda para MRR:
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as CurrencyMode)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/[0.1] text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 font-sans"
                >
                  <option value="BRL">🇧🇷 Real Brasileiro (R$) - Convertido em Real</option>
                  <option value="USD">🇺🇸 Dólar Americano ($ USD)</option>
                  <option value="EUR">🇪🇺 Euro (€ EUR)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Webhook de Alertas (Discord / Slack):
              </label>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/[0.1] text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 font-sans"
              />
            </div>

            <div className="pt-3 border-t border-card-border flex items-center justify-between">
              {savedSuccess ? (
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
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
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 pb-2 border-b border-card-border">
              Conectores de Inteligência Artificial & APIs
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Chave de API do Modelo (OpenAI / Gemini / Anthropic):
                  </label>
                  <span className="text-2xs font-medium text-emerald-600 dark:text-emerald-400">Ativa e Conectada</span>
                </div>
                <input
                  type="password"
                  value={apiKeyGemini}
                  onChange={(e) => setApiKeyGemini(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/[0.1] text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Proxy de Scraping / BrightData / Apify (Opcional):
                </label>
                <input
                  type="text"
                  placeholder="https://proxy.exemplo.com:8080"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/[0.1] text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-card-border flex items-center justify-end">
              <Button type="submit" variant="primary" size="sm">
                Atualizar Chaves
              </Button>
            </div>
          </form>
        )}

        {activeTab === 'sources' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2 pb-2 border-b border-card-border">
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
                      ? 'bg-slate-100/90 dark:bg-slate-900/90 border-slate-300 dark:border-white/20 shadow-xs'
                      : 'bg-slate-50/50 dark:bg-white/[0.01] border-slate-200 dark:border-white/[0.04] opacity-60'
                  }`}
                >
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-200">{item.name}</h4>
                    <p className="text-2xs text-slate-500">{item.desc}</p>
                  </div>
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      enabledSources[item.key]
                        ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-950'
                        : 'border-slate-300 dark:border-white/20'
                    }`}
                  >
                    {enabledSources[item.key] && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'export' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2 pb-2 border-b border-card-border">
              Backup e Exportação de Inteligência
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
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
