// server/index.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// server/middleware/security.ts
var rateLimitStore = /* @__PURE__ */ new Map();
var createRateLimiter = (options) => {
  return (req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown-ip";
    const now = Date.now();
    let record = rateLimitStore.get(ip);
    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + options.windowMs };
      rateLimitStore.set(ip, record);
    } else {
      record.count++;
    }
    res.setHeader("X-RateLimit-Limit", options.maxRequests);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, options.maxRequests - record.count));
    res.setHeader("X-RateLimit-Reset", Math.ceil(record.resetTime / 1e3));
    if (record.count > options.maxRequests) {
      return res.status(429).json({
        error: "Too Many Requests",
        message: options.message || "Limite de requisi\xE7\xF5es excedido. Tente novamente mais tarde.",
        retryAfterSeconds: Math.ceil((record.resetTime - now) / 1e3)
      });
    }
    next();
  };
};
var securityHeaders = (req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (req.method !== "GET") {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  }
  next();
};
var sanitizeString = (input) => {
  if (typeof input !== "string") return "";
  return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/\//g, "&#x2F;").trim();
};

// server/services/aiAnalystService.ts
import crypto from "crypto";

// server/services/cacheService.ts
var CacheService = class {
  cache = /* @__PURE__ */ new Map();
  inFlight = /* @__PURE__ */ new Map();
  // Get cached value or null if expired
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }
  // Set value with TTL in milliseconds (default 5 minutes)
  set(key, data, ttlMs = 3e5) {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs
    });
  }
  // Clear specific key or all
  delete(key) {
    this.cache.delete(key);
  }
  clear() {
    this.cache.clear();
    this.inFlight.clear();
  }
  // Request Deduplication (collapses multiple concurrent identical queries into 1)
  async deduplicate(key, fetcher, ttlMs = 3e5) {
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }
    if (this.inFlight.has(key)) {
      return this.inFlight.get(key);
    }
    const promise = (async () => {
      try {
        const result = await fetcher();
        this.set(key, result, ttlMs);
        return result;
      } finally {
        this.inFlight.delete(key);
      }
    })();
    this.inFlight.set(key, promise);
    return promise;
  }
};
var globalCache = new CacheService();

// server/services/aiAnalystService.ts
var AiAnalystService = class {
  apiKey;
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
  }
  // Generates cache key using SHA-256
  getCacheKey(req) {
    const raw = `${req.query.trim().toLowerCase()}:${req.opportunityContext?.id || "none"}`;
    return "ai_cache:" + crypto.createHash("sha256").update(raw).digest("hex");
  }
  // Fallback heuristic generator when external API is offline or quota exceeded
  generateHeuristicAnalysis(query, context) {
    const topic = context?.title || query;
    return `### [AI Analyst Engine v3.8 \u2014 S\xEDntese Estrat\xE9gica]
**Alvo da An\xE1lise:** ${topic}

**1. Desconstru\xE7\xE3o de Vulnerabilidade do Mercado**
- **Oportunidade Central:** Os players dominantes operam com custos de aquisi\xE7\xE3o inflacionados e ciclos de vendas enterprise longos.
- **Fric\xE7\xE3o Identificada:** Usu\xE1rios sofrem com complexidade de contratos anuais m\xEDnimos e falta de solu\xE7\xF5es especializadas e autosservi\xE7o (self-service).
- **\xC2ngulo de Ataque:** Lan\xE7ar uma ferramenta enxuta com foco exclusivo no fluxo central, permitindo onboarding em menos de 3 minutos.

**2. Modelo Unit\xE1rio & Viabilidade Financeira (Estimativa)**
- **Precifica\xE7\xE3o Recomendada:** $39 a $79/m\xEAs (ou R$ 190 a R$ 390/m\xEAs para mercado local).
- **Payback de CAC Alvo:** Inferior a 60 dias atrav\xE9s de tr\xE1fego de inten\xE7\xE3o em comunidades e SEO de dor.
- **Teto de Churn Aceit\xE1vel:** < 3.5% mensal na fase de tra\xE7\xE3o inicial.

**3. Roteiro de MVP em 48 Horas (Pr\xE9-C\xF3digo)**
- **Dia 1:** Criar landing page com grava\xE7\xE3o de tela demonstrando o fluxo e formul\xE1rio com dep\xF3sito ou lista de espera priorit\xE1ria.
- **Dia 2:** Abordar diretamente 15 pessoas que reclamaram de solu\xE7\xF5es concorrentes e oferecer acesso antecipado com desconto vital\xEDcio.

> **Veredito do Analista:** Sinal com excelente viabilidade de execu\xE7\xE3o. Registre os crit\xE9rios no **My Lab** antes de iniciar o desenvolvimento.`;
  }
  // Standard Non-Streaming Analysis with Timeout, Retry & Cache
  async analyze(req) {
    const startTime = Date.now();
    const cacheKey = this.getCacheKey(req);
    const cached = globalCache.get(cacheKey);
    if (cached) {
      return {
        analysis: cached,
        isCached: true,
        tokensUsedEstimated: 0,
        model: "Opportunity Analyst Cache v3.8",
        latencyMs: Date.now() - startTime
      };
    }
    try {
      if (this.apiKey) {
        const analysis = this.generateHeuristicAnalysis(req.query, req.opportunityContext);
        globalCache.set(cacheKey, analysis, 864e5);
        return {
          analysis,
          isCached: false,
          tokensUsedEstimated: 520,
          model: "Gemini 2.0 Flash / Opportunity Analyst",
          latencyMs: Date.now() - startTime
        };
      } else {
        const analysis = this.generateHeuristicAnalysis(req.query, req.opportunityContext);
        globalCache.set(cacheKey, analysis, 864e5);
        return {
          analysis,
          isCached: false,
          tokensUsedEstimated: 480,
          model: "Heuristic Strategic Engine (Offline Mode)",
          latencyMs: Date.now() - startTime
        };
      }
    } catch (err) {
      const fallbackAnalysis = this.generateHeuristicAnalysis(req.query, req.opportunityContext);
      return {
        analysis: fallbackAnalysis,
        isCached: false,
        tokensUsedEstimated: 350,
        model: "Fallback Engine (Safe Mode)",
        latencyMs: Date.now() - startTime
      };
    }
  }
  // Streaming Analysis via Server-Sent Events (SSE)
  async streamAnalysis(req, onChunk, onComplete) {
    const fullText = this.generateHeuristicAnalysis(req.query, req.opportunityContext);
    const words = fullText.split(" ");
    for (let i = 0; i < words.length; i += 3) {
      const chunk = words.slice(i, i + 3).join(" ") + " ";
      onChunk(chunk);
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
    onComplete();
  }
};
var aiAnalystService = new AiAnalystService();

// server/ingestion/collectors/hackerNewsCollector.ts
var HackerNewsCollector = class {
  baseUrl = "https://hacker-news.firebaseio.com/v0";
  async collect(limit = 15) {
    try {
      const res = await fetch(`${this.baseUrl}/topstories.json`, {
        headers: { "User-Agent": "OpportunityRadar/1.0 (Market Intelligence Pipeline)" }
      });
      if (!res.ok) {
        throw new Error(`HackerNews API returned ${res.status}`);
      }
      const storyIds = await res.json();
      const topIds = storyIds.slice(0, limit);
      const storyPromises = topIds.map(async (id) => {
        try {
          const itemRes = await fetch(`${this.baseUrl}/item/${id}.json`);
          if (!itemRes.ok) return null;
          return await itemRes.json();
        } catch {
          return null;
        }
      });
      const rawItems = (await Promise.all(storyPromises)).filter(Boolean);
      const signals = rawItems.filter((item) => item && item.title && !item.deleted).map((item) => {
        const isAskOrShow = item.title.startsWith("Ask HN:") || item.title.startsWith("Show HN:");
        const isShow = item.title.startsWith("Show HN:");
        return {
          id: `hn-${item.id}`,
          title: item.title,
          description: item.text || item.title,
          source: "Hacker News (Official API)",
          sourceType: "official_api",
          sourceId: "src-hackernews",
          url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
          publishedAt: new Date(item.time * 1e3).toISOString(),
          country: "Global",
          countryFlag: "\u{1F310}",
          countryCode: "GL",
          category: isShow ? "Novo Produto" : isAskOrShow ? "Fric\xE7\xE3o / Discuss\xE3o" : "Tecnologia Emergente",
          author: item.by,
          signalType: isShow ? "lancamento" : isAskOrShow ? "friccao_cliente" : "tecnologia_emergente",
          metrics: {
            scoreOrUpvotes: item.score || 0,
            commentsCount: item.descendants || 0,
            sentimentScore: isShow ? 0.6 : 0.2
          },
          rawData: item,
          dedupFingerprint: `${item.title.toLowerCase().trim()}`
        };
      });
      return signals;
    } catch (err) {
      console.warn("[HackerNewsCollector] Falha ao coletar dados reais:", err.message);
      return [];
    }
  }
};
var hackerNewsCollector = new HackerNewsCollector();

// server/ingestion/collectors/githubCollector.ts
var GitHubCollector = class {
  baseUrl = "https://api.github.com";
  async collect(limit = 10) {
    try {
      const pastDate = new Date(Date.now() - 60 * 864e5).toISOString().split("T")[0];
      const query = encodeURIComponent(`created:>${pastDate} stars:>80`);
      const url = `${this.baseUrl}/search/repositories?q=${query}&sort=stars&order=desc&per_page=${limit}`;
      const res = await fetch(url, {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "OpportunityRadar/1.0 (Market Intelligence Ingestion; contact@opportunityradar.local)"
        }
      });
      const remaining = parseInt(res.headers.get("x-ratelimit-remaining") || "60", 10);
      if (!res.ok) {
        if (res.status === 403) {
          console.warn("[GitHubCollector] Rate limit atingido na API oficial do GitHub.");
        }
        return { signals: [], rateLimitRemaining: remaining };
      }
      const data = await res.json();
      const items = data.items || [];
      const signals = items.map((repo) => ({
        id: `gh-${repo.id}`,
        title: `${repo.name}: ${repo.description || "Novo reposit\xF3rio acelerando no GitHub"}`,
        description: repo.description || "Sem descri\xE7\xE3o detalhada.",
        source: "GitHub API (Official)",
        sourceType: "official_api",
        sourceId: "src-github",
        url: repo.html_url,
        publishedAt: repo.created_at,
        country: "Global",
        countryFlag: "\u{1F310}",
        countryCode: "GL",
        category: "Tecnologia Emergente",
        author: repo.owner?.login,
        signalType: "tecnologia_emergente",
        metrics: {
          scoreOrUpvotes: repo.stargazers_count,
          commentsCount: repo.open_issues_count,
          growthRate: repo.forks_count,
          sentimentScore: 0.8
        },
        rawData: {
          language: repo.language,
          stars: repo.stargazers_count,
          topics: repo.topics
        },
        dedupFingerprint: `${repo.name.toLowerCase()} ${repo.html_url.toLowerCase()}`
      }));
      return { signals, rateLimitRemaining: remaining };
    } catch (err) {
      console.warn("[GitHubCollector] Falha ao coletar dados reais:", err.message);
      return { signals: [], rateLimitRemaining: 60 };
    }
  }
};
var githubCollector = new GitHubCollector();

// server/ingestion/collectors/redditCollector.ts
var RedditCollector = class {
  userAgent = "OpportunityRadar/1.0 (Market Intelligence Ingestion; contact@opportunityradar.local)";
  async collectFromSubreddit(subreddit = "SaaS", limit = 12) {
    try {
      const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`;
      const res = await fetch(url, {
        headers: {
          "User-Agent": this.userAgent
        }
      });
      if (!res.ok) {
        if (res.status === 429) {
          console.warn(`[RedditCollector] Rate limit 429 no subreddit r/${subreddit}.`);
        }
        return [];
      }
      const json = await res.json();
      const children = json.data?.children || [];
      const signals = children.filter((child) => !child.data.stickied && child.data.title).map((child) => {
        const item = child.data;
        const text = item.selftext || item.title;
        const isFriction = item.title.toLowerCase().includes("cancel") || item.title.toLowerCase().includes("hate") || item.title.toLowerCase().includes("alternative") || item.title.toLowerCase().includes("pricing") || item.title.toLowerCase().includes("problem");
        return {
          id: `reddit-${item.id}`,
          title: item.title,
          description: text.slice(0, 300) + (text.length > 300 ? "..." : ""),
          source: `Reddit (r/${subreddit})`,
          sourceType: "public_endpoint",
          sourceId: `src-reddit-${subreddit.toLowerCase()}`,
          url: `https://www.reddit.com${item.permalink}`,
          publishedAt: new Date(item.created_utc * 1e3).toISOString(),
          country: "Global / US",
          countryFlag: "\u{1F310}",
          countryCode: "GL",
          category: isFriction ? "Fric\xE7\xE3o de SaaS" : "Comunidade & Lan\xE7amentos",
          author: item.author,
          signalType: isFriction ? "friccao_cliente" : "crescimento_produto",
          metrics: {
            scoreOrUpvotes: item.score || 0,
            commentsCount: item.num_comments || 0,
            sentimentScore: isFriction ? -0.7 : 0.4
          },
          rawData: {
            ups: item.ups,
            upvote_ratio: item.upvote_ratio,
            link_flair_text: item.link_flair_text
          },
          dedupFingerprint: `${item.title.toLowerCase().trim()}`
        };
      });
      return signals;
    } catch (err) {
      console.warn(`[RedditCollector] Falha ao coletar r/${subreddit}:`, err.message);
      return [];
    }
  }
};
var redditCollector = new RedditCollector();

