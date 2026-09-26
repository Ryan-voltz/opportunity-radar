import React from 'react';
import { NavSection } from '../../types';
import {
  LayoutDashboard,
  Radio,
  Sparkles,
  Layers,
  TrendingUp,
  Globe,
  Briefcase,
  SearchCode,
  Bot,
  FlaskConical,
  Bell,
  Bookmark,
  FileCheck2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Radar as RadarIcon,
  Database,
  Compass,
} from 'lucide-react';

interface SidebarProps {
  currentSection: NavSection;
  onNavigate: (section: NavSection) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  savedCount: number;
  liveSignalCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  savedCount,
  liveSignalCount,
}) => {
  const navGroups: {
    label: string;
    items: {
      section: NavSection;
      label: string;
      icon: React.ReactNode;
      badge?: string | number;
      badgeColor?: 'cyan' | 'emerald' | 'amber';
    }[];
  }[] = [
    {
      label: 'Inteligência Core',
      items: [
        {
          section: 'dashboard',
          label: 'Dashboard',
          icon: <LayoutDashboard className="w-4 h-4" />,
        },
        {
          section: 'radar',
          label: 'Radar Live',
          icon: <Radio className="w-4 h-4 text-cyan-400" />,
          badge: liveSignalCount > 0 ? `${liveSignalCount} novos` : undefined,
          badgeColor: 'cyan',
        },
        {
          section: 'market-news',
          label: 'News & Discovery',
          icon: <Compass className="w-4 h-4 text-cyan-400" />,
          badge: 'Live',
          badgeColor: 'cyan',
        },
        {
          section: 'opportunities',
          label: 'Oportunidades',
          icon: <Sparkles className="w-4 h-4 text-emerald-400" />,
        },
        {
          section: 'saas-radar',
          label: 'SaaS Radar',
          icon: <Layers className="w-4 h-4 text-violet-400" />,
        },
      ],
    },
    {
      label: 'Mercado & Sinais',
      items: [
        {
          section: 'market-trends',
          label: 'Market Trends',
          icon: <TrendingUp className="w-4 h-4 text-amber-400" />,
        },
        {
          section: 'global-opportunities',
          label: 'Global & Arbitragem',
          icon: <Globe className="w-4 h-4 text-cyan-400" />,
        },
        {
          section: 'remote-work',
          label: 'Remote Work',
          icon: <Briefcase className="w-4 h-4" />,
        },
        {
          section: 'research',
          label: 'Research & Dores',
          icon: <SearchCode className="w-4 h-4 text-rose-400" />,
        },
      ],
    },
    {
      label: 'Validação & Ação',
      items: [
        {
          section: 'ai-analyst',
          label: 'AI Analyst',
          icon: <Bot className="w-4 h-4 text-violet-400" />,
        },
        {
          section: 'my-lab',
          label: 'My Lab',
          icon: <FlaskConical className="w-4 h-4 text-emerald-400" />,
        },
        {
          section: 'saved',
          label: 'Oportunidades Salvas',
          icon: <Bookmark className="w-4 h-4" />,
          badge: savedCount > 0 ? savedCount : undefined,
          badgeColor: 'emerald',
        },
        {
          section: 'execution-plans',
          label: 'Planos de Execução',
          icon: <FileCheck2 className="w-4 h-4" />,
        },
      ],
    },
    {
      label: 'Sistema',
      items: [
        {
          section: 'admin',
          label: 'Fontes & Ingestão',
          icon: <Database className="w-4 h-4 text-cyan-400" />,
          badge: 'Live',
          badgeColor: 'cyan',
        },
        {
          section: 'alerts',
          label: 'Alertas & Triggers',
          icon: <Bell className="w-4 h-4" />,
        },
        {
          section: 'settings',
          label: 'Configurações',
          icon: <Settings className="w-4 h-4" />,
        },
      ],
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-slate-950/95 border-r border-white/[0.08] backdrop-blur-xl flex flex-col justify-between transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 px-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
              <RadarIcon className="w-4 h-4 text-cyan-400 animate-spin-slow" />
            </div>

            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5 truncate">
                  Opportunity Radar
                  <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    PRO
                  </span>
                </span>
                <span className="text-[10px] font-mono text-slate-500 truncate">
                  Market Intelligence
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="hidden md:flex p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title={isCollapsed ? 'Expandir Menu' : 'Recolher Menu'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="overflow-y-auto max-h-[calc(100vh-140px)] p-2.5 space-y-5 no-scrollbar">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {!isCollapsed && (
                <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  {group.label}
                </div>
              )}

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = currentSection === item.section;
                  return (
                    <button
                      key={item.section}
                      onClick={() => onNavigate(item.section)}
                      className={`w-full flex items-center ${
                        isCollapsed ? 'justify-center px-0' : 'justify-between px-2.5'
                      } py-2 rounded-lg text-xs font-medium transition-all group relative ${
                        isActive
                          ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] border border-transparent'
                      }`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`shrink-0 transition-colors ${
                            isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                          }`}
                        >
                          {item.icon}
                        </span>
                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                      </div>

                      {!isCollapsed && item.badge && (
                        <span
                          className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-full border ${
                            item.badgeColor === 'cyan'
                              ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                              : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}

                      {/* Dot for active state when collapsed */}
                      {isCollapsed && isActive && (
                        <span className="absolute right-1 top-2 w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer User Workspace Panel */}
      <div className="p-3 border-t border-white/[0.08] bg-slate-900/60">
        {!isCollapsed ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white font-mono shrink-0">
                OR
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-slate-200 truncate">
                  Ryan Workspace
                </span>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Sinais Ativos
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white font-mono">
              OR
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
