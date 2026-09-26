import { NormalizedSignal } from '../types';

export class HackerNewsCollector {
  private baseUrl = 'https://hacker-news.firebaseio.com/v0';

  async collect(limit = 15): Promise<NormalizedSignal[]> {
    try {
      // 1. Fetch top stories IDs from official public Firebase endpoint
      const res = await fetch(`${this.baseUrl}/topstories.json`, {
        headers: { 'User-Agent': 'OpportunityRadar/1.0 (Market Intelligence Pipeline)' },
      });

      if (!res.ok) {
        throw new Error(`HackerNews API returned ${res.status}`);
      }

      const storyIds: number[] = await res.json();
      const topIds = storyIds.slice(0, limit);

      // 2. Fetch each story concurrently (max limit)
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

      // 3. Normalize items
      const signals: NormalizedSignal[] = rawItems
        .filter((item: any) => item && item.title && !item.deleted)
        .map((item: any) => {
          const isAskOrShow = item.title.startsWith('Ask HN:') || item.title.startsWith('Show HN:');
          const isShow = item.title.startsWith('Show HN:');

          return {
            id: `hn-${item.id}`,
            title: item.title,
            description: item.text || item.title,
            source: 'Hacker News (Official API)',
            sourceType: 'official_api',
            sourceId: 'src-hackernews',
            url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
            publishedAt: new Date(item.time * 1000).toISOString(),
            country: 'Global',
            countryFlag: '🌐',
            countryCode: 'GL',
            category: isShow ? 'Novo Produto' : isAskOrShow ? 'Fricção / Discussão' : 'Tecnologia Emergente',
            author: item.by,
            signalType: isShow ? 'lancamento' : isAskOrShow ? 'friccao_cliente' : 'tecnologia_emergente',
            metrics: {
              scoreOrUpvotes: item.score || 0,
              commentsCount: item.descendants || 0,
              sentimentScore: isShow ? 0.6 : 0.2,
            },
            rawData: item,
            dedupFingerprint: `${item.title.toLowerCase().trim()}`,
          };
        });

      return signals;
    } catch (err) {
      console.warn('[HackerNewsCollector] Falha ao coletar dados reais:', (err as Error).message);
      return [];
    }
  }
}

export const hackerNewsCollector = new HackerNewsCollector();
