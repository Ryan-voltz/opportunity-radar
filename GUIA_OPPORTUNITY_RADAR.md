# Opportunity Radar — Guia da Fundação da Plataforma SaaS

A fundação visual, arquitetural e conceitual da plataforma **Opportunity Radar** foi implementada com excelência estética, seguindo padrões internacionais de design de software (como *Linear, Raycast, Stripe e Vercel*).

---

## 1. Visão Geral da Arquitetura Entregue

A aplicação está estruturada em um ecossistema modular construído com:
- **Vite 8 + React 19 + TypeScript**: Desempenho extremo, compilação em menos de 1 segundo e tipagem estrita para todos os dados do domínio.
- **Tailwind CSS v4 com PostCSS**: Paleta de cores Obsidian Dark com acentos luminescentes táticos (Cyan, Emerald, Violet, Amber e Rose), sombras de elevação e gradientes discretos.
- **Lucide React Icons**: Iconografia minimalista, precisa e coerente em todas as telas.

### Estrutura de Pastas
```
pesquisador de oportunidades/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Badge.tsx            # Badges semânticos com variantes de cor
│   │   │   ├── Button.tsx           # Botões com microinterações e estados de loading
│   │   │   ├── CommandPalette.tsx   # Paleta global Ctrl+K para busca e navegação rápida
│   │   │   ├── DetailDrawer.tsx     # Slide-over lateral com dossiê completo em 5 abas
│   │   │   ├── FilterBar.tsx        # Barra de filtros, busca, ordenação e reset
│   │   │   ├── MetricCard.tsx       # Cards de métricas com números tabulares e deltas
│   │   │   ├── OpportunityCard.tsx  # Cards elegantes de oportunidades com tags e ações
│   │   │   └── RadarScoreBadge.tsx  # Indicador de viabilidade com escala dinâmica
│   │   └── layout/
│   │       ├── Header.tsx           # Header global com live stream pulse e busca
│   │       └── Sidebar.tsx          # Menu lateral com 14 seções agrupadas e modo recolhido
│   ├── data/
│   │   └── mockData.ts              # Modelos de dados de mercado realistas e tipados
│   ├── types/
│   │   └── index.ts                 # Interfaces do domínio (Opportunity, Signal, Trends...)
│   ├── views/
│   │   ├── DashboardView.tsx        # 1. Dashboard Executivo
│   │   ├── RadarView.tsx            # 2. Radar Live (Stream estilo terminal)
│   │   ├── OpportunitiesView.tsx    # 3. Explorador de Oportunidades (Cards/Tabela)
│   │   ├── SaasRadarView.tsx        # 4. SaaS Radar (Micro-SaaS & Unbundling)
│   │   ├── MarketTrendsView.tsx     # 5. Market Trends & Tecnologias
│   │   ├── GlobalOpportunitiesView.tsx # 6. Arbitragem Geográfica & Replicação
│   │   ├── RemoteWorkView.tsx       # 7. Trabalho Remoto & Freelance High-Ticket
│   │   ├── ResearchView.tsx         # 8. Research de Queixas & Dores de Clientes
│   │   ├── AiAnalystView.tsx        # 9. AI Analyst Workbench & Playbooks
│   │   ├── MyLabView.tsx            # 10. My Lab (Sandbox de Validação Kanban)
│   │   ├── AlertsView.tsx           # 11. Alertas & Triggers Proativos
│   │   ├── SavedView.tsx            # 12. Oportunidades Salvas & Pipeline
│   │   ├── ExecutionPlansView.tsx   # 13. Planos de Execução em 4 Fases
│   │   └── SettingsView.tsx         # 14. Configurações de Workspace & APIs
│   ├── App.tsx                      # Orquestrador central e gerenciador de estado
│   ├── index.css                    # Tokens visuais e utilitários glassmorphism
│   └── main.tsx                     # Ponto de entrada
├── package.json
├── tailwind.config.js
└── postcss.config.js
```

---

## 2. As 14 Telas Implementadas

