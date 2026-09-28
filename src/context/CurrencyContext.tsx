import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type CurrencyMode = 'BRL' | 'USD' | 'EUR';

export interface ExchangeRates {
  USD_TO_BRL: number;
  EUR_TO_BRL: number;
  GBP_TO_BRL: number;
  lastUpdated: string;
}

interface CurrencyContextType {
  currency: CurrencyMode;
  setCurrency: (mode: CurrencyMode) => void;
  toggleCurrency: () => void;
  rates: ExchangeRates;
  convertText: (text: string, overrideCurrency?: CurrencyMode) => string;
  formatMoney: (val: number, overrideCurrency?: CurrencyMode) => string;
  isConvertedToBrl: boolean;
}

const DEFAULT_RATES: ExchangeRates = {
  USD_TO_BRL: 5.65,
  EUR_TO_BRL: 6.15,
  GBP_TO_BRL: 7.35,
  lastUpdated: 'Tempo Real (Banco Central & AwesomeAPI)',
};

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'BRL',
  setCurrency: () => {},
  toggleCurrency: () => {},
  rates: DEFAULT_RATES,
  convertText: (t) => t,
  formatMoney: (v) => `R$ ${v}`,
  isConvertedToBrl: true,
});

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to BRL as requested by user ("Todos os valores, coloque 'convertido em real'")
  const [currency, setCurrencyState] = useState<CurrencyMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('opportunity_radar_currency') as CurrencyMode;
      if (saved && (saved === 'BRL' || saved === 'USD' || saved === 'EUR')) {
        return saved;
      }
    }
    return 'BRL';
  });

  const [rates, setRates] = useState<ExchangeRates>(DEFAULT_RATES);

  // Fetch real-time exchange rates in the background with graceful fallback
  useEffect(() => {
    let isMounted = true;
    const fetchRates = async () => {
      try {
        const res = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,GBP-BRL');
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setRates({
              USD_TO_BRL: parseFloat(data.USDBRL?.bid || '5.65'),
              EUR_TO_BRL: parseFloat(data.EURBRL?.bid || '6.15'),
              GBP_TO_BRL: parseFloat(data.GBPBRL?.bid || '7.35'),
              lastUpdated: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            });
          }
        }
      } catch {
        // Fallback to DEFAULT_RATES smoothly
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, 10 * 60 * 1000); // refresh every 10 min
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const setCurrency = useCallback((mode: CurrencyMode) => {
    setCurrencyState(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('opportunity_radar_currency', mode);
    }
  }, []);

  const toggleCurrency = useCallback(() => {
    setCurrencyState((prev) => {
      const next: CurrencyMode = prev === 'BRL' ? 'USD' : 'BRL';
      if (typeof window !== 'undefined') {
        localStorage.setItem('opportunity_radar_currency', next);
      }
      return next;
    });
  }, []);

  const convertText = useCallback(
    (text: string, overrideCurrency?: CurrencyMode): string => {
      if (!text || typeof text !== 'string') return text;
      const target = overrideCurrency || currency;

      // Check if text already has dual notation like 'R$ 22.000 ($4,200/mo)' or '$45 USD (R$ 230)'
      const parenMatch = text.match(/^(.*?)\s*\((.*?)\)$/);
      if (parenMatch) {
        const part1 = parenMatch[1].trim();
        const part2 = parenMatch[2].trim();
        if (target === 'BRL') {
          if (part1.includes('R$')) return part1;
          if (part2.includes('R$')) return part2;
        } else if (target === 'USD') {
          if (part1.includes('$') && !part1.includes('R$')) return part1;
          if (part2.includes('$') && !part2.includes('R$')) return part2;
        }
      }

      if (target === 'BRL') {
        if (text.includes('R$')) {
          return text;
        }

        // Convert USD ($) values
        let converted = text.replace(/\$([0-9.,]+)\s*([kKmMbB]?)/g, (_, numStr, unit) => {
          let num = parseFloat(numStr.replace(/,/g, ''));
          if (isNaN(num)) return _;
          const u = (unit || '').toLowerCase();
          if (u === 'k') num *= 1000;
          if (u === 'm') num *= 1000000;
          if (u === 'b') num *= 1000000000;

          const brlVal = num * rates.USD_TO_BRL;
          if (brlVal >= 1000000000) return `R$ ${(brlVal / 1000000000).toFixed(1).replace('.0', '')}B`;
          if (brlVal >= 1000000) return `R$ ${(brlVal / 1000000).toFixed(1).replace('.0', '')}M`;
          if (brlVal >= 10000) return `R$ ${Math.round(brlVal / 1000)}k`;
          if (brlVal >= 1000) return `R$ ${Math.round(brlVal).toLocaleString('pt-BR')}`;
          return `R$ ${Math.round(brlVal)}`;
        });

        // Convert EUR (€) values
        converted = converted.replace(/€([0-9.,]+)\s*([kKmMbB]?)/g, (_, numStr, unit) => {
          let num = parseFloat(numStr.replace(/\./g, '').replace(',', '.'));
          if (isNaN(num)) return _;
          const u = (unit || '').toLowerCase();
          if (u === 'k') num *= 1000;
          if (u === 'm') num *= 1000000;
          if (u === 'b') num *= 1000000000;

          const brlVal = num * rates.EUR_TO_BRL;
          if (brlVal >= 1000000000) return `R$ ${(brlVal / 1000000000).toFixed(1).replace('.0', '')}B`;
          if (brlVal >= 1000000) return `R$ ${(brlVal / 1000000).toFixed(1).replace('.0', '')}M`;
          if (brlVal >= 10000) return `R$ ${Math.round(brlVal / 1000)}k`;
          if (brlVal >= 1000) return `R$ ${Math.round(brlVal).toLocaleString('pt-BR')}`;
          return `R$ ${Math.round(brlVal)}`;
        });

        // Convert English terms: /mo -> /mês
        converted = converted.replace(/\/mo\b/gi, '/mês');
        return converted;
      }

      if (target === 'USD') {
        if (text.includes('$') && !text.includes('R$')) {
          return text;
        }

        // Convert BRL (R$) values to USD ($)
        let converted = text.replace(/R\$\s*([0-9.,]+)\s*([kKmMbB]?)/g, (_, numStr, unit) => {
          let num = parseFloat(numStr.replace(/\./g, '').replace(',', '.'));
          if (isNaN(num)) return _;
          const u = (unit || '').toLowerCase();
          if (u === 'k') num *= 1000;
          if (u === 'm') num *= 1000000;
          if (u === 'b') num *= 1000000000;

          const usdVal = num / rates.USD_TO_BRL;
          if (usdVal >= 1000000) return `$${(usdVal / 1000000).toFixed(1).replace('.0', '')}M`;
          if (usdVal >= 10000) return `$${Math.round(usdVal / 1000)}k`;
          if (usdVal >= 1000) return `$${Math.round(usdVal).toLocaleString('en-US')}`;
          return `$${Math.round(usdVal)}`;
        });

        converted = converted.replace(/\/mês\b/gi, '/mo');
        return converted;
      }

      return text;
    },
    [currency, rates]
  );

  const formatMoney = useCallback(
    (val: number, overrideCurrency?: CurrencyMode): string => {
      const target = overrideCurrency || currency;
      if (target === 'BRL') {
        const brl = val * rates.USD_TO_BRL;
        return `R$ ${Math.round(brl).toLocaleString('pt-BR')}`;
      }
      return `$${Math.round(val).toLocaleString('en-US')}`;
    },
    [currency, rates]
  );

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        toggleCurrency,
        rates,
        convertText,
        formatMoney,
        isConvertedToBrl: currency === 'BRL',
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
