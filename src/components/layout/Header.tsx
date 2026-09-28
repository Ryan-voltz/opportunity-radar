import React, { useState } from 'react';
import { NavSection } from '../../types';
import {
  Search,
  Bell,
  Menu,
  Sparkles,
  Command,
  Sun,
  Moon,
} from 'lucide-react';
import { Button } from '../common/Button';
import { useTheme } from '../../context/ThemeContext';
import { CurrencySwitcher } from '../common/CurrencySwitcher';
import { NotificationPopover } from '../common/NotificationPopover';

interface HeaderProps {
  currentSection: NavSection;
  onOpenCommandPalette: () => void;
  onToggleMobileMenu: () => void;
  onQuickAction: () => void;
  unhandledAlertsCount: number;
  onNavigateSection?: (section: NavSection) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentSection,
  onOpenCommandPalette,
  onToggleMobileMenu,
  onQuickAction,
  unhandledAlertsCount,
  onNavigateSection,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const getSectionTitle = (section: NavSection) => {
    switch (section) {
      case 'dashboard':
        return { title: 'Dashboard Executivo', subtitle: 'Visão consolidada de oportunidades, tendências e pulso de mercado' };
      case 'radar':
        return { title: 'Radar de Sinais Live', subtitle: 'Ingestão em tempo real de discussões, queixas e picos de demanda global' };
      case 'opportunities':
        return { title: 'Explorador de Oportunidades', subtitle: 'Catálogo multidimensional com scores de viabilidade e velocidade de MVP' };
      case 'saas-radar':
        return { title: 'SaaS Radar & Micro-SaaS', subtitle: 'Gaps de software B2B, oportunidades de unbundling e produtos de nicho' };
      case 'market-trends':
        return { title: 'Market Trends & Tecnologias', subtitle: 'Tecnologias emergentes, repositórios acelerando e mudanças regulatórias' };
      case 'global-opportunities':
        return { title: 'Global Opportunities & Arbitragem', subtitle: 'Modelos validados internacionalmente prontos para adaptação regional' };
      case 'remote-work':
        return { title: 'Trabalho Remoto & Freelance Global', subtitle: 'Contratos internacionais de alto tíquete e habilidades escassas em alta' };
      case 'research':
        return { title: 'Research & Queixas de Clientes', subtitle: 'Mineração profunda de fricções em G2, Capterra, Reddit e fóruns técnicos' };
      case 'ai-analyst':
        return { title: 'AI Analyst Workbench', subtitle: 'Análise tática assistida por IA: desconstrução de concorrentes, SWOT e CAC/LTV' };
      case 'my-lab':
        return { title: 'My Lab: Sandbox de Validação', subtitle: 'Painel pessoal para registrar hipóteses, gerenciar testes e testar tração' };
      case 'alerts':
        return { title: 'Alertas & Triggers', subtitle: 'Regras de notificação proativas para detecção precoce de demandas' };
      case 'saved':
        return { title: 'Oportunidades Salvas', subtitle: 'Seu pipeline selecionado de oportunidades para estudo e execução' };
      case 'execution-plans':
        return { title: 'Planos de Execução', subtitle: 'Playbooks estruturados passo a passo para lançar sem desperdício de código' };
      case 'market-news':
        return { title: 'Market News & Discovery', subtitle: 'Notícias globais e detecção autônoma de hipóteses de oportunidade e tendências' };
      case 'admin':
        return { title: 'Fontes & Ingestão Real', subtitle: 'Conexões a APIs oficiais, feeds de dados e compliance com rate limits e robots.txt' };
      case 'settings':
        return { title: 'Configurações de Workspace', subtitle: 'Chaves de APIs, fontes de dados habilitadas e preferências do sistema' };
      default:
        return { title: 'Opportunity Radar', subtitle: 'Plataforma de Inteligência de Mercado' };
    }
  };

  const meta = getSectionTitle(currentSection);

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-white/[0.08] bg-slate-950/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Mobile menu button + Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          title="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight truncate flex items-center gap-2 font-sans">
            {meta.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate hidden sm:block font-sans">
            {meta.subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Live Stream Pulse Badge */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 text-xs font-sans font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Feed Ativo</span>
        </div>

        {/* Command Palette Button */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors text-xs font-sans"
          title="Abrir Command Palette (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline text-slate-700 dark:text-slate-300">Buscar...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] text-slate-500 bg-white dark:bg-white/10 px-1 rounded border border-slate-200 dark:border-white/10">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </button>

        {/* Currency Switcher (Real-time Real / Dollar converter) */}
        <CurrencySwitcher />

        {/* Theme Toggle Button (Light / Dark) */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 transition-all shadow-2xs flex items-center justify-center"
          title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
          aria-label="Alternar tema claro/escuro"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700 hover:-rotate-12 transition-transform" />
          )}
        </button>

        {/* Real In-App Notifications Pop-up */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationOpen((prev) => !prev)}
            className={`relative p-2 rounded-xl border transition-colors ${
              isNotificationOpen
                ? 'bg-slate-200 dark:bg-white/10 border-slate-400 dark:border-white/30 text-slate-900 dark:text-white'
                : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20'
            }`}
            title="Notificações & Alertas"
            aria-expanded={isNotificationOpen}
            aria-haspopup="dialog"
          >
            <Bell className="w-4 h-4" />
            {unhandledAlertsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          <NotificationPopover
            isOpen={isNotificationOpen}
            onClose={() => setIsNotificationOpen(false)}
            onNavigateSection={(sec) => onNavigateSection?.(sec as NavSection)}
          />
        </div>

        {/* Quick Action Button */}
        <Button
          variant="primary"
          size="sm"
          iconLeft={<Sparkles className="w-3.5 h-3.5" />}
          onClick={onQuickAction}
          className="hidden sm:inline-flex"
        >
          Analisar Oportunidade
        </Button>
      </div>
    </header>
  );
};
