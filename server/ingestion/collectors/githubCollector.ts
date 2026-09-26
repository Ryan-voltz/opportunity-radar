import { NormalizedSignal } from '../types';

export class GitHubCollector {
  private baseUrl = 'https://api.github.com';

  async collect(limit = 10): Promise<{ signals: NormalizedSignal[]; rateLimitRemaining: number }> {
    try {
      // Official search endpoint for trending repos created in the last 60 days with > 100 stars
      const pastDate = new Date(Date.now() - 60 * 86400000).toISOString().split('T')[0];
      const query = encodeURIComponent(`created:>${pastDate} stars:>80`);
      const url = `${this.baseUrl}/search/repositories?q=${query}&sort=stars&order=desc&per_page=${limit}`;

      const res = await fetch(url, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'OpportunityRadar/1.0 (Market Intelligence Ingestion; contact@opportunityradar.local)',
        },
      });

      const remaining = parseInt(res.headers.get('x-ratelimit-remaining') || '60', 10);

      if (!res.ok) {
        if (res.status === 403) {
          console.warn('[GitHubCollector] Rate limit atingido na API oficial do GitHub.');
        }
        return { signals: [], rateLimitRemaining: remaining };
      }

      const data = await res.json();
      const items = data.items || [];

      const signals: NormalizedSignal[] = items.map((repo: any) => ({
        id: `gh-${repo.id}`,
        title: `${repo.name}: ${repo.description || 'Novo repositório acelerando no GitHub'}`,
        description: repo.description || 'Sem descrição detalhada.',
        source: 'GitHub API (Official)',
        sourceType: 'official_api',
        sourceId: 'src-github',
        url: repo.html_url,
        publishedAt: repo.created_at,
        country: 'Global',
        countryFlag: '🌐',
        countryCode: 'GL',
        category: 'Tecnologia Emergente',
        author: repo.owner?.login,
        signalType: 'tecnologia_emergente',
        metrics: {
          scoreOrUpvotes: repo.stargazers_count,
          commentsCount: repo.open_issues_count,
          growthRate: repo.forks_count,
          sentimentScore: 0.8,
        },
        rawData: {
          language: repo.language,
          stars: repo.stargazers_count,
          topics: repo.topics,
        },
        dedupFingerprint: `${repo.name.toLowerCase()} ${repo.html_url.toLowerCase()}`,
      }));

      return { signals, rateLimitRemaining: remaining };
    } catch (err) {
      console.warn('[GitHubCollector] Falha ao coletar dados reais:', (err as Error).message);
      return { signals: [], rateLimitRemaining: 60 };
    }
  }
}

export const githubCollector = new GitHubCollector();
