import React from 'react';
import { AiCoachAlert } from '../../types';
import { AlertTriangle, Sparkles, Rocket, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { Button } from './Button';

interface AiCoachNotificationBannerProps {
  alerts: AiCoachAlert[];
  onOpenProject?: (projectId: string) => void;
  className?: string;
}

export const AiCoachNotificationBanner: React.FC<AiCoachNotificationBannerProps> = ({
  alerts,
  onOpenProject,
  className = '',
}) => {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {alerts.map((alert) => {
        const isUrgent = alert.severity === 'urgent';
        const isLaunch = alert.type === 'launch_ready';

        return (
          <div
            key={alert.id}
            className={`relative rounded-[20px] p-4 sm:p-5 border transition-all duration-300 shadow-card-subtle ${
              isUrgent
                ? 'bg-gradient-to-r from-amber-950/70 via-slate-900/90 to-amber-950/40 border-amber-500/40 text-amber-100 shadow-amber-500/10'
                : isLaunch
                ? 'bg-gradient-to-r from-emerald-950/70 via-slate-900/90 to-cyan-950/40 border-emerald-500/40 text-emerald-100 shadow-emerald-500/10'
                : 'bg-slate-900/90 border-blue-500/30 text-slate-100'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    isUrgent
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : isLaunch
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  }`}
                >
                  {isUrgent ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : isLaunch ? (
                    <Rocket className="w-5 h-5" />
                  ) : (
                    <Sparkles className="w-5 h-5" />
                  )}
                </div>

                <div className="space-y-1.5 max-w-3xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded font-bold ${
                        isUrgent
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      AI Execution Coach • Accountability
                    </span>

                    <span className="text-2xs font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Análise de Foco em Tempo Real
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    {alert.headline}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                    {alert.message}
                  </p>

                  <div className="pt-1 flex items-center gap-2 text-xs font-mono text-cyan-300">
                    <span className="font-semibold text-slate-400">Próxima Ação Recomendada:</span>
                    <span className="underline decoration-cyan-500/50 underline-offset-2 text-cyan-200">
                      {alert.recommendedAction}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 md:self-center">
                <Button
                  variant={isUrgent ? 'amber' : 'emerald'}
                  size="sm"
                  iconRight={<ArrowRight className="w-3.5 h-3.5" />}
                  onClick={() => onOpenProject?.(alert.projectId)}
                  className="w-full sm:w-auto font-mono text-xs"
                >
                  {alert.actionButtonText}
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