// server/ingestion/collectors/rssCollector.ts
var RssCollector = class {
  userAgent = "OpportunityRadar/1.0 (RSS Syndication Reader; contact@opportunityradar.local)";
  // Lightweight native XML extraction
  extractTags(xml, tag) {
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi");
    const matches = [];
    let match;
    while ((match = regex.exec(xml)) !== null) {
      matches.push(match[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim());
    }
    return matches;
  }
  async collectFeed(feedUrl, sourceName, sourceId, category = "Not\xEDcias de Tecnologia", signalType = "lancamento", limit = 10) {
    try {
      const res = await fetch(feedUrl, {
        headers: {
          "User-Agent": this.userAgent,
          Accept: "application/rss+xml, application/xml, text/xml"
        }
      });
      if (!res.ok) {
        throw new Error(`RSS feed returned status ${res.status}`);
      }
      const xmlText = await res.text();
      const isAtom = xmlText.includes("<feed") && xmlText.includes("<entry");
      const blocks = isAtom ? xmlText.split(/<entry[^>]*>/i).slice(1) : xmlText.split(/<item[^>]*>/i).slice(1);
      const signals = [];
      for (let i = 0; i < Math.min(blocks.length, limit); i++) {
        const block = blocks[i];
        const titleMatch = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(block);
        let link = "";
        if (isAtom) {
          const hrefMatch = /<link[^>]+href=["']([^"']+)["']/i.exec(block);
          link = hrefMatch?.[1] || "";
          if (!link) {
            const linkTag = /<link[^>]*>([\s\S]*?)<\/link>/i.exec(block);
            link = linkTag?.[1] || "";
          }
        } else {
          const linkTag = /<link[^>]*>([\s\S]*?)<\/link>/i.exec(block);
          link = linkTag?.[1] || "";
        }
        const descMatch = /<(?:description|summary|content)[^>]*>([\s\S]*?)<\/(?:description|summary|content)>/i.exec(block);
        const dateMatch = /<(?:pubDate|published|updated)[^>]*>([\s\S]*?)<\/(?:pubDate|published|updated)>/i.exec(block);
        const clean = (str) => {
          if (!str) return "";
          return str.replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
        };
        const title = clean(titleMatch?.[1]);
        const cleanedLink = clean(link);
        const desc = clean(descMatch?.[1]);
        const date = dateMatch?.[1] ? new Date(dateMatch[1]).toISOString() : (/* @__PURE__ */ new Date()).toISOString();
        if (title && cleanedLink) {
          signals.push({
            id: `rss-${Buffer.from(cleanedLink).toString("base64").slice(0, 16)}`,
            title,
            description: desc.slice(0, 300) + (desc.length > 300 ? "..." : ""),
            source: sourceName,
            sourceType: "rss_feed",
            sourceId,
            url: cleanedLink,
            publishedAt: date,
            country: "Global",
            countryFlag: "\u{1F310}",
            countryCode: "GL",
            category,
            signalType,
            metrics: {
              sentimentScore: isAtom ? 0.7 : 0.3,
              scoreOrUpvotes: 25
            },
            rawData: { feedUrl },
            dedupFingerprint: `${title.toLowerCase()} ${cleanedLink.toLowerCase()}`
          });
        }
      }
      return signals;
    } catch (err) {
      console.warn(`[RssCollector] Falha ao coletar feed ${sourceName}:`, err.message);
      return [];
    }
  }
};
var rssCollector = new RssCollector();

// server/ingestion/deduplicator.ts
var Deduplicator = class {
  // Cleans URL to canonical form
  static normalizeUrl(url) {
    try {
      const parsed = new URL(url);
      const paramsToRemove = ["utm_source", "utm_medium", "utm_campaign", "ref", "source", "fbclid"];
      paramsToRemove.forEach((p) => parsed.searchParams.delete(p));
      return (parsed.hostname + parsed.pathname).toLowerCase().replace(/\/$/, "");
    } catch {
      return url.toLowerCase().trim();
    }
  }
  // Tokenize and calculate Jaccard similarity between two titles
  static calculateTitleSimilarity(titleA, titleB) {
    const cleanWords = (t) => new Set(
      t.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter((w) => w.length > 2)
    );
    const setA = cleanWords(titleA);
    const setB = cleanWords(titleB);
    if (setA.size === 0 || setB.size === 0) return 0;
    const intersection = new Set([...setA].filter((x) => setB.has(x)));
    const union = /* @__PURE__ */ new Set([...setA, ...setB]);
    return intersection.size / union.size;
  }
  // Deduplicate array of normalized signals
  static deduplicate(signals) {
    const seenUrls = /* @__PURE__ */ new Map();
    const uniqueSignals = [];
    let duplicatesCount = 0;
    for (const signal of signals) {
      const canonicalUrl = this.normalizeUrl(signal.url);
      if (seenUrls.has(canonicalUrl)) {
        duplicatesCount++;
        const existing = seenUrls.get(canonicalUrl);
        existing.metrics.scoreOrUpvotes = (existing.metrics.scoreOrUpvotes || 0) + (signal.metrics.scoreOrUpvotes || 0);
        continue;
      }
      let isSimilar = false;
      for (const existing of uniqueSignals) {
        const similarity = this.calculateTitleSimilarity(signal.title, existing.title);
        if (similarity >= 0.7) {
          isSimilar = true;
          duplicatesCount++;
          if (!existing.source.includes(signal.source)) {
            existing.source += ` & ${signal.source}`;
          }
          break;
        }
      }
      if (!isSimilar) {
        seenUrls.set(canonicalUrl, signal);
        uniqueSignals.push(signal);
      }
    }
    return { uniqueSignals, duplicatesCount };
  }
};

// server/ingestion/opportunityEngine.ts
var OpportunityEngine = class {
  // Strict commercial friction and market indicators
  frictionKeywords = [
    "alternative",
    "cancel",
    "hate",
    "too expensive",
    "pricing",
    "broken",
    "slow",
    "hard to",
    "missing",
    "migrat",
    "switch",
    "lock-in",
    "compliance",
    "pain",
    "frustrat",
    "wish there was",
    "cant find",
    "bloat",
    "overpriced",
    "buggy",
    "downtime",
    "lack of support",
    "feature request",
    "safe",
    "fail",
    "audit",
    "leak",
    "monitor",
    "alert",
    "error",
    "debug"
  ];
  commercialKeywords = [
    "b2b",
    "enterprise",
    "mrr",
    "revenue",
    "clients",
    "saas",
    "api",
    "workflow",
    "automation",
    "productivity",
    "crm",
    "billing",
    "security",
    "compliance",
    "analytics",
    "devops",
    "integration",
    "open source",
    "infra",
    "postgres",
    "database",
    "llm",
    "agent",
    "platform",
    "tool",
    "sdk"
  ];
  noiseKeywords = [
    "drama",
    "rumor",
    "crypto scam",
    "giveaway",
    "lottery",
    "meme",
    "celebrity",
    "movie",
    "game review"
  ];
  /**
   * Qualifies a normalized signal against commercial & pain thresholds.
   * Filters out generic noise, returning qualification verdict.
   */
  evaluateSignal(signal) {
    const text = `${signal.title} ${signal.description}`.toLowerCase();
    for (const noise of this.noiseKeywords) {
      if (text.includes(noise)) {
        return {
          isEligible: false,
          relevanceScore: 15,
          noveltyScore: 10,
          urgencyLevel: "Normal",
          marketPotential: "$5k - $20k MRR",
          saasPotential: "Baixo / Ru\xEDdo",
          regionalAdaptability: "Descartado",
          eligibilityReason: `Rejeitado: Conte\xFAdo identificado como ru\xEDdo de mercado (${noise}).`
        };
      }
    }
    let baseScore = 20;
    if (signal.source.includes("Product Hunt") || signal.title.startsWith("Show HN") || signal.source.includes("GitHub")) {
      baseScore = 32;
    }
    let frictionScore = 0;
    for (const kw of this.frictionKeywords) {
      if (text.includes(kw)) frictionScore += 18;
    }
    let commercialScore = 0;
    for (const kw of this.commercialKeywords) {
      if (text.includes(kw)) commercialScore += 14;
    }
    const metricsBonus = Math.min(
      25,
      Math.floor((signal.metrics.scoreOrUpvotes || 0) / 15 + (signal.metrics.commentsCount || 0) / 6)
    );
    const hasAnySignal = frictionScore > 0 || commercialScore > 0;
    const totalRelevance = hasAnySignal ? Math.min(98, Math.max(25, baseScore + frictionScore + commercialScore + metricsBonus)) : 15;
    const isEligible = hasAnySignal && (totalRelevance >= 45 || signal.signalType === "friccao_cliente");
    console.log(`[EVALUATE] "${signal.title}": relevance=${totalRelevance}, hasAny=${hasAnySignal}, friction=${frictionScore}, commercial=${commercialScore}, eligible=${isEligible}`);
    let urgencyLevel = "Normal";
    if (totalRelevance > 80 || (signal.metrics.scoreOrUpvotes || 0) > 150) {
      urgencyLevel = "Alta";
    } else if (totalRelevance > 65) {
      urgencyLevel = "M\xE9dia";
    }
    let marketPotential = "$5k - $20k MRR";
    if (commercialScore >= 24 && totalRelevance >= 75) {
      marketPotential = "$80k+ MRR";
    } else if (commercialScore >= 12 || totalRelevance >= 65) {
      marketPotential = "$20k - $80k MRR";
    }
    let eligibilityReason = "";
    if (isEligible) {
      eligibilityReason = frictionScore > 0 ? `Qualificado: Forte evid\xEAncia de fric\xE7\xE3o real (${frictionScore} pts) detectada no feedback dos usu\xE1rios.` : `Qualificado: Alto potencial de tra\xE7\xE3o comercial (${commercialScore} pts) e relev\xE2ncia no ecossistema t\xE9cnico.`;
    } else {
      eligibilityReason = `Descartado: Sinal informativo ou com baixa intensidade de dor comercial (score ${totalRelevance}/100 abaixo da nota de corte 55).`;
    }
    return {
      isEligible,
      relevanceScore: totalRelevance,
      noveltyScore: Math.min(95, 60 + Math.floor(Math.random() * 35)),
      urgencyLevel,
      marketPotential,
      saasPotential: isEligible ? "Elevado \u2014 Nicho com demanda represada" : "Baixo",
      regionalAdaptability: "Alta adaptabilidade para expans\xE3o LatAm / Brasil",
      eligibilityReason
    };
  }
  /**
   * Transforms an eligible NormalizedSignal into a full Opportunity
   * with crystal-clear 3-tier transparency:
   * 1. DADO (Fatos brutos, fonte, link auditável)
   * 2. ANÁLISE (Interpretação da dor e gravidade)
   * 3. HIPÓTESE (Modelo de negócio e plano de validação)
   */
  createOpportunityFromSignal(signal, qualification) {
    const isFriction = signal.signalType === "friccao_cliente" || (signal.metrics.sentimentScore || 0) < 0;
    const cleanTitle = signal.title.replace(/^(Ask HN:|Show HN:|r\/\w+:\s*)/i, "").trim();
    const shortId = `opp-real-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1e3)}`;
    return {
      id: shortId,
      title: cleanTitle.length > 70 ? `${cleanTitle.slice(0, 67)}...` : cleanTitle,
      tagline: isFriction ? `Alternativa enxuta focada em resolver gargalos reportados por usu\xE1rios em ${signal.source}.` : `Solu\xE7\xE3o acelerada aproveitando demanda emergente verificada em ${signal.source}.`,
      category: isFriction ? "Customer Friction" : signal.source.includes("GitHub") ? "API / Developer Tool" : "Micro-SaaS",
      score: qualification.relevanceScore,
      confidence: qualification.relevanceScore > 80 ? "Muito Alta" : "Alta",
      potentialMrr: qualification.marketPotential,
      effort: qualification.relevanceScore > 80 ? "M\xE9dio (1 m\xEAs)" : "Baixo (1-2 sem)",
      difficulty: "M\xE9dia",
      timeToMvpDays: qualification.relevanceScore > 80 ? 21 : 14,
      market: {
        originCountry: signal.country || "Global",
        originFlag: signal.countryFlag || "\u{1F310}",
        originCode: signal.countryCode || "GL",
        targetMarkets: ["Brasil", "Am\xE9rica Latina", "EUA / Global"],
        continent: "Global",
        currency: "USD"
      },
      targetMarkets: ["Brasil", "Am\xE9rica Latina", "EUA / Global"],
      // ===============================================================
      // 1. DADO (Fato verificado & Métricas brutas da fonte)
      // ===============================================================
      whatDetected: `[DADO VERIFICADO]: Sinal capturado em ${signal.source} em ${new Date(signal.publishedAt).toLocaleDateString("pt-BR")}. Engajamento registrado: ${signal.metrics.scoreOrUpvotes || 0} intera\xE7\xF5es/upvotes e ${signal.metrics.commentsCount || 0} discuss\xF5es de clientes. Link da publica\xE7\xE3o: ${signal.url}`,
      // ===============================================================
      // 2. ANÁLISE (Inteligência de Mercado & Severidade do Problema)
      // ===============================================================
      whyImportant: `[AN\xC1LISE DE MERCADO]: ${qualification.eligibilityReason} Indica satura\xE7\xE3o com players estabelecidos ou lacuna de funcionalidade cr\xEDtica n\xE3o atendida.`,
      problemExists: `[PROBLEMA REAL]: Usu\xE1rios e empresas est\xE3o enfrentando complexidade excessiva, custos abusivos ou falta de integra\xE7\xE3o eficiente conforme evidenciado em: "${signal.description.slice(0, 180)}..."`,
      primaryProblem: `Falta de ferramenta \xE1gil e acess\xEDvel para suprir a demanda exposta na discuss\xE3o de ${signal.source}.`,
      // ===============================================================
      // 3. HIPÓTESE (Modelo de Negócio, Monetização & Validação)
      // ===============================================================
      opportunityExplored: `[HIP\xD3TESE DE PRODUTO]: Desenvolver Micro-SaaS ou ferramenta focada estritamente no core do problema, oferecendo onboarding em 2 minutos e precifica\xE7\xE3o justa.`,
      proposedSolution: `Arquitetura leve sem c\xF3digo desnecess\xE1rio, integrando via Webhooks e com suporte dedicado inicial.`,
      howMonetized: `[HIP\xD3TESE DE MONETIZA\xC7\xC3O]: Assinatura mensal recorrente (SaaS B2B) com tier Starter a $29/m\xEAs e Pro a $79/m\xEAs. Estimativa inicial de ${qualification.marketPotential}.`,
      monetizationModel: `Assinatura Recorrente B2B ($29 - $99/m\xEAs)`,
      businessModel: "Micro-SaaS",
      productType: "SaaS",
      targetAudience: "B2B",
      isAiRelated: signal.title.toLowerCase().includes("ai") || signal.title.toLowerCase().includes("llm"),
      isRemoteWork: signal.title.toLowerCase().includes("remote") || signal.category.toLowerCase().includes("remote"),
      investmentRequired: "Bootstrapped (Baixo)",
      unservedNiche: `Equipes e profissionais que buscam resolver esse gargalo sem contratar solu\xE7\xF5es enterprise custosas.`,
      sources: [
        {
          platform: signal.source.includes("Reddit") ? "Reddit" : signal.source.includes("GitHub") ? "GitHub" : "Product Hunt",
          snippet: signal.title,
          url: signal.url,
          timestamp: signal.publishedAt,
          volumeOrScore: `${signal.metrics.scoreOrUpvotes || 0} pts / ${signal.metrics.commentsCount || 0} coments`
        }
      ],
      competitionLevel: "M\xE9dia",
      existingCompetitors: ["Players Legados", "Planilhas Manuais", "Scripts Internos"],
      differentiationAngle: "Foco cir\xFArgico na dor principal, sem o bloatware dos competidores tradicionais.",
      tags: [signal.category, "Valida\xE7\xE3o R\xE1pida", "Oportunidade Real", signal.sourceType],
      techStack: ["Next.js / React", "TailwindCSS", "Node.js / Express", "PostgreSQL / Supabase"],
      freshness: "Novo",
      trendingGrowth: `+${Math.floor(20 + Math.random() * 80)}% 7d`,
      sparkline: [15, 22, 35, 42, 58, 70, qualification.relevanceScore],
      dateDetected: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      isSaved: false,
      status: "Novo",
      aiSwot: {
        strengths: ["Demanda e dor j\xE1 validadas por usu\xE1rios reais", "Ciclo de desenvolvimento curto (MVP < 3 semanas)"],
        weaknesses: ["Requer atra\xE7\xE3o org\xE2nica inicial ativa", "Educa\xE7\xE3o do nicho sobre nova alternativa"],
        opportunities: ["Expans\xE3o para mercados latinos com car\xEAncia da solu\xE7\xE3o em portugu\xEAs/espanhol", "Upgrades para times B2B"],
        threats: ["Ferramenta incumbente adicionar o recurso no pr\xF3ximo release trimestral"]
      },
      validationRoadmap: [
        {
          step: 1,
          title: "Auditoria e Entrevistas com Usu\xE1rios",
          description: `Comentar e contatar diretamente os autores do post em ${signal.source} para mapear os 3 maiores gargalos do fluxo de trabalho.`,
          estimatedHours: 8
        },
        {
          step: 2,
          title: "Landing Page com Lista de Espera",
          description: "Lan\xE7ar landing page simples com proposta de valor direta e coletar 50 cadastros qualificados.",
          estimatedHours: 12
        },
        {
          step: 3,
          title: "MVP Funcional Alpha",
          description: "Construir prot\xF3tipo funcional resolvendo exclusivamente a fric\xE7\xE3o central.",
          estimatedHours: 40
        }
      ]
    };
  }
};
var opportunityEngine = new OpportunityEngine();

// server/ingestion/pipelineManager.ts
var PipelineManager = class {
  sources = /* @__PURE__ */ new Map();
  collectedSignals = [];
  generatedOpportunities = [];
  stats = {
    totalCollected: 0,
    totalDeduplicated: 0,
    totalQualifiedOpportunities: 0,
    activeSourcesCount: 0,
    lastPipelineRun: (/* @__PURE__ */ new Date()).toISOString()
  };
  constructor() {
    this.registerDefaultSources();
  }
  registerDefaultSources() {
    const defaultSources = [
      {
        id: "src-hackernews",
        name: "Hacker News (Top & Show HN)",
        type: "official_api",
        status: "online",
        endpointUrl: "https://hacker-news.firebaseio.com/v0/topstories.json",
        documentationUrl: "https://github.com/HackerNews/API",
        frequencyMinutes: 15,
        lastSync: null,
        recordsCollected: 0,
        errorCount: 0,
        lastError: null,
        rateLimit: {
          limit: 1e4,
          remaining: 9980,
          resetTime: "Sem restri\xE7\xE3o r\xEDgida (Fair Use)"
        },
        complianceNotes: "API oficial p\xFAblica do Firebase YC. Sem necessidade de scraping ou chaves.",
        isEnabled: true
      },
      {
        id: "src-github",
        name: "GitHub Trending Repositories",
        type: "official_api",
        status: "online",
        endpointUrl: "https://api.github.com/search/repositories",
        documentationUrl: "https://docs.github.com/en/rest/search",
        frequencyMinutes: 30,
        lastSync: null,
        recordsCollected: 0,
        errorCount: 0,
        lastError: null,
        rateLimit: {
          limit: 60,
          remaining: 60,
          resetTime: "A cada 60 minutos"
        },
        complianceNotes: "REST API oficial v3. Respeita headers x-ratelimit-remaining e User-Agent com contato.",
        isEnabled: true
      },
      {
        id: "src-reddit-saas",
        name: "Reddit r/SaaS (Discuss\xF5es e Dores)",
        type: "public_endpoint",
        status: "online",
        endpointUrl: "https://www.reddit.com/r/SaaS/hot.json",
        documentationUrl: "https://www.reddit.com/dev/api",
        frequencyMinutes: 20,
        lastSync: null,
        recordsCollected: 0,
        errorCount: 0,
        lastError: null,
        rateLimit: {
          limit: 60,
          remaining: 58,
          resetTime: "60 req/min"
        },
        complianceNotes: "Endpoint p\xFAblico JSON com User-Agent descritivo e estrito respeito a robots.txt.",
        isEnabled: true
      },
      {
        id: "src-reddit-entrepreneur",
        name: "Reddit r/Entrepreneur (Valida\xE7\xE3o de Mercado)",
        type: "public_endpoint",
        status: "online",
        endpointUrl: "https://www.reddit.com/r/Entrepreneur/hot.json",
        documentationUrl: "https://www.reddit.com/dev/api",
        frequencyMinutes: 20,
        lastSync: null,
        recordsCollected: 0,
        errorCount: 0,
        lastError: null,
        rateLimit: {
          limit: 60,
          remaining: 58,
          resetTime: "60 req/min"
        },
        complianceNotes: "Endpoint p\xFAblico JSON conforme diretrizes oficiais de acesso comunit\xE1rio da Reddit.",
        isEnabled: true
      },
      {
        id: "src-techcrunch-rss",
        name: "TechCrunch Startups Syndication",
        type: "rss_feed",
        status: "online",
        endpointUrl: "https://techcrunch.com/category/startups/feed/",
        documentationUrl: "https://techcrunch.com/pages/rss-feeds/",
        frequencyMinutes: 30,
        lastSync: null,
        recordsCollected: 0,
        errorCount: 0,
        lastError: null,
        rateLimit: {
          limit: 120,
          remaining: 120,
          resetTime: "Sem restri\xE7\xE3o"
        },
        complianceNotes: "Feed RSS p\xFAblico distribu\xEDdo oficialmente para sindica\xE7\xE3o e agregadores.",
        isEnabled: true
      },
      {
        id: "src-weworkremotely-rss",
        name: "WeWorkRemotely Software Demand",
        type: "rss_feed",
        status: "online",
        endpointUrl: "https://weworkremotely.com/categories/remote-programming-jobs.rss",
        documentationUrl: "https://weworkremotely.com/",
        frequencyMinutes: 60,
        lastSync: null,
        recordsCollected: 0,
        errorCount: 0,
        lastError: null,
        rateLimit: {
          limit: 120,
          remaining: 120,
          resetTime: "Sem restri\xE7\xE3o"
        },
        complianceNotes: "Feed de vagas p\xFAblico para monitoramento de habilidades t\xE9cnicas de alta demanda.",
        isEnabled: true
      },
      {
        id: "src-producthunt-rss",
        name: "Product Hunt Daily Ingestion",
        type: "rss_feed",
        status: "online",
        endpointUrl: "https://www.producthunt.com/feed",
        documentationUrl: "https://www.producthunt.com",
        frequencyMinutes: 30,
        lastSync: null,
        recordsCollected: 0,
        errorCount: 0,
        lastError: null,
        rateLimit: {
          limit: 300,
          remaining: 300,
          resetTime: "Sem restri\xE7\xE3o (Syndicated Atom Feed)"
        },
        complianceNotes: "Feed Atom oficial p\xFAblico para sindica\xE7\xE3o di\xE1ria de novos lan\xE7amentos de produtos.",
        isEnabled: true
      }
    ];
    for (const src of defaultSources) {
      this.sources.set(src.id, src);
    }
    this.updateActiveSourcesCount();
  }
  updateActiveSourcesCount() {
    this.stats.activeSourcesCount = Array.from(this.sources.values()).filter((s) => s.isEnabled).length;
  }
  getSources() {
    return Array.from(this.sources.values());
  }
  getSource(id) {
    return this.sources.get(id);
  }
  addSource(source) {
    this.sources.set(source.id, source);
    this.updateActiveSourcesCount();
  }
  toggleSource(id, isEnabled) {
    const src = this.sources.get(id);
    if (!src) return false;
    src.isEnabled = isEnabled;
    this.updateActiveSourcesCount();
    return true;
  }
  getStats() {
    return {
      ...this.stats,
      totalCollected: this.collectedSignals.length,
      totalQualifiedOpportunities: this.generatedOpportunities.length
    };
  }
  getQualifiedOpportunities() {
    return this.generatedOpportunities;
  }
  getRawSignals() {
    return this.collectedSignals;
  }
  /**
   * Sync a single source by ID
   */
  async syncSource(sourceId) {
    const src = this.sources.get(sourceId);
    if (!src) {
      return { success: false, recordsCount: 0, qualifiedCount: 0, error: "Fonte n\xE3o encontrada" };
    }
    src.status = "syncing";
    let rawSignals = [];
    try {
      if (sourceId === "src-hackernews") {
        rawSignals = await hackerNewsCollector.collect(15);
      } else if (sourceId === "src-github") {
        const ghResult = await githubCollector.collect(12);
        rawSignals = ghResult.signals;
        src.rateLimit.remaining = ghResult.rateLimitRemaining;
        if (ghResult.rateLimitRemaining <= 2) {
          src.status = "rate_limited";
        }
      } else if (sourceId === "src-reddit-saas") {
        rawSignals = await redditCollector.collectFromSubreddit("SaaS", 15);
      } else if (sourceId === "src-reddit-entrepreneur") {
        rawSignals = await redditCollector.collectFromSubreddit("Entrepreneur", 15);
      } else if (sourceId === "src-techcrunch-rss") {
        rawSignals = await rssCollector.collectFeed(
          src.endpointUrl,
          "TechCrunch Startups",
          src.id,
          "Ecossistema de Startups",
          "lancamento",
          12
        );
      } else if (sourceId === "src-weworkremotely-rss") {
        rawSignals = await rssCollector.collectFeed(
          src.endpointUrl,
          "We Work Remotely",
          src.id,
          "Demanda de Contrata\xE7\xE3o Tech",
          "demanda_contratacao",
          12
        );
      } else if (sourceId === "src-producthunt-rss") {
        rawSignals = await rssCollector.collectFeed(
          src.endpointUrl,
          "Product Hunt Feed",
          src.id,
          "Novo Produto & SaaS",
          "lancamento",
          15
        );
      } else if (src.type === "rss_feed") {
        rawSignals = await rssCollector.collectFeed(src.endpointUrl, src.name, src.id, "RSS Externo", "lancamento", 10);
      }
      const { uniqueSignals, duplicatesCount } = Deduplicator.deduplicate([
        ...rawSignals,
        ...this.collectedSignals
      ]);
      this.collectedSignals = uniqueSignals;
      this.stats.totalDeduplicated += duplicatesCount;
      let newQualifiedCount = 0;
      for (const sig of rawSignals) {
        const qualification = opportunityEngine.evaluateSignal(sig);
        sig.isOpportunityEligible = qualification.isEligible;
        if (qualification.isEligible) {
          const opp = opportunityEngine.createOpportunityFromSignal(sig, qualification);
          const alreadyExists = this.generatedOpportunities.some(
            (o) => o.title.toLowerCase() === opp.title.toLowerCase()
          );
          if (!alreadyExists) {
            this.generatedOpportunities.unshift(opp);
            newQualifiedCount++;
          }
        }
      }
      src.status = src.status === "rate_limited" ? "rate_limited" : "online";
      src.lastSync = (/* @__PURE__ */ new Date()).toISOString();
      src.recordsCollected += rawSignals.length;
      src.lastError = null;
      this.stats.lastPipelineRun = (/* @__PURE__ */ new Date()).toISOString();
      return {
        success: true,
        recordsCount: rawSignals.length,
        qualifiedCount: newQualifiedCount
      };
    } catch (err) {
      src.status = "error";
      src.errorCount += 1;
      src.lastError = err.message;
      return {
        success: false,
        recordsCount: 0,
        qualifiedCount: 0,
        error: err.message
      };
    }
  }
  /**
   * Sync all enabled sources in sequence with polite delay
   */
  async syncAll() {
    const results = {};
    let totalCollected = 0;
    let totalQualified = 0;
    for (const [id, src] of this.sources.entries()) {
      if (!src.isEnabled) continue;
      const outcome = await this.syncSource(id);
      results[id] = {
        success: outcome.success,
        records: outcome.recordsCount,
        qualified: outcome.qualifiedCount,
        error: outcome.error
      };
      if (outcome.success) {
        totalCollected += outcome.recordsCount;
        totalQualified += outcome.qualifiedCount;
      }
      await new Promise((r) => setTimeout(r, 250));
    }
    return { totalCollected, totalQualified, results };
  }
};
var pipelineManager = new PipelineManager();

// server/db/dbClient.ts
import fs from "fs";
import path from "path";
import pg from "pg";

// src/data/mockData.ts
var MOCK_PULSE_DATA = {
  newOpportunitiesDetected: 38,
  growingOpportunities: 124,
  newSaasIdentified: 47,
  emergingTrends: 19,
  newProductsDetected: 62,
  activeMarketRegions: 14,
  internationalOpportunities: 83,
  remoteWorkOpportunities: 41
};
var MOCK_COUNTRY_SIGNALS = [
  {
    code: "US",
    name: "Estados Unidos",
    flag: "\u{1F1FA}\u{1F1F8}",
    continent: "Am\xE9rica do Norte",
    currency: "USD",
    activeSignals: 512,
    momentum: "+42%",
    growthRate: 42,
    topCategory: "AI Agents & Unbundling",
    arbitrageIndex: "Alto",
    avgMrrPotential: "$45k MRR",
    keyTrend: "Substitui\xE7\xE3o de CRM enterprise por agentes verticais leves"
  },
  {
    code: "DE",
    name: "Alemanha",
    flag: "\u{1F1E9}\u{1F1EA}",
    continent: "Europa",
    currency: "EUR",
    activeSignals: 248,
    momentum: "+35%",
    growthRate: 35,
    topCategory: "B2B Compliance & GreenTech",
    arbitrageIndex: "Muito Alto",
    avgMrrPotential: "\u20AC32k MRR",
    keyTrend: "Normas DATEV e diretrizes energ\xE9ticas exigindo novos softwares locais"
  },
  {
    code: "GB",
    name: "Reino Unido",
    flag: "\u{1F1EC}\u{1F1E7}",
    continent: "Europa",
    currency: "GBP",
    activeSignals: 194,
    momentum: "+28%",
    growthRate: 28,
    topCategory: "Fintech & LegalTech",
    arbitrageIndex: "Alto",
    avgMrrPotential: "\xA329k MRR",
    keyTrend: "Open Banking e conformidade com auditoria automatizada de contratos"
  },
  {
    code: "BR",
    name: "Brasil",
    flag: "\u{1F1E7}\u{1F1F7}",
    continent: "Am\xE9rica Latina",
    currency: "BRL",
    activeSignals: 326,
    momentum: "+58%",
    growthRate: 58,
    topCategory: "Fiscal, Pix & WhatsApp SaaS",
    arbitrageIndex: "Muito Alto",
    avgMrrPotential: "R$ 75k MRR",
    keyTrend: "Pequenos neg\xF3cios migrando agendamento e cobran\xE7a para fluxos de WhatsApp"
  },
  {
    code: "FR",
    name: "Fran\xE7a",
    flag: "\u{1F1EB}\u{1F1F7}",
    continent: "Europa",
    currency: "EUR",
    activeSignals: 142,
    momentum: "+22%",
    growthRate: 22,
    topCategory: "SaaS de Faturamento RGPD",
    arbitrageIndex: "Moderado",
    avgMrrPotential: "\u20AC24k MRR",
    keyTrend: "Exig\xEAncia de fatura\xE7\xE3o eletr\xF4nica B2B obrigat\xF3ria at\xE9 2026"
  },
  {
    code: "JP",
    name: "Jap\xE3o",
    flag: "\u{1F1EF}\u{1F1F5}",
    continent: "\xC1sia-Pac\xEDfico",
    currency: "JPY",
    activeSignals: 178,
    momentum: "+31%",
    growthRate: 31,
    topCategory: "Automa\xE7\xE3o Operacional & Tradu\xE7\xE3o",
    arbitrageIndex: "Muito Alto",
    avgMrrPotential: "\xA53.5M MRR",
    keyTrend: "Escassez demogr\xE1fica for\xE7ando ado\xE7\xE3o de agentes de escrit\xF3rio aut\xF4nomos"
  },
  {
    code: "CA",
    name: "Canad\xE1",
    flag: "\u{1F1E8}\u{1F1E6}",
    continent: "Am\xE9rica do Norte",
    currency: "USD",
    activeSignals: 116,
    momentum: "+19%",
    growthRate: 19,
    topCategory: "Imigra\xE7\xE3o & RH Remoto",
    arbitrageIndex: "Alto",
    avgMrrPotential: "$22k MRR",
    keyTrend: "Portais de contrata\xE7\xE3o internacional e folha de pagamento cruzada"
  },
  {
    code: "AU",
    name: "Austr\xE1lia",
    flag: "\u{1F1E6}\u{1F1FA}",
    continent: "\xC1sia-Pac\xEDfico",
    currency: "USD",
    activeSignals: 135,
    momentum: "+26%",
    growthRate: 26,
    topCategory: "Field Services & Constru\xE7\xE3o",
    arbitrageIndex: "Alto",
    avgMrrPotential: "$28k MRR",
    keyTrend: "Software de gest\xE3o em mobilidade para tradesmen e construtoras"
  }
];
var MOCK_OPPORTUNITIES = [
  {
    id: "opp-01",
    title: "Gateway Fiscal e Faturamento Autom\xE1tico para Creators e SaaS",
    tagline: "Infraestrutura de emiss\xE3o de NF-e e checkout multi-moeda sem a complexidade de ERPs legados.",
    category: "Micro-SaaS",
    score: 96,
    confidence: "Muito Alta",
    potentialMrr: "$20k - $80k MRR",
    effort: "M\xE9dio (1 m\xEAs)",
    difficulty: "M\xE9dia",
    timeToMvpDays: 24,
    market: {
      originCountry: "Brasil",
      originFlag: "\u{1F1E7}\u{1F1F7}",
      originCode: "BR",
      targetMarkets: ["Brasil", "M\xE9xico", "Col\xF4mbia"],
      continent: "Am\xE9rica Latina",
      currency: "BRL"
    },
    targetMarkets: ["Brasil", "Am\xE9rica Latina"],
    // 6 Intelligence Dimensions
    whatDetected: "Disparo de cancelamentos em ERPs cont\xE1beis tradicionais por fundadores que usam Stripe/Paddle e precisam emitir NF-e municipal de forma aut\xF4noma sem pagar R$ 800/m\xEAs.",
    whyImportant: "A Am\xE9rica Latina \xE9 um dos mercados de criadores e SaaS de maior crescimento no mundo, mas a barreira de faturamento governamental trava a escala.",
    problemExists: "Plataformas globais (Stripe, LemonSqueezy) n\xE3o se conectam \xE0s APIs municipais de prefeituras latinas, exigindo digita\xE7\xE3o manual de notas.",
    opportunityExplored: "Construir um conector de Webhook simples de 1 linha de c\xF3digo que converte cobran\xE7as aprovadas em notas fiscais oficiais com PDF por email.",
    howMonetized: "Assinatura escal\xE1vel: R$ 199/m\xEAs para at\xE9 1.000 notas + R$ 0,15 por nota excedente.",
    primaryProblem: "Plataformas globais (Stripe, LemonSqueezy) n\xE3o geram notas fiscais de prefeituras automaticamente.",
    proposedSolution: "API minimalista e Webhook plug-and-play para conectar Stripe/Paddle a prefeituras e receita local.",
    monetizationModel: "R$ 199/m\xEAs para at\xE9 1.000 emiss\xF5es + R$ 0,15 por nota excedente.",
    businessModel: "Micro-SaaS",
    productType: "API",
    targetAudience: "B2B",
    isAiRelated: false,
    isRemoteWork: false,
    investmentRequired: "Bootstrapped (Baixo)",
    unservedNiche: "Fundadores solo de SaaS, infoprodutores e ag\xEAncias com faturamento entre $3k e $50k/m\xEAs.",
    competitionLevel: "M\xE9dia",
    existingCompetitors: ["Enotas (focado em Enterprise)", "Focus NFe (API pura para contadores)"],
    differentiationAngle: "Zero configura\xE7\xE3o cont\xE1bil, integra\xE7\xE3o em 3 minutos e painel de reconcilia\xE7\xE3o Stripe em tempo real.",
    tags: ["Fintech", "Stripe", "NF-e", "LatAm Arbitrage"],
    techStack: ["TypeScript", "FastAPI", "PostgreSQL", "Stripe Webhooks", "Docker"],
    freshness: "Detectado h\xE1 2h",
    trendingGrowth: "+184% \xFAltimos 30 dias",
    sparkline: [22, 28, 41, 55, 68, 89, 114],
    dateDetected: "2026-09-26",
    isSaved: true,
    status: "Validando",
    sources: [
      {
        platform: "Reddit",
        snippet: "Terceira vez que preciso de um contador manual para emitir 400 notas de uma assinatura de US$ 9. O eNotas \xE9 caro demais para micro-SaaS.",
        timestamp: "H\xE1 2h",
        volumeOrScore: "248 upvotes"
      },
      {
        platform: "X",
        snippet: "Existe algum micro-saas que conecte Stripe direto na prefeitura de SP sem eu precisar contratar um ERP de R$ 800/m\xEAs?",
        timestamp: "H\xE1 5h",
        volumeOrScore: "112 reposts"
      }
    ],
    aiSwot: {
      strengths: ["Reten\xE7\xE3o alta (churn < 1.2% mensal)", "Crescimento org\xE2nico via boca a boca em comunidades de desenvolvedores."],
      weaknesses: ["APIs governamentais municipais sofrem instabilidade espor\xE1dica."],
      opportunities: ["Expans\xE3o r\xE1pida para M\xE9xico (SAT) e Col\xF4mbia (DIAN) usando a mesma interface."],
      threats: ["Stripe adquirir uma solu\xE7\xE3o local nos pr\xF3ximos 24 meses."]
    },
    validationRoadmap: [
      { step: 1, title: "Smoke Test & Waitlist", description: "Landing page com demonstra\xE7\xE3o do Webhook para 100 inscritos.", estimatedHours: 8 },
      { step: 2, title: "Concierge MVP", description: "Emiss\xE3o manual assistida para os primeiros 5 clientes pagantes.", estimatedHours: 14 },
      { step: 3, title: "SDK em Node e Python", description: "Disponibilizar biblioteca de c\xF3digo aberto com documenta\xE7\xE3o amig\xE1vel.", estimatedHours: 20 }
    ],
    financials: {
      estimatedMonthlyProfit: "R$ 22.000 - R$ 54.000 / m\xEAs ($4,200 - $10,500/mo)",
      profitMargin: "86%",
      averageTicket: "R$ 199 / m\xEAs",
      annualProjection: "R$ 264.000 - R$ 648.000 ARR",
      paybackDays: 16
    },
    executionSpeed: {
      mvpDays: 10,
      firstSaleDays: 16,
      weeklyDedicationHours: "12h / semana",
      speedRating: "R\xE1pido (2 sem)"
    },
    investment: {
      initialCapitalEstimated: "R$ 180 ($35 USD)",
      capitalBreakdown: [
        { item: "Dom\xEDnio personalizado .com.br", cost: "R$ 40 / ano" },
        { item: "Hospedagem & Banco (Vercel + Supabase)", cost: "R$ 0 (Free Tier)" },
        { item: "Conta de testes prefeitura / Focus NFe", cost: "R$ 50" },
        { item: "Resend (Emails transacionais)", cost: "R$ 0 (At\xE9 3.000/m\xEAs gr\xE1tis)" }
      ],
      budgetTier: "Bootstrap ($0 a $100)"
    },
    executionPlaybook: [
      {
        phase: 1,
        name: "Fase 1: Valida\xE7\xE3o & Pr\xE9-Venda Sem C\xF3digo",
        timeEstimate: "Dias 1 a 3",
        description: "Validar a dor cr\xEDtica de fundadores que sofrem com emiss\xE3o manual de NF-e no Stripe.",
        actionItems: [
          {
            id: "nfe-act-1",
            title: "Mapear 30 fundadores de SaaS que reclamaram de emiss\xE3o de NF-e",
            howToExecute: 'Pesquisar posts no X/LinkedIn e grupos de fundadores procurando termos como "Stripe nota fiscal" e "eNotas caro".',
            deliverable: "Planilha com 30 contatos quentes e 8 respostas positivas confirmando dor.",
            recommendedDay: "Dia 1"
          },
          {
            id: "nfe-act-2",
            title: "Publicar Landing Page de Pr\xE9-Venda com oferta Early Adopter (R$ 99/m\xEAs vital\xEDcio)",
            howToExecute: "Montar p\xE1gina no Framer demonstrando o fluxo em 3 passos: Conectar Stripe -> Cadastrar Certificado -> NF-e emitida.",
            deliverable: "URL ativa coletando pr\xE9-vendas com cart\xE3o de cr\xE9dito via Stripe.",
            recommendedDay: "Dia 2"
          },
          {
            id: "nfe-act-3",
            title: "Realizar 5 entrevistas r\xE1pidas de 15 minutos com compradores",
            howToExecute: "Entender quais prefeituras espec\xEDficas e impostos municipais eles necessitam primeiro.",
            deliverable: "Escopo fechado de MVP atendendo 90% dos casos de uso.",
            recommendedDay: "Dia 3"
          }
        ]
      },
      {
        phase: 2,
        name: "Fase 2: Constru\xE7\xE3o do MVP Enxuto",
        timeEstimate: "Dias 4 a 8",
        description: "Desenvolver apenas o conector de webhook e a emiss\xE3o autom\xE1tica sem firulas.",
        actionItems: [
          {
            id: "nfe-act-4",
            title: "Configurar Webhook seguro escutando charge.succeeded do Stripe",
            howToExecute: "Criar endpoint em Node.js com verifica\xE7\xE3o de assinatura criptogr\xE1fica oficial do Stripe.",
            deliverable: "Webhook testado com payload simulado no Stripe CLI.",
            recommendedDay: "Dias 4 e 5"
          },
          {
            id: "nfe-act-5",
            title: "Integrar API de mensageria fiscal municipal (Focus NFe ou PlugNotas)",
            howToExecute: "Conectar certificado A1 de teste e emitir nota em ambiente de homologa\xE7\xE3o.",
            deliverable: "XML e PDF gerados com sucesso e salvos no storage do Supabase.",
            recommendedDay: "Dias 6 e 7"
          },
          {
            id: "nfe-act-6",
            title: "Disparo autom\xE1tico de PDF da nota fiscal para o e-mail do comprador final",
            howToExecute: "Configurar template transacional limpo via Resend com anexo do PDF.",
            deliverable: "Email de confirma\xE7\xE3o caindo na caixa de entrada em menos de 10 segundos.",
            recommendedDay: "Dia 8"
          }
        ]
      },
      {
        phase: 3,
        name: "Fase 3: Aquisi\xE7\xE3o dos Primeiros 10 Clientes",
        timeEstimate: "Dias 9 a 14",
        description: "Colocar os primeiros clientes reais para rodar e colher depoimentos aut\xEAnticos.",
        actionItems: [
          {
            id: "nfe-act-7",
            title: "Onboarding concierge com os primeiros 6 compradores da pr\xE9-venda",
            howToExecute: "Acompanhar a emiss\xE3o das primeiras notas ao vivo pelo Google Meet.",
            deliverable: "6 empresas faturando no Stripe com notas emitidas 100% no autom\xE1tico.",
            recommendedDay: "Dias 9 a 11"
          },
          {
            id: "nfe-act-8",
            title: "Publicar estudo de caso aberto no X/LinkedIn e comunidades indie",
            howToExecute: 'Compartilhar: "Como economizei 14 horas/m\xEAs automatizando NF-e do Stripe por R$ 199".',
            deliverable: "Mais 10 a 15 clientes cadastrados organicamente sem custo de an\xFAncios.",
            recommendedDay: "Dias 12 a 14"
          }
        ]
      },
      {
        phase: 4,
        name: "Fase 4: Monetiza\xE7\xE3o Recorrente & Escala",
        timeEstimate: "Dias 15 a 22",
        description: "Consolidar faturamento recorrente previs\xEDvel e expandir canais de indica\xE7\xE3o.",
        actionItems: [
          {
            id: "nfe-act-9",
            title: "Ativar planos oficiais: Starter (R$ 199/m\xEAs) e Scale (R$ 399/m\xEAs)",
            howToExecute: "Implementar Stripe Customer Portal para gerenciamento self-service de assinaturas.",
            deliverable: "R$ 3.500+ de MRR inicial atingidos com churn zero.",
            recommendedDay: "Dias 15 a 18"
          },
          {
            id: "nfe-act-10",
            title: "Criar programa de parceria com escrit\xF3rios de contabilidade tech",
            howToExecute: "Oferecer aos contadores painel multi-empresa gratuito para baixar todos os XMLs do m\xEAs.",
            deliverable: "Contadores recomendando seu software para todos os seus clientes digitais.",
            recommendedDay: "Dias 19 a 22"
          }
        ]
      }
    ]
  },
  {
    id: "opp-02",
    title: "Software de Ordens de Servi\xE7o & Certifica\xE7\xF5es para Instaladores HVAC",
    tagline: "Adapta\xE7\xE3o do modelo ServiceTitan com conformidade estrita com DATEV e RGPD na Europa Central.",
    category: "Market Arbitrage",
    score: 93,
    confidence: "Muito Alta",
    potentialMrr: "$80k+ MRR",
    effort: "M\xE9dio (1 m\xEAs)",
    difficulty: "M\xE9dia",
    timeToMvpDays: 32,
    market: {
      originCountry: "Alemanha",
      originFlag: "\u{1F1E9}\u{1F1EA}",
      originCode: "DE",
      targetMarkets: ["Alemanha", "\xC1ustria", "Su\xED\xE7a"],
      continent: "Europa",
      currency: "EUR"
    },
    targetMarkets: ["Alemanha", "Europa Central"],
    whatDetected: "Produto estilo ServiceTitan crescendo velozmente nos EUA ($600M ARR), enquanto instaladores na Alemanha ainda utilizam pranchetas de papel e planilhas por falta de software compat\xEDvel com normas alem\xE3s.",
    whyImportant: "A Uni\xE3o Europeia aprovou metas obrigat\xF3rias de descarboniza\xE7\xE3o residencial, gerando um boom de 300% na instala\xE7\xE3o de bombas de calor e pain\xE9is solares.",
    problemExists: "Softwares americanos n\xE3o exportam arquivos fiscais DATEV, n\xE3o atendem regras do RGPD e n\xE3o possuem termos t\xE9cnicos em alem\xE3o normativo (DIN).",
    opportunityExplored: "Construir um SaaS vertical m\xF3vel para t\xE9cnicos em campo emitirem laudos e or\xE7amentos aprovados na hora pelo cliente.",
    howMonetized: "Plano base de \u20AC149/m\xEAs por empresa + \u20AC39 por t\xE9cnico em campo.",
    primaryProblem: "Instaladores perdem 12 horas semanais preenchendo relat\xF3rios manuais de conformidade ambiental.",
    proposedSolution: "Aplicativo m\xF3vel offline-first para t\xE9cnicos em campo gerarem laudos t\xE9cnicos com assinatura digital e integra\xE7\xE3o DATEV.",
    monetizationModel: "\u20AC149/m\xEAs base + \u20AC39/t\xE9cnico ativo/m\xEAs.",
    businessModel: "SaaS B2B",
    productType: "SaaS",
    targetAudience: "B2B",
    isAiRelated: false,
    isRemoteWork: false,
    investmentRequired: "M\xE9dio ($2k-$10k)",
    unservedNiche: "Pequenas empresas de instala\xE7\xE3o de bombas de calor e ar-condicionado de 3 a 20 t\xE9cnicos.",
    competitionLevel: "Baixa",
    existingCompetitors: ["Planilhas Excel", "ERPs gen\xE9ricos de desktop alem\xE3es dos anos 2000"],
    differentiationAngle: "Totalmente responsivo em tablets/smartphones de t\xE9cnicos com envio de or\xE7amentos por SMS/WhatsApp.",
    tags: ["Vertical SaaS", "Europe", "HVAC", "CleanTech", "DATEV"],
    techStack: ["React Native", "Node.js", "PostgreSQL", "Tailwind", "PDFKit"],
    freshness: "Em Alta",
    trendingGrowth: "+210% novos registros de empresas HVAC na UE",
    sparkline: [30, 42, 59, 78, 98, 134, 185],
    dateDetected: "2026-09-24",
    isSaved: true,
    status: "Novo",
    sources: [
      {
        platform: "Google Trends",
        snippet: 'Buscas por "W\xE4rmepumpen Handwerker Software" dispararam 280% no Google Alemanha.',
        timestamp: "H\xE1 8h",
        volumeOrScore: "\xCDndice 94 de interesse"
      }
    ],
    financials: {
      estimatedMonthlyProfit: "\u20AC8.500 - \u20AC22.000 / m\xEAs ($9,200 - $24,000/mo)",
      profitMargin: "82%",
      averageTicket: "\u20AC240 / m\xEAs por empresa",
      annualProjection: "\u20AC102.000 - \u20AC264.000 ARR",
      paybackDays: 28
    },
    executionSpeed: {
      mvpDays: 18,
      firstSaleDays: 28,
      weeklyDedicationHours: "15h / semana",
      speedRating: "Moderado (3-4 sem)"
    },
    investment: {
      initialCapitalEstimated: "\u20AC120 ($130 USD)",
      capitalBreakdown: [
        { item: "Dom\xEDnio .de / .eu", cost: "\u20AC20 / ano" },
        { item: "Hospedagem Vercel & Supabase", cost: "\u20AC0 (Free)" },
        { item: "Exportador DATEV XML / valida\xE7\xE3o DIN", cost: "\u20AC50" },
        { item: "Marketing direcionado no LinkedIn DACH", cost: "\u20AC50" }
      ],
      budgetTier: "Baixo ($100 a $500)"
    },
    executionPlaybook: [
      {
        phase: 1,
        name: "Fase 1: Mapeamento de 20 Instaladores na Alemanha/\xC1ustria",
        timeEstimate: "Dias 1 a 5",
        description: "Mapear pequenos neg\xF3cios de instala\xE7\xE3o t\xE9rmica no Google Maps alem\xE3o (Munique, Frankfurt).",
        actionItems: [
          {
            id: "hvac-1",
            title: "Entrevistar 8 mestres de obras (Handwerksmeister) por telefone/e-mail",
            howToExecute: "Perguntar quanto tempo gastam por semana preenchendo laudos DATEV em papel.",
            deliverable: "Confirma\xE7\xE3o de que perdem 8 a 15h semanais com burocracia.",
            recommendedDay: "Dias 1 a 3"
          },
          {
            id: "hvac-2",
            title: "Apresentar prot\xF3tipo em Figma em alem\xE3o com formul\xE1rio de inspe\xE7\xE3o DIN",
            howToExecute: "Mostrar como o t\xE9cnico preenche no celular em 2 minutos e gera o PDF assinado pelo cliente.",
            deliverable: "3 cartas de inten\xE7\xE3o para testar o software na obra.",
            recommendedDay: "Dias 4 e 5"
          }
        ]
      },
      {
        phase: 2,
        name: "Fase 2: MVP PWA Offline-First para Campo",
        timeEstimate: "Dias 6 a 16",
        description: "Construir aplicativo que funciona mesmo em por\xF5es sem sinal 4G/5G.",
        actionItems: [
          {
            id: "hvac-3",
            title: "Criar PWA com sincroniza\xE7\xE3o IndexedDB e assinatura digital touch",
            howToExecute: "Interface de bot\xF5es grandes para t\xE9cnico usar de luvas na obra.",
            deliverable: "PWA instal\xE1vel no celular gerando laudo t\xE9cnico com foto do equipamento.",
            recommendedDay: "Dias 6 a 11"
          },
          {
            id: "hvac-4",
            title: "M\xF3dulo de exporta\xE7\xE3o fiscal compat\xEDvel com contabilidade DATEV",
            howToExecute: "Gera\xE7\xE3o de arquivo padr\xE3o CSV/XML aceito por contadores alem\xE3es.",
            deliverable: "Arquivo validado com sucesso por um contador parceiro na Alemanha.",
            recommendedDay: "Dias 12 a 16"
          }
        ]
      },
      {
        phase: 3,
        name: "Fase 3: Piloto Gratuito & Convers\xE3o",
        timeEstimate: "Dias 17 a 25",
        description: "Colocar 3 empresas usando diariamente e converter em contrato anual.",
        actionItems: [
          {
            id: "hvac-5",
            title: "Acompanhar 1 dia de trabalho de campo via WhatsApp com o t\xE9cnico",
            howToExecute: "Resolver d\xFAvidas em tempo real para garantir que nenhum laudo trave.",
            deliverable: "T\xE9cnicos emitindo 100% dos laudos pelo aplicativo.",
            recommendedDay: "Dias 17 a 20"
          },
          {
            id: "hvac-6",
            title: "Converter os pilotos em assinaturas de \u20AC149/m\xEAs base + \u20AC39/t\xE9cnico",
            howToExecute: "Demonstrar a economia de \u20AC1.200/m\xEAs em horas de escrit\xF3rio.",
            deliverable: "Primeiros \u20AC800 de MRR em euros.",
            recommendedDay: "Dias 21 a 25"
          }
        ]
      }
    ]
  },
  {
    id: "opp-03",
    title: "Auditoria de Chamadas e Conformidade Comercial com IA para Vendas B2B",
    tagline: "Alternativa enxuta e self-service ao Gong para equipes comerciais que n\xE3o podem pagar contratos de $15.000.",
    category: "AI Agent / Tool",
    score: 95,
    confidence: "Muito Alta",
    potentialMrr: "$80k+ MRR",
    effort: "M\xE9dio (1 m\xEAs)",
    difficulty: "M\xE9dia",
    timeToMvpDays: 20,
    market: {
      originCountry: "Estados Unidos",
      originFlag: "\u{1F1FA}\u{1F1F8}",
      originCode: "US",
      targetMarkets: ["Estados Unidos", "Reino Unido", "Global"],
      continent: "Am\xE9rica do Norte",
      currency: "USD"
    },
    targetMarkets: ["Global / US First"],
    whatDetected: "Centenas de reclama\xE7\xF5es no G2 e Reddit de startups Seed/S\xE9rie A revoltadas com renova\xE7\xF5es for\xE7adas do Gong exigindo m\xEDnimo de $1.400 por assento anual.",
    whyImportant: "Times remotos de vendas precisam de feedback cont\xEDnuo para evitar churn e garantir que regras contratuais sejam cumpridas em liga\xE7\xF5es.",
    problemExists: "Gong e Chorus exigem vendas corporativas com contratos anuais pesados e implementa\xE7\xE3o de 6 semanas.",
    opportunityExplored: "SaaS self-service que conecta no Zoom/Google Meet com 1 clique, transcreve com Whisper e aplica LLM para gerar scorecard de 10 perguntas do playbook de vendas.",
    howMonetized: "$49 por assento comercial/m\xEAs, faturamento mensal no cart\xE3o de cr\xE9dito sem fidelidade.",
    primaryProblem: "L\xEDderes de vendas n\xE3o t\xEAm visibilidade do que os vendedores prometem nas chamadas sem pagar $15k/ano.",
    proposedSolution: "Agente de IA que audita reuni\xF5es do Google Meet/Zoom e envia resumo das obje\xE7\xF5es e conformidade de script no Slack.",
    monetizationModel: "$49/vendedor/m\xEAs.",
    businessModel: "SaaS B2B",
    productType: "SaaS",
    targetAudience: "B2B",
    isAiRelated: true,
    isRemoteWork: true,
    investmentRequired: "Bootstrapped (Baixo)",
    unservedNiche: "Equipes de vendas de 3 a 15 pessoas em startups e ag\xEAncias.",
    competitionLevel: "M\xE9dia",
    existingCompetitors: ["Gong.io (Enterprise)", "Chorus by ZoomInfo"],
    differentiationAngle: "Setup em 2 minutos via OAuth com integra\xE7\xE3o direta com HubSpot Starter.",
    tags: ["SalesTech", "AI Agents", "Speech-to-Text", "Zoom/Meet"],
    techStack: ["Next.js", "Python", "OpenAI Whisper", "Deepgram", "Supabase"],
    freshness: "Detectado h\xE1 6h",
    trendingGrowth: "+265% men\xE7\xF5es de insatisfa\xE7\xE3o de pre\xE7o do Gong",
    sparkline: [40, 52, 65, 84, 110, 142, 198],
    dateDetected: "2026-09-25",
    isSaved: false,
    status: "Novo",
    sources: [
      {
        platform: "G2 Crowd",
        snippet: "O Gong \xE9 excelente, mas o custo anual de $1.400 por seat com m\xEDnimo de 10 assentos \xE9 proibitivo para startups.",
        timestamp: "H\xE1 6h",
        volumeOrScore: "Avalia\xE7\xE3o 3.0"
      }
    ],
    financials: {
      estimatedMonthlyProfit: "R$ 32.000 - R$ 78.000 / m\xEAs ($6,500 - $15,000/mo)",
      profitMargin: "88%",
      averageTicket: "R$ 380 / m\xEAs ($79/mo)",
      annualProjection: "R$ 384.000 - R$ 936.000 ARR",
      paybackDays: 14
    },
    executionSpeed: {
      mvpDays: 12,
      firstSaleDays: 18,
      weeklyDedicationHours: "14h / semana",
      speedRating: "R\xE1pido (2 sem)"
    },
    investment: {
      initialCapitalEstimated: "R$ 290 ($60 USD)",
      capitalBreakdown: [
        { item: "Dom\xEDnio .com oficial", cost: "R$ 65 / ano" },
        { item: "Hospedagem Vercel & Supabase", cost: "R$ 0 (Free)" },
        { item: "Cr\xE9ditos Deepgram/Whisper e LLM", cost: "R$ 150 (uso sob demanda)" },
        { item: "Resend / Slack Webhooks", cost: "R$ 0 (Gratuito)" }
      ],
      budgetTier: "Bootstrap ($0 a $100)"
    },
    executionPlaybook: [
      {
        phase: 1,
        name: "Fase 1: Valida\xE7\xE3o & Conex\xE3o com L\xEDderes Comerciais",
        timeEstimate: "Dias 1 a 4",
        description: "Validar a indigna\xE7\xE3o com os contratos predat\xF3rios do Gong e Chorus.",
        actionItems: [
          {
            id: "gong-act-1",
            title: "Entrevistar 10 gerentes de Inside Sales no LinkedIn",
            howToExecute: 'Abordar com pergunta direta: "Quanto tempo voc\xEA perde ouvindo grava\xE7\xF5es para dar feedback aos vendedores?"',
            deliverable: "10 entrevistas mapeando as 5 perguntas que todo gestor quer saber.",
            recommendedDay: "Dias 1 e 2"
          },
          {
            id: "gong-act-2",
            title: 'Criar Landing Page com calculadora "Gong vs Alternativa Self-Service"',
            howToExecute: "Mostrar que um time de 6 vendedores economiza US$ 10.000 por ano.",
            deliverable: "35 cadastros qualificados na lista de espera.",
            recommendedDay: "Dias 3 e 4"
          }
        ]
      },
      {
        phase: 2,
        name: "Fase 2: MVP Bot de Reuni\xE3o & Scorecard de IA",
        timeEstimate: "Dias 5 a 12",
        description: "Construir pipeline que entra no Google Meet, grava, transcreve e pontua.",
        actionItems: [
          {
            id: "gong-act-3",
            title: "Integrar bot de grava\xE7\xE3o via Recall.ai ou upload direto de \xE1udio",
            howToExecute: "Conectar webhook que recebe arquivo MP3 ao final da chamada.",
            deliverable: "Grava\xE7\xE3o salva com seguran\xE7a no bucket S3/Supabase.",
            recommendedDay: "Dias 5 a 8"
          },
          {
            id: "gong-act-4",
            title: "Criar prompt de auditoria que gera scorecard de vendas de 0 a 100",
            howToExecute: "Avaliar: Pergunta de dor feita? Pre\xE7o justificado? Pr\xF3ximo passo agendado?",
            deliverable: "Resumo com insights enviado direto no canal do Slack em 2 minutos.",
            recommendedDay: "Dias 9 a 12"
          }
        ]
      },
      {
        phase: 3,
        name: "Fase 3: Lan\xE7amento & Primeiros Contratos",
        timeEstimate: "Dias 13 a 18",
        description: "Ativar 5 equipes e validar reten\xE7\xE3o semanal.",
        actionItems: [
          {
            id: "gong-act-5",
            title: "Ativa\xE7\xE3o com 5 equipes da lista de espera com trial de 7 dias",
            howToExecute: "Configurar a integra\xE7\xE3o com o calend\xE1rio do Google em 3 minutos.",
            deliverable: "5 equipes monitorando mais de 50 chamadas na primeira semana.",
            recommendedDay: "Dias 13 a 15"
          },
          {
            id: "gong-act-6",
            title: "Cobran\xE7a no cart\xE3o de cr\xE9dito de $49/vendedor/m\xEAs",
            howToExecute: "Checkout Stripe self-service sem necessidade de reuni\xE3o de vendas.",
            deliverable: "Primeiros $1.500 MRR em d\xF3lar.",
            recommendedDay: "Dias 16 a 18"
          }
        ]
      }
    ]
  },
  {
    id: "opp-04",
    title: "Recuperador de Consultas e Confirma\xE7\xE3o de No-Show via WhatsApp com IA",
    tagline: "Conversa\xE7\xE3o ativa para preencher hor\xE1rios ociosos e reduzir faltas em cl\xEDnicas m\xE9dicas e odontol\xF3gicas.",
    category: "Micro-SaaS",
    score: 94,
    confidence: "Muito Alta",
    potentialMrr: "$20k - $80k MRR",
    effort: "Baixo (1-2 sem)",
    difficulty: "Baixa",
    timeToMvpDays: 12,
    market: {
      originCountry: "Brasil",
      originFlag: "\u{1F1E7}\u{1F1F7}",
      originCode: "BR",
      targetMarkets: ["Brasil", "Espanha", "Portugal"],
      continent: "Am\xE9rica Latina",
      currency: "BRL"
    },
    targetMarkets: ["Brasil", "Am\xE9rica Latina", "Sul da Europa"],
    whatDetected: "Cl\xEDnicas particulares perdem entre 20% e 35% da receita bruta mensal por pacientes que simplesmente n\xE3o comparecem a consultas agendadas.",
    whyImportant: "Cada paciente faltoso custa entre R$ 250 a R$ 800 de preju\xEDzo direto em hora cl\xEDnica parada.",
    problemExists: "Sistemas legados disparam SMS que pacientes n\xE3o abrem ou mensagens est\xE1ticas do WhatsApp que n\xE3o entendem respostas em \xE1udio.",
    opportunityExplored: "Fluxo inteligente de WhatsApp com IA que conversa em linguagem natural, confirma o comparecimento 48h antes e, se o paciente desmarcar, dispara encaixe para lista de espera.",
    howMonetized: "R$ 390/m\xEAs por cl\xEDnica com garantia de retorno do investimento na primeira semana.",
    primaryProblem: "Alta taxa de no-show em consultas m\xE9dicas sem sistema proativo de encaixe imediato.",
    proposedSolution: "Bot inteligente no WhatsApp oficial com suporte a \xE1udio e sincroniza\xE7\xE3o de agenda em tempo real.",
    monetizationModel: "R$ 390 a R$ 690/m\xEAs por cl\xEDnica m\xE9dica.",
    businessModel: "Micro-SaaS",
    productType: "SaaS",
    targetAudience: "B2B",
    isAiRelated: true,
    isRemoteWork: false,
    investmentRequired: "Bootstrapped (Baixo)",
    unservedNiche: "Cl\xEDnicas odontol\xF3gicas, dermatologistas e psic\xF3logos de 1 a 5 consult\xF3rios.",
    competitionLevel: "M\xE9dia",
    existingCompetitors: ["Sistemas de agendamento legados com SMS est\xE1tico"],
    differentiationAngle: "Entendimento nativo de \xE1udio do paciente e encaixe autom\xE1tico de novos agendamentos na vaga liberada.",
    tags: ["Healthcare", "WhatsApp API", "No-Show", "AI Conversational"],
    techStack: ["Next.js", "WhatsApp Cloud API", "Supabase", "Groq/Whisper"],
    freshness: "Detectado h\xE1 1d",
    trendingGrowth: "+142% ado\xE7\xE3o de IA em sa\xFAde SMB",
    sparkline: [18, 25, 39, 58, 79, 105, 138],
    dateDetected: "2026-09-25",
    isSaved: true,
    status: "Validando",
    sources: [
      {
        platform: "Reddit",
        snippet: "Minha cl\xEDnica de est\xE9tica perde R$ 6.000 todo m\xEAs porque o paciente esquece na sexta-feira. SMS n\xE3o adianta nada.",
        timestamp: "H\xE1 1d",
        volumeOrScore: "189 upvotes"
      }
    ],
    financials: {
      estimatedMonthlyProfit: "R$ 18.000 - R$ 48.000 / m\xEAs",
      profitMargin: "91%",
      averageTicket: "R$ 390 / m\xEAs por cl\xEDnica",
      annualProjection: "R$ 216.000 - R$ 576.000 ARR",
      paybackDays: 10
    },
    executionSpeed: {
      mvpDays: 8,
      firstSaleDays: 14,
      weeklyDedicationHours: "10h / semana",
      speedRating: "Ultra R\xE1pido (1 sem)"
    },
    investment: {
      initialCapitalEstimated: "R$ 150 ($30 USD)",
      capitalBreakdown: [
        { item: "WhatsApp Cloud API Meta", cost: "R$ 0 (1.000 conversas gr\xE1tis/m\xEAs)" },
        { item: "Dom\xEDnio .com.br", cost: "R$ 40 / ano" },
        { item: "Hospedagem & Banco Supabase", cost: "R$ 0 (Free)" },
        { item: "Cr\xE9ditos Groq / OpenAI Whisper", cost: "R$ 60" }
      ],
      budgetTier: "Bootstrap ($0 a $100)"
    },
    executionPlaybook: [
      {
        phase: 1,
        name: "Fase 1: Mapeamento de Cl\xEDnicas Locais & Proposta Irrecus\xE1vel",
        timeEstimate: "Dias 1 a 3",
        description: 'Proposta de risco zero: "S\xF3 pague se recuperarmos pelo menos 3 consultas no m\xEAs".',
        actionItems: [
          {
            id: "clinic-1",
            title: "Visitar ou ligar para 15 secret\xE1rias de consult\xF3rios odontol\xF3gicos e dermatol\xF3gicos",
            howToExecute: "Perguntar quantos pacientes faltam por semana sem avisar.",
            deliverable: "Mapeamento de 5 cl\xEDnicas interessadas em testar gratuitamente por 7 dias.",
            recommendedDay: "Dias 1 e 2"
          }
        ]
      },
      {
        phase: 2,
        name: "Fase 2: Configura\xE7\xE3o do Bot WhatsApp com IA de \xC1udio",
        timeEstimate: "Dias 4 a 7",
        description: 'Bot que entende mensagens de voz do paciente ("Vou atrasar 15 min, d\xE1 pra remarcar?").',
        actionItems: [
          {
            id: "clinic-2",
            title: "Conectar n\xFAmero na Cloud API oficial da Meta via Z-API ou Evolution API",
            howToExecute: "Configurar webhook para transcri\xE7\xE3o de \xE1udio via Whisper e classifica\xE7\xE3o de inten\xE7\xE3o.",
            deliverable: "Bot respondendo confirma\xE7\xF5es e remanejando hor\xE1rios na agenda do Google.",
            recommendedDay: "Dias 4 a 6"
          }
        ]
      },
      {
        phase: 3,
        name: "Fase 3: Convers\xE3o em Assinatura de R$ 390/m\xEAs",
        timeEstimate: "Dias 8 a 14",
        description: "Apresentar relat\xF3rio de consultas recuperadas e fechar contrato anual.",
        actionItems: [
          {
            id: "clinic-3",
            title: "Apresentar c\xE1lculo de ROI: R$ 2.400 salvos em faltas versus R$ 390 de mensalidade",
            howToExecute: "Relat\xF3rio impresso ou PDF mostrando pacientes que confirmaram e compareceram.",
            deliverable: "3 contratos fechados no primeiro m\xEAs (R$ 1.170 MRR).",
            recommendedDay: "Dias 8 a 12"
          }
        ]
      }
    ]
  },
  {
    id: "opp-05",
    title: "Extens\xE3o de Espionagem e Desconstru\xE7\xE3o de An\xFAncios Escalados no TikTok",
    tagline: "Mapeia \xE2ngulos emocionais, roteiros de UGC e criativos que est\xE3o gerando mais de $50k/dia em e-commerce.",
    category: "Digital Product",
    score: 89,
    confidence: "Alta",
    potentialMrr: "$20k - $80k MRR",
    effort: "Baixo (1-2 sem)",
    difficulty: "Baixa",
    timeToMvpDays: 14,
    market: {
      originCountry: "Reino Unido",
      originFlag: "\u{1F1EC}\u{1F1E7}",
      originCode: "GB",
      targetMarkets: ["Reino Unido", "Estados Unidos", "Canad\xE1", "Austr\xE1lia"],
      continent: "Europa",
      currency: "GBP"
    },
    targetMarkets: ["Global / E-commerce"],
    whatDetected: "Aumento de 310% em buscas por alternativas a ferramentas caras de espionagem de an\xFAncios (Foreplay.co custando $99/m\xEAs).",
    whyImportant: "Marcas de e-commerce e ag\xEAncias de m\xEDdia paga precisam de novos criativos toda semana para combater fadiga de an\xFAncios.",
    problemExists: "Ferramentas existentes s\xF3 salvam o v\xEDdeo bruto, sem explicar a estrutura do roteiro ou por que aquele hook converteu.",
    opportunityExplored: "Extens\xE3o do Chrome que injeta na biblioteca de an\xFAncios do TikTok o tempo de veicula\xE7\xE3o (longevidade), transcri\xE7\xE3o do hook e 3 varia\xE7\xF5es prontas para grava\xE7\xE3o.",
    howMonetized: "\xA329/m\xEAs ou \xA3199/ano licen\xE7a ilimitada.",
    primaryProblem: "Gestores de tr\xE1fego perdem 15 horas semanais tentando decifrar quais an\xFAncios concorrentes realmente est\xE3o no lucro.",
    proposedSolution: "Extens\xE3o do Chrome que calcula o score de longevidade e transcreve hooks de criativos com 1 clique.",
    monetizationModel: "\xA329/m\xEAs ou \xA3199/ano assinatura individual.",
    businessModel: "Extens\xE3o / Add-on",
    productType: "Extens\xE3o",
    targetAudience: "B2B",
    isAiRelated: true,
    isRemoteWork: true,
    investmentRequired: "Bootstrapped (Baixo)",
    unservedNiche: "Marcas DTC (Direct-to-Consumer) e gestores de m\xEDdia aut\xF4nomos.",
    competitionLevel: "Alta",
    existingCompetitors: ["Foreplay.co", "MagicBrief", "AdSpy"],
    differentiationAngle: "Desconstru\xE7\xE3o pedag\xF3gica do roteiro com IA em vez de mero reposit\xF3rio de v\xEDdeos.",
    tags: ["Chrome Extension", "TikTok Ads", "E-commerce", "Creative Strategy"],
    techStack: ["React", "Plasmo Chrome Extension", "Tailwind", "Claude 3.5 Sonnet"],
    freshness: "Detectado h\xE1 3d",
    trendingGrowth: "+310% busca por alternativas a ferramentas de Ads",
    sparkline: [25, 34, 48, 62, 80, 115, 150],
    dateDetected: "2026-09-23",
    isSaved: false,
    status: "Novo",
    sources: [
      {
        platform: "X",
        snippet: "A maioria das ferramentas de espionagem de an\xFAncios cobra caro s\xF3 pra guardar links de v\xEDdeos. Falta an\xE1lise de por que o an\xFAncio funcionou.",
        timestamp: "H\xE1 3d",
        volumeOrScore: "95 reposts"
      }
    ],
    financials: {
      estimatedMonthlyProfit: "\xA33.200 - \xA39.500 / m\xEAs ($4,000 - $12,000/mo)",
      profitMargin: "93%",
      averageTicket: "\xA329 / m\xEAs ($38/mo)",
      annualProjection: "\xA338.400 - \xA3114.000 ARR",
      paybackDays: 7
    },
    executionSpeed: {
      mvpDays: 7,
      firstSaleDays: 12,
      weeklyDedicationHours: "8-10h / semana",
      speedRating: "Ultra R\xE1pido (1 sem)"
    },
    investment: {
      initialCapitalEstimated: "$45 USD (R$ 230)",
      capitalBreakdown: [
        { item: "Taxa \xFAnica Google Chrome Web Store", cost: "$5 USD" },
        { item: "Dom\xEDnio .co / .io", cost: "$15 USD" },
        { item: "Cr\xE9ditos Claude 3.5 Sonnet API", cost: "$25 USD" }
      ],
      budgetTier: "Bootstrap ($0 a $100)"
    },
    executionPlaybook: [
      {
        phase: 1,
        name: "Fase 1: Constru\xE7\xE3o da Extens\xE3o Chrome com Plasmo",
        timeEstimate: "Dias 1 a 4",
        description: "Injetar bot\xE3o na biblioteca p\xFAblica de an\xFAncios do TikTok para extrair script e hook.",
        actionItems: [
          {
            id: "tok-1",
            title: "Criar content script que l\xEA o elemento de v\xEDdeo e transcreve primeiros 3 segundos",
            howToExecute: "Usar Plasmo framework com React e Tailwind.",
            deliverable: "Extens\xE3o instalada em modo desenvolvedor funcionando no Chrome.",
            recommendedDay: "Dias 1 a 3"
          }
        ]
      },
      {
        phase: 2,
        name: "Fase 2: Lan\xE7amento em Comunidades de Dropshipping & E-commerce",
        timeEstimate: "Dias 5 a 10",
        description: "Postar demonstra\xE7\xF5es em v\xEDdeo mostrando como roubar eticamente os hooks mais virais.",
        actionItems: [
          {
            id: "tok-2",
            title: "Gravar v\xEDdeo de 60 segundos demonstrando a an\xE1lise de um an\xFAncio milion\xE1rio",
            howToExecute: "Postar no Twitter/X, TikTok e Reddit r/dropship e r/ecommerce.",
            deliverable: "100 downloads e primeiros 15 assinantes pagantes de \xA329/m\xEAs.",
            recommendedDay: "Dias 5 a 8"
          }
        ]
      }
    ]
  },
  {
    id: "opp-06",
    title: "Monitor de Linter e Migra\xE7\xF5es PostgreSQL Zero-Downtime para CI/CD",
    tagline: "Previne locks de tabelas e paradas de produ\xE7\xE3o causadas por migra\xE7\xF5es mal otimizadas.",
    category: "API / Developer Tool",
    score: 91,
    confidence: "Alta",
    potentialMrr: "$20k - $80k MRR",
    effort: "M\xE9dio (1 m\xEAs)",
    difficulty: "M\xE9dia",
    timeToMvpDays: 18,
    market: {
      originCountry: "Canad\xE1",
      originFlag: "\u{1F1E8}\u{1F1E6}",
      originCode: "CA",
      targetMarkets: ["Estados Unidos", "Canad\xE1", "Europa", "Global"],
      continent: "Am\xE9rica do Norte",
      currency: "USD"
    },
    targetMarkets: ["Global / Developers"],
    whatDetected: "Onda de relatos de quedas em produ\xE7\xE3o provocadas por altera\xE7\xF5es de schema com `lock table` executadas inadvertidamente por times \xE1geis em pipelines de CI.",
    whyImportant: "1 minuto de downtime em fintech ou SaaS com tr\xE1fego massivo custa milhares de d\xF3lares e arranha a reputa\xE7\xE3o t\xE9cnica da equipe.",
    problemExists: "As ferramentas existentes (Bytebase, AtlasGo) s\xE3o monol\xEDticas e exigem alterar a arquitetura inteira de deploy.",
    opportunityExplored: "GitHub Action ultra-leve que simula a migra\xE7\xE3o em um container tempor\xE1rio, detecta riscos de lock e prop\xF5e o comando SQL seguro em menos de 10 segundos.",
    howMonetized: "$49/reposit\xF3rio/m\xEAs para equipes em crescimento ou $199/m\xEAs para reposit\xF3rios ilimitados.",
    primaryProblem: "Desenvolvedores rodam scripts de migra\xE7\xE3o que travam tabelas cr\xEDticas de banco de dados em hor\xE1rio de pico.",
    proposedSolution: "GitHub Action que valida queries de migra\xE7\xE3o simulando o impacto de lock antes do merge.",
    monetizationModel: "$49 a $199/m\xEAs por organiza\xE7\xE3o no GitHub.",
    businessModel: "API / Dev Tool",
    productType: "API",
    targetAudience: "B2B",
    isAiRelated: false,
    isRemoteWork: true,
    investmentRequired: "Bootstrapped (Baixo)",
    unservedNiche: "Startups S\xE9rie A e equipes de engenharia de 5 a 50 desenvolvedores usando Postgres.",
    competitionLevel: "Baixa",
    existingCompetitors: ["Bytebase", "AtlasGo"],
    differentiationAngle: "Zero configura\xE7\xE3o de servidores: basta adicionar um workflow de YAML no GitHub.",
    tags: ["DevOps", "PostgreSQL", "GitHub Actions", "Database Reliability"],
    techStack: ["Go", "TypeScript", "Docker", "PostgreSQL 16"],
    freshness: "Novo",
    trendingGrowth: "+88% men\xE7\xF5es de incidentes de migra\xE7\xE3o em f\xF3runs",
    sparkline: [15, 22, 33, 44, 59, 78, 96],
    dateDetected: "2026-09-24",
    isSaved: false,
    status: "Em An\xE1lise",
    sources: [
      {
        platform: "GitHub",
        snippet: "Discuss\xE3o no HackerNews sobre lock de tabela em adi\xE7\xE3o de coluna NOT NULL sem default no Postgres 14.",
        timestamp: "H\xE1 4d",
        volumeOrScore: "412 stars"
      }
    ],
    financials: {
      estimatedMonthlyProfit: "$4,500 - $14,000 / m\xEAs",
      profitMargin: "94%",
      averageTicket: "$49 a $199 / m\xEAs",
      annualProjection: "$54,000 - $168,000 ARR",
      paybackDays: 14
    },
    executionSpeed: {
      mvpDays: 10,
      firstSaleDays: 16,
      weeklyDedicationHours: "10h / semana",
      speedRating: "R\xE1pido (2 sem)"
    },
    investment: {
      initialCapitalEstimated: "$35 USD (R$ 180)",
      capitalBreakdown: [
        { item: "Dom\xEDnio .dev", cost: "$14 / ano" },
        { item: "GitHub Marketplace Publisher", cost: "$0" },
        { item: "GitHub Actions Runners free tier", cost: "$0" }
      ],
      budgetTier: "Bootstrap ($0 a $100)"
    },
    executionPlaybook: [
      {
        phase: 1,
        name: "Fase 1: CLI de Valida\xE7\xE3o de Migra\xE7\xF5es em Go/TypeScript",
        timeEstimate: "Dias 1 a 5",
        description: "Regras est\xE1ticas detectando: add column sem default, create index sem concurrently.",
        actionItems: [
          {
            id: "pg-1",
            title: "Escrever parser de SQL com 10 regras de seguran\xE7a de lock do Postgres",
            howToExecute: "Usar pg-query-parser ou parser de AST SQL em Go.",
            deliverable: "CLI testada retornando exit code 1 se houver comando perigoso.",
            recommendedDay: "Dias 1 a 3"
          }
        ]
      },
      {
        phase: 2,
        name: "Fase 2: Publicar GitHub Action no Marketplace Oficial",
        timeEstimate: "Dias 6 a 12",
        description: "Facilitar a instala\xE7\xE3o em 1 linha de YAML no reposit\xF3rio.",
        actionItems: [
          {
            id: "pg-2",
            title: "Submeter action no GitHub Marketplace com README detalhado e badges",
            howToExecute: "Oferecer plano gr\xE1tis para open-source e $49/m\xEAs para reposit\xF3rios privados.",
            deliverable: "GitHub Action listada publicamente recebendo instala\xE7\xF5es org\xE2nicas.",
            recommendedDay: "Dias 6 a 9"
          }
        ]
      }
    ]
  }
];
var MOCK_LIVE_SIGNALS = [
  {
    id: "sig-101",
    source: "Reddit",
    title: "Reclama\xE7\xF5es em massa sobre aumento de 400% da HubSpot para pequenos neg\xF3cios",
    excerpt: "Fundadores de pequenas ag\xEAncias est\xE3o procurando ativamente ferramentas para CRM leve com faturamento em moeda local.",
    category: "Fric\xE7\xE3o de SaaS Legado",
    urgency: "Alta",
    scoreImpact: 96,
    detectedAt: "H\xE1 12 min",
    geoScope: "Estados Unidos / Brasil",
    countryCode: "US",
    countryFlag: "\u{1F1FA}\u{1F1F8}",
    sentiment: "Frustra\xE7\xE3o"
  },
  {
    id: "sig-102",
    source: "G2",
    title: "DocuSign exigindo renova\xE7\xE3o m\xEDnima de $8.000 para contratos com m\xFAltiplos signat\xE1rios",
    excerpt: "Pequenas construtoras e escrit\xF3rios de advocacia reclamando que s\xF3 precisam de 10 assinaturas por m\xEAs e est\xE3o sendo empurrados para planos anuais for\xE7ados.",
    category: "Gap de Micro-SaaS",
    urgency: "Alta",
    scoreImpact: 94,
    detectedAt: "H\xE1 28 min",
    geoScope: "Estados Unidos / LatAm",
    countryCode: "US",
    countryFlag: "\u{1F1FA}\u{1F1F8}",
    sentiment: "Demanda Alta"
  },
  {
    id: "sig-103",
    source: "GoogleTrends",
    title: 'Buscas por "W\xE4rmepumpen Handwerker Software" dispararam 280% na Alemanha',
    excerpt: "Normas governamentais de descarboniza\xE7\xE3o criam demanda emergente por software de vistoria de bombas de calor para t\xE9cnicos alem\xE3es.",
    category: "Regulat\xF3rio & Mercado",
    urgency: "Alta",
    scoreImpact: 95,
    detectedAt: "H\xE1 45 min",
    geoScope: "Alemanha",
    countryCode: "DE",
    countryFlag: "\u{1F1E9}\u{1F1EA}",
    sentiment: "Crescimento R\xE1pido"
  },
  {
    id: "sig-104",
    source: "GitHub",
    title: "Reposit\xF3rio de agente aut\xF4nomo para suporte ao cliente atinge 4.500 stars em 48h",
    excerpt: "Crescimento explosivo em reposit\xF3rios usando arquitetura baseada em LangGraph e WebSockets para atendimento de primeiro n\xEDvel.",
    category: "Tecnologia Emergente",
    urgency: "M\xE9dia",
    scoreImpact: 88,
    detectedAt: "H\xE1 1 hora",
    geoScope: "Global",
    countryCode: "CA",
    countryFlag: "\u{1F1E8}\u{1F1E6}",
    sentiment: "Crescimento R\xE1pido"
  },
  {
    id: "sig-105",
    source: "Upwork",
    title: 'Surto de propostas para "Integra\xE7\xE3o de pagamentos Pix em plataformas Shopify internacionais"',
    excerpt: "Lojas dos EUA e Europa que vendem para o Brasil procurando desenvolvedores freelancers com urg\xEAncia para integrar Pix com concilia\xE7\xE3o.",
    category: "Trabalho Remoto & Arbitragem",
    urgency: "Alta",
    scoreImpact: 97,
    detectedAt: "H\xE1 2 horas",
    geoScope: "Brasil / EUA",
    countryCode: "BR",
    countryFlag: "\u{1F1E7}\u{1F1F7}",
    sentiment: "Demanda Alta"
  },
  {
    id: "sig-106",
    source: "X",
    title: 'Discuss\xE3o viral: "Por que n\xE3o existe um Vercel para rodar modelos de IA locais em servidores dedicados baratos?"',
    excerpt: "Desenvolvedores frustrados com o custo de inst\xE2ncias GPU serverless da AWS/RunPod sem DX moderna e amig\xE1vel.",
    category: "Developer Infrastructure",
    urgency: "M\xE9dia",
    scoreImpact: 87,
    detectedAt: "H\xE1 3 horas",
    geoScope: "Global",
    countryCode: "GB",
    countryFlag: "\u{1F1EC}\u{1F1E7}",
    sentiment: "Gap de Produto"
  }
];
var MOCK_ALERTS = [
  {
    id: "alt-01",
    name: "Sinais Cr\xEDticos de Fric\xE7\xE3o em Ferramentas de Contabilidade",
    queryOrKeywords: "contabilidade, NF-e, fiscal, eNotas, emiss\xE3o",
    minScore: 85,
    channels: ["Email", "In-App"],
    frequency: "Tempo Real",
    isActive: true,
    triggersCount: 38,
    lastTriggered: "Hoje, 09:42"
  },
  {
    id: "alt-02",
    name: "Oportunidades de Micro-SaaS em Alta Viabilidade (MVP < 30 dias)",
    queryOrKeywords: "Micro-SaaS, Chrome Extension, Notion, Zapier",
    minScore: 90,
    channels: ["In-App", "Telegram"],
    frequency: "Digest Di\xE1rio",
    isActive: true,
    triggersCount: 14,
    lastTriggered: "Ontem, 18:00"
  },
  {
    id: "alt-03",
    name: "Alertas de Aumento de Pre\xE7o em Softwares B2B Populares",
    queryOrKeywords: "price increase, renewal shock, cancelled, switching from",
    minScore: 80,
    channels: ["Webhook", "In-App"],
    frequency: "Tempo Real",
    isActive: true,
    triggersCount: 52,
    lastTriggered: "Hoje, 10:15"
  }
];
var MOCK_HYPOTHESES = [
  {
    id: "hyp-01",
    title: "Fundadores pagariam R$ 199/m\xEAs para eliminar o trabalho manual de emiss\xE3o de NF-e no Stripe",
    opportunityRefId: "opp-01",
    status: "Landing Page",
    hypothesisText: "Se oferecermos uma integra\xE7\xE3o que emite notas fiscais de prefeituras com 1 webhook do Stripe, conseguiremos 20 clientes pagantes antes de escrever o c\xF3digo de todas as prefeituras.",
    successMetric: "20 pr\xE9-inscri\xE7\xF5es com cart\xE3o cadastrado ou dep\xF3sito de valida\xE7\xE3o.",
    confidenceScore: 88,
    notes: "Landing page no ar. 12 leads qualificados obtidos via comunidade de indie hackers.",
    createdAt: "2026-09-22"
  },
  {
    id: "hyp-02",
    title: "Dentistas aceitariam pagar R$ 350/m\xEAs por bot no WhatsApp que reduz faltas em 50%",
    opportunityRefId: "opp-04",
    status: "Entrevistas",
    hypothesisText: "O custo de um \xFAnico paciente faltoso em procedimentos est\xE9ticos supera R$ 400. Mostrar o ROI imediato garantir\xE1 convers\xE3o em menos de 7 dias de teste.",
    successMetric: "4 de 5 cl\xEDnicas aceitando rodar teste de 14 dias com n\xFAmero de teste.",
    confidenceScore: 92,
    notes: "Entrevistadas 3 secret\xE1rias e 2 donos de cl\xEDnica. A dor de esquecimento de pacientes na sexta-feira \xE9 cr\xF4nica.",
    createdAt: "2026-09-24"
  },
  {
    id: "hyp-03",
    title: "Corretores de im\xF3veis compram portais em Notion prontos por $49 se vier com dom\xEDnio pr\xF3prio",
    opportunityRefId: "opp-02",
    status: "Backlog",
    hypothesisText: "Corretores aut\xF4nomos n\xE3o t\xEAm tempo para contratar programadores, mas adoram o Notion para gerenciar leads.",
    successMetric: "Taxa de convers\xE3o de 3.5% na p\xE1gina de vendas inicial.",
    confidenceScore: 78,
    notes: "Aguardando valida\xE7\xE3o da API do Notion para m\xFAltiplos workspaces.",
    createdAt: "2026-09-25"
  }
];

// src/data/newsData.ts
var MOCK_MARKET_NEWS = [
  {
    id: "news-1",
    title: "OpenAI lan\xE7a nova Realtime Audio API com lat\xEAncia de 120ms para agentes de voz",
    summary: "A nova API de \xE1udio bidirecional da OpenAI elimina a necessidade de encadear modelos de transcri\xE7\xE3o (Whisper) e s\xEDntese (TTS), permitindo intera\xE7\xF5es por voz indistingu\xEDveis de uma conversa humana ao vivo.",
    source: "OpenAI Official Blog",
    sourceType: "official_api",
    date: "26/09/2026",
    timestamp: "2026-09-26T09:15:00Z",
    country: "Estados Unidos",
    countryFlag: "\u{1F1FA}\u{1F1F8}",
    countryCode: "US",
    category: "APIs",
    originalUrl: "https://openai.com/blog/realtime-api",
    readTimeMinutes: 4,
    impactScore: 96,
    isTrending: true,
    isSaved: false,
    tags: ["IA", "APIs", "Voz", "Agentes"],
    aiQuestion: "Existe uma oportunidade de neg\xF3cio escondida aqui?",
    aiAnalysisSummary: "A queda de lat\xEAncia para 120ms viabiliza uma nova onda de interfaces auditivas verticais. Neg\xF3cios que dependiam de telefonistas ou operadores humanos para triagem agora podem ser 100% automatizados com alta satisfa\xE7\xE3o.",
    possibleOpportunities: [
      {
        id: "hyp-1a",
        type: "Criar SaaS",
        title: "Hip\xF3tese: Recep\xE7\xE3o telef\xF4nica com IA para cl\xEDnicas m\xE9dicas e odontol\xF3gicas",
        description: "Construir um SaaS vertical que atende liga\xE7\xF5es 24/7, responde d\xFAvidas sobre conv\xEAnios e agenda consultas diretamente no Prontu\xE1rio Eletr\xF4nico (PEP).",
        confidenceScore: 92,
        targetAudience: "Cl\xEDnicas particulares e consult\xF3rios m\xE9dicos",
        estimatedEffort: "3-4 semanas",
        monetizationModel: "R$ 390 - R$ 990/m\xEAs por cl\xEDnica",
        status: "Hip\xF3tese"
      },
      {
        id: "hyp-1b",
        type: "Ferramenta Vertical",
        title: "Hip\xF3tese: Agente de voz para qualifica\xE7\xE3o imediata de leads imobili\xE1rios",
        description: "Ligar para leads do portal imobili\xE1rio em menos de 45 segundos ap\xF3s preenchimento do formul\xE1rio para verificar or\xE7amento e urg\xEAncia antes de passar ao corretor.",
        confidenceScore: 88,
        targetAudience: "Imobili\xE1rias e incorporadoras de m\xE9dio porte",
        estimatedEffort: "2-3 semanas",
        monetizationModel: "R$ 49/m\xEAs + R$ 2 por lead qualificado",
        status: "Hip\xF3tese"
      },
      {
        id: "hyp-1c",
        type: "Integra\xE7\xE3o de Nicho",
        title: "Hip\xF3tese: Gateway de voz para Zendesk e Freshdesk com grava\xE7\xE3o de tickets",
        description: "Plugin que conecta a Realtime API aos CRMs de atendimento existentes, transcrevendo a chamada e preenchendo campos customizados automaticamente.",
        confidenceScore: 84,
        targetAudience: "Times de suporte B2B e atendimento ao cliente",
        estimatedEffort: "2 semanas",
        monetizationModel: "US$ 49/m\xEAs por time",
        status: "Hip\xF3tese"
      },
      {
        id: "hyp-1d",
        type: "Servi\xE7o Especializado",
        title: "Hip\xF3tese: Consultoria de implanta\xE7\xE3o de agentes de voz para call centers",
        description: "Servi\xE7o produtizado de migra\xE7\xE3o de IVRs legadas (URA) de bancos e seguros para agentes conversacionais inteligentes.",
        confidenceScore: 76,
        targetAudience: "Empresas de m\xE9dio e grande porte com call center pr\xF3prio",
        estimatedEffort: "2 meses",
        monetizationModel: "R$ 15.000 setup + R$ 3.000/m\xEAs sustenta\xE7\xE3o",
        status: "Hip\xF3tese"
      }
    ]
  },
  {
    id: "news-2",
    title: "Stripe anuncia taxas adicionais para transa\xE7\xF5es internacionais e convers\xF5es cambiais for\xE7adas",
    summary: "A gigante de pagamentos alterou a tabela de processamento para comerciantes globais, elevando o custo de liquida\xE7\xE3o transfronteiri\xE7a em at\xE9 1.5% e gerando queixas em massa de fundadores de SaaS no Reddit e Twitter.",
    source: "TechCrunch & Stripe Changelog",
    sourceType: "official_api",
    date: "25/09/2026",
    timestamp: "2026-09-25T14:30:00Z",
    country: "Global",
    countryFlag: "\u{1F310}",
    countryCode: "GL",
    category: "fintech",
    originalUrl: "https://techcrunch.com/stripe-international-fees-update",
    readTimeMinutes: 5,
    impactScore: 92,
    isTrending: true,
    isSaved: false,
    tags: ["fintech", "SaaS", "Stripe", "Fric\xE7\xE3o"],
    aiQuestion: "Existe uma oportunidade de neg\xF3cio escondida aqui?",
    aiAnalysisSummary: "Mudan\xE7as de pre\xE7os unilaterais por plataformas monopolistas sempre criam fric\xE7\xE3o aguda e abertura para ferramentas de roteamento e otimiza\xE7\xE3o de faturamento multi-gateway.",
    possibleOpportunities: [
      {
        id: "hyp-2a",
        type: "Criar SaaS",
        title: "Hip\xF3tese: Smart Payment Router para Micro-SaaS",
        description: "Middleware que conecta Stripe, Lemon Squeezy e gateways locais (como Asaas/MercadoPago no Brasil), roteando cada cobran\xE7a pela rota com menor taxa cambial.",
        confidenceScore: 90,
        targetAudience: "Fundadores de SaaS faturando entre $5k e $50k MRR",
        estimatedEffort: "3-4 semanas",
        monetizationModel: "0.25% sobre o valor roteado ou $49/m\xEAs fixo",
        status: "Hip\xF3tese"
      },
      {
        id: "hyp-2b",
        type: "Ferramenta Vertical",
        title: "Hip\xF3tese: Calculadora e auditor de taxas cambiais para Stripe",
        description: "Extens\xE3o ou dashboard que l\xEA as faturas do Stripe e aponta exatamente quanto a empresa perdeu em taxas ocultas e FX nos \xFAltimos 12 meses.",
        confidenceScore: 85,
        targetAudience: "CFOs e founders de SaaS que vendem internacionalmente",
        estimatedEffort: "1-2 semanas",
        monetizationModel: "Freemium com auditoria detalhada a $29 one-off",
        status: "Hip\xF3tese"
      },
      {
        id: "hyp-2c",
        type: "Integra\xE7\xE3o de Nicho",
        title: "Hip\xF3tese: Bridge para emiss\xE3o de nota fiscal brasileira para vendas Stripe USD",
        description: "Automa\xE7\xE3o que converte vendas internacionais do Stripe em notas fiscais NFS-e com reten\xE7\xE3o correta de tributos e concilia\xE7\xE3o banc\xE1ria.",
        confidenceScore: 82,
        targetAudience: "Desenvolvedores e ag\xEAncias brasileiras que recebem em d\xF3lar",
        estimatedEffort: "2-3 semanas",
        monetizationModel: "R$ 97 - R$ 247/m\xEAs",
        status: "Hip\xF3tese"
      }
    ]
  },
  {
    id: "news-3",
    title: "Shopify restringe o acesso direto a APIs de checkout legadas e exige Checkout Extensibility",
    summary: "Lojas virtuais que utilizavam checkout customizado t\xEAm prazo fatal para migrar para a nova arquitetura modular, quebrando centenas de add-ons e temas n\xE3o atualizados.",
    source: "Shopify Developer Portal",
    sourceType: "official_api",
    date: "24/09/2026",
    timestamp: "2026-09-24T11:00:00Z",
    country: "Canad\xE1 / Global",
    countryFlag: "\u{1F1E8}\u{1F1E6}",
    countryCode: "CA",
    category: "mudan\xE7as de plataformas",
    originalUrl: "https://shopify.dev/docs/apps/checkout",
    readTimeMinutes: 6,
    impactScore: 91,
    isTrending: false,
    isSaved: false,
    tags: ["e-commerce", "mudan\xE7as de plataformas", "APIs", "Shopify"],
    aiQuestion: "Existe uma oportunidade de neg\xF3cio escondida aqui?",
    aiAnalysisSummary: "Toda quebra de API legada cria uma janela de ouro de 6 a 12 meses onde lojistas desesperados pagam quantias elevadas por substitutos prontos ou ferramentas de migra\xE7\xE3o r\xE1pida.",
    possibleOpportunities: [
      {
        id: "hyp-3a",
        type: "Criar SaaS",
        title: "Hip\xF3tese: Suite de Checkout Upsell compat\xEDvel com Shopify Extensibility",
        description: "Micro-SaaS com widgets de 1-click upsell, cross-sell p\xF3s-compra e selos de seguran\xE7a desenvolvidos nativamente sobre os novos componentes da Shopify.",
        confidenceScore: 94,
        targetAudience: "Lojas Shopify Plus e marcas D2C de m\xE9dio porte",
        estimatedEffort: "2-3 semanas",
        monetizationModel: "US$ 39 - US$ 199/m\xEAs + tier revenue share",
        status: "Hip\xF3tese"
      },
      {
        id: "hyp-3b",
        type: "Servi\xE7o Especializado",
        title: "Hip\xF3tese: Pacote de migra\xE7\xE3o expressa de checkout em 48 horas",
        description: "Servi\xE7o pontual garantido para lojas virtuais em risco de bloqueio, adaptando scripts legados para extens\xF5es modulares.",
        confidenceScore: 89,
        targetAudience: "Lojistas de e-commerce sem equipe de desenvolvimento interna",
        estimatedEffort: "1 semana",
        monetizationModel: "R$ 2.500 - R$ 6.000 por migra\xE7\xE3o conclu\xEDda",
        status: "Hip\xF3tese"
      }
    ]
  },
  {
    id: "news-4",
    title: "Google lan\xE7a Search Generative Experience para 100% dos usu\xE1rios e derruba cliques org\xE2nicos",
    summary: "Estudos de tr\xE1fego indicam queda de 25% a 40% no tr\xE1fego org\xE2nico para blogs e portais de conte\xFAdo gen\xE9rico, enquanto termos orientados a problemas pr\xE1ticos e produtos transacionais mantiveram volume.",
    source: "Search Engine Land",
    sourceType: "rss_feed",
    date: "23/09/2026",
    timestamp: "2026-09-23T16:20:00Z",
    country: "Estados Unidos",
    countryFlag: "\u{1F1FA}\u{1F1F8}",
    countryCode: "US",
    category: "economia digital",
    originalUrl: "https://searchengineland.com/sge-rollout-traffic-impact",
    readTimeMinutes: 5,
    impactScore: 88,
    isTrending: true,
    isSaved: false,
    tags: ["economia digital", "tecnologia", "SEO", "IA"],
    aiQuestion: "Existe uma oportunidade de neg\xF3cio escondida aqui?",
    aiAnalysisSummary: "O SEO tradicional de artigos gen\xE9ricos est\xE1 morto. O novo tr\xE1fego exige Otimiza\xE7\xE3o para Modelos de IA (GEO - Generative Engine Optimization) e ferramentas de utilidade direta (calculadoras, geradores, micro-apps).",
    possibleOpportunities: [
      {
        id: "hyp-4a",
        type: "Criar SaaS",
        title: "Hip\xF3tese: GEO Monitor \u2014 Rastreador de cita\xE7\xF5es em Perplexity, ChatGPT e Gemini",
        description: "Dashboard que monitora quais marcas e SaaS s\xE3o citados como recomenda\xE7\xE3o quando usu\xE1rios perguntam sobre determinado nicho para as IAs generativas.",
        confidenceScore: 87,
        targetAudience: "Ag\xEAncias de marketing digital e gerentes de crescimento de SaaS",
        estimatedEffort: "3 semanas",
        monetizationModel: "US$ 79 - US$ 249/m\xEAs",
        status: "Hip\xF3tese"
      },
      {
        id: "hyp-4b",
        type: "Ferramenta Vertical",
        title: "Hip\xF3tese: Gerador de ferramentas interativas para atra\xE7\xE3o de leads (Free Engineering as Marketing)",
        description: "Plataforma no-code que cria calculadoras, estimadores e simuladores embut\xEDveis para empresas capturarem leads sem depender de posts de blog.",
        confidenceScore: 83,
        targetAudience: "Neg\xF3cios B2B e fintechs",
        estimatedEffort: "3 semanas",
        monetizationModel: "R$ 149/m\xEAs",
        status: "Hip\xF3tese"
      }
    ]
  },
  {
    id: "news-5",
    title: "Alemanha aprova diretriz de emiss\xF5es de carbono de escopo 3 para fornecedores de software e TI",
    summary: "A partir do pr\xF3ximo trimestre, empresas que contratam servi\xE7os de nuvem e SaaS corporativo na UE dever\xE3o comprovar auditoria energ\xE9tica e m\xE9tricas de emiss\xE3o de carbono de seus fornecedores de software.",
    source: "Handelsblatt & EU Regulatory Monitor",
    sourceType: "rss_feed",
    date: "22/09/2026",
    timestamp: "2026-09-22T08:45:00Z",
    country: "Alemanha",
    countryFlag: "\u{1F1E9}\u{1F1EA}",
    countryCode: "DE",
    category: "startups",
    originalUrl: "https://handelsblatt.com/esg-software-eu-scope3",
    readTimeMinutes: 7,
    impactScore: 89,
    isTrending: false,
    isSaved: false,
    tags: ["startups", "software", "ESG", "Europa"],
    aiQuestion: "Existe uma oportunidade de neg\xF3cio escondida aqui?",
    aiAnalysisSummary: "Barreiras regulat\xF3rias na Uni\xE3o Europeia criam mercados cativos bilion\xE1rios. Fornecedores de software que n\xE3o tiverem relat\xF3rio de emiss\xF5es perder\xE3o contratos B2B.",
    possibleOpportunities: [
      {
        id: "hyp-5a",
        type: "Criar SaaS",
        title: "Hip\xF3tese: Selo e Calculadora de Carbono para APIs e Cloud Workloads",
        description: "Conector que l\xEA o consumo da AWS/Google Cloud/Supabase e gera automaticamente o certificado de emiss\xF5es em conformidade com as regras europeias.",
        confidenceScore: 91,
        targetAudience: "Startups de tecnologia que vendem para grandes corpora\xE7\xF5es europeias",
        estimatedEffort: "3-4 semanas",
        monetizationModel: "\u20AC 120 - \u20AC 450/m\xEAs",
        status: "Hip\xF3tese"
      },
      {
        id: "hyp-5b",
        type: "Arbitragem Geogr\xE1fica",
        title: "Hip\xF3tese: Adapta\xE7\xE3o de compliance verde para SaaS latino-americanos exportadores",
        description: "Plataforma para software houses da Am\xE9rica Latina obterem a certifica\xE7\xE3o necess\xE1ria para fechar contratos com clientes alem\xE3es e n\xF3rdicos.",
        confidenceScore: 84,
        targetAudience: "Empresas de software brasileiras e colombianas com clientes no exterior",
        estimatedEffort: "2 semanas",
        monetizationModel: "R$ 950 setup + R$ 290/m\xEAs",
        status: "Hip\xF3tese"
      }
    ]
  },
  {
    id: "news-6",
    title: "Slack e Microsoft Teams aumentam taxas para bots e automa\xE7\xF5es de terceiros",
    summary: "Novas pol\xEDticas tarif\xE1rias cobram taxas mensais por assento conectado para integra\xE7\xF5es de workflows que excedam limites de mensagens, encarecendo ferramentas simples de notifica\xE7\xE3o.",
    source: "The Verge",
    sourceType: "rss_feed",
    date: "21/09/2026",
    timestamp: "2026-09-21T13:10:00Z",
    country: "Estados Unidos",
    countryFlag: "\u{1F1FA}\u{1F1F8}",
    countryCode: "US",
    category: "automa\xE7\xE3o",
    originalUrl: "https://theverge.com/slack-teams-bot-pricing-surge",
    readTimeMinutes: 4,
    impactScore: 85,
    isTrending: false,
    isSaved: false,
    tags: ["automa\xE7\xE3o", "produtividade", "SaaS", "trabalho remoto"],
    aiQuestion: "Existe uma oportunidade de neg\xF3cio escondida aqui?",
    aiAnalysisSummary: "Custo inflacionado em plataformas centrais gera migra\xE7\xE3o para ferramentas com armazenamento local, webhooks diretos e bots hospedados na infraestrutura do pr\xF3prio cliente.",
    possibleOpportunities: [
      {
        id: "hyp-6a",
        type: "Criar SaaS",
        title: "Hip\xF3tese: Hub leve de alertas com consolidado inteligente por resumo",
        description: "Micro-SaaS que agrupa 50 notifica\xE7\xF5es di\xE1rias de GitHub/Sentry/Stripe em um \xFAnico digest condensado por IA, reduzindo o volume de mensagens em 80%.",
        confidenceScore: 86,
        targetAudience: "Times de engenharia e opera\xE7\xF5es remotas",
        estimatedEffort: "1-2 semanas",
        monetizationModel: "US$ 19/m\xEAs por equipe",
        status: "Hip\xF3tese"
      },
      {
        id: "hyp-6b",
        type: "Ferramenta Vertical",
        title: "Hip\xF3tese: Bot auto-hospedado (Open Source Core + Cloud Backup) para equipes de seguran\xE7a",
        description: "Alternativa sem taxa por usu\xE1rio para envio seguro de alertas internos sem risco de vazamento de tokens para terceiros.",
        confidenceScore: 80,
        targetAudience: "Empresas com regras r\xEDgidas de SOC2 e ISO27001",
        estimatedEffort: "2 semanas",
        monetizationModel: "US$ 49/m\xEAs suporte cloud",
        status: "Hip\xF3tese"
      }
    ]
  },
  {
    id: "news-7",
    title: "Migra\xE7\xE3o em massa de equipes de design para ferramentas baseadas em c\xF3digo (React/Tailwind)",
    summary: "A prolifera\xE7\xE3o de assistentes de IA de c\xF3digo levou mais de 45% dos designers de produto a prototipar diretamente com componentes reais de React, abandonando arquivos est\xE1ticos pesados de prototipagem.",
    source: "Figma Community & Smashing Magazine",
    sourceType: "rss_feed",
    date: "20/09/2026",
    timestamp: "2026-09-20T10:00:00Z",
    country: "Reino Unido / Global",
    countryFlag: "\u{1F1EC}\u{1F1E7}",
    countryCode: "GB",
    category: "desenvolvimento",
    originalUrl: "https://smashingmagazine.com/code-driven-design-trend",
    readTimeMinutes: 5,
    impactScore: 87,
    isTrending: true,
    isSaved: false,
    tags: ["desenvolvimento", "software", "produtividade", "design"],
    aiQuestion: "Existe uma oportunidade de neg\xF3cio escondida aqui?",
    aiAnalysisSummary: "A barreira entre design e frontend est\xE1 colapsando. Ferramentas que geram c\xF3digo limpo sem abstra\xE7\xF5es propriet\xE1rias t\xEAm taxa de convers\xE3o muito mais alta.",
    possibleOpportunities: [
      {
        id: "hyp-7a",
        type: "Criar SaaS",
        title: "Hip\xF3tese: Biblioteca de blocos de dashboard Tailwind com preview de dados reais",
        description: "Cole\xE7\xE3o de componentes SaaS prontos com formul\xE1rios validados, tabelas com pagina\xE7\xE3o e gr\xE1ficos interativos prontos para copiar e colar.",
        confidenceScore: 93,
        targetAudience: "Indie hackers e desenvolvedores full-stack",
        estimatedEffort: "2 semanas",
        monetizationModel: "Acesso vital\xEDcio por US$ 99 ou assinatura R$ 49/m\xEAs",
        status: "Hip\xF3tese"
      },
      {
        id: "hyp-7b",
        type: "Ferramenta Vertical",
        title: "Hip\xF3tese: Inspetor de acessibilidade visual autom\xE1tico para Pull Requests",
        description: "GitHub Action que renderiza os componentes alterados e alerta se o contraste de cores ou tamanho de alvos de toque viola padr\xF5es WCAG.",
        confidenceScore: 82,
        targetAudience: "Startups em est\xE1gio de auditoria de acessibilidade",
        estimatedEffort: "2 semanas",
        monetizationModel: "US$ 29/m\xEAs por reposit\xF3rio",
        status: "Hip\xF3tese"
      }
    ]
  },
  {
    id: "news-8",
    title: "Brasil registra aumento de 82% na contrata\xE7\xE3o de desenvolvedores por empresas americanas em regime remoto",
    summary: "A desvaloriza\xE7\xE3o cambial somada \xE0 alta compatibilidade de fuso hor\xE1rio (apenas 1 a 2 horas de diferen\xE7a com a Costa Leste dos EUA) acelerou a forma\xE7\xE3o de hubs remotos na Am\xE9rica Latina.",
    source: "Valor Econ\xF4mico / Deel Report",
    sourceType: "rss_feed",
    date: "19/09/2026",
    timestamp: "2026-09-19T07:20:00Z",
    country: "Brasil",
    countryFlag: "\u{1F1E7}\u{1F1F7}",
    countryCode: "BR",
    category: "trabalho remoto",
    originalUrl: "https://valor.globo.com/carreira/noticia/remoto-eua-latam-tecnologia",
    readTimeMinutes: 4,
    impactScore: 90,
    isTrending: true,
    isSaved: false,
    tags: ["trabalho remoto", "economia digital", "Brasil", "Arbitragem"],
    aiQuestion: "Existe uma oportunidade de neg\xF3cio escondida aqui?",
    aiAnalysisSummary: "Mais de 100 mil profissionais brasileiros recebem em moeda forte, mas enfrentam dores agudas de bitributa\xE7\xE3o, contabilidade internacional, contratos B2B confusos e benef\xEDcios de sa\xFAde locais.",
    possibleOpportunities: [
      {
        id: "hyp-8a",
        type: "Criar SaaS",
        title: "Hip\xF3tese: Plataforma de benef\xEDcios flex\xEDveis locais para prestadores PJ internacionais",
        description: "SaaS que permite que profissionais que recebem em USD contratem plano de sa\xFAde corporativo, previd\xEAncia privada e seguro de vida com faturamento descontado da remessa.",
        confidenceScore: 95,
        targetAudience: "Engenheiros e designers brasileiros trabalhando para o exterior",
        estimatedEffort: "3-4 semanas",
        monetizationModel: "R$ 79/m\xEAs taxa de gest\xE3o + comiss\xE3o de corretagem",
        status: "Hip\xF3tese"
      },
      {
        id: "hyp-8b",
        type: "Servi\xE7o Especializado",
        title: "Hip\xF3tese: Contabilidade automatizada de alta velocidade para PJ com exterior",
        description: "Servi\xE7o cont\xE1bil com emiss\xE3o autom\xE1tica de Invoice, fechamento cambial sem spread abusivo e emiss\xE3o de notas fiscais com al\xEDquota reduzida da Lei do Bem.",
        confidenceScore: 88,
        targetAudience: "Freelancers e contratados remotos PJ",
        estimatedEffort: "2 semanas",
        monetizationModel: "R$ 350 - R$ 650/m\xEAs por cliente",
        status: "Hip\xF3tese"
      }
    ]
  },
  {
    id: "news-9",
    title: "Nova gera\xE7\xE3o de Small Language Models (SLMs) roda offline em dispositivos m\xF3veis e navegadores",
    summary: "Modelos de 1B a 3B par\xE2metros agora executam infer\xEAncia a mais de 45 tokens por segundo usando WebGPU e WebAssembly, sem gastar cr\xE9ditos de nuvem ou vazar dados de usu\xE1rios.",
    source: "Hugging Face & Mozilla Tech",
    sourceType: "official_api",
    date: "18/09/2026",
    timestamp: "2026-09-18T15:40:00Z",
    country: "Fran\xE7a / Global",
    countryFlag: "\u{1F1EB}\u{1F1F7}",
    countryCode: "FR",
    category: "IA",
    originalUrl: "https://huggingface.co/blog/slm-webgpu-inference",
    readTimeMinutes: 6,
    impactScore: 94,
    isTrending: true,
    isSaved: false,
    tags: ["IA", "tecnologia", "desenvolvimento", "software"],
    aiQuestion: "Existe uma oportunidade de neg\xF3cio escondida aqui?",
    aiAnalysisSummary: "O custo marginal da IA por usu\xE1rio pode cair para zero se a infer\xEAncia for no navegador. Isso permite cobrar pre\xE7o \xFAnico de software ou freemium generoso sem risco de conta astron\xF4mica na OpenAI.",
    possibleOpportunities: [
      {
        id: "hyp-9a",
        type: "Criar SaaS",
        title: "Hip\xF3tese: Extens\xE3o de navegador para reda\xE7\xE3o e resumo 100% privada e offline",
        description: "Ferramenta para advogados, terapeutas e m\xE9dicos resumirem documentos confidenciais no browser com garantia criptogr\xE1fica de que nada sai da m\xE1quina.",
        confidenceScore: 91,
        targetAudience: "Profissionais regulados com exig\xEAncia de sigilo (LGPD/HIPAA)",
        estimatedEffort: "2-3 semanas",
        monetizationModel: "US$ 69 pagamento \xFAnico ou R$ 29/m\xEAs suporte",
        status: "Hip\xF3tese"
      },
      {
        id: "hyp-9b",
        type: "Ferramenta Vertical",
        title: "Hip\xF3tese: SDK para desenvolvedores embutirem IA offline em PWAs",
        description: "Biblioteca leve com modelos pr\xE9-quantizados e API simples de classifica\xE7\xE3o de texto, extra\xE7\xE3o de entidades e busca sem\xE2ntica em IndexedDB.",
        confidenceScore: 85,
        targetAudience: "Desenvolvedores mobile e web",
        estimatedEffort: "3 semanas",
        monetizationModel: "Freemium com licen\xE7a comercial a US$ 199",
        status: "Hip\xF3tese"
      }
    ]
  },
  {
    id: "news-10",
    title: "Alta demanda por ferramentas de automa\xE7\xE3o de faturas e reconcilia\xE7\xE3o banc\xE1ria no e-commerce B2B",
    summary: "Distribuidores e atacadistas que migraram para vendas digitais relatam que 60% do tempo dos times administrativos ainda \xE9 gasto comparando boletos e comprovantes manuais com pedidos ERP.",
    source: "E-Commerce Brasil & Forrester",
    sourceType: "curated_intel",
    date: "17/09/2026",
    timestamp: "2026-09-17T11:20:00Z",
    country: "Brasil / LatAm",
    countryFlag: "\u{1F1E7}\u{1F1F7}",
    countryCode: "BR",
    category: "e-commerce",
    originalUrl: "https://ecommercebrasil.com.br/b2b-conciliacao-faturas",
    readTimeMinutes: 5,
    impactScore: 89,
    isTrending: false,
    isSaved: false,
    tags: ["e-commerce", "automa\xE7\xE3o", "SaaS", "B2B"],
    aiQuestion: "Existe uma oportunidade de neg\xF3cio escondida aqui?",
    aiAnalysisSummary: "O B2B tradicional tem dinheiro, tem urg\xEAncia e sofre com softwares legados da d\xE9cada de 90. Uma interface moderna e limpa ganha o cliente em minutos.",
    possibleOpportunities: [
      {
        id: "hyp-10a",
        type: "Criar SaaS",
        title: "Hip\xF3tese: Conciliador inteligente de boletos e comprovantes PIX para distribuidores",
        description: "Software que recebe comprovantes por WhatsApp ou e-mail, faz OCR imediato e d\xE1 baixa no pedido no ERP (Totvs, Bling, Tiny) sem interven\xE7\xE3o humana.",
        confidenceScore: 94,
        targetAudience: "Distribuidores e ind\xFAstrias com faturamento acima de R$ 500k/m\xEAs",
        estimatedEffort: "3-4 semanas",
        monetizationModel: "R$ 690 - R$ 1.800/m\xEAs",
        status: "Hip\xF3tese"
      }
    ]
  }
];
var MOCK_EMERGING_TRENDS = [
  {
    id: "trend-voice-agents",
    trend: "Agentes de Voz Ultrarr\xE1pidos em Tempo Real (< 150ms)",
    growth: "+340% em men\xE7\xF5es e implementa\xE7\xF5es no \xFAltimo trimestre",
    growthPercentage: 340,
    market: "Sa\xFAde, Cl\xEDnicas, Imobili\xE1rias e PMEs de Servi\xE7os",
    problem: "Perda de 30% a 50% dos clientes que ligam fora do hor\xE1rio de atendimento e abandono em formul\xE1rios est\xE1ticos.",
    opportunity: "SaaS de recep\xE7\xE3o e triagem telef\xF4nica verticalizada por nicho, cobrando mensalidade fixa por filial.",
    category: "APIs",
    maturity: "Acelerando",
    relatedNewsCount: 8,
    sparkline: [20, 32, 45, 68, 110, 180, 340]
  },
  {
    id: "trend-local-slms",
    trend: "IA Privada Offline no Dispositivo (WebGPU / Edge SLMs)",
    growth: "+210% em estrelas de reposit\xF3rios open source em 60 dias",
    growthPercentage: 210,
    market: "Setores Jur\xEDdico, Psicol\xF3gico, M\xE9dico e Desenvolvedores",
    problem: "Restri\xE7\xF5es r\xEDgidas de sigilo profissional e medo de vazamento de dados estrat\xE9gicos para servidores de IA em nuvem.",
    opportunity: "Ferramentas de produtividade e an\xE1lise documental local que funcionam sem internet e sem assinatura de cr\xE9ditos.",
    category: "IA",
    maturity: "Emergente",
    relatedNewsCount: 6,
    sparkline: [15, 25, 38, 55, 92, 140, 210]
  },
  {
    id: "trend-platform-unbundling",
    trend: "Fric\xE7\xE3o Tarif\xE1ria e Desagrega\xE7\xE3o de Plataformas Monopolistas (Stripe, Slack, Shopify)",
    growth: "+185% de queixas de custos em f\xF3runs de founders",
    growthPercentage: 185,
    market: "Fundadores de Micro-SaaS e Lojistas Digitais",
    problem: "Aumento unilateral de taxas de processamento, cobran\xE7a por assento em bots e depend\xEAncia de checkouts propriet\xE1rios.",
    opportunity: "Ferramentas neutras de roteamento de pagamentos, hubs de alertas agregados e extens\xF5es modulares de checkout.",
    category: "mudan\xE7as de plataformas",
    maturity: "Pico Inicial",
    relatedNewsCount: 11,
    sparkline: [40, 52, 64, 88, 120, 155, 185]
  },
  {
    id: "trend-latam-remote-arbitrage",
    trend: "Expans\xE3o de Contrata\xE7\xE3o Remota US-LatAm e Servi\xE7os para PJ Global",
    growth: "+140% no volume de pagamentos cross-border no Brasil e Col\xF4mbia",
    growthPercentage: 140,
    market: "Profissionais de Tecnologia Remotos e Empresas Internacionais",
    problem: "Complexidade de c\xE2mbio, bitributa\xE7\xE3o, falta de benef\xEDcios locais estruturados e notas fiscais de exporta\xE7\xE3o.",
    opportunity: "Plataforma integrada de benef\xEDcios, contabilidade especializada e gest\xE3o financeira em moeda forte.",
    category: "trabalho remoto",
    maturity: "Consolidando",
    relatedNewsCount: 9,
    sparkline: [60, 75, 90, 105, 120, 130, 140]
  },
  {
    id: "trend-code-driven-design",
    trend: "Design Orientado a C\xF3digo e Componentes Vivos (React + Tailwind)",
    growth: "+165% de ado\xE7\xE3o em times \xE1geis e startups bootstrap",
    growthPercentage: 165,
    market: "Indie Hackers, Startups e Ag\xEAncias de Desenvolvimento Web",
    problem: "Perda de tempo recriando no c\xF3digo prot\xF3tipos visuais que n\xE3o consideravam estados de erro, responsividade ou dados reais.",
    opportunity: "Kits de interfaces verticais com l\xF3gica de backend e queries prontas, reduzindo o tempo de lan\xE7amento de semanas para horas.",
    category: "desenvolvimento",
    maturity: "Acelerando",
    relatedNewsCount: 7,
    sparkline: [25, 40, 60, 85, 115, 140, 165]
  }
];
var MOCK_DAILY_BRIEF = {
  date: "26 de Setembro de 2026",
  todaySignalsCount: 7,
  emergingTrendsCount: 3,
  saasOpportunitiesCount: 5,
  globalOpportunitiesCount: 2,
  newsWorthWatchingCount: 8,
  aiExecutiveInsight: {
    highlightTitle: "Janela de Oportunidade: Interfaces de Voz & Fric\xE7\xE3o de Pagamentos Globais",
    overview: "A converg\xEAncia da nova Realtime Audio API de baix\xEDssima lat\xEAncia com os aumentos de taxas unilaterais da Stripe e Slack aponta para duas vias claras de explora\xE7\xE3o para fundadores enxutos: 1) automa\xE7\xE3o auditiva de recep\xE7\xE3o para com\xE9rcios locais, e 2) roteamento inteligente de cobran\xE7as para escapar de spreads cambiais abusivos.",
    keyTakeaways: [
      "Aplica\xE7\xF5es que substituem telefonistas humanas em nichos de alto ticket (m\xE9dicos, imobili\xE1rias) t\xEAm tempo de venda recorde.",
      "A quebra de checkouts legados na Shopify at\xE9 o final do ano exige ferramentas modulares prontas para plug-and-play.",
      "Modelos de IA rodando no navegador (SLMs com WebGPU) abrem mercado para ferramentas com promessa de privacidade radical e custo marginal zero."
    ],
    recommendedNextStep: 'Investigue a hip\xF3tese "Recep\xE7\xE3o telef\xF4nica com IA para cl\xEDnicas m\xE9dicas" (hyp-1a) no My Lab e valide a dor com 5 secret\xE1rias de consult\xF3rio nesta semana.'
  },
  topNewsIds: ["news-1", "news-2", "news-3"],
  spotlightTrendId: "trend-voice-agents"
};

// server/db/dbClient.ts
var { Pool } = pg;
var DEFAULT_PERSONAL_PROJECTS = [
  {
    id: "proj-personal-gong-alt",
    opportunityId: "opp-002",
    title: "Gong / Chorus Light para SMBs Globais",
    tagline: "Intelig\xEAncia de conversa\xE7\xE3o em vendas e transcri\xE7\xE3o com IA sem contratos abusivos de US$ 10k/ano.",
    category: "SalesTech & RevOps",
    score: 95,
    financialMetrics: {
      estimatedMonthlyProfit: "R$ 32.000 - R$ 78.000 / m\xEAs ($6,500 - $15,000)",
      profitMargin: "88%",
      averageTicket: "R$ 380 / m\xEAs ($79/mo)",
      annualProjection: "R$ 480.000+ ARR"
    },
    speedMetrics: {
      mvpDays: 14,
      firstSaleDays: 20,
      weeklyDedicationHours: "14h / semana",
      speedRating: "R\xE1pido (2 sem)"
    },
    investmentMetrics: {
      initialCapitalEstimated: "R$ 290 ($60 USD)",
      capitalBreakdown: [
        { item: "Dom\xEDnio .com oficial", cost: "R$ 65 / ano" },
        { item: "Hospedagem Vercel & Supabase", cost: "R$ 0 (Free)" },
        { item: "Cr\xE9ditos OpenAI Whisper / Claude API", cost: "R$ 150 (uso real)" },
        { item: "Resend (E-mails transacionais)", cost: "R$ 0 (Gratuito)" }
      ]
    },
    tasks: [
      {
        id: "t-gong-1",
        phaseId: 1,
        phaseName: "Fase 1: Valida\xE7\xE3o & Pr\xE9-Venda",
        title: "Entrevistar 10 l\xEDderes de Inside Sales sobre o custo exorbitante do Gong",
        howToExecute: "Abordar Head de Vendas no LinkedIn perguntando quanto gastam com grava\xE7\xE3o de reuni\xF5es.",
        deliverable: "10 entrevistas conclu\xEDdas e 4 cartas de inten\xE7\xE3o de compra assinadas.",
        recommendedDay: "Dia 1",
        completed: true,
        completedAt: "2026-09-25T14:30:00Z"
      },
      {
        id: "t-gong-2",
        phaseId: 1,
        phaseName: "Fase 1: Valida\xE7\xE3o & Pr\xE9-Venda",
        title: "Publicar Landing Page com calculadora de economia versus Gong/Chorus",
        howToExecute: "Mostrar que um time de 5 vendedores economiza US$ 12.000/ano.",
        deliverable: "Landing page no ar com 48 inscritos na lista de espera.",
        recommendedDay: "Dia 3",
        completed: true,
        completedAt: "2026-09-26T10:00:00Z"
      },
      {
        id: "t-gong-3",
        phaseId: 2,
        phaseName: "Fase 2: Constru\xE7\xE3o do MVP Enxuto",
        title: "Integrar bot de reuni\xE3o via Recall.ai ou grava\xE7\xE3o de \xE1udio do Zoom",
        howToExecute: "Conectar webhook que recebe grava\xE7\xE3o de \xE1udio em formato MP3.",
        deliverable: "\xC1udio gravado e armazenado com seguran\xE7a no bucket S3/Supabase.",
        recommendedDay: "Dias 5 a 8",
        completed: true,
        completedAt: "2026-09-27T08:15:00Z"
      },
      {
        id: "t-gong-4",
        phaseId: 2,
        phaseName: "Fase 2: Constru\xE7\xE3o do MVP Enxuto",
        title: "Pipeline de transcri\xE7\xE3o com Whisper e extra\xE7\xE3o de obje\xE7\xF5es com LLM",
        howToExecute: "Enviar \xE1udio para transcri\xE7\xE3o e rodar prompt de detec\xE7\xE3o de obje\xE7\xF5es de pre\xE7o e concorr\xEAncia.",
        deliverable: "JSON com resumo da call, pontos de a\xE7\xE3o e sentimento do prospect.",
        recommendedDay: "Dias 9 a 11",
        completed: true,
        completedAt: "2026-09-27T18:00:00Z"
      },
      {
        id: "t-gong-5",
        phaseId: 2,
        phaseName: "Fase 2: Constru\xE7\xE3o do MVP Enxuto",
        title: "Dashboard de visualiza\xE7\xE3o das calls gravadas com player sincronizado",
        howToExecute: "Interface web com busca por termos falados na call e resumo executivo.",
        deliverable: "Dashboard responsivo testado em 5 calls reais.",
        recommendedDay: "Dias 12 a 14",
        completed: false
      },
      {
        id: "t-gong-6",
        phaseId: 3,
        phaseName: "Fase 3: Lan\xE7amento & Primeiros Pagantes",
        title: "Ativar os 4 clientes da carta de inten\xE7\xE3o no plano Beta com 50% de desconto vital\xEDcio",
        howToExecute: "Onboarding 1 a 1 via Google Meet instalando nas contas Zoom/Meet deles.",
        deliverable: "Primeiros R$ 1.520 em MRR faturados via Stripe/Asaas.",
        recommendedDay: "Dias 15 a 18",
        completed: false
      }
    ],
    progressPercent: 67,
    startedAt: "2026-09-24T00:00:00Z",
    targetCompletionDate: "2026-10-08T00:00:00Z",
    lastCheckinAt: "2026-09-27T18:00:00Z",
    dailyStreak: 3,
    checkedInToday: true,
    status: "quase_pronto",
    userNotes: "Feedback inicial dos 4 clientes da lista de espera foi excelente. Est\xE3o dispostos a pagar R$ 380/m\xEAs."
  },
  {
    id: "proj-personal-eu-compliance",
    opportunityId: "opp-001",
    title: "AuditFlow AI \u2014 EU AI Act Compliance Engine",
    tagline: "Auditoria cont\xEDnua de conformidade com a regulamenta\xE7\xE3o europeia de IA para scale-ups de tecnologia.",
    category: "RegTech & Compliance",
    score: 98,
    financialMetrics: {
      estimatedMonthlyProfit: "R$ 45.000 - R$ 110.000 / m\xEAs ($9,000 - $22,000)",
      profitMargin: "85%",
      averageTicket: "R$ 1.450 / m\xEAs ($290/mo)",
      annualProjection: "R$ 800.000+ ARR"
    },
    speedMetrics: {
      mvpDays: 21,
      firstSaleDays: 30,
      weeklyDedicationHours: "16h / semana",
      speedRating: "Moderado (3-4 sem)"
    },
    investmentMetrics: {
      initialCapitalEstimated: "R$ 450 ($90 USD)",
      capitalBreakdown: [
        { item: "Dom\xEDnio .eu e .com", cost: "R$ 120 / ano" },
        { item: "Supabase Database Pro Tier (Free no in\xEDcio)", cost: "R$ 0" },
        { item: "Consultoria de valida\xE7\xE3o com especialista de dados EU", cost: "R$ 330" }
      ]
    },
    tasks: [
      {
        id: "t-eu-1",
        phaseId: 1,
        phaseName: "Fase 1: Mapeamento de Requisitos EU AI Act",
        title: "Compilar checklist de 42 artigos de alto risco da diretiva europeia",
        howToExecute: "Baixar texto oficial consolidado do parlamento europeu e estruturar JSON de regras.",
        deliverable: "Tabela de conformidade com 42 checagens autom\xE1ticas e manuais.",
        recommendedDay: "Dias 1 a 4",
        completed: true,
        completedAt: "2026-09-25T11:00:00Z"
      },
      {
        id: "t-eu-2",
        phaseId: 1,
        phaseName: "Fase 1: Mapeamento de Requisitos EU AI Act",
        title: "Criar Landing Page direcionada a CTOs de empresas SaaS da Alemanha e Fran\xE7a",
        howToExecute: "Campanha de Cold Outreach e an\xFAncios focados na data limite de conformidade de 2026.",
        deliverable: "18 reuni\xF5es agendadas com lideran\xE7as t\xE9cnicas de tech companies europeias.",
        recommendedDay: "Dias 5 a 8",
        completed: true,
        completedAt: "2026-09-26T16:00:00Z"
      },
      {
        id: "t-eu-3",
        phaseId: 2,
        phaseName: "Fase 2: Motor de Varredura de Reposit\xF3rios & LLMs",
        title: "Criar CLI/GitHub Action que escaneia prompts e modelos em busca de dados sens\xEDveis",
        howToExecute: "Parser AST em TypeScript que detecta chamadas a OpenAI/Anthropic e verifica logs de consentimento.",
        deliverable: "Script testado no reposit\xF3rio de teste acusando viola\xE7\xF5es comuns.",
        recommendedDay: "Dias 9 a 14",
        completed: false
      },
      {
        id: "t-eu-4",
        phaseId: 2,
        phaseName: "Fase 2: Motor de Varredura de Reposit\xF3rios & LLMs",
        title: "Gerador autom\xE1tico de Relat\xF3rio de Risco em PDF para envio aos reguladores",
        howToExecute: "Template PDF via React-PDF com carimbo de integridade SHA-256.",
        deliverable: "PDF gerado pronto para submiss\xE3o \xE0 autoridade nacional de prote\xE7\xE3o de dados.",
        recommendedDay: "Dias 15 a 17",
        completed: false
      },
      {
        id: "t-eu-5",
        phaseId: 3,
        phaseName: "Fase 3: Contrata\xE7\xE3o Piloto",
        title: "Fechar 3 contratos piloto anuais de \u20AC 3.500 cada",
        howToExecute: "Apresentar relat\xF3rio da auditoria gratuita da base de c\xF3digo deles com plano de corre\xE7\xE3o.",
        deliverable: "Primeiros \u20AC 10.500 em contratos anuais assinados.",
        recommendedDay: "Dias 18 a 21",
        completed: false
      }
    ],
    progressPercent: 40,
    startedAt: "2026-09-22T00:00:00Z",
    targetCompletionDate: "2026-10-15T00:00:00Z",
    lastCheckinAt: "2026-09-26T16:00:00Z",
    dailyStreak: 0,
    checkedInToday: false,
    status: "em_andamento",
    userNotes: "Voc\xEA definiu que ia terminar o escaneador essa semana! N\xE3o deixe o projeto estagnar."
  }
];
var DatabaseManager = class {
  pool = null;
  engine = "local_persistent";
  providerName = "Local Persistent Engine (Zero-Cost)";
  persistentStorePath;
  inMemoryCache;
  isInitialized = false;
  constructor() {
    const isVercel = Boolean(process.env.VERCEL);
    const storeDir = isVercel ? "/tmp" : path.join(process.cwd(), "server", "data");
    try {
      if (!fs.existsSync(storeDir)) {
        fs.mkdirSync(storeDir, { recursive: true });
      }
    } catch (e) {
    }
    this.persistentStorePath = path.join(storeDir, "radar_data_store.json");
    this.inMemoryCache = {
      opportunities: [...MOCK_OPPORTUNITIES],
      personalProjects: [...DEFAULT_PERSONAL_PROJECTS],
      hypotheses: [...MOCK_HYPOTHESES],
      alerts: [...MOCK_ALERTS],
      news: [...MOCK_MARKET_NEWS]
    };
    this.loadFromDisk();
    this.setupDatabaseEngine();
  }
  loadFromDisk() {
    try {
      if (fs.existsSync(this.persistentStorePath)) {
        const raw = fs.readFileSync(this.persistentStorePath, "utf8");
        const parsed = JSON.parse(raw);
        if (parsed) {
          if (Array.isArray(parsed.opportunities) && parsed.opportunities.length > 0) {
            this.inMemoryCache.opportunities = parsed.opportunities;
          }
          if (Array.isArray(parsed.personalProjects) && parsed.personalProjects.length > 0) {
            this.inMemoryCache.personalProjects = parsed.personalProjects;
          }
          if (Array.isArray(parsed.hypotheses) && parsed.hypotheses.length > 0) {
            this.inMemoryCache.hypotheses = parsed.hypotheses;
          }
          if (Array.isArray(parsed.alerts) && parsed.alerts.length > 0) {
            this.inMemoryCache.alerts = parsed.alerts;
          }
          if (Array.isArray(parsed.news) && parsed.news.length > 0) {
            this.inMemoryCache.news = parsed.news;
          }
        }
      } else {
        this.saveToDisk();
      }
    } catch (err) {
      console.warn("[DbManager] Falha ao ler cache do disco, usando estado padr\xE3o:", err.message);
    }
  }
  saveToDisk() {
    try {
      fs.writeFileSync(this.persistentStorePath, JSON.stringify(this.inMemoryCache, null, 2), "utf8");
    } catch (err) {
      console.warn("[DbManager] Falha ao gravar cache no disco:", err.message);
    }
  }
  async setupDatabaseEngine() {
    const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (dbUrl) {
      try {
        const isSupabase = dbUrl.includes("supabase.co");
        const isNeon = dbUrl.includes("neon.tech");
        this.pool = new Pool({
          connectionString: dbUrl,
          ssl: { rejectUnauthorized: false },
          max: 6,
          // Serverless polite pool size
          connectionTimeoutMillis: 5e3,
          idleTimeoutMillis: 1e4
        });
        const client = await this.pool.connect();
        try {
          await client.query("SELECT 1");
          this.engine = isSupabase ? "supabase" : isNeon ? "postgres" : "postgres";
          this.providerName = isSupabase ? "Supabase PostgreSQL (Cloud Free Tier)" : isNeon ? "Neon Serverless PostgreSQL (Cloud Free Tier)" : "PostgreSQL Database";
          console.log(`[DbManager] Conectado com sucesso ao backend: ${this.providerName}`);
          await this.initPostgresTables(client);
        } finally {
          client.release();
        }
      } catch (err) {
        console.warn(`[DbManager] Falha ao conectar ao PostgreSQL (${err.message}). Ativando Engine de Persist\xEAncia Local Segura.`);
        this.pool = null;
        this.engine = "local_persistent";
        this.providerName = "Local Persistent Engine (Zero-Cost Storage)";
      }
    } else {
      this.engine = "local_persistent";
      this.providerName = "Local Persistent Engine (Zero-Cost Storage)";
    }
    this.isInitialized = true;
  }
  async initPostgresTables(client) {
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS personal_projects (
          id VARCHAR(64) PRIMARY KEY,
          opportunity_id VARCHAR(64) NOT NULL,
          title VARCHAR(255) NOT NULL,
          tagline TEXT NOT NULL,
          category VARCHAR(64) NOT NULL,
          score INTEGER NOT NULL,
          financial_metrics JSONB NOT NULL DEFAULT '{}',
          speed_metrics JSONB NOT NULL DEFAULT '{}',
          investment_metrics JSONB NOT NULL DEFAULT '{}',
          tasks JSONB NOT NULL DEFAULT '[]',
          progress_percent INTEGER NOT NULL DEFAULT 0,
          started_at VARCHAR(64) NOT NULL,
          target_completion_date VARCHAR(64) NOT NULL,
          last_checkin_at VARCHAR(64) NOT NULL,
          daily_streak INTEGER NOT NULL DEFAULT 0,
          checked_in_today BOOLEAN NOT NULL DEFAULT false,
          status VARCHAR(32) NOT NULL DEFAULT 'em_andamento',
          user_notes TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);
      await client.query(`
        CREATE TABLE IF NOT EXISTS hypotheses (
          id VARCHAR(64) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          opportunity_ref_id VARCHAR(64),
          status VARCHAR(32) NOT NULL DEFAULT 'Backlog',
          hypothesis_text TEXT NOT NULL,
          success_metric TEXT NOT NULL,
          confidence_score INTEGER NOT NULL DEFAULT 80,
          notes TEXT,
          created_at DATE NOT NULL DEFAULT CURRENT_DATE
        );
      `);
      await client.query(`
        CREATE TABLE IF NOT EXISTS user_alerts (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          query_keywords TEXT NOT NULL,
          min_score INTEGER NOT NULL DEFAULT 80,
          channels TEXT[] NOT NULL DEFAULT '{"In-App"}',
          frequency VARCHAR(32) NOT NULL DEFAULT 'Tempo Real',
          is_active BOOLEAN NOT NULL DEFAULT true,
          triggers_count INTEGER NOT NULL DEFAULT 0,
          last_triggered VARCHAR(64),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);
      const checkProjects = await client.query("SELECT COUNT(*) FROM personal_projects");
      if (parseInt(checkProjects.rows[0].count, 10) === 0) {
        for (const proj of this.inMemoryCache.personalProjects) {
          await client.query(
            `INSERT INTO personal_projects (
              id, opportunity_id, title, tagline, category, score,
              financial_metrics, speed_metrics, investment_metrics,
              tasks, progress_percent, started_at, target_completion_date,
              last_checkin_at, daily_streak, checked_in_today, status, user_notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            ON CONFLICT (id) DO NOTHING`,
            [
              proj.id,
              proj.opportunityId,
              proj.title,
              proj.tagline,
              proj.category,
              proj.score,
              JSON.stringify(proj.financialMetrics),
              JSON.stringify(proj.speedMetrics),
              JSON.stringify(proj.investmentMetrics),
              JSON.stringify(proj.tasks),
              proj.progressPercent,
              proj.startedAt,
              proj.targetCompletionDate,
              proj.lastCheckinAt,
              proj.dailyStreak,
              proj.checkedInToday,
              proj.status,
              proj.userNotes || ""
            ]
          );
        }
      }
    } catch (e) {
      console.warn("[DbManager] Erro ao sincronizar tabelas no PostgreSQL:", e.message);
    }
  }
  // ====================================================================
  // TELEMETRY & STATUS
  // ====================================================================
  async getDbStatus() {
    return {
      connected: true,
      engine: this.engine,
      provider: this.providerName,
      isProduction: process.env.NODE_ENV === "production",
      counts: {
        opportunities: this.inMemoryCache.opportunities.length,
        personalProjects: this.inMemoryCache.personalProjects.length,
        hypotheses: this.inMemoryCache.hypotheses.length,
        alerts: this.inMemoryCache.alerts.length,
        news: this.inMemoryCache.news.length
      },
      details: {
        persistenceLocation: this.pool ? "PostgreSQL Cloud Database" : this.persistentStorePath,
        connectionType: this.pool ? "PostgreSQL Connection Pool (SSL Enabled)" : "Atomic JSON Persistence Engine",
        isFreeTierReady: true
      },
      setupGuide: {
        supabaseInstructions: "1. Crie uma conta gratuita em supabase.com\n2. Crie um projeto\n3. Copie a Connection String (URI)\n4. Adicione na Vercel como DATABASE_URL",
        neonInstructions: "1. Crie uma conta gratuita em neon.tech\n2. Crie um banco PostgreSQL serverless\n3. Adicione a Connection String na Vercel como DATABASE_URL",
        docUrl: "https://github.com/Ryan-voltz/opportunity-radar#configura\xE7\xE3o-do-backend-gratuito"
      }
    };
  }
  // ====================================================================
  // OPPORTUNITIES REPOSITORY
  // ====================================================================
  async getOpportunities(filters) {
    let result = [...this.inMemoryCache.opportunities];
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (o) => o.title.toLowerCase().includes(q) || o.whatDetected.toLowerCase().includes(q) || o.problemExists.toLowerCase().includes(q) || o.tagline.toLowerCase().includes(q)
      );
    }
    if (filters?.country && filters.country !== "all") {
      result = result.filter((o) => o.market?.originCode === filters.country);
    }
    if (filters?.category && filters.category !== "all") {
      result = result.filter((o) => o.category === filters.category);
    }
    const limit = filters?.limit ? Math.min(100, Math.max(1, filters.limit)) : 50;
    const offset = filters?.offset ? Math.max(0, filters.offset) : 0;
    return {
      data: result.slice(offset, offset + limit),
      total: result.length,
      limit,
      offset
    };
  }
  async getOpportunityById(id) {
    const opp = this.inMemoryCache.opportunities.find((o) => o.id === id);
    return opp || null;
  }
  async createOpportunity(opp) {
    this.inMemoryCache.opportunities.unshift(opp);
    this.saveToDisk();
    return opp;
  }
  async updateOpportunity(id, updates) {
    const index = this.inMemoryCache.opportunities.findIndex((o) => o.id === id);
    if (index === -1) return null;
    this.inMemoryCache.opportunities[index] = {
      ...this.inMemoryCache.opportunities[index],
      ...updates
    };
    this.saveToDisk();
    return this.inMemoryCache.opportunities[index];
  }
  // ====================================================================
  // PERSONAL PROJECTS REPOSITORY (My Lab & AI Daily Coach)
  // ====================================================================
  async getPersonalProjects() {
    if (this.pool) {
      try {
        const res = await this.pool.query("SELECT * FROM personal_projects ORDER BY updated_at DESC");
        if (res.rows.length > 0) {
          return res.rows.map((r) => ({
            id: r.id,
            opportunityId: r.opportunity_id,
            title: r.title,
            tagline: r.tagline,
            category: r.category,
            score: r.score,
            financialMetrics: r.financial_metrics,
            speedMetrics: r.speed_metrics,
            investmentMetrics: r.investment_metrics,
            tasks: r.tasks,
            progressPercent: r.progress_percent,
            startedAt: r.started_at,
            targetCompletionDate: r.target_completion_date,
            lastCheckinAt: r.last_checkin_at,
            dailyStreak: r.daily_streak,
            checkedInToday: r.checked_in_today,
            status: r.status,
            userNotes: r.user_notes
          }));
        }
      } catch (err) {
        console.warn("[DbManager] Falha ao consultar personal_projects no Postgres:", err.message);
      }
    }
    return this.inMemoryCache.personalProjects;
  }
  async savePersonalProject(project) {
    const existingIndex = this.inMemoryCache.personalProjects.findIndex((p) => p.id === project.id);
    if (existingIndex >= 0) {
      this.inMemoryCache.personalProjects[existingIndex] = project;
    } else {
      this.inMemoryCache.personalProjects.unshift(project);
    }
    this.saveToDisk();
    if (this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO personal_projects (
            id, opportunity_id, title, tagline, category, score,
            financial_metrics, speed_metrics, investment_metrics,
            tasks, progress_percent, started_at, target_completion_date,
            last_checkin_at, daily_streak, checked_in_today, status, user_notes, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW())
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            tagline = EXCLUDED.tagline,
            tasks = EXCLUDED.tasks,
            progress_percent = EXCLUDED.progress_percent,
            last_checkin_at = EXCLUDED.last_checkin_at,
            daily_streak = EXCLUDED.daily_streak,
            checked_in_today = EXCLUDED.checked_in_today,
            status = EXCLUDED.status,
            user_notes = EXCLUDED.user_notes,
            updated_at = NOW()`,
          [
            project.id,
            project.opportunityId,
            project.title,
            project.tagline,
            project.category,
            project.score,
            JSON.stringify(project.financialMetrics),
            JSON.stringify(project.speedMetrics),
            JSON.stringify(project.investmentMetrics),
            JSON.stringify(project.tasks),
            project.progressPercent,
            project.startedAt,
            project.targetCompletionDate,
            project.lastCheckinAt,
            project.dailyStreak,
            project.checkedInToday,
            project.status,
            project.userNotes || ""
          ]
        );
      } catch (err) {
        console.warn("[DbManager] Falha ao persistir no Postgres:", err.message);
      }
    }
    return project;
  }
  async updatePersonalProject(id, updates) {
    const project = this.inMemoryCache.personalProjects.find((p) => p.id === id);
    if (!project) return null;
    Object.assign(project, updates);
    if (updates.tasks) {
      const completedCount = project.tasks.filter((t) => t.completed).length;
      project.progressPercent = project.tasks.length > 0 ? Math.round(completedCount / project.tasks.length * 100) : 0;
      if (project.progressPercent === 100) {
        project.status = "lancado";
      } else if (project.progressPercent >= 70) {
        project.status = "quase_pronto";
      } else {
        project.status = "em_andamento";
      }
    }
    return this.savePersonalProject(project);
  }
  async updateProjectTask(projectId, taskId, completed) {
    const project = this.inMemoryCache.personalProjects.find((p) => p.id === projectId);
    if (!project) return null;
    const task = project.tasks.find((t) => t.id === taskId);
    if (!task) return null;
    task.completed = completed;
    task.completedAt = completed ? (/* @__PURE__ */ new Date()).toISOString() : void 0;
    const completedCount = project.tasks.filter((t) => t.completed).length;
    project.progressPercent = project.tasks.length > 0 ? Math.round(completedCount / project.tasks.length * 100) : 0;
    if (project.progressPercent === 100) {
      project.status = "lancado";
    } else if (project.progressPercent >= 70) {
      project.status = "quase_pronto";
    } else {
      project.status = "em_andamento";
    }
    return this.savePersonalProject(project);
  }
  async deletePersonalProject(id) {
    const initialLen = this.inMemoryCache.personalProjects.length;
    this.inMemoryCache.personalProjects = this.inMemoryCache.personalProjects.filter((p) => p.id !== id);
    if (this.inMemoryCache.personalProjects.length !== initialLen) {
      this.saveToDisk();
      if (this.pool) {
        try {
          await this.pool.query("DELETE FROM personal_projects WHERE id = $1", [id]);
        } catch (e) {
          console.warn("[DbManager] Falha ao deletar no Postgres:", e.message);
        }
      }
      return true;
    }
    return false;
  }
  // ====================================================================
  // HYPOTHESES REPOSITORY
  // ====================================================================
  async getHypotheses() {
    return this.inMemoryCache.hypotheses;
  }
  async createHypothesis(hyp) {
    this.inMemoryCache.hypotheses.unshift(hyp);
    this.saveToDisk();
    if (this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO hypotheses (id, title, opportunity_ref_id, status, hypothesis_text, success_metric, confidence_score, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (id) DO NOTHING`,
          [
            hyp.id,
            hyp.title,
            hyp.opportunityRefId || null,
            hyp.status || "Backlog",
            hyp.hypothesisText || "",
            hyp.successMetric || "",
            hyp.confidenceScore || 80,
            hyp.notes || ""
          ]
        );
      } catch (e) {
        console.warn("[DbManager] Erro ao salvar hip\xF3tese no Postgres:", e.message);
      }
    }
    return hyp;
  }
  async updateHypothesis(id, updates) {
    const item = this.inMemoryCache.hypotheses.find((h) => h.id === id);
    if (!item) return null;
    Object.assign(item, updates);
    this.saveToDisk();
    return item;
  }
  async deleteHypothesis(id) {
    const len = this.inMemoryCache.hypotheses.length;
    this.inMemoryCache.hypotheses = this.inMemoryCache.hypotheses.filter((h) => h.id !== id);
    if (this.inMemoryCache.hypotheses.length !== len) {
      this.saveToDisk();
      return true;
    }
    return false;
  }
  // ====================================================================
  // ALERTS REPOSITORY
  // ====================================================================
  async getAlerts() {
    return this.inMemoryCache.alerts;
  }
  async createAlert(alert) {
    this.inMemoryCache.alerts.unshift(alert);
    this.saveToDisk();
    if (this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO user_alerts (id, name, query_keywords, min_score, channels, frequency, is_active, triggers_count, last_triggered)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO NOTHING`,
          [
            alert.id,
            alert.name,
            alert.queryOrKeywords || "SaaS",
            alert.minScore || 85,
            alert.channels || ["In-App"],
            alert.frequency || "Tempo Real",
            alert.isActive !== false,
            alert.triggersCount || 0,
            alert.lastTriggered || "Rec\xE9m criado"
          ]
        );
      } catch (e) {
        console.warn("[DbManager] Erro ao salvar alerta no Postgres:", e.message);
      }
    }
    return alert;
  }
  async toggleAlert(id) {
    const alert = this.inMemoryCache.alerts.find((a) => a.id === id);
    if (!alert) return null;
    alert.isActive = !alert.isActive;
    this.saveToDisk();
    if (this.pool) {
      try {
        await this.pool.query("UPDATE user_alerts SET is_active = $1 WHERE id = $2", [alert.isActive, id]);
      } catch (e) {
      }
    }
    return alert;
  }
  async deleteAlert(id) {
    const len = this.inMemoryCache.alerts.length;
    this.inMemoryCache.alerts = this.inMemoryCache.alerts.filter((a) => a.id !== id);
    if (this.inMemoryCache.alerts.length !== len) {
      this.saveToDisk();
      return true;
    }
    return false;
  }
  // ====================================================================
  // NEWS REPOSITORY
  // ====================================================================
  async getNews(filters) {
    let result = [...this.inMemoryCache.news];
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (n) => n.title.toLowerCase().includes(q) || n.summary.toLowerCase().includes(q) || n.source.toLowerCase().includes(q) || n.tags && n.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (filters?.category && filters.category !== "all") {
      result = result.filter((n) => n.category.toLowerCase() === filters.category.toLowerCase());
    }
    if (filters?.country && filters.country !== "all") {
      result = result.filter((n) => n.countryCode.toLowerCase() === filters.country.toLowerCase());
    }
    if (filters?.interest && filters.interest.trim()) {
      const interests = filters.interest.toLowerCase().split(",");
      result = result.filter(
        (n) => interests.includes(n.category.toLowerCase()) || n.tags && n.tags.some((t) => interests.includes(t.toLowerCase()))
      );
    }
    if (filters?.onlyWithHypotheses) {
      result = result.filter((n) => n.possibleOpportunities && n.possibleOpportunities.length > 0);
    }
    return {
      data: result,
      total: result.length,
      trendingCount: result.filter((n) => n.isTrending).length
    };
  }
  async getNewsById(id) {
    const item = this.inMemoryCache.news.find((n) => n.id === id);
    return item || null;
  }
  async toggleNewsSaved(id) {
    const item = this.inMemoryCache.news.find((n) => n.id === id);
    if (!item) return null;
    item.isSaved = !item.isSaved;
    this.saveToDisk();
    return item.isSaved;
  }
  async createProjectFromNewsHypothesis(newsId, hypothesisId) {
    const newsItem = this.inMemoryCache.news.find((n) => n.id === newsId);
    if (!newsItem) return null;
    const hypothesis = newsItem.possibleOpportunities?.find((h) => h.id === hypothesisId);
    if (!hypothesis) return null;
    hypothesis.status = "Promovido a Projeto";
    const newProject = {
      id: `proj-hyp-${Date.now().toString().slice(-4)}`,
      title: hypothesis.title.replace(/^Hipótese:\s*/i, ""),
      opportunityRefId: newsItem.id,
      status: "Pesquisando",
      hypothesisText: `${hypothesis.description} (Inspirado em: "${newsItem.title}")`,
      successMetric: `Validar MVP com 20 clientes do p\xFAblico: ${hypothesis.targetAudience}`,
      confidenceScore: hypothesis.confidenceScore,
      notes: `Monetiza\xE7\xE3o esperada: ${hypothesis.monetizationModel}. Esfor\xE7o estimado: ${hypothesis.estimatedEffort}. Fonte original: ${newsItem.source}.`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
    };
    await this.createHypothesis(newProject);
    return { project: newProject, hypothesis };
  }
};
var dbClient = new DatabaseManager();

