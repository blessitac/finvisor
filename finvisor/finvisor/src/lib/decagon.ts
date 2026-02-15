// ═══════════════════════════════════════════════════════
// FINVISOR - Decagon Integration
// Sponsor: Decagon - Conversational UX
// ═══════════════════════════════════════════════════════

import axios from 'axios';

const DECAGON_API_URL = 'https://api.decagon.ai/v1';

interface DecagonConversation {
  id: string;
  userId: string;
  status: 'active' | 'resolved' | 'escalated';
  messages: DecagonMessage[];
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface DecagonMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sources?: Array<{ title: string; url: string }>;
  actions?: Array<{ type: string; label: string; payload: Record<string, unknown> }>;
}

interface DecagonIntent {
  name: string;
  confidence: number;
  entities: Array<{ name: string; value: string; confidence: number }>;
}

// Get auth headers
function getAuthHeaders(): Record<string, string> {
  return {
    'Authorization': `Bearer ${process.env.DECAGON_API_KEY}`,
    'Content-Type': 'application/json',
  };
}

// Start a new conversation
export async function startConversation(
  userId: string,
  initialContext?: {
    studentProfile?: Record<string, unknown>;
    currentStep?: string;
    previousConversations?: string[];
  }
): Promise<DecagonConversation> {
  const response = await axios.post<DecagonConversation>(
    `${DECAGON_API_URL}/conversations`,
    {
      bot_id: process.env.DECAGON_BOT_ID,
      user_id: userId,
      context: initialContext,
      settings: {
        tone: 'empathetic',
        language: 'en',
        include_sources: true,
        enable_handoff: true,
      },
    },
    { headers: getAuthHeaders() }
  );

  return response.data;
}

// Send a message and get response
export async function sendMessage(
  conversationId: string,
  message: string,
  context?: Record<string, unknown>
): Promise<{
  response: DecagonMessage;
  intent: DecagonIntent;
  suggestedActions: Array<{ label: string; action: string }>;
}> {
  const response = await axios.post<{
    message: DecagonMessage;
    intent: DecagonIntent;
    suggested_actions: Array<{ label: string; action: string }>;
  }>(
    `${DECAGON_API_URL}/conversations/${conversationId}/messages`,
    {
      content: message,
      context,
    },
    { headers: getAuthHeaders() }
  );

  return {
    response: response.data.message,
    intent: response.data.intent,
    suggestedActions: response.data.suggested_actions,
  };
}

// Get conversation history
export async function getConversation(
  conversationId: string
): Promise<DecagonConversation> {
  const response = await axios.get<DecagonConversation>(
    `${DECAGON_API_URL}/conversations/${conversationId}`,
    { headers: getAuthHeaders() }
  );

  return response.data;
}

// Detect user intent
export async function detectIntent(
  text: string
): Promise<DecagonIntent> {
  const response = await axios.post<DecagonIntent>(
    `${DECAGON_API_URL}/intent/detect`,
    {
      bot_id: process.env.DECAGON_BOT_ID,
      text,
    },
    { headers: getAuthHeaders() }
  );

  return response.data;
}

// Get suggested responses
export async function getSuggestedResponses(
  conversationId: string,
  currentMessage: string
): Promise<string[]> {
  const response = await axios.post<{ suggestions: string[] }>(
    `${DECAGON_API_URL}/conversations/${conversationId}/suggestions`,
    {
      message: currentMessage,
      max_suggestions: 3,
    },
    { headers: getAuthHeaders() }
  );

  return response.data.suggestions;
}

// Escalate to human advisor
export async function escalateToHuman(
  conversationId: string,
  reason: string,
  priority: 'low' | 'medium' | 'high' = 'medium'
): Promise<{
  escalationId: string;
  estimatedWaitTime: number;
  queuePosition: number;
}> {
  const response = await axios.post(
    `${DECAGON_API_URL}/conversations/${conversationId}/escalate`,
    {
      reason,
      priority,
      include_context: true,
    },
    { headers: getAuthHeaders() }
  );

  return response.data;
}

// Add knowledge base entry
export async function addKnowledgeEntry(
  entry: {
    question: string;
    answer: string;
    category: string;
    tags: string[];
    sources?: string[];
  }
): Promise<{ entryId: string }> {
  const response = await axios.post(
    `${DECAGON_API_URL}/knowledge`,
    {
      bot_id: process.env.DECAGON_BOT_ID,
      ...entry,
    },
    { headers: getAuthHeaders() }
  );

  return response.data;
}

