import { NormalizedSignal } from '../types';

export class RssCollector {
  private userAgent = 'OpportunityRadar/1.0 (RSS Syndication Reader; contact@opportunityradar.local)';

  // Lightweight native XML extraction
  private extractTags(xml: string, tag: string): string[] {
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
    const matches: string[] = [];
    let match;
    while ((match = regex.exec(xml)) !== null) {
      matches.push(match[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim());
    }
    return matches;
  }

  async collectFeed(
    feedUrl: string,
    sourceName: string,
    sourceId: string,
    category = 'Notícias de Tecnologia',
    signalType: NormalizedSignal['signalType'] = 'lancamento',
    limit = 10
  ): Promise<NormalizedSignal[]> {
    try {
      const res = await fetch(feedUrl, {
        headers: {
          'User-Agent': this.userAgent,
          Accept: 'application/rss+xml, application/xml, text/xml',
        },
      });

      if (!res.ok) {
        throw new Error(`RSS feed returned status ${res.status}`);
      }

      const xmlText = await res.text();

      // Support both RSS (<item>) and Atom (<entry>)
      const isAtom = xmlText.includes('<feed') && xmlText.includes('<entry');
      const blocks = isAtom
        ? xmlText.split(/<entry[^>]*>/i).slice(1)
        : xmlText.split(/<item[^>]*>/i).slice(1);

      const signals: NormalizedSignal[] = [];

      for (let i = 0; i < Math.min(blocks.length, limit); i++) {
        const block = blocks[i];
        const titleMatch = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(block);

        let link = '';
        if (isAtom) {
          const hrefMatch = /<link[^>]+href=["']([^"']+)["']/i.exec(block);
          link = hrefMatch?.[1] || '';
          if (!link) {
            const linkTag = /<link[^>]*>([\s\S]*?)<\/link>/i.exec(block);
            link = linkTag?.[1] || '';
          }
        } else {
          const linkTag = /<link[^>]*>([\s\S]*?)<\/link>/i.exec(block);
          link = linkTag?.[1] || '';
        }

        const descMatch = /<(?:description|summary|content)[^>]*>([\s\S]*?)<\/(?:description|summary|content)>/i.exec(block);
        const dateMatch = /<(?:pubDate|published|updated)[^>]*>([\s\S]*?)<\/(?:pubDate|published|updated)>/i.exec(block);

        const clean = (str?: string) => {
          if (!str) return '';
          return str
            .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&amp;/g, '&')
            .replace(/<[^>]+>/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        };

        const title = clean(titleMatch?.[1]);
        const cleanedLink = clean(link);
        const desc = clean(descMatch?.[1]);
        const date = dateMatch?.[1] ? new Date(dateMatch[1]).toISOString() : new Date().toISOString();

        if (title && cleanedLink) {
          signals.push({
            id: `rss-${Buffer.from(cleanedLink).toString('base64').slice(0, 16)}`,
            title,
            description: desc.slice(0, 300) + (desc.length > 300 ? '...' : ''),
            source: sourceName,
            sourceType: 'rss_feed',
            sourceId,
            url: cleanedLink,
            publishedAt: date,
            country: 'Global',
            countryFlag: '🌐',
            countryCode: 'GL',
            category,
            signalType,
            metrics: {
              sentimentScore: isAtom ? 0.7 : 0.3,
              scoreOrUpvotes: 25,
            },
            rawData: { feedUrl },
            dedupFingerprint: `${title.toLowerCase()} ${cleanedLink.toLowerCase()}`,
          });
        }
      }

      return signals;
    } catch (err) {
      console.warn(`[RssCollector] Falha ao coletar feed ${sourceName}:`, (err as Error).message);
      return [];
    }
  }
}

export const rssCollector = new RssCollector();
