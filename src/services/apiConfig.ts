/**
 * Centralized API Base URL configuration for Opportunity Radar.
 * 
 * - In local dev with Vite proxy: defaults to '/api' (proxied to http://localhost:3001)
 * - In Vercel unified deployment: defaults to '/api' (handled by serverless rewrite to api/index.ts)
 * - In decoupled deployment: can be overridden via VITE_API_URL (e.g. 'https://api.opportunityradar.com')
 */
export const API_BASE_URL: string = (import.meta.env.VITE_API_URL as string)?.replace(/\/$/, '') || '/api';
