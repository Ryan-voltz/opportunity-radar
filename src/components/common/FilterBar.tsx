import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { OpportunityCategory } from '../../types';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedEffort: string;
  onEffortChange: (effort: string) => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
  categories: OpportunityCategory[];
  totalResults: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedEffort,
  onEffortChange,
  sortBy,
  onSortByChange,
  categories,
  totalResults,
}) => {
  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'all' || selectedEffort !== 'all';

  const clearFilters = () => {
    onSearchChange('');
    onCategoryChange('all');
    onEffortChange('all');
  };

  return (
    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-sm space-y-3">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input with shortcut hint */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filtrar por título, tecnologia, dor de mercado ou nicho..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.05] transition-colors"
          />
        </div>

        {/* Filters and Sorting controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="px-2.5 py-2 rounded-lg bg-slate-900 border border-white/[0.08] text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
            >
              <option value="all">Todas as Categorias</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Effort Dropdown */}
          <select
            value={selectedEffort}
            onChange={(e) => onEffortChange(e.target.value)}
            className="px-2.5 py-2 rounded-lg bg-slate-900 border border-white/[0.08] text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
          >
            <option value="all">Todo Esforço</option>
            <option value="Baixo">Esforço Baixo (1-2 sem)</option>
            <option value="Médio">Esforço Médio (1 mês)</option>
            <option value="Alto">Esforço Alto (2-3 meses)</option>
          </select>

          {/* Sorting */}
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="px-2.5 py-2 rounded-lg bg-slate-900 border border-white/[0.08] text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
          >
            <option value="score">Maior Radar Score</option>
            <option value="speed">Mais Rápido (MVP dias)</option>
            <option value="newest">Mais Recentes</option>
          </select>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="p-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 text-xs flex items-center gap-1 transition-colors"
              title="Limpar todos os filtros"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Limpar</span>
            </button>
          )}
        </div>
      </div>

      {/* Meta Counter */}
      <div className="flex items-center justify-between text-2xs font-mono text-slate-500 pt-1 border-t border-white/[0.03]">
        <div className="flex items-center gap-2">
          <Filter className="w-3 h-3 text-slate-600" />
          <span>
            {totalResults} {totalResults === 1 ? 'oportunidade indexada' : 'oportunidades indexadas'}
          </span>
        </div>
        {hasActiveFilters && (
          <span className="text-cyan-400">Filtros ativos aplicados</span>
        )}
      </div>
    </div>
  );
};
