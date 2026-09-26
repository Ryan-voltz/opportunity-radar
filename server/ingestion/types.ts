export type SourceType = 'official_api' | 'rss_feed' | 'public_endpoint';
export type SourceStatus = 'online' | 'syncing' | 'rate_limited' | 'error' | 'idle';

export interface IngestionSource {
  id: string;
  name: string;
  type: SourceType;
  status: SourceStatus;
  endpointUrl: string;
  documentationUrl: string;
  frequencyMinutes: number;
  lastSync: string | null;
  recordsCollected: number;
  errorCount: number;
  lastError: string | null;
  rateLimit: {
    limit: number;
    remaining: number;
    resetTime?: string;
  };
  complianceNotes: string; // Proof of adherence to robots.txt and official terms
  isEnabled: boolean;
}

export type SignalType =
  | 'friccao_cliente'
  | 'crescimento_produto'
  | 'demanda_contratacao'
  | 'tecnologia_emergente'
  | 'lancamento';

export interface NormalizedSignal {
  id: string; // Unique deduplication hash
  title: string;
  description: string;
  source: string;
  sourceType: SourceType;
  sourceId: string;
  url: string;
  publishedAt: string;
  country?: string;
  countryFlag?: string;
  countryCode?: string;
  category: string;
  author?: string;
  signalType: SignalType;
  metrics: {
    scoreOrUpvotes?: number;
    commentsCount?: number;
    sentimentScore?: number; // -1.0 (frustration) to 1.0 (growth/traction)
    growthRate?: number;
    reputationScore?: number;
  };
  rawData: Record<string, any>;
  dedupFingerprint: string;
  isOpportunityEligible?: boolean;
}

export interface IngestionStats {
  totalCollected: number;
  totalDeduplicated: number;
  totalQualifiedOpportunities: number;
  activeSourcesCount: number;
  lastPipelineRun: string;
}

export interface OpportunityQualification {
  isEligible: boolean;
  relevanceScore: number; // 0 to 100
  noveltyScore: number;
  urgencyLevel: 'Alta' | 'Média' | 'Normal';
  marketPotential: '$5k - $20k MRR' | '$20k - $80k MRR' | '$80k+ MRR';
  saasPotential: string;
  regionalAdaptability: string;
  eligibilityReason: string;
}
