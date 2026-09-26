import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../server/index';

/**
 * Vercel Serverless Function entry point for Opportunity Radar API.
 * Bridges serverless HTTP requests with the Express application.
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  // Ensure path starts with /api so Express routes match seamlessly
  if (req.url && !req.url.startsWith('/api')) {
    req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
  }
  return app(req, res);
}