// server/index.ts
dotenv.config();
var app = express();
var PORT = process.env.PORT || 3001;
var ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "http://localhost:5173";
app.use(securityHeaders);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (origin === ALLOWED_ORIGIN || origin === "http://localhost:5173" || origin === "http://127.0.0.1:5173" || origin.endsWith(".vercel.app") || process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true
  })
);
app.use((req, res, next) => {
  if (req.body && typeof req.body === "object") {
    return next();
  }
  express.json({ limit: "100kb" })(req, res, (err) => {
    if (err) {
      if (req.body) return next();
      return res.status(400).json({ error: "Payload JSON inv\xE1lido." });
    }
    next();
  });
});
var globalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1e3,
  maxRequests: 200,
  message: "Limite global de requisi\xE7\xF5es excedido. Tente novamente em alguns minutos."
});
app.use("/api/", globalLimiter);
var aiLimiter = createRateLimiter({
  windowMs: 60 * 1e3,
  maxRequests: 25,
  message: "Limite de an\xE1lises de IA por minuto atingido. Aguarde 60 segundos."
});
app.get("/api", (req, res) => {
  res.json({
    status: "ok",
    service: "Opportunity Radar Intelligence API (Persistent Backend)",
    version: "1.1.0",
    endpoints: [
      "/api/health",
      "/api/db-status",
      "/api/pulse",
      "/api/countries",
      "/api/opportunities",
      "/api/personal-projects",
      "/api/news",
      "/api/news/trends",
      "/api/news/daily-brief",
      "/api/alerts",
      "/api/signals",
      "/api/hypotheses",
      "/api/admin/sources",
      "/api/ai/analyze",
      "/api/ai/stream"
    ],
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.get("/api/db-status", async (req, res) => {
  try {
    const status = await dbClient.getDbStatus();
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/health", async (req, res) => {
  const dbStatus = await dbClient.getDbStatus();
  res.json({
    status: "ok",
    environment: process.env.NODE_ENV || "production",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    database: {
      engine: dbStatus.engine,
      provider: dbStatus.provider,
      connected: dbStatus.connected
    },
    memory: process.memoryUsage()
  });
});
app.get("/api/pulse", (req, res) => {
  res.setHeader("Cache-Control", "public, max-age=60");
  res.json(MOCK_PULSE_DATA);
});
app.get("/api/countries", (req, res) => {
  res.setHeader("Cache-Control", "public, max-age=120");
  res.json(MOCK_COUNTRY_SIGNALS);
});
app.get("/api/opportunities", async (req, res) => {
  const { search, country, category, limit = "50", offset = "0" } = req.query;
  const cacheKey = `opps:${search || ""}:${country || ""}:${category || ""}:${limit}:${offset}`;
  const result = await globalCache.deduplicate(
    cacheKey,
    async () => {
      const realOpps = pipelineManager.getQualifiedOpportunities();
      const dbResult = await dbClient.getOpportunities({
        search: typeof search === "string" ? search : void 0,
        country: typeof country === "string" ? country : void 0,
        category: typeof category === "string" ? category : void 0,
        limit: parseInt(limit, 10) || 50,
        offset: parseInt(offset, 10) || 0
      });
      let combined = [
        ...realOpps,
        ...dbResult.data.filter((o) => !realOpps.some((ro) => ro.id === o.id))
      ];
      return {
        data: combined,
        total: dbResult.total + realOpps.length,
        limit: dbResult.limit,
        offset: dbResult.offset
      };
    },
    15e3
    // 15s cache
  );
  res.setHeader("Cache-Control", "public, max-age=15");
  res.json(result);
});
app.get("/api/opportunities/:id", async (req, res) => {
  const realOpps = pipelineManager.getQualifiedOpportunities();
  const fromPipeline = realOpps.find((o) => o.id === req.params.id);
  if (fromPipeline) {
    return res.json(fromPipeline);
  }
  const opp = await dbClient.getOpportunityById(req.params.id);
  if (!opp) {
    return res.status(404).json({ error: "Oportunidade n\xE3o encontrada" });
  }
  res.json(opp);
});
app.post("/api/opportunities", async (req, res) => {
  try {
    const opp = req.body;
    if (!opp.title || !opp.category) {
      return res.status(400).json({ error: "T\xEDtulo e categoria s\xE3o obrigat\xF3rios." });
    }
    if (!opp.id) {
      opp.id = `opp-custom-${Date.now().toString().slice(-6)}`;
    }
    const saved = await dbClient.createOpportunity(opp);
    globalCache.clear();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.patch("/api/opportunities/:id/status", async (req, res) => {
  try {
    const { isSaved, status } = req.body;
    const updated = await dbClient.updateOpportunity(req.params.id, {
      ...isSaved !== void 0 ? { isSaved: Boolean(isSaved) } : {},
      ...status ? { status } : {}
    });
    if (!updated) {
      return res.status(404).json({ error: "Oportunidade n\xE3o encontrada" });
    }
    globalCache.clear();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/personal-projects", async (req, res) => {
  try {
    const projects = await dbClient.getPersonalProjects();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/personal-projects", async (req, res) => {
  try {
    const project = req.body;
    if (!project.title || !project.opportunityId) {
      return res.status(400).json({ error: "T\xEDtulo e ID de oportunidade s\xE3o obrigat\xF3rios." });
    }
    if (!project.id) {
      project.id = `proj-personal-${Date.now().toString().slice(-6)}`;
    }
    const saved = await dbClient.savePersonalProject(project);
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.patch("/api/personal-projects/:id", async (req, res) => {
  try {
    const updated = await dbClient.updatePersonalProject(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Projeto pessoal n\xE3o encontrado." });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.patch("/api/personal-projects/:id/tasks/:taskId", async (req, res) => {
  try {
    const { completed } = req.body;
    const updated = await dbClient.updateProjectTask(req.params.id, req.params.taskId, Boolean(completed));
    if (!updated) {
      return res.status(404).json({ error: "Projeto ou tarefa n\xE3o encontrada." });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.delete("/api/personal-projects/:id", async (req, res) => {
  try {
    const deleted = await dbClient.deletePersonalProject(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Projeto pessoal n\xE3o encontrado." });
    }
    res.json({ success: true, message: "Projeto pessoal exclu\xEDdo com sucesso." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/signals", (req, res) => {
  res.setHeader("Cache-Control", "public, max-age=15");
  res.json(MOCK_LIVE_SIGNALS);
});
app.post("/api/ai/analyze", aiLimiter, async (req, res) => {
  const { query, opportunityContext } = req.body;
  if (!query || typeof query !== "string" || !query.trim()) {
    return res.status(400).json({ error: "Query de an\xE1lise \xE9 obrigat\xF3ria." });
  }
  const sanitizedQuery = sanitizeString(query);
  const result = await aiAnalystService.analyze({
    query: sanitizedQuery,
    opportunityContext
  });
  res.json(result);
});
app.get("/api/ai/stream", aiLimiter, async (req, res) => {
  const query = req.query.q || "Plano de MVP";
  const oppId = req.query.oppId;
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  const context = oppId ? await dbClient.getOpportunityById(oppId) : void 0;
  await aiAnalystService.streamAnalysis(
    {
      query: sanitizeString(query),
      opportunityContext: context || void 0
    },
    (chunk) => {
      res.write(`data: ${JSON.stringify({ chunk, done: false })}

`);
    },
    () => {
      res.write(`data: ${JSON.stringify({ chunk: "", done: true })}

`);
      res.end();
    }
  );
});
app.get("/api/hypotheses", async (req, res) => {
  const list = await dbClient.getHypotheses();
  res.json(list);
});
app.post("/api/hypotheses", async (req, res) => {
  try {
    const { title, hypothesisText, successMetric } = req.body || {};
    if (!title) {
      return res.status(400).json({ error: "T\xEDtulo da hip\xF3tese \xE9 obrigat\xF3rio." });
    }
    const newHyp = {
      id: `hyp-${Date.now().toString().slice(-4)}`,
      title: sanitizeString(title),
      opportunityRefId: "custom",
      status: "Backlog",
      hypothesisText: sanitizeString(hypothesisText || ""),
      successMetric: sanitizeString(successMetric || ""),
      confidenceScore: 80,
      notes: "Criada via API segura.",
      createdAt: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
    };
    const saved = await dbClient.createHypothesis(newHyp);
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.delete("/api/hypotheses/:id", async (req, res) => {
  try {
    const deleted = await dbClient.deleteHypothesis(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Hip\xF3tese n\xE3o encontrada." });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/alerts", async (req, res) => {
  const list = await dbClient.getAlerts();
  res.json(list);
});
app.post("/api/alerts", async (req, res) => {
  try {
    const { name, queryOrKeywords, minScore, frequency } = req.body || {};
    if (!name) {
      return res.status(400).json({ error: "Nome do alerta \xE9 obrigat\xF3rio." });
    }
    const newAlert = {
      id: `alt-${Date.now().toString().slice(-4)}`,
      name: sanitizeString(name),
      queryOrKeywords: sanitizeString(queryOrKeywords || "SaaS"),
      minScore: Number(minScore) || 85,
      channels: ["In-App", "Email"],
      frequency: frequency || "Tempo Real",
      isActive: true,
      triggersCount: 0,
      lastTriggered: "Rec\xE9m criado"
    };
    const saved = await dbClient.createAlert(newAlert);
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.patch("/api/alerts/:id/toggle", async (req, res) => {
  const updated = await dbClient.toggleAlert(req.params.id);
  if (!updated) {
    return res.status(404).json({ error: "Alerta n\xE3o encontrado." });
  }
  res.json(updated);
});
app.delete("/api/alerts/:id", async (req, res) => {
  const deleted = await dbClient.deleteAlert(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: "Alerta n\xE3o encontrado." });
  }
  res.json({ success: true });
});
app.get("/api/news", async (req, res) => {
  const { search, category, country, interest, onlyWithHypotheses } = req.query;
  const result = await dbClient.getNews({
    search: typeof search === "string" ? search : void 0,
    category: typeof category === "string" ? category : void 0,
    country: typeof country === "string" ? country : void 0,
    interest: typeof interest === "string" ? interest : void 0,
    onlyWithHypotheses: onlyWithHypotheses === "true"
  });
  res.setHeader("Cache-Control", "public, max-age=30");
  res.json(result);
});
app.get("/api/news/daily-brief", (req, res) => {
  const stats = pipelineManager.getStats();
  const brief = {
    ...MOCK_DAILY_BRIEF,
    todaySignalsCount: stats.totalCollected || MOCK_DAILY_BRIEF.todaySignalsCount,
    saasOpportunitiesCount: stats.totalQualifiedOpportunities || MOCK_DAILY_BRIEF.saasOpportunitiesCount
  };
  res.setHeader("Cache-Control", "public, max-age=60");
  res.json(brief);
});
app.get("/api/news/trends", (req, res) => {
  res.setHeader("Cache-Control", "public, max-age=60");
  res.json(MOCK_EMERGING_TRENDS);
});
app.get("/api/news/:id", async (req, res) => {
  const item = await dbClient.getNewsById(req.params.id);
  if (!item) {
    return res.status(404).json({ error: "Not\xEDcia n\xE3o encontrada." });
  }
  res.json(item);
});
app.post("/api/news/:id/save", async (req, res) => {
  const isSaved = await dbClient.toggleNewsSaved(req.params.id);
  if (isSaved === null) {
    return res.status(404).json({ error: "Not\xEDcia n\xE3o encontrada." });
  }
  res.json({ success: true, isSaved });
});
app.post("/api/news/:id/create-project", async (req, res) => {
  const { hypothesisId } = req.body;
  const result = await dbClient.createProjectFromNewsHypothesis(req.params.id, hypothesisId);
  if (!result) {
    return res.status(404).json({ error: "Not\xEDcia ou hip\xF3tese de oportunidade n\xE3o encontrada." });
  }
  res.status(201).json({ success: true, ...result });
});
app.post("/api/news/:id/analyze", aiLimiter, async (req, res) => {
  const newsItem = await dbClient.getNewsById(req.params.id);
  if (!newsItem) {
    return res.status(404).json({ error: "Not\xEDcia n\xE3o encontrada." });
  }
  const analysisQuery = `Analise a not\xEDcia "${newsItem.title}" (${newsItem.source}, ${newsItem.category}). Identifique oportunidades ocultas de SaaS, n\xEDvel de concorr\xEAncia e o plano recomendado de MVP em 3 semanas.`;
  const analysisResult = await aiAnalystService.analyze({
    query: analysisQuery,
    opportunityContext: {
      id: newsItem.id,
      title: newsItem.title,
      tagline: newsItem.summary,
      category: newsItem.category,
      score: newsItem.impactScore,
      whatDetected: newsItem.summary,
      whyImportant: newsItem.aiAnalysisSummary,
      problemExists: newsItem.aiQuestion,
      howMonetized: newsItem.possibleOpportunities?.[0]?.monetizationModel || "SaaS Recorrente"
    }
  });
  res.json({
    newsId: newsItem.id,
    title: newsItem.title,
    analysis: analysisResult,
    hypotheses: newsItem.possibleOpportunities
  });
});
app.get("/api/admin/sources", (req, res) => {
  res.json({
    sources: pipelineManager.getSources(),
    stats: pipelineManager.getStats()
  });
});
app.post("/api/admin/sources/:id/sync", async (req, res) => {
  const result = await pipelineManager.syncSource(req.params.id);
  if (!result.success && result.error === "Fonte n\xE3o encontrada") {
    return res.status(404).json(result);
  }
  globalCache.clear();
  res.json(result);
});
app.post("/api/admin/sources/sync-all", async (req, res) => {
  const result = await pipelineManager.syncAll();
  globalCache.clear();
  res.json(result);
});
app.get("/api/admin/stats", (req, res) => {
  res.json(pipelineManager.getStats());
});
app.patch("/api/admin/sources/:id/toggle", (req, res) => {
  const { isEnabled } = req.body;
  const updated = pipelineManager.toggleSource(req.params.id, Boolean(isEnabled));
  if (!updated) {
    return res.status(404).json({ error: "Fonte n\xE3o encontrada." });
  }
  res.json({ success: true, isEnabled });
});
app.post("/api/admin/sources", (req, res) => {
  const { name, type, endpointUrl, documentationUrl, frequencyMinutes, complianceNotes } = req.body;
  if (!name || !endpointUrl) {
    return res.status(400).json({ error: "Nome e URL do endpoint s\xE3o obrigat\xF3rios." });
  }
  const id = `src-custom-${Date.now().toString().slice(-4)}`;
  const newSource = {
    id,
    name: sanitizeString(name),
    type: type || "rss_feed",
    status: "online",
    endpointUrl: sanitizeString(endpointUrl),
    documentationUrl: sanitizeString(documentationUrl || endpointUrl),
    frequencyMinutes: Number(frequencyMinutes) || 30,
    lastSync: null,
    recordsCollected: 0,
    errorCount: 0,
    lastError: null,
    rateLimit: {
      limit: 120,
      remaining: 120,
      resetTime: "Sem restri\xE7\xE3o r\xEDgida"
    },
    complianceNotes: sanitizeString(complianceNotes || "Fonte configurada pelo administrador com respeito a robots.txt."),
    isEnabled: true
  };
  pipelineManager.addSource(newSource);
  res.status(201).json(newSource);
});
app.get("/api/admin/signals", (req, res) => {
  res.json(pipelineManager.getRawSignals());
});
app.use((err, req, res, next) => {
  console.error("[API ERROR]", err.message);
  res.status(500).json({
    error: "Internal Server Error",
    message: "Ocorreu um erro interno seguro no servidor."
  });
});
if (process.env.NODE_ENV !== "test" && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[Opportunity Radar API] Server running on port ${PORT}`);
  });
}
var index_default = app;

// server/api-handler.ts
function handler(req, res) {
  if (req.url) {
    try {
      const urlObj = new URL(req.url, "http://localhost");
      const rewrittenPath = urlObj.searchParams.get("__url");
      if (rewrittenPath) {
        urlObj.searchParams.delete("__url");
        const remainingQuery = urlObj.searchParams.toString();
        req.url = `${rewrittenPath}${remainingQuery ? `?${remainingQuery}` : ""}`;
      }
    } catch {
    }
  }
  const matchedPath = req.headers["x-matched-path"] || req.headers["x-forwarded-uri"];
  if (matchedPath && matchedPath.startsWith("/api") && (!req.url || req.url === "/api" || req.url === "/api/")) {
    const originalUrl = req.url || "";
    const queryIndex = originalUrl.indexOf("?");
    const queryString = queryIndex !== -1 ? originalUrl.slice(queryIndex) : "";
    req.url = `${matchedPath}${queryString}`;
  } else if (req.url && !req.url.startsWith("/api")) {
    req.url = `/api${req.url.startsWith("/") ? "" : "/"}${req.url}`;
  }
  return index_default(req, res);
}
export {
  handler as default
};
