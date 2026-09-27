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
            className={`relative rounded-xl p-4 sm:p-5 border transition-all duration-300 shadow-sm ${
              isUrgent
                ? 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/30 text-slate-900 dark:text-slate-100'
                : isLaunch
                ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/30 text-slate-900 dark:text-slate-100'
                : 'bg-card-bg border-card-border text-slate-900 dark:text-slate-100'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    isUrgent
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      : isLaunch
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/[0.08]'
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
                      className={`text-2xs uppercase tracking-wider px-2 py-0.5 rounded font-semibold ${
                        isUrgent
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      AI Execution Coach • Accountability
                    </span>

                    <span className="text-2xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Análise de Foco em Tempo Real
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    {alert.headline}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                    {alert.message}
                  </p>

                  <div className="pt-1 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Próxima Ação:</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100 underline decoration-slate-400 dark:decoration-slate-500 underline-offset-2">
                      {alert.recommendedAction}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 md:self-center">
                <Button
                  variant="primary"
                  size="sm"
                  iconRight={<ArrowRight className="w-3.5 h-3.5" />}
                  onClick={() => onOpenProject?.(alert.projectId)}
                  className="w-full sm:w-auto font-medium text-xs"
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
