import { NormalizedSignal } from './types';

export class Deduplicator {
  // Cleans URL to canonical form
  static normalizeUrl(url: string): string {
    try {
      const parsed = new URL(url);
      // Remove tracking parameters
      const paramsToRemove = ['utm_source', 'utm_medium', 'utm_campaign', 'ref', 'source', 'fbclid'];
      paramsToRemove.forEach((p) => parsed.searchParams.delete(p));
      return (parsed.hostname + parsed.pathname).toLowerCase().replace(/\/$/, '');
    } catch {
      return url.toLowerCase().trim();
    }
  }

  // Tokenize and calculate Jaccard similarity between two titles
  static calculateTitleSimilarity(titleA: string, titleB: string): number {
    const cleanWords = (t: string) =>
      new Set(
        t
          .toLowerCase()
          .replace(/[^\w\s]/g, '')
          .split(/\s+/)
          .filter((w) => w.length > 2)
      );

    const setA = cleanWords(titleA);
    const setB = cleanWords(titleB);

    if (setA.size === 0 || setB.size === 0) return 0;

    const intersection = new Set([...setA].filter((x) => setB.has(x)));
    const union = new Set([...setA, ...setB]);

    return intersection.size / union.size;
  }

  // Deduplicate array of normalized signals
  static deduplicate(signals: NormalizedSignal[]): {
    uniqueSignals: NormalizedSignal[];
    duplicatesCount: number;
  } {
    const seenUrls = new Map<string, NormalizedSignal>();
    const uniqueSignals: NormalizedSignal[] = [];
    let duplicatesCount = 0;

    for (const signal of signals) {
      const canonicalUrl = this.normalizeUrl(signal.url);

      // 1. Check exact canonical URL
      if (seenUrls.has(canonicalUrl)) {
        duplicatesCount++;
        // Consolidate cross-source metrics
        const existing = seenUrls.get(canonicalUrl)!;
        existing.metrics.scoreOrUpvotes =
          (existing.metrics.scoreOrUpvotes || 0) + (signal.metrics.scoreOrUpvotes || 0);
        continue;
      }

      // 2. Check title similarity with existing unique items
      let isSimilar = false;
      for (const existing of uniqueSignals) {
        const similarity = this.calculateTitleSimilarity(signal.title, existing.title);
        if (similarity >= 0.70) {
          isSimilar = true;
          duplicatesCount++;
          // Corroborate: add secondary source mention
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
}