// Search knowledge base
export async function searchKnowledge(
  query: string,
  filters?: { category?: string; tags?: string[] }
): Promise<Array<{
  question: string;
  answer: string;
  relevance: number;
  sources: string[];
}>> {
  const response = await axios.get<{
    results: Array<{
      question: string;
      answer: string;
      relevance: number;
      sources: string[];
    }>;
  }>(
    `${DECAGON_API_URL}/knowledge/search`,
    {
      headers: getAuthHeaders(),
      params: { query, ...filters },
    }
  );

  return response.data.results;
}

// Get conversation analytics
export async function getConversationAnalytics(
  timeRange: { start: string; end: string }
): Promise<{
  totalConversations: number;
  resolvedCount: number;
  escalatedCount: number;
  averageResolutionTime: number;
  topIntents: Array<{ intent: string; count: number }>;
  satisfactionScore: number;
}> {
  const response = await axios.get(
    `${DECAGON_API_URL}/analytics`,
    {
      headers: getAuthHeaders(),
      params: {
        bot_id: process.env.DECAGON_BOT_ID,
        ...timeRange,
      },
    }
  );

  return response.data;
}

// Train bot with new examples
export async function trainBot(
  examples: Array<{
    input: string;
    expectedIntent: string;
    expectedResponse: string;
  }>
): Promise<{ trainingJobId: string; status: string }> {
  const response = await axios.post(
    `${DECAGON_API_URL}/training`,
    {
      bot_id: process.env.DECAGON_BOT_ID,
      examples,
    },
    { headers: getAuthHeaders() }
  );

  return response.data;
}

// Finvisor-specific conversation intents
export const FINVISOR_INTENTS = [
  {
    name: 'start_appeal',
    examples: [
      'I need to appeal my financial aid',
      'How do I get more financial aid?',
      'My aid package isn\'t enough',
    ],
  },
  {
    name: 'upload_document',
    examples: [
      'I want to upload my W-2',
      'Here are my documents',
      'Where do I submit my tax forms?',
    ],
  },
  {
    name: 'check_status',
    examples: [
      'What\'s the status of my appeal?',
      'Has my appeal been reviewed?',
      'When will I hear back?',
    ],
  },
  {
    name: 'schedule_advisor',
    examples: [
      'Can I talk to someone?',
      'I need to speak with an advisor',
      'Schedule a meeting',
    ],
  },
  {
    name: 'get_help',
    examples: [
      'I\'m stuck',
      'I don\'t understand',
      'Help me with this',
    ],
  },
  {
    name: 'provide_circumstance',
    examples: [
      'My parent lost their job',
      'We have medical expenses',
      'Our income changed',
    ],
  },
];

// Configure Decagon bot for Finvisor
export async function configureFinvisorBot(): Promise<{ success: boolean }> {
  // Add all intents
  for (const intent of FINVISOR_INTENTS) {
    await axios.post(
      `${DECAGON_API_URL}/intents`,
      {
        bot_id: process.env.DECAGON_BOT_ID,
        name: intent.name,
        examples: intent.examples,
      },
      { headers: getAuthHeaders() }
    );
  }

  // Add knowledge base entries for common questions
  const knowledgeEntries = [
    {
      question: 'What documents do I need for a financial aid appeal?',
      answer: 'For a strong appeal, you typically need: W-2 forms showing income changes, FAFSA/aid letter, proof of circumstances (termination letter, medical bills, etc.), and any documentation of changed financial situation.',
      category: 'documents',
      tags: ['appeal', 'documents', 'requirements'],
    },
    {
      question: 'How long does an appeal take?',
      answer: 'Most schools respond to appeals within 2-4 weeks. However, timing can vary by school and volume of appeals. We recommend submitting as early as possible.',
      category: 'timeline',
      tags: ['appeal', 'timeline', 'response'],
    },
    {
      question: 'What are my chances of success?',
      answer: 'Appeals with documented income changes have a 40-60% success rate at top schools. Having strong documentation, clear circumstances, and a well-written letter significantly improves your chances.',
      category: 'success',
      tags: ['appeal', 'success', 'statistics'],
    },
  ];

  for (const entry of knowledgeEntries) {
    await addKnowledgeEntry(entry);
  }

  return { success: true };
}
