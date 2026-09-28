import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  X,
  Flame,
  Sparkles,
  ArrowRight,
  Check,
  Radio,
  ExternalLink,
  Clock,
} from 'lucide-react';
import { Badge } from './Badge';

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timeAgo: string;
  type: 'urgent_signal' | 'saas_opportunity' | 'ai_coach' | 'system';
  score?: number;
  isRead: boolean;
  linkSection?: string;
}

interface NotificationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateSection?: (section: string) => void;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: '3 novos sinais detectados com Radar Score superior a 90',
    description: 'Pico de demanda e queixas contra preços corporativos de SaaS nas últimas 2 horas.',
    timeAgo: 'Há 18 min',
    type: 'urgent_signal',
    score: 98,
    isRead: false,
    linkSection: 'radar',
  },
  {
    id: 'notif-2',
    title: 'Gong / Chorus Light para SMBs',
    description: '18 discussões sobre custos abusivos de contratos enterprise detectadas no Reddit r/sales.',
    timeAgo: 'Há 1 hora',
    type: 'saas_opportunity',
    score: 95,
    isRead: false,
    linkSection: 'opportunities',
  },
  {
    id: 'notif-3',
    title: 'AI Daily Coach: Checkpoint Pendente',
    description: 'Você está na metade do projeto "AuditFlow AI" no My Lab. Conclua a tarefa de hoje.',
    timeAgo: 'Há 2 horas',
    type: 'ai_coach',
    isRead: false,
    linkSection: 'my-lab',
  },
];

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  isOpen,
  onClose,
  onNavigateSection,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const popoverRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleItemClick = (item: NotificationItem) => {
    markAsRead(item.id);
    if (item.linkSection && onNavigateSection) {
      onNavigateSection(item.linkSection);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-sm rounded-2xl bg-card-bg/95 backdrop-blur-xl border border-card-border shadow-xl shadow-black/10 dark:shadow-black/50 z-50 overflow-hidden animate-fade-in"
      role="dialog"
      aria-label="Notificações do Radar"
    >
      {/* Popover Header */}
      <div className="p-4 border-b border-card-border flex items-center justify-between bg-slate-50/70 dark:bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center text-slate-900 dark:text-slate-100">
            <Bell className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Notificações do Radar
              </h3>
              {unreadCount > 0 && (
                <Badge variant="emerald" size="sm">
                  {unreadCount} novas
                </Badge>
              )}
            </div>
            <p className="text-3xs text-slate-500">Alertas de viabilidade e sinais em tempo real</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-3xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors"
            >
              Marcar lidas
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-card-border">
        {notifications.map((item) => (
          <div
            key={item.id}
            onClick={() => handleItemClick(item)}
            className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 ${
              item.isRead
                ? 'bg-transparent opacity-75 hover:bg-slate-50/50 dark:hover:bg-white/[0.02]'
                : 'bg-slate-50/80 dark:bg-white/[0.03] hover:bg-slate-100/80 dark:hover:bg-white/[0.05]'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {item.type === 'urgent_signal' && (
                <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <Flame className="w-3.5 h-3.5" />
                </div>
              )}
              {item.type === 'saas_opportunity' && (
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Radio className="w-3.5 h-3.5" />
                </div>
              )}
              {item.type === 'ai_coach' && (
                <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <h4
                  className={`text-xs truncate ${
                    item.isRead
                      ? 'font-medium text-slate-700 dark:text-slate-300'
                      : 'font-bold text-slate-900 dark:text-slate-100'
                  }`}
                >
                  {item.title}
                </h4>
                {item.score && (
                  <span className="text-3xs font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900 text-white dark:bg-white dark:text-slate-900 shrink-0">
                    {item.score}
                  </span>
                )}
              </div>

              <p className="text-2xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                {item.description}
              </p>

              <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 dark:border-white/[0.04]">
                <span className="text-3xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {item.timeAgo}
                </span>

                <span className="text-3xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1 group">
                  <span>Ver detalhes</span>
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Popover Footer */}
      <div className="p-3 border-t border-card-border bg-slate-50/70 dark:bg-white/[0.02] flex items-center justify-between">
        <button
          onClick={() => {
            if (onNavigateSection) onNavigateSection('alerts');
            onClose();
          }}
          className="text-xs font-semibold text-slate-900 dark:text-slate-100 hover:underline flex items-center gap-1.5"
        >
          <span>Central de Alertas & Sinais</span>
          <ExternalLink className="w-3 h-3 text-slate-500" />
        </button>

        <span className="text-3xs text-slate-500">
          Atualizado em tempo real
        </span>
      </div>
    </div>
  );
};
