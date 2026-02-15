// ═══════════════════════════════════════════════════════
// FINVISOR - Type Definitions
// ═══════════════════════════════════════════════════════

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    provider?: 'openai' | 'anthropic' | 'decagon';
    tokens?: number;
    latency?: number;
  };
}

export interface Document {
  id: string;
  type: 'w2' | 'fafsa' | 'aid_letter' | 'tax_return' | 'other';
  name: string;
  status: 'uploading' | 'parsing' | 'parsed' | 'error';
  parsedData?: ParsedDocumentData;
  rawContent?: string;
  createdAt: Date;
}

export interface ParsedDocumentData {
  type: string;
  fields: DocumentField[];
  confidence: number;
  rawExtraction?: Record<string, unknown>;
}

export interface DocumentField {
  key: string;
  value: string;
  flag?: boolean;
  confidence?: number;
}

export interface StudentProfile {
  id: string;
  school: string;
  currentAid: number;
  totalCost: number;
  gap: number;
  gpa?: number;
  circumstances: Circumstance[];
  documents: Document[];
}

export interface Circumstance {
  type: 'job_loss' | 'medical' | 'divorce' | 'death' | 'housing' | 'other';
  description: string;
  financialImpact?: number;
  date?: string;
}

export interface StrategyStep {
  id: string;
  label: string;
  result?: string;
  status: 'pending' | 'thinking' | 'done' | 'skipped';
  color?: string;
}

export interface ResearchResult {
  id: string;
  query: string;
  result: string;
  source: string;
  status: 'searching' | 'found' | 'error';
  citations?: Citation[];
}

export interface Citation {
  title: string;
  url: string;
  snippet: string;
}

export interface AppealLetter {
  id: string;
  content: string;
  status: 'generating' | 'complete' | 'error';
  metadata: {
    wordCount: number;
    citationsCount: number;
    tone: string;
    generatedBy: 'anthropic' | 'openai';
  };
}

export interface SubmissionStep {
  id: string;
  icon: string;
  text: string;
  status: 'pending' | 'running' | 'done' | 'error';
}

export interface ZoomSession {
  id: string;
  meetingId?: string;
  status: 'connecting' | 'live' | 'ended';
  transcript: TranscriptEntry[];
  insights: string[];
  startTime?: Date;
  endTime?: Date;
}

export interface TranscriptEntry {
  id: string;
  speaker: 'Advisor' | 'Student';
  text: string;
  timestamp: Date;
}

export interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  popular?: boolean;
}

export interface AgentTransaction {
  id: string;
  type: 'service_request' | 'payment' | 'completion';
  amount?: number;
  status: 'pending' | 'completed' | 'failed';
  agentAddress?: string;
  timestamp: Date;
}

export interface AnalyticsData {
  appealsFiled: number;
  successRate: number;
  avgAidIncrease: number;
  revenue: number;
  activeUsers: number;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    provider: string;
    latency: number;
    tokensUsed?: number;
  };
}
