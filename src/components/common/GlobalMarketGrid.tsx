import React from 'react';
import { CountryMarketSignal } from '../../types';
import { Badge } from './Badge';
import { Globe2, ArrowUpRight, TrendingUp, Sparkles } from 'lucide-react';

interface GlobalMarketGridProps {
  signals: CountryMarketSignal[];
  selectedCountry?: string;
  onSelectCountry?: (countryCode: string) => void;
}

export const GlobalMarketGrid: React.FC<GlobalMarketGridProps> = ({
  signals,
  selectedCountry,
  onSelectCountry,
}) => {
  return (
    <div className="space-y-4">
      {/* Console Subheader */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
        <div className="flex items-center gap-2">
          <Globe2 className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-100 font-mono tracking-tight uppercase">
            Global Market Signals Terminal // 8 Nós Regionais Ativos
          </h3>
        </div>
        <span className="text-2xs font-mono text-slate-500">
          Clique em um nó nacional para filtrar sinais e oportunidades daquele mercado
        </span>
      </div>

      {/* Grid of Geopolitical Nodes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {signals.map((country) => {
          const isSelected = selectedCountry === country.code;

          return (
            <div
              key={country.code}
              onClick={() => onSelectCountry?.(isSelected ? '' : country.code)}
              className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                isSelected
                  ? 'bg-cyan-500/10 border-cyan-400/50 shadow-glow-cyan'
                  : 'bg-slate-900/60 border-white/[0.07] hover:border-white/20 hover:bg-slate-900/80'
              }`}
            >
              <div>
                {/* Header: Flag + Name + Momentum */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg leading-none" role="img" aria-label={country.name}>
                      {country.flag}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors block leading-tight">
                        {country.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">
                        {country.code} • {country.currency}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 text-xs font-mono font-semibold text-emerald-400">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>{country.momentum}</span>
                  </div>
                </div>

                {/* Key Metrics Row */}
                <div className="grid grid-cols-2 gap-2 my-2.5 p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <div>
                    <span className="text-[9px] font-mono uppercase text-slate-500 block">
                      Sinais Ativos
                    </span>
                    <span className="text-xs font-bold font-mono text-slate-100 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      {country.activeSignals}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] font-mono uppercase text-slate-500 block">
                      Arbitragem
                    </span>
                    <span
                      className={`text-xs font-bold font-mono ${
                        country.arbitrageIndex === 'Muito Alto'
                          ? 'text-emerald-400'
                          : 'text-cyan-300'
                      }`}
                    >
                      {country.arbitrageIndex}
                    </span>
                  </div>
                </div>

                {/* Top Category Badge */}
                <div className="mb-2">
                  <span className="text-[9px] font-mono text-slate-500 block mb-1">
                    Nicho com Maior Movimento:
                  </span>
                  <Badge variant="slate" size="xs" className="w-full justify-start truncate">
                    {country.topCategory}
                  </Badge>
                </div>
              </div>

              {/* Bottom Quote / Trigger */}
              <div className="pt-2 border-t border-white/[0.04] text-[11px] text-slate-400 line-clamp-2 leading-relaxed italic">
                "{country.keyTrend}"
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
