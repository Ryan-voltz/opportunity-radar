import type { Request, Response } from 'express';
import app from './index';

/**
 * Serverless function entrypoint for Vercel deployment.
 * Bundled via esbuild into api/index.js during npm run build.
 */
export default function handler(req: Request, res: Response) {
  if (req.url) {
    try {
      const urlObj = new URL(req.url, 'http://localhost');
      const rewrittenPath = urlObj.searchParams.get('__url');
      if (rewrittenPath) {
        urlObj.searchParams.delete('__url');
        const remainingQuery = urlObj.searchParams.toString();
        req.url = `${rewrittenPath}${remainingQuery ? `?${remainingQuery}` : ''}`;
      }
    } catch {
      // fallback
    }
  }

  // Vercel rewrites fallback: set from x-matched-path or x-forwarded-uri if still /api
  const matchedPath = (req.headers['x-matched-path'] as string) || (req.headers['x-forwarded-uri'] as string);
  if (matchedPath && matchedPath.startsWith('/api') && (!req.url || req.url === '/api' || req.url === '/api/')) {
    const originalUrl = req.url || '';
    const queryIndex = originalUrl.indexOf('?');
    const queryString = queryIndex !== -1 ? originalUrl.slice(queryIndex) : '';
    req.url = `${matchedPath}${queryString}`;
  } else if (req.url && !req.url.startsWith('/api')) {
    req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
  }
  
  return app(req, res);
}
