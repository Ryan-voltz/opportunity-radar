import React from 'react';
import { RemoteWorkInsight } from '../types';
import { Badge } from '../components/common/Badge';
import { Briefcase, DollarSign, TrendingUp, Globe, Code, ArrowUpRight } from 'lucide-react';

interface RemoteWorkViewProps {
  insights: RemoteWorkInsight[];
}

export const RemoteWorkView: React.FC<RemoteWorkViewProps> = ({ insights }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/20">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="emerald" size="sm">
            Monetização Global
          </Badge>
          <span className="text-2xs font-mono text-slate-400">
            Contratos Internacionais em Moeda Forte
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
          Trabalho Remoto & Freelancing High-Ticket
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Mapeamento de escassez técnica em empresas americanas e europeias dispostas a pagar tíquetes internacionais para especialistas independentes.
        </p>
      </div>

      {/* Grid of Remote Roles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {insights.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-slate-900/60 border border-white/[0.08] hover:border-emerald-500/30 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <Badge variant="emerald" size="xs">
                  {item.demandGrowth}
                </Badge>
                <span className="text-2xs font-mono text-slate-400">
                  {item.openContractsVolume} vagas abertas
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-100 mb-2">
                {item.roleOrSkill}
              </h3>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] space-y-1.5 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Taxa Horária:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {item.averageRateHourUsd}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Arbitragem Salarial:</span>
                  <span className="font-mono text-cyan-300">
                    {item.arbitrageMultiplier}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                  Regiões Contratantes:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {item.topHiringGeos.map((geo, i) => (
                    <Badge key={i} variant="slate" size="xs">
                      {geo}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1.5">
                Stack Chave:
              </span>
              <div className="flex flex-wrap gap-1">
                {item.requiredStack.map((tech, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-white/[0.04] text-slate-300 font-mono text-[11px] border border-white/[0.06]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
