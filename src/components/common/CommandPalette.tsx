import React, { useState, useEffect } from 'react';
import { NavSection, Opportunity } from '../../types';
import {
  Search,
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
  X,
  ChevronRight,
  Database,
  Compass,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (section: NavSection) => void;
  onSelectOpportunity: (opportunity: Opportunity) => void;
  opportunities: Opportunity[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onSelectOpportunity,
  opportunities,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open handled externally or we can toggle
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navItems: { section: NavSection; label: string; icon: React.ReactNode; category: string }[] = [
    { section: 'dashboard', label: 'Dashboard Executivo', icon: <LayoutDashboard className="w-4 h-4" />, category: 'Navegação' },
    { section: 'radar', label: 'Radar de Sinais Live', icon: <Radio className="w-4 h-4 text-cyan-400" />, category: 'Navegação' },
    { section: 'market-news', label: 'Market News & Discovery (Notícias & Hipóteses)', icon: <Compass className="w-4 h-4 text-cyan-400" />, category: 'Navegação' },
    { section: 'opportunities', label: 'Explorador de Oportunidades', icon: <Sparkles className="w-4 h-4 text-emerald-400" />, category: 'Navegação' },
    { section: 'saas-radar', label: 'SaaS Radar & Micro-SaaS', icon: <Layers className="w-4 h-4 text-violet-400" />, category: 'Navegação' },
    { section: 'market-trends', label: 'Market Trends & Tecnologias', icon: <TrendingUp className="w-4 h-4 text-amber-400" />, category: 'Navegação' },
    { section: 'global-opportunities', label: 'Global & Geo-Arbitragem', icon: <Globe className="w-4 h-4 text-cyan-400" />, category: 'Navegação' },
    { section: 'remote-work', label: 'Trabalho Remoto & Freelance Global', icon: <Briefcase className="w-4 h-4" />, category: 'Navegação' },
    { section: 'research', label: 'Research & Queixas de Clientes', icon: <SearchCode className="w-4 h-4 text-rose-400" />, category: 'Navegação' },
    { section: 'ai-analyst', label: 'AI Analyst Workbench', icon: <Bot className="w-4 h-4 text-violet-400" />, category: 'Navegação' },
    { section: 'my-lab', label: 'My Lab: Sandbox de Validação', icon: <FlaskConical className="w-4 h-4 text-emerald-400" />, category: 'Navegação' },
    { section: 'alerts', label: 'Alertas & Triggers', icon: <Bell className="w-4 h-4" />, category: 'Navegação' },
    { section: 'saved', label: 'Oportunidades Salvas', icon: <Bookmark className="w-4 h-4 text-cyan-400" />, category: 'Navegação' },
    { section: 'execution-plans', label: 'Planos de Execução & Playbooks', icon: <FileCheck2 className="w-4 h-4" />, category: 'Navegação' },
    { section: 'admin', label: 'Fontes & Ingestão de Inteligência', icon: <Database className="w-4 h-4 text-cyan-400" />, category: 'Sistema' },
    { section: 'settings', label: 'Configurações & Chaves de API', icon: <Settings className="w-4 h-4" />, category: 'Navegação' },
  ];

  const filteredNav = navItems.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredOpportunities = opportunities.filter(
    (opp) =>
      opp.title.toLowerCase().includes(query.toLowerCase()) ||
      opp.tagline.toLowerCase().includes(query.toLowerCase()) ||
      opp.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Palette Modal */}
      <div className="relative w-full max-w-xl bg-slate-950 border border-white/15 rounded-2xl shadow-panel overflow-hidden z-10 animate-fade-in flex flex-col max-h-[75vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-slate-900/80">
          <Search className="w-4 h-4 text-cyan-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Navegue pelas 14 seções ou busque oportunidades..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
            autoFocus
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white/5 border border-white/10 rounded">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-4">
          {/* Nav Items */}
          {filteredNav.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-slate-500">
                Navegação Rápida ({filteredNav.length})
              </div>
              <div className="space-y-0.5 mt-1">
                {filteredNav.map((item) => (
                  <button
                    key={item.section}
                    onClick={() => {
                      onNavigate(item.section);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors group text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="p-1 rounded bg-white/[0.04] text-slate-400 group-hover:text-cyan-400">
                        {item.icon}
                      </span>
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Opportunities Matching */}
          {filteredOpportunities.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-slate-500">
                Oportunidades em Destaque ({filteredOpportunities.length})
              </div>
              <div className="space-y-1 mt-1">
                {filteredOpportunities.map((opp) => (
                  <button
                    key={opp.id}
                    onClick={() => {
                      onSelectOpportunity(opp);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors group text-left"
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-2xs font-mono text-cyan-400">{opp.category}</span>
                        <span className="text-2xs font-mono text-emerald-400">Score {opp.score}</span>
                      </div>
                      <p className="font-medium text-slate-200 group-hover:text-cyan-300 truncate">
                        {opp.title}
                      </p>
                    </div>
                    <span className="text-2xs font-mono text-slate-500 shrink-0">
                      Ver Dossiê →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredNav.length === 0 && filteredOpportunities.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-xs">
              Nenhum resultado encontrado para "{query}".
            </div>
          )}
        </div>

        {/* Footer shortcuts info */}
        <div className="px-4 py-2 border-t border-white/[0.06] bg-slate-900/60 flex items-center justify-between text-2xs text-slate-500">
          <span>Dica: Use as setas para navegar e Enter para selecionar</span>
          <span className="font-mono">Opportunity Radar Command Center</span>
        </div>
      </div>
    </div>
  );
};
