import React, { useState } from 'react';
import { Opportunity, OpportunityCategory } from '../types';
import { OpportunityCard } from '../components/common/OpportunityCard';
import { FilterBar } from '../components/common/FilterBar';
import { RadarScoreBadge } from '../components/common/RadarScoreBadge';
import { Badge } from '../components/common/Badge';
import { LayoutGrid, List, Bookmark, ChevronRight } from 'lucide-react';

interface OpportunitiesViewProps {
  opportunities: Opportunity[];
  onSelectOpportunity: (opportunity: Opportunity) => void;
  onToggleSave: (id: string) => void;
}

export const OpportunitiesView: React.FC<OpportunitiesViewProps> = ({
  opportunities,
  onSelectOpportunity,
  onToggleSave,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEffort, setSelectedEffort] = useState('all');
  const [sortBy, setSortBy] = useState('score');

  const categories: OpportunityCategory[] = [
    'Micro-SaaS',
    'B2B Software',
    'AI Agent / Tool',
    'Market Arbitrage',
    'Remote / Freelance',
    'API / Developer Tool',
    'Digital Product',
    'Customer Friction',
  ];

  // Filtering logic
  const filtered = opportunities
    .filter((opp) => {
      const matchSearch =
        opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.primaryProblem.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCat =
        selectedCategory === 'all' || opp.category === selectedCategory;

      const matchEffort =
        selectedEffort === 'all' || opp.effort.includes(selectedEffort);

      return matchSearch && matchCat && matchEffort;
    })
    .sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score;
      if (sortBy === 'speed') return a.timeToMvpDays - b.timeToMvpDays;
      if (sortBy === 'newest') return b.dateDetected.localeCompare(a.dateDetected);
      return 0;
    });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">
            Catálogo de Oportunidades Estruturadas
          </h2>
          <p className="text-xs text-slate-400">
            Modelos de negócio refinados com estimativa de MRR, concorrência e esforço técnico
          </p>
        </div>

        {/* View Switcher: Grid vs Table */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-white/[0.08] rounded-lg">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md text-xs transition-colors flex items-center gap-1.5 ${
              viewMode === 'grid'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Visualização em Cards"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cards</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-md text-xs transition-colors flex items-center gap-1.5 ${
              viewMode === 'table'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Visualização em Tabela Linear"
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tabela</span>
          </button>
        </div>
      </div>

      {/* Filter Component */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedEffort={selectedEffort}
        onEffortChange={setSelectedEffort}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        categories={categories}
        totalResults={filtered.length}
      />

      {/* Content Rendering: Grid vs Table */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              onSelect={onSelectOpportunity}
              onToggleSave={(id, e) => {
                e.stopPropagation();
                onToggleSave(id);
              }}
            />
          ))}
        </div>
      ) : (
        /* Linear Table View */
        <div className="rounded-xl bg-slate-900/60 border border-white/[0.08] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-white/[0.06] text-slate-400 font-mono uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Oportunidade</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Potencial MRR</th>
                  <th className="py-3 px-4">Tempo MVP</th>
                  <th className="py-3 px-4">Concorrência</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map((opp) => (
                  <tr
                    key={opp.id}
                    onClick={() => onSelectOpportunity(opp)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <RadarScoreBadge score={opp.score} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 min-w-[280px]">
                      <div className="font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                        {opp.title}
                      </div>
                      <div className="text-2xs text-slate-500 truncate max-w-sm">
                        {opp.tagline}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge variant="slate" size="xs">
                        {opp.category}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-emerald-400 font-medium">
                      {opp.potentialMrr}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-400">
                      {opp.timeToMvpDays} dias
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-amber-400 font-mono text-2xs">
                        {opp.competitionLevel}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleSave(opp.id);
                          }}
                          className={`p-1.5 rounded hover:bg-white/[0.08] transition-colors ${
                            opp.isSaved ? 'text-cyan-400' : 'text-slate-500'
                          }`}
                        >
                          <Bookmark className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-300 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="p-16 text-center rounded-2xl bg-slate-900/40 border border-white/[0.06] space-y-2">
          <p className="text-sm font-semibold text-slate-300">
            Nenhuma oportunidade corresponde aos filtros aplicados.
          </p>
          <p className="text-xs text-slate-500">
            Tente remover a restrição de categoria ou o termo de busca para visualizar mais resultados.
          </p>
        </div>
      )}
    </div>
  );
};
