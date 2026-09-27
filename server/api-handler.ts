import type { Request, Response } from 'express';
import app from './index';

/**
 * Serverless function entrypoint for Vercel deployment.
 * Bundled via esbuild into api/index.js during npm run build.
 */
export default function handler(req: Request, res: Response) {
  // Vercel rewrites set x-matched-path to the requested path (e.g., /api/market-news)
  const matchedPath = (req.headers['x-matched-path'] as string) || (req.headers['x-forwarded-uri'] as string);
  
  if (matchedPath && matchedPath.startsWith('/api')) {
    const originalUrl = req.url || '';
    const queryIndex = originalUrl.indexOf('?');
    const queryString = queryIndex !== -1 ? originalUrl.slice(queryIndex) : '';
    req.url = `${matchedPath}${queryString}`;
  } else if (req.url && !req.url.startsWith('/api')) {
    req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
  }
  
  return app(req, res);
}
