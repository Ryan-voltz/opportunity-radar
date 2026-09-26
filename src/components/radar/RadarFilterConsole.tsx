import React, { useState } from 'react';
import {
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Globe2,
  DollarSign,
  Layers,
  Cpu,
  Clock,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import { Continent, Currency, EffortLevel } from '../../types';

export interface RadarFilterState {
  searchQuery: string;
  country: string;
  continent: string;
  currency: string;
  category: string;
  saasType: string;
  productType: string;
  technology: string;
  isAiOnly: boolean | null; // null = any, true = AI only, false = non-AI
  audience: string; // 'all' | 'B2B' | 'B2C'
  isRemoteOnly: boolean;
  investment: string; // 'all' | 'Bootstrapped (Baixo)' | 'Médio ($2k-$10k)'
  difficulty: string; // 'all' | 'Baixa' | 'Média' | 'Alta'
  potential: string; // 'all' | '$5k - $20k MRR' | '$20k - $80k MRR' | '$80k+ MRR'
  freshness: string; // 'all' | '24h' | '7d' | '30d'
  sortBy: 'score' | 'newest' | 'growth' | 'mvp';
}

interface RadarFilterConsoleProps {
  filters: RadarFilterState;
  onFilterChange: (newFilters: RadarFilterState) => void;
  onReset: () => void;
  totalFiltered: number;
  totalAvailable: number;
}

export const RadarFilterConsole: React.FC<RadarFilterConsoleProps> = ({
  filters,
  onFilterChange,
  onReset,
  totalFiltered,
  totalAvailable,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const update = (key: keyof RadarFilterState, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const activeFiltersCount =
    (filters.searchQuery ? 1 : 0) +
    (filters.country !== 'all' ? 1 : 0) +
    (filters.continent !== 'all' ? 1 : 0) +
    (filters.currency !== 'all' ? 1 : 0) +
    (filters.category !== 'all' ? 1 : 0) +
    (filters.saasType !== 'all' ? 1 : 0) +
    (filters.technology !== 'all' ? 1 : 0) +
    (filters.isAiOnly !== null ? 1 : 0) +
    (filters.audience !== 'all' ? 1 : 0) +
    (filters.isRemoteOnly ? 1 : 0) +
    (filters.investment !== 'all' ? 1 : 0) +
    (filters.difficulty !== 'all' ? 1 : 0) +
    (filters.potential !== 'all' ? 1 : 0) +
    (filters.freshness !== 'all' ? 1 : 0);

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-white/[0.08] backdrop-blur-md p-4 space-y-3.5 shadow-panel">
      {/* Primary Bar: Search + Quick Category + Country + Toggle Advanced */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => update('searchQuery', e.target.value)}
            placeholder="Buscar por sinal, tecnologia, problema ou tese de mercado..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-white/[0.08] text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-slate-950 transition-colors font-sans"
          />
          {filters.searchQuery && (
            <button
              onClick={() => update('searchQuery', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Selectors */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Country Quick Select */}
          <select
            value={filters.country}
            onChange={(e) => update('country', e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950/70 border border-white/[0.08] text-xs text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer font-mono"
          >
            <option value="all">🌍 Todos os Países</option>
            <option value="US">🇺🇸 Estados Unidos</option>
            <option value="DE">🇩🇪 Alemanha</option>
            <option value="GB">🇬🇧 Reino Unido</option>
            <option value="BR">🇧🇷 Brasil</option>
            <option value="FR">🇫🇷 França</option>
            <option value="JP">🇯🇵 Japão</option>
            <option value="CA">🇨🇦 Canadá</option>
            <option value="AU">🇦🇺 Austrália</option>
          </select>

          {/* Category Quick Select */}
          <select
            value={filters.category}
            onChange={(e) => update('category', e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950/70 border border-white/[0.08] text-xs text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="all">Todas Categorias</option>
            <option value="Micro-SaaS">Micro-SaaS</option>
            <option value="B2B Software">B2B Software</option>
            <option value="AI Agent / Tool">AI Agent / Tool</option>
            <option value="Market Arbitrage">Arbitragem Geográfica</option>
            <option value="API / Developer Tool">API / Dev Tool</option>
            <option value="Digital Product">Produto Digital</option>
          </select>

          {/* Sort By */}
          <select
            value={filters.sortBy}
            onChange={(e) => update('sortBy', e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-slate-950/70 border border-white/[0.08] text-xs text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer font-mono"
          >
            <option value="score">Score Radar (Maior)</option>
            <option value="growth">Crescimento Mais Rápido</option>
            <option value="newest">Mais Recentes</option>
            <option value="mvp">Menor Tempo de MVP</option>
          </select>

          {/* Toggle Advanced Filters Button */}
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className={`px-3 py-2 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-colors ${
              isExpanded || activeFiltersCount > 0
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                : 'bg-slate-950/70 border-white/[0.08] text-slate-400 hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Multi-Filter Drawer Section */}
      {isExpanded && (
        <div className="pt-3 border-t border-white/[0.06] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 animate-fade-in">
          {/* Continente */}
          <div>
            <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
              Continente:
            </label>
            <select
              value={filters.continent}
              onChange={(e) => update('continent', e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-white/[0.08] text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">Todos</option>
              <option value="América do Norte">América do Norte</option>
              <option value="Europa">Europa</option>
              <option value="América Latina">América Latina</option>
              <option value="Ásia-Pacífico">Ásia-Pacífico</option>
              <option value="Global">Global</option>
            </select>
          </div>

          {/* Moeda */}
          <div>
            <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
              Moeda Alvo:
            </label>
            <select
              value={filters.currency}
              onChange={(e) => update('currency', e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-white/[0.08] text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="all">Todas</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="BRL">BRL (R$)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          {/* Dificuldade */}
          <div>
            <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
              Dificuldade:
            </label>
            <select
              value={filters.difficulty}
              onChange={(e) => update('difficulty', e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-white/[0.08] text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">Qualquer</option>
              <option value="Baixa">Baixa (Solo Dev)</option>
              <option value="Média">Média (1 mês)</option>
              <option value="Alta">Alta (Complexa)</option>
            </select>
          </div>

          {/* Modelo B2B / B2C */}
          <div>
            <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
              Público Alvo:
            </label>
            <select
              value={filters.audience}
              onChange={(e) => update('audience', e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-white/[0.08] text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">B2B e B2C</option>
              <option value="B2B">Apenas B2B</option>
              <option value="B2C">Apenas B2C</option>
            </select>
          </div>

          {/* Investimento */}
          <div>
            <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
              Investimento:
            </label>
            <select
              value={filters.investment}
              onChange={(e) => update('investment', e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-white/[0.08] text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">Qualquer</option>
              <option value="Bootstrapped (Baixo)">Bootstrapped ($0 - $500)</option>
              <option value="Médio ($2k-$10k)">Médio ($2k - $10k)</option>
            </select>
          </div>

          {/* Recência / Novidade */}
          <div>
            <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
              Janela Temporal:
            </label>
            <select
              value={filters.freshness}
              onChange={(e) => update('freshness', e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-white/[0.08] text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">Todo Histórico</option>
              <option value="24h">Últimas 24 horas</option>
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
            </select>
          </div>

          {/* IA Switch & Remote Switch Row */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-6 pt-2 border-t border-white/[0.04] flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300">
              <input
                type="checkbox"
                checked={filters.isAiOnly === true}
                onChange={(e) => update('isAiOnly', e.target.checked ? true : null)}
                className="rounded bg-slate-950 border-white/20 text-cyan-500 focus:ring-cyan-500/20"
              />
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>Apenas produtos baseados em IA</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300">
              <input
                type="checkbox"
                checked={filters.isRemoteOnly}
                onChange={(e) => update('isRemoteOnly', e.target.checked)}
                className="rounded bg-slate-950 border-white/20 text-cyan-500 focus:ring-cyan-500/20"
              />
              <span>Trabalho Remoto & Contratos Globais</span>
            </label>
          </div>
        </div>
      )}

      {/* Footer Info & Reset */}
      <div className="flex items-center justify-between text-2xs font-mono text-slate-500 pt-1 border-t border-white/[0.04]">
        <div className="flex items-center gap-2">
          <span>
            Exibindo <strong className="text-cyan-400">{totalFiltered}</strong> de{' '}
            <strong>{totalAvailable}</strong> descobertas catalogadas
          </span>
          {activeFiltersCount > 0 && (
            <span className="text-emerald-400">({activeFiltersCount} parâmetros aplicados)</span>
          )}
        </div>

        {activeFiltersCount > 0 && (
          <button
            onClick={onReset}
            className="text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
          >
            <X className="w-3 h-3" />
            <span>Resetar Filtros</span>
          </button>
        )}
      </div>
    </div>
  );
};
