import React from 'react';
import { GeoArbitrageOpportunity } from '../types';
import { Badge } from '../components/common/Badge';
import { Globe, ArrowRight, ShieldCheck } from 'lucide-react';

interface GlobalOpportunitiesViewProps {
  geoOpportunities: GeoArbitrageOpportunity[];
}

export const GlobalOpportunitiesView: React.FC<GlobalOpportunitiesViewProps> = ({
  geoOpportunities,
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Concept Header */}
      <div className="p-6 rounded-2xl bg-card-bg border border-card-border shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="neutral" size="sm">
            Estratégia de Arbitragem Geográfica
          </Badge>
          <span className="text-2xs font-medium text-slate-500 dark:text-slate-400">
            Replicação Contextual de Negócios Validados
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
          Global Opportunities & Adaptação Regional
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Os maiores sucessos de SaaS em mercados emergentes não inventam comportamentos novos; eles adaptam produtos comprovados nos EUA para resolver barreiras fiscais, linguísticas e regulatórias locais.
        </p>
      </div>

      {/* Cards of Geo Arbitrage */}
      <div className="space-y-4">
        {geoOpportunities.map((geo) => (
          <div
            key={geo.id}
            className="p-6 rounded-2xl bg-card-bg border border-card-border hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4 shadow-sm"
          >
            {/* Flow comparison: Original -> Target */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-card-border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300">
                  <Globe className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <div className="text-2xs text-slate-500 font-medium">Modelo Original Comprovado</div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{geo.originalModel}</h3>
                  <div className="text-2xs text-slate-500">
                    Origem: {geo.originalMarket} • Faturamento: {geo.originalAnnualRevenue}
                  </div>
                </div>
              </div>

              <div className="hidden md:flex items-center text-slate-400 px-4">
                <ArrowRight className="w-5 h-5" />
              </div>

              <div className="text-left sm:text-right">
                <div className="text-2xs text-slate-500 font-medium">Mercado Alvo Desatendido</div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200">{geo.targetMarket}</h4>
                <div className="text-2xs text-slate-600 dark:text-slate-400 font-medium">
                  TAM Estimado: {geo.estimatedTAMInTarget}
                </div>
              </div>
            </div>

            {/* Why the gap exists */}
            <div className="space-y-2">
              <span className="text-2xs font-semibold uppercase tracking-wider text-slate-500 block">
                Por que o player original não domina o mercado alvo:
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200/80 dark:border-white/[0.04] leading-relaxed">
                {geo.reasonForGap}
              </p>
            </div>

            {/* Key Localization Needs */}
            <div>
              <span className="text-2xs font-semibold uppercase tracking-wider text-slate-500 block mb-2">
                Adaptações Críticas para Vitória Local:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {geo.keyLocalizationNeeds.map((need, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-white/[0.06] text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                    <span>{need}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
