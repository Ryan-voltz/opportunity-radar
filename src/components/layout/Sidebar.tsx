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
          icon: <Radio className="w-4 h-4" />,
          badge: liveSignalCount > 0 ? `${liveSignalCount} novos` : undefined,
        },
        {
          section: 'market-news',
          label: 'News & Discovery',
          icon: <Compass className="w-4 h-4" />,
          badge: 'Live',
        },
        {
          section: 'opportunities',
          label: 'Oportunidades',
          icon: <Sparkles className="w-4 h-4" />,
        },
        {
          section: 'saas-radar',
          label: 'SaaS Radar',
          icon: <Layers className="w-4 h-4" />,
        },
      ],
    },
    {
      label: 'Mercado & Sinais',
      items: [
        {
          section: 'market-trends',
          label: 'Market Trends',
          icon: <TrendingUp className="w-4 h-4" />,
        },
        {
          section: 'global-opportunities',
          label: 'Global & Arbitragem',
          icon: <Globe className="w-4 h-4" />,
        },
        {
          section: 'remote-work',
          label: 'Remote Work',
          icon: <Briefcase className="w-4 h-4" />,
        },
        {
          section: 'research',
          label: 'Research & Dores',
          icon: <SearchCode className="w-4 h-4" />,
        },
      ],
    },
    {
      label: 'Validação & Ação',
      items: [
        {
          section: 'ai-analyst',
          label: 'AI Analyst',
          icon: <Bot className="w-4 h-4" />,
        },
        {
          section: 'my-lab',
          label: 'Meus Projetos & Lab',
          icon: <FlaskConical className="w-4 h-4" />,
        },
        {
          section: 'saved',
          label: 'Oportunidades Salvas',
          icon: <Bookmark className="w-4 h-4" />,
          badge: savedCount > 0 ? savedCount : undefined,
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
          icon: <Database className="w-4 h-4" />,
          badge: 'Live',
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
            <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white/10 border border-slate-700 dark:border-white/15 flex items-center justify-center shrink-0">
              <RadarIcon className="w-4 h-4 text-slate-100" />
            </div>

            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                  Opportunity Radar
                  <span className="text-[10px] font-sans font-semibold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-white/10">
                    PRO
                  </span>
                </span>
                <span className="text-[11px] font-sans text-slate-500 dark:text-slate-400 truncate">
                  Market Intelligence
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="hidden md:flex p-1.5 rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
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
                <div className="px-2.5 py-1 text-[11px] font-sans font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
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
                      } py-2 rounded-xl text-xs font-sans transition-all group relative ${
                        isActive
                          ? 'bg-slate-200 dark:bg-white/[0.08] text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 font-semibold shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04] border border-transparent'
                      }`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`shrink-0 transition-colors ${
                            isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'
                          }`}
                        >
                          {item.icon}
                        </span>
                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                      </div>

                      {!isCollapsed && item.badge && (
                        <span className="text-[10px] font-sans font-medium px-2 py-0.5 rounded-full bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/10">
                          {item.badge}
                        </span>
                      )}

                      {/* Dot for active state when collapsed */}
                      {isCollapsed && isActive && (
                        <span className="absolute right-1 top-2 w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-white" />
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
