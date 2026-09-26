# Opportunity Radar — Plataforma de Inteligência de Mercado e Descoberta de SaaS

> **Opportunity Radar** é uma plataforma SaaS premium para monitoramento contínuo do mercado global, detecção autônoma de sinais, análise de oportunidades de negócio e validação pré-código de produtos digitais e Micro-SaaS.

---

## 📑 Sumário

- [Visão Geral](#-visão-geral)
- [Recursos Principais](#-recursos-principais)
- [Stack Tecnológica](#-stack-tecnológica)
- [Arquitetura do Sistema](#-arquitetura-do-sistema)
- [Instalação e Configuração](#-instalação-e-configuração)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Desenvolvimento Local](#-desenvolvimento-local)
- [Build e Verificação de Produção](#-build-e-verificação-de-produção)
- [Deploy na Vercel (Produção & Preview)](#-deploy-na-vercel-produção--preview)
- [Banco de Dados (PostgreSQL)](#-banco-de-dados-postgresql)
- [Fontes de Inteligência & Compliance](#-fontes-de-inteligência--compliance)
- [Scripts Disponíveis](#-scripts-disponíveis)

---

## 🔭 Visão Geral

O **Opportunity Radar** monitora ecossistemas globais de tecnologia e negócios para responder em tempo real à pergunta central:
> *"O que está acontecendo no mercado agora e quais oportunidades de negócio posso explorar com rapidez e baixo risco?"*

A aplicação transforma sinais brutos (lançamentos de APIs, dores em fóruns, migrações de plataformas, repositórios em ascensão) em **Hipóteses Estruturadas de Oportunidade**, estimando público-alvo, esforço técnico preliminar, score de confiança e modelo de monetização.

---

## ⚡ Recursos Principais

1. **Dashboard & Opportunity Pulse:** Métricas ao vivo do mercado, sinais capturados hoje, tendências acelerando e resumo executivo.
2. **Global Radar Console:** Filtros multidimensionais por país/continente, moeda, nicho, facilidade técnica e potencial de receita.
3. **Market News & Discovery:**
   - Taxonomia cobrindo **15 categorias de inteligência** (*IA, SaaS, startups, economia digital, e-commerce, software, automação, fintech, APIs, novos produtos, mudanças de plataformas, etc.*).
   - Motor de inferência AI perguntando ativamente: *"Existe uma oportunidade de negócio escondida aqui?"*.
   - Rotulagem estrita como `[Hipótese de oportunidade] • <Tipo>` (sem falsas promessas de certeza).
   - Alternância entre **Visualização em Grade** e **Linha do Tempo (Timeline)** com nós iluminados.
   - **Emerging Trends:** Pipeline causal de 5 etapas (`1. TREND` → `2. GROWTH` → `3. MARKET` → `4. PROBLEM` → `5. OPPORTUNITY`).
   - **Daily Market Brief:** Briefing executivo diário com KPIs, pontos de atenção para fundadores e ação recomendada imediata.
4. **AI Analyst Engine:** Análise de vulnerabilidade de mercado, cálculo de viabilidade financeira e roteiro de validação ágil de 3 semanas com fallback heurístico seguro.
5. **My Lab (Sandbox Pré-Código):** Esteira kanban de validação rápida para transformar hipóteses em projetos com metas de validação.
6. **Gerenciador de Fontes & Compliance:** Painel de auditoria de fontes reais, medição de taxa de qualificação, respeito estrito a rate limits e robots.txt.

---

## 🛠 Stack Tecnológica

### Frontend
- **Framework:** React 19 + TypeScript
- **Bundler & Tooling:** Vite 8.3 + ESNext
- **Estilização:** Tailwind CSS v4 + PostCSS
- **Ícones & UI:** Lucide React, Clsx, Tailwind Merge
- **Visualização de Dados:** Sparkline SVG ultraleve embutido (zero dependências pesadas de gráficos)

### Backend & API
- **Runtime:** Node.js (ES Modules nativo)
- **Framework Web:** Express 5.2 (compatível com Vercel Serverless Functions via `@vercel/node`)
- **Streaming:** Server-Sent Events (SSE) para respostas de IA em tempo real
- **Segurança:** Headers OWASP (CSP, HSTS, X-Content-Type-Options), sanitização de inputs, Rate Limiting por IP (janela de 15 min) e mitigação contra body floods.
- **Cache:** Sistema multi-nível (Cache cliente em memória com deduplicação de in-flight requests + cache servidor com hash SHA-256).

### Qualidade & CI
- **Linter:** Oxlint (verificação estática em menos de 100ms)
- **Tipagem:** TypeScript strict mode com verificação em tempo de build (`tsc -b`)

---

## 🏛 Arquitetura do Sistema

```
                                 [ BROWSER / CLIENT ]
                                           │
                         (Vite SPA / React 19 + TypeScript)
                                           │
                                  /api/*   │   Rotas SPA
                                ┌──────────┴──────────┐
                                ▼                     ▼
                       [ VERCEL EDGE / CDN ]     [ dist/index.html ]
                                │
                        (vercel.json rewrite)
                                │
                                ▼
                   [ VERCEL SERVERLESS FUNCTION ]
                         (api/index.ts)
                                │
                                ▼
                       [ EXPRESS 5 ENGINE ]
                        (server/index.ts)
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
[ INGESTION PIPELINE ]  [ AI ANALYST SERVICE ]   [ DATABASE & CACHE ]
  • GitHub API            • Gemini 2.0 Flash       • PostgreSQL (schema.sql)
  • Hacker News API       • Heuristic Fallback     • Global Memory Cache
  • Reddit Permitted API  • SSE Stream Provider    • SHA-256 Query Hashing
  • Public RSS Syndication
```

---

## 🚀 Instalação e Configuração

### Pré-requisitos
- **Node.js:** Versão 18.x ou superior (Recomendado: Node 20 LTS ou 22 LTS)
- **NPM:** Versão 9.x ou superior
- **Git**

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/opportunity-radar.git
   cd opportunity-radar
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as Variáveis de Ambiente:**
   Copie o arquivo de exemplo:
   ```bash
   cp .env.example .env
   ```
   Abra o arquivo `.env` e configure suas chaves (veja a seção [Variáveis de Ambiente](#-variáveis-de-ambiente)).

---

## 🔑 Variáveis de Ambiente

> **IMPORTANTE:** NUNCA faça commit de valores reais no GitHub. Mantenha os arquivos `.env`, `.env.local` e `.env.production` estritamente no seu `.gitignore`.

| Variável | Escopo | Obrigatória? | Descrição | Exemplo / Padrão |
| :--- | :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | Servidor | Recomendada | Chave de API do Google Gemini para análises profundas de IA. | Obter em [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `OPENAI_API_KEY` | Servidor | Opcional | Chave da OpenAI para contingência de embeddings/modelos alternativos. | `sk-...` |
| `DATABASE_URL` | Servidor | Opcional | String de conexão PostgreSQL de produção. | `postgresql://user:pass@host:5432/db?sslmode=require` |
| `VITE_API_URL` | Cliente | Opcional | URL base da API. Se vazia, utiliza `/api` (padrão ideal para Vercel). | `https://api.opportunityradar.com` |
| `PORT` | Servidor | Opcional | Porta do servidor standalone local. | `3001` |
| `NODE_ENV` | Ambos | Opcional | Ambiente de execução. | `development` / `production` |
| `ALLOWED_ORIGIN` | Servidor | Opcional | Domínio do frontend para CORS em ambientes desacoplados. | `http://localhost:5173` |
| `CACHE_TTL_MS` | Servidor | Opcional | Tempo de vida do cache em milissegundos. | `300000` (5 minutos) |
| `RATE_LIMIT_WINDOW_MS` | Servidor | Opcional | Janela do limitador de taxa em ms. | `900000` (15 minutos) |
| `RATE_LIMIT_MAX` | Servidor | Opcional | Máximo de requisições por IP na janela. | `200` |

---

## 💻 Desenvolvimento Local

O projeto foi preparado para operar com máxima agilidade no desenvolvimento local:

1. **Inicie o servidor de inteligência (Backend):**
   ```bash
   npm run server
   ```
   *Inicia a API Express na porta `3001` com hot-reload via `tsx watch`.*

2. **Inicie o painel visual (Frontend):**
   Em um segundo terminal:
   ```bash
   npm run dev
   ```
   *Inicia o Vite na porta `5173`. O Vite já possui proxy configurado para redirecionar `/api` automaticamente para a porta `3001` sem erros de CORS.*

3. **Acesse a aplicação no navegador:**
   - Frontend: `http://localhost:5173`
   - Healthcheck da API: `http://localhost:3001/api/pulse`

---

## 🏗 Build e Verificação de Produção

Antes de enviar commits para o GitHub ou disparar deploys, execute a suíte de verificação integrada:

```bash
# Executa linter estático e build de produção completo:
npm test
```

Para executar separadamente:

```bash
# Análise de linting:
npm run lint

# Compilação e empacotamento:
npm run build

# Pré-visualização local dos arquivos compilados de produção:
npm run preview
```

---

## 🌐 Deploy na Vercel (Produção & Preview)

O projeto já inclui o arquivo [`vercel.json`](file:///c:/Users/ryanm/OneDrive/Documentos/projetos/pesquisador%20de%20oportunidades/vercel.json) e o handler serverless [`api/index.ts`](file:///c:/Users/ryanm/OneDrive/Documentos/projetos/pesquisador%20de%20oportunidades/api/index.ts), permitindo deploy unificado (Frontend SPA + Backend API Serverless) com um único clique.

### Passo a Passo no Dashboard da Vercel

1. Acesse [vercel.com](https://vercel.com) e conecte sua conta GitHub.
2. Clique em **"Add New Project"** e selecione o repositório `opportunity-radar`.
3. Verifique as configurações pré-detectadas:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Na aba **Environment Variables**, adicione suas variáveis:
   - `GEMINI_API_KEY`: sua chave de inteligência artificial.
   - `NODE_ENV`: `production`
   - *(Opcional)* `DATABASE_URL`: URL do seu banco PostgreSQL gerenciado (Neon, Supabase, Vercel Postgres).
   - *(Opcional)* `ALLOWED_ORIGIN`: URL do seu domínio na Vercel (ex: `https://opportunity-radar.vercel.app`).
5. Clique em **Deploy**.

### Ambientes Suportados na Vercel
- **Production (`main` branch):** Deploy estável de produção com cache imutável de assets estáticos e cabeçalhos de segurança completos.
- **Preview (Pull Requests):** URLs dinâmicas para testes com suporte automático de CORS para domínios `*.vercel.app`.
- **Development (`vercel dev`):** Suporte opcional à emulação local do runtime da Vercel.

---

## 🗄 Banco de Dados (PostgreSQL)

O esquema relacional completo pronto para produção está localizado em:
[`server/db/schema.sql`](file:///c:/Users/ryanm/OneDrive/Documentos/projetos/pesquisador%20de%20oportunidades/server/db/schema.sql)

O schema inclui:
- Tabelas: `opportunities`, `market_signals`, `ingestion_sources`, `hypotheses_cards`, `opportunity_alerts`.
- Extensões: `uuid-ossp` e `pg_trgm` (para busca textual rápida em títulos e problemas).
- Triggers automáticos para atualização de `updated_at`.
- Índices otimizados para score, categoria, país e data.

Para aplicar o schema no seu banco de dados:
```bash
psql -d "sua_database_url_aqui" -f server/db/schema.sql
```

---

## 📡 Fontes de Inteligência & Compliance

O módulo de coleta opera em estrita conformidade com as diretrizes legais e éticas da web:
- **Prioridade 1:** APIs oficiais (GitHub REST API, Hacker News Firebase API, Reddit Permitted Endpoints).
- **Prioridade 2:** Feeds públicos de sindicação (RSS/Atom) com headers User-Agent explícitos.
- **Sem Anti-bot Bypassing:** Não utiliza métodos para contornar CAPTCHAs, autenticações fechadas ou restrições anti-bot.
- **Respeito a Rate Limits:** Janelas de controle de taxa embutidas por fonte para evitar sobrecarga em servidores de terceiros.

---

## 📜 Scripts Disponíveis

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor Vite para desenvolvimento local com HMR e proxy para a API. |
| `npm run server` | Inicia o backend Express com observação contínua de mudanças via `tsx watch`. |
| `npm run start` | Inicia o servidor backend em modo standalone para produção. |
| `npm run build` | Compila o projeto TypeScript e gera o bundle minificado em `dist/`. |
| `npm run lint` | Executa análise estática de código com o Oxlint. |
| `npm test` | Executa lint e build para validação contínua (CI). |
| `npm run preview` | Serve localmente a versão compilada em `dist/`. |

---

## 📄 Licença

Distribuído sob licença proprietária para a equipe do **Opportunity Radar**. Todos os direitos reservados.
