import React from 'react';
import { Opportunity, NavSection } from '../types';
import { OpportunityCard } from '../components/common/OpportunityCard';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Bookmark, Sparkles, ArrowRight } from 'lucide-react';

interface SavedViewProps {
  opportunities: Opportunity[];
  onSelectOpportunity: (opportunity: Opportunity) => void;
  onToggleSave: (id: string) => void;
  onNavigate: (section: NavSection) => void;
}

export const SavedView: React.FC<SavedViewProps> = ({
  opportunities,
  onSelectOpportunity,
  onToggleSave,
  onNavigate,
}) => {
  const savedOpportunities = opportunities.filter((o) => o.isSaved);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-500/20">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="cyan" size="sm">
            Pipeline Pessoal
          </Badge>
          <span className="text-2xs font-mono text-slate-400">
            Oportunidades em Monitoramento Ativo
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
          Oportunidades Salvas & Priorizadas
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Seu repositório pessoal de ideias que passaram pelo primeiro filtro e estão aguardando validação ou execução.
        </p>
      </div>

      {/* Grid or Empty State */}
      {savedOpportunities.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono text-slate-400">
              Total Salvas: <strong className="text-cyan-400">{savedOpportunities.length}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {savedOpportunities.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                isSaved={true}
                onSelect={onSelectOpportunity}
                onToggleSave={(id, e) => {
                  e.stopPropagation();
                  onToggleSave(id);
                }}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="p-16 text-center rounded-2xl bg-slate-900/40 border border-white/[0.06] max-w-lg mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-slate-500">
            <Bookmark className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-base font-semibold text-slate-200">
              Nenhuma oportunidade salva ainda
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Explore o catálogo de oportunidades e clique no ícone de marcador para salvar e acompanhar o ciclo de validação.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            iconRight={<ArrowRight className="w-4 h-4" />}
            onClick={() => onNavigate('opportunities')}
          >
            Navegar pelas Oportunidades
          </Button>
        </div>
      )}
    </div>
  );
};
