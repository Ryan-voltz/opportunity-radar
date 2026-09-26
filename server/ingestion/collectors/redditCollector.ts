import { NormalizedSignal } from '../types';

export class RedditCollector {
  private userAgent = 'OpportunityRadar/1.0 (Market Intelligence Ingestion; contact@opportunityradar.local)';

  async collectFromSubreddit(subreddit: string = 'SaaS', limit = 12): Promise<NormalizedSignal[]> {
    try {
      // Official public JSON interface provided by Reddit
      const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`;

      const res = await fetch(url, {
        headers: {
          'User-Agent': this.userAgent,
        },
      });

      if (!res.ok) {
        if (res.status === 429) {
          console.warn(`[RedditCollector] Rate limit 429 no subreddit r/${subreddit}.`);
        }
        return [];
      }

      const json = await res.json();
      const children = json.data?.children || [];

      const signals: NormalizedSignal[] = children
        .filter((child: any) => !child.data.stickied && child.data.title)
        .map((child: any) => {
          const item = child.data;
          const text = item.selftext || item.title;

          // Categorize sentiment
          const isFriction =
            item.title.toLowerCase().includes('cancel') ||
            item.title.toLowerCase().includes('hate') ||
            item.title.toLowerCase().includes('alternative') ||
            item.title.toLowerCase().includes('pricing') ||
            item.title.toLowerCase().includes('problem');

          return {
            id: `reddit-${item.id}`,
            title: item.title,
            description: text.slice(0, 300) + (text.length > 300 ? '...' : ''),
            source: `Reddit (r/${subreddit})`,
            sourceType: 'public_endpoint',
            sourceId: `src-reddit-${subreddit.toLowerCase()}`,
            url: `https://www.reddit.com${item.permalink}`,
            publishedAt: new Date(item.created_utc * 1000).toISOString(),
            country: 'Global / US',
            countryFlag: '🌐',
            countryCode: 'GL',
            category: isFriction ? 'Fricção de SaaS' : 'Comunidade & Lançamentos',
            author: item.author,
            signalType: isFriction ? 'friccao_cliente' : 'crescimento_produto',
            metrics: {
              scoreOrUpvotes: item.score || 0,
              commentsCount: item.num_comments || 0,
              sentimentScore: isFriction ? -0.7 : 0.4,
            },
            rawData: {
              ups: item.ups,
              upvote_ratio: item.upvote_ratio,
              link_flair_text: item.link_flair_text,
            },
            dedupFingerprint: `${item.title.toLowerCase().trim()}`,
          };
        });

      return signals;
    } catch (err) {
      console.warn(`[RedditCollector] Falha ao coletar r/${subreddit}:`, (err as Error).message);
      return [];
    }
  }
}

export const redditCollector = new RedditCollector();
