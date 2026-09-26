import React, { useState } from 'react';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { SearchCode, ThumbsDown, MessageSquare, AlertCircle, ArrowUpRight, Sparkles } from 'lucide-react';

export const ResearchView: React.FC = () => {
  const [activeNiche, setActiveNiche] = useState<string>('all');

  const researchItems = [
    {
      id: 'res-1',
      software: 'DocuSign',
      category: 'Assinatura Eletrônica',
      rating: '2.8 / 5.0 em planos SMB',
      primaryComplaint: 'Imposição de contratos anuais mínimos de $8.000 para equipes que só precisam de autenticação esporádica.',
      quotesCount: 142,
      topQuote: 'Tivemos que cancelar porque nosso uso é sazonal e eles não oferecem planos pay-as-you-go transparentes.',
      unservedSegment: 'Subempreiteiros da construção civil e pequenas bancas de advocacia.',
      opportunityAngle: 'Micro-SaaS com assinatura eletrônica e pagamento estritamente por documento assinado (R$ 1,50/doc).',
      sentimentSeverity: 'Crítica'
    },
    {
      id: 'res-2',
      software: 'HubSpot CRM',
      category: 'Automação Comercial',
      rating: '3.1 / 5.0 em Starter',
      primaryComplaint: 'Degrau financeiro gigantesco entre plano gratuito e planos Pro (salto de $50/mês para $500+/mês).',
      quotesCount: 310,
      topQuote: 'Assim que você atinge 1.000 contatos, o preço explode. Não tem um meio-termo para quem fatura menos de $15k.',
      unservedSegment: 'Agências solo e prestadores de serviço locais.',
      opportunityAngle: 'CRM ultra-leve com WhatsApp nativo e faturamento fixo sem taxa por número de contatos.',
      sentimentSeverity: 'Alta'
    },
    {
      id: 'res-3',
      software: 'Jira Software',
      category: 'Gestão de Projetos',
      rating: '2.9 / 5.0 em Usabilidade',
      primaryComplaint: 'Lentidão crônica de carregamento e dezenas de campos obrigatórios que paralisam desenvolvedores.',
      quotesCount: 520,
      topQuote: 'Gastamos mais tempo preenchendo campos no Jira do que escrevendo código de produção.',
      unservedSegment: 'Times de desenvolvimento de 3 a 15 pessoas.',
      opportunityAngle: 'Issue tracker focado em velocidade extrema com atalhos de teclado (estilo Linear) integrado a PRs.',
      sentimentSeverity: 'Alta'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-950/40 to-slate-900 border border-rose-500/20">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="rose" size="sm">
            Mineração de Dores Reais
          </Badge>
          <span className="text-2xs font-mono text-slate-400">
            Fricções extraídas de G2, Reddit, Capterra e Fóruns
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
          Research de Clientes Insatisfeitos & Queixas
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
          As melhores oportunidades de negócio nascem da frustração persistente de clientes que já pagam por soluções existentes mas se sentem ignorados ou explorados.
        </p>
      </div>

      {/* Complaints Grid */}
      <div className="space-y-4">
        {researchItems.map((item) => (
          <div
            key={item.id}
            className="p-6 rounded-2xl bg-slate-900/60 border border-white/[0.08] hover:border-rose-500/30 transition-all space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                  <ThumbsDown className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-100">{item.software}</h3>
                    <Badge variant="slate" size="xs">
                      {item.category}
                    </Badge>
                  </div>
                  <span className="text-2xs font-mono text-rose-400">
                    {item.rating} • {item.quotesCount} reclamações analisadas
                  </span>
                </div>
              </div>

              <Badge variant="rose" size="sm">
                Severidade: {item.sentimentSeverity}
              </Badge>
            </div>

            {/* Core complaint */}
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block">
                Ponto Central de Atrito:
              </span>
              <p className="text-sm font-medium text-slate-200">
                {item.primaryComplaint}
              </p>
            </div>

            {/* Real Quote */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="flex items-center gap-1.5 text-2xs font-mono text-slate-500 mb-1">
                <MessageSquare className="w-3 h-3 text-cyan-400" /> Citação Típica de Cliente:
              </div>
              <blockquote className="text-xs italic text-slate-300">
                "{item.topQuote}"
              </blockquote>
            </div>

            {/* Opportunity derived */}
            <div className="pt-2 border-t border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Ângulo de Oportunidade: {item.opportunityAngle}</span>
              </div>

              <Button
                variant="outline"
                size="xs"
                iconRight={<ArrowUpRight className="w-3 h-3" />}
                onClick={() => alert(`Gerando dossiê de solução contra a dor do ${item.software}`)}
              >
                Sintetizar Solução
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
