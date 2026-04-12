// ─── Campaign Brief ───────────────────────────────────────────────────────────

export interface CampaignBrief {
  assetType: string;          // email | google_ad | facebook_ad | social_post | landing_page | other
  objective: string;          // what it's trying to accomplish
  callToAction: string;       // action the reader should take
  product: string;            // product/service/program being promoted
  uniqueValue: string;        // what makes it unique or valuable
  tone: string;               // professional | warm | urgent | playful | etc.
  successDefinition: string;  // what success looks like for this campaign
}

// ─── ICP ──────────────────────────────────────────────────────────────────────

export interface ICP {
  ageRange: string;
  genderDescription: string;
  location: string;
  professionalContext: string;
  problemsFrustrations: string;
  motivators: string;
  objections: string;
  categoryFamiliarity: string;
  emotionalState: string;
}

// ─── Virtual Persona ──────────────────────────────────────────────────────────

export interface Persona {
  id: string;
  name: string;
  age: number;
  occupation: string;
  motivationLevel: 'low' | 'medium' | 'high';
  skepticismLevel: 'low' | 'medium' | 'high';
  familiarityWithCategory: 'low' | 'medium' | 'high';
  primaryMotivation: string;
  primaryObjection: string;
  emotionalState: string;
  briefDescription: string;
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

export interface PersonaScore {
  personaId: string;
  score: number;
  reason: string;
}

export interface ScoreAggregation {
  averageScore: number;
  scoreDistribution: {
    low: number;    // 1-3
    mid: number;    // 4-6
    high: number;   // 7-10
  };
  topObjections: string[];
  topPositives: string[];
}

// ─── Iteration ────────────────────────────────────────────────────────────────

export interface Iteration {
  iterationNumber: number;
  assetText: string;
  averageScore: number;
  scoreDistribution: {
    low: number;
    mid: number;
    high: number;
  };
  topObjections: string[];
  topPositives: string[];
  diagnosticReport: string;
  personaScores: PersonaScore[];
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ─── App Phase ────────────────────────────────────────────────────────────────

export type Phase = 'brief' | 'audience' | 'optimizing' | 'results';

// ─── Optimization State ───────────────────────────────────────────────────────

export interface OptimizationState {
  currentIteration: number;
  currentPersonaIndex: number;
  totalPersonas: number;
  phase: 'scoring' | 'aggregating' | 'diagnosing' | 'refining' | 'done';
  runningScore: number;
  completedPersonas: number;
}

// ─── API Request/Response shapes ──────────────────────────────────────────────

export interface BriefAgentRequest {
  messages: ChatMessage[];
}

export interface BriefAgentResponse {
  reply: string;
  brief?: CampaignBrief;
  complete: boolean;
}

export interface AudienceAgentRequest {
  messages: ChatMessage[];
  brief: CampaignBrief;
}

export interface AudienceAgentResponse {
  reply: string;
  icp?: ICP;
  complete: boolean;
}

export interface GeneratePersonasRequest {
  icp: ICP;
  brief: CampaignBrief;
}

export interface GeneratePersonasResponse {
  personas: Persona[];
}

// ─── Asset Images ─────────────────────────────────────────────────────────────

export interface AssetImage {
  base64: string;   // raw base64 data (no data URL prefix)
  mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
  name: string;
  previewUrl: string; // full data URL for <img> previews
}

export interface ScorePersonaRequest {
  persona: Persona;
  brief: CampaignBrief;
  assetText: string;
  images?: AssetImage[];
}

export interface ScorePersonaResponse {
  score: number;
  reason: string;
}

export interface DiagnosticsRequest {
  assetText: string;
  brief: CampaignBrief;
  personaScores: PersonaScore[];
  personas: Persona[];
  aggregation: ScoreAggregation;
  iterationNumber: number;
  images?: AssetImage[];
}

export interface DiagnosticsResponse {
  report: string;
}

export interface RefineRequest {
  assetText: string;
  brief: CampaignBrief;
  diagnosticReport: string;
  previousScore: number;
}

export interface RefineResponse {
  refinedAsset: string;
}
