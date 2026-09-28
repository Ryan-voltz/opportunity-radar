import {
  Opportunity,
  OpportunityPulseData,
  CountryMarketSignal,
  LiveSignal,
} from '../types';

import {
  MOCK_OPPORTUNITIES,
  MOCK_PULSE_DATA,
  MOCK_COUNTRY_SIGNALS,
  MOCK_LIVE_SIGNALS,
} from '../data/mockData';
import { API_BASE_URL } from './apiConfig';

// In-Memory Client Request Cache & In-Flight Collapser
const clientCache = new Map<string, { data: any; expiry: number }>();
const inFlightRequests = new Map<string, Promise<any>>();

export class ApiClient {
  private static async request<T>(
    endpoint: string,
    options?: RequestInit,
    ttlMs: number = 60000,
    fallbackData?: T
  ): Promise<T> {
    const cacheKey = `${options?.method || 'GET'}:${endpoint}`;

    // 1. Check client cache
    const cached = clientCache.get(cacheKey);
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }

    // 2. Request deduplication
    if (inFlightRequests.has(cacheKey)) {
      return inFlightRequests.get(cacheKey);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s client timeout

    const fetchPromise = (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }

        const data = await response.json();
        clientCache.set(cacheKey, { data, expiry: Date.now() + ttlMs });
        return data as T;
      } catch (err) {
        clearTimeout(timeoutId);
        // Graceful fallback to static seed if server is offline or unreachable
        if (fallbackData !== undefined) {
          console.warn(`[ApiClient] Usando fallback local para ${endpoint}:`, (err as Error).message);
          return fallbackData;
        }
        throw err;
      } finally {
        inFlightRequests.delete(cacheKey);
      }
    })();

    inFlightRequests.set(cacheKey, fetchPromise);
    return fetchPromise;
  }

  // Public Methods
  static async getPulse(): Promise<OpportunityPulseData> {
    return this.request<OpportunityPulseData>('/pulse', undefined, 60000, MOCK_PULSE_DATA);
  }

  static async getCountries(): Promise<CountryMarketSignal[]> {
    return this.request<CountryMarketSignal[]>('/countries', undefined, 120000, MOCK_COUNTRY_SIGNALS);
  }

  static async getOpportunities(): Promise<Opportunity[]> {
    const res = await this.request<{ data: Opportunity[] }>(
      '/opportunities',
      undefined,
      60000,
      { data: MOCK_OPPORTUNITIES }
    );
    return res.data || MOCK_OPPORTUNITIES;
  }

  static async getSignals(): Promise<LiveSignal[]> {
    return this.request<LiveSignal[]>('/signals', undefined, 30000, MOCK_LIVE_SIGNALS);
  }

  // Database Status Telemetry
  static async getDbStatus(): Promise<any> {
    return this.request<any>('/db-status', undefined, 10000, {
      connected: true,
      engine: 'local_persistent',
      provider: 'Local Storage Engine (Client-side fallback)',
    });
  }

  // Personal Projects Backend Synchronization
  static async getPersonalProjects(): Promise<any[]> {
    return this.request<any[]>('/personal-projects', undefined, 5000, []);
  }

  static async savePersonalProject(project: any): Promise<any> {
    return this.request<any>(
      '/personal-projects',
      {
        method: 'POST',
        body: JSON.stringify(project),
      },
      0
    );
  }

  static async updateProjectTask(projectId: string, taskId: string, completed: boolean): Promise<any> {
    return this.request<any>(
      `/personal-projects/${projectId}/tasks/${taskId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ completed }),
      },
      0
    );
  }

  static async deletePersonalProject(projectId: string): Promise<any> {
    return this.request<any>(
      `/personal-projects/${projectId}`,
      {
        method: 'DELETE',
      },
      0
    );
  }

  // AI Stream Helper
  static streamAiAnalysis(
    query: string,
    oppId?: string,
    onChunk?: (chunk: string) => void,
    onDone?: () => void
  ): () => void {
    const url = `${API_BASE_URL}/ai/stream?q=${encodeURIComponent(query)}${oppId ? `&oppId=${encodeURIComponent(oppId)}` : ''}`;
    
    // Check if EventSource is supported
    if (typeof EventSource !== 'undefined') {
      const eventSource = new EventSource(url);

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.chunk && onChunk) {
            onChunk(payload.chunk);
          }
          if (payload.done) {
            eventSource.close();
            onDone?.();
          }
        } catch (e) {
          // ignore parsing error
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        onDone?.();
      };

      return () => eventSource.close();
    } else {
      onDone?.();
      return () => {};
    }
  }
}

