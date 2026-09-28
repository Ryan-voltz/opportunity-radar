import React, { useState } from 'react';
import { useCurrency } from '../../context/CurrencyContext';
import { RefreshCw } from 'lucide-react';

interface CurrencyValueProps {
  value: string;
  className?: string;
  badgeClassName?: string;
  showBadge?: boolean;
  inline?: boolean;
  prefix?: string;
  suffix?: string;
}

export const CurrencyValue: React.FC<CurrencyValueProps> = ({
  value,
  className = '',
  badgeClassName = '',
  showBadge = true,
  inline = false,
  prefix = '',
  suffix = '',
}) => {
  const { currency, toggleCurrency, convertText, rates } = useCurrency();
  const [isHovered, setIsHovered] = useState(false);

  const convertedText = convertText(value);
  const isBrl = currency === 'BRL';

  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        toggleCurrency();
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`cursor-pointer group/curr transition-all select-none inline-flex ${
        inline ? 'items-center gap-1.5' : 'flex-col'
      }`}
      title={`Câmbio em tempo real: 1 USD = R$ ${rates.USD_TO_BRL.toFixed(2)} (AwesomeAPI / BACEN). Clique para alternar entre R$ e $`}
    >
      <span className={`inline-flex items-center gap-1 ${className}`}>
        {prefix}
        <span>{convertedText}</span>
        {suffix}
        {isHovered && (
          <RefreshCw className="w-2.5 h-2.5 text-slate-400 opacity-70 animate-spin shrink-0 group-hover/curr:opacity-100" />
        )}
      </span>

      {showBadge && isBrl && (
        <span
          className={`text-[9px] font-sans font-medium text-emerald-600 dark:text-emerald-400/90 tracking-tight transition-opacity ${
            badgeClassName || 'mt-0.5'
          }`}
        >
          convertido em real
        </span>
      )}

      {showBadge && !isBrl && (
        <span
          className={`text-[9px] font-sans font-medium text-slate-500 tracking-tight transition-opacity ${
            badgeClassName || 'mt-0.5'
          }`}
        >
          em dólar (clique p/ R$)
        </span>
      )}
    </span>
  );
};