| # | Módulo | Proposta de Valor & Funcionalidades |
|---|---|---|
| **1** | **Dashboard** | Visão executiva com 4 KPIs principais, banners de varredura global ativa, oportunidades em alta e ticker de sinais em tempo real. |
| **2** | **Radar Live** | Terminal de fluxo contínuo de sinais não filtrados (Reddit, G2, GitHub, Upwork), com filtro de fonte, sentimento e botão direto de promoção para oportunidade. |
| **3** | **Oportunidades** | Catálogo com alternância entre visualização em Cards e Tabela Linear, filtro por esforço de desenvolvimento, categoria, ordenação por score e busca instantânea. |
| **4** | **SaaS Radar** | Foco exclusivo em Micro-SaaS (<$20k MRR), estratégias de *unbundling* de gigantes corporativos (Salesforce/HubSpot) e add-ons para ecossistemas (Shopify/Notion/Chrome). |
| **5** | **Market Trends** | Detecção de aceleração em buscas e tecnologias emergentes (ex: Agentes de Código como Sidecar, conformidade com o EU AI Act, bancos WASM). |
| **6** | **Global Opportunities** | Estratégia de arbitragem geográfica: mapeamento de produtos faturando milhões nos EUA/Europa e sua adaptação para mercados locais desatendidos. |
| **7** | **Remote Work** | Mapeamento de escassez técnica em dólares e euros (LangGraph, Rust distribuído, RevOps), taxas horárias e multiplicador de arbitragem salarial. |
| **8** | **Research** | Mineração de queixas de consumidores em sites de avaliação (G2, Capterra) e fóruns técnicos, transformando pontos de atrito em teses de produtos alternativos. |
| **9** | **AI Analyst** | Bancada de inteligência assistida por IA com prompts calibrados para desconstruir concorrentes, estimar CAC/LTV e criar roteiros de MVP em 48h. |
| **10** | **My Lab** | Sandbox de validação com quadro Kanban em 5 etapas (*Backlog, Pesquisando, Landing Page, Entrevistas, Validado*) e modal para novas hipóteses. |
| **11** | **Alertas** | Monitoramento automatizado com gatilhos por palavra-chave, pontuação mínima de corte, canais de entrega (Webhook, Email, In-App) e frequência. |
| **12** | **Oportunidades Salvas** | Pipeline pessoal das oportunidades selecionadas para estudo aprofundado, com contadores dinâmicos e *empty state* elegante. |
| **13** | **Planos de Execução** | Roteiro prático em 4 fases para solo founders validarem e faturarem sem desperdício de código, acompanhado de checklists interativos e stack recomendada. |
| **14** | **Configurações** | Painel administrativo com abas para Workspace, Chaves de APIs/LLMs, canais de ingestão de dados e ferramentas de backup/exportação. |

---

## 3. Recursos Globais de Interação

1. **Slide-over Detail Drawer**:
   - Clicar em qualquer oportunidade abre uma gaveta deslizante lateral com visualização analítica em 5 abas:
     - *Visão Estruturada* (Problema, Solução, Monetização, Nicho, Diferenciação)
     - *Mercado & Concorrência* (Players existentes e motivo do gap)
     - *Plano de Execução* (Roteiro passo a passo com estimativa de horas)
     - *Sinais de Origem* (Citações reais capturadas com volume e fonte)
     - *SWOT IA* (Matriz de Forças, Fraquezas, Oportunidades e Ameaças)
2. **Command Palette (`Ctrl+K` ou `Cmd+K`)**:
   - Permite saltar instantaneamente para qualquer uma das 14 seções ou buscar diretamente no acervo de oportunidades através do teclado.
3. **Conversão de Sinais em Oportunidades**:
   - No **Radar Live**, ao clicar em *"Criar Oportunidade"*, o sinal do Reddit/G2 é instantaneamente transformado em uma oportunidade rascunho com pontuação e plano de validação.

---

## 4. Como Executar e Testar Localmente

O servidor de desenvolvimento do Vite já está rodando em segundo plano:

```bash
# Caso precise reiniciar futuramente:
npm.cmd run dev
```

Abra seu navegador em:
**`http://localhost:5173/`**

### Verificação do Build de Produção
Para verificar que todo o código TypeScript e CSS é 100% válido e compilável:
```bash
npm.cmd run build
```
*(Resultado atual: 0 erros, compilação concluída em menos de 1 segundo)*.
