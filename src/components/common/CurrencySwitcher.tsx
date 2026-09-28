import React, { useState, useRef, useEffect } from 'react';
import { useCurrency, CurrencyMode } from '../../context/CurrencyContext';
import { ChevronDown, ArrowRightLeft, Check, DollarSign } from 'lucide-react';

interface CurrencySwitcherProps {
  className?: string;
  compact?: boolean;
}

export const CurrencySwitcher: React.FC<CurrencySwitcherProps> = ({
  className = '',
  compact = false,
}) => {
  const { currency, setCurrency, toggleCurrency, rates } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currencies: { code: CurrencyMode; label: string; flag: string; symbol: string }[] = [
    { code: 'BRL', label: 'Real Brasileiro', flag: '🇧🇷', symbol: 'R$' },
    { code: 'USD', label: 'Dólar Americano', flag: '🇺🇸', symbol: '$' },
    { code: 'EUR', label: 'Euro Europeu', flag: '🇪🇺', symbol: '€' },
  ];

  const currentOption = currencies.find((c) => c.code === currency) || currencies[0];

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      {/* Switcher Button */}
      <div className="flex items-center gap-1">
        <button
          onClick={toggleCurrency}
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all text-xs font-sans shadow-2xs ${
            currency === 'BRL'
              ? 'bg-slate-100 dark:bg-white/[0.06] border-slate-300 dark:border-white/20 text-slate-900 dark:text-white'
              : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
          title="Clique para alternar câmbio em tempo real (Real ⇄ Dólar)"
        >
          <span className="text-sm">{currentOption.flag}</span>
          <span className="font-semibold">{currentOption.symbol}</span>
          {!compact && (
            <span className="hidden sm:inline font-medium">
              {currency === 'BRL' ? 'Real (convertido)' : currentOption.label}
            </span>
          )}
          <ArrowRightLeft className="w-3 h-3 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
        </button>

        {/* Dropdown caret for EUR and options */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          title="Mais moedas de conversão"
        >
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-card-bg border border-card-border p-2 shadow-xl z-50 animate-fade-in space-y-1">
          <div className="px-2.5 py-1.5 text-2xs font-semibold text-slate-500 border-b border-card-border flex items-center justify-between">
            <span>Conversão em Tempo Real</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              1 USD = R$ {rates.USD_TO_BRL.toFixed(2)}
            </span>
          </div>

          {currencies.map((item) => (
            <button
              key={item.code}
              onClick={() => {
                setCurrency(item.code);
                setIsOpen(false);
              }}
              className={`w-full px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                currency === item.code
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{item.flag}</span>
                <span>{item.label}</span>
                <span className="opacity-60 text-2xs font-sans">({item.symbol})</span>
              </div>
              {currency === item.code && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
            </button>
          ))}

          <div className="pt-1.5 px-2.5 text-[10px] text-slate-400 leading-tight">
            Cotação automática sincronizada com BACEN / AwesomeAPI.
          </div>
        </div>
      )}
    </div>
  );
};
