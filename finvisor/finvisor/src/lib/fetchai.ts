// ═══════════════════════════════════════════════════════
// FINVISOR - Fetch.ai Integration
// Sponsor: Fetch.ai - Monetized Agents
// ═══════════════════════════════════════════════════════

import axios from 'axios';

const FETCHAI_API_URL = 'https://agentverse.ai/api/v1';

interface FetchAIAgent {
  address: string;
  name: string;
  description: string;
  protocols: string[];
  status: 'active' | 'inactive';
}

interface AgentMessage {
  sender: string;
  recipient: string;
  content: string;
  protocol: string;
  timestamp: string;
}

interface PaymentRequest {
  id: string;
  amount: number;
  currency: string;
  recipient: string;
  status: 'pending' | 'completed' | 'failed';
  service: string;
}

// Get auth headers for Fetch.ai API
function getAuthHeaders(): Record<string, string> {
  return {
    'Authorization': `Bearer ${process.env.FETCHAI_API_KEY}`,
    'Content-Type': 'application/json',
  };
}

// Register a new Finvisor agent on the network
export async function registerAgent(
  agentConfig: {
    name: string;
    description: string;
    services: string[];
    pricing: Record<string, number>;
  }
): Promise<FetchAIAgent> {
  const response = await axios.post<FetchAIAgent>(
    `${FETCHAI_API_URL}/agents`,
    {
      name: agentConfig.name,
      description: agentConfig.description,
      protocols: ['finvisor/appeal-service', 'payment/uagents'],
      metadata: {
        services: agentConfig.services,
        pricing: agentConfig.pricing,
      },
    },
    { headers: getAuthHeaders() }
  );

  return response.data;
}

// Send a message to another agent
export async function sendAgentMessage(
  recipientAddress: string,
  message: {
    type: 'service_request' | 'service_response' | 'payment_request';
    content: Record<string, unknown>;
  }
): Promise<{ success: boolean; messageId: string }> {
  const response = await axios.post(
    `${FETCHAI_API_URL}/messages`,
    {
      sender: process.env.FETCHAI_AGENT_ADDRESS,
      recipient: recipientAddress,
      protocol: 'finvisor/appeal-service',
      content: message,
    },
    { headers: getAuthHeaders() }
  );

  return response.data;
}

// Request payment for a service
export async function requestPayment(
  userId: string,
  service: 'basic_appeal' | 'pro_appeal' | 'premium_appeal' | 'advisor_session',
  amount: number
): Promise<PaymentRequest> {
  const pricing = {
    basic_appeal: 9,
    pro_appeal: 29,
    premium_appeal: 49,
    advisor_session: 15,
  };

  const response = await axios.post<PaymentRequest>(
    `${FETCHAI_API_URL}/payments/request`,
    {
      recipient: process.env.FETCHAI_AGENT_ADDRESS,
      amount: amount || pricing[service],
      currency: 'USD',
      service,
      metadata: {
        userId,
        service_description: `Finvisor ${service.replace('_', ' ')} service`,
      },
    },
    { headers: getAuthHeaders() }
  );

  return response.data;
}

// Process payment confirmation
export async function confirmPayment(
  paymentId: string
): Promise<{
  confirmed: boolean;
  transaction_hash?: string;
  amount: number;
}> {
  const response = await axios.get(
    `${FETCHAI_API_URL}/payments/${paymentId}`,
    { headers: getAuthHeaders() }
  );

  return {
    confirmed: response.data.status === 'completed',
    transaction_hash: response.data.transaction_hash,
    amount: response.data.amount,
  };
}

// Create service offer on Agentverse marketplace
export async function createServiceOffer(
  service: {
    name: string;
    description: string;
    price: number;
    duration?: number; // in minutes
    deliverables: string[];
  }
): Promise<{ offerId: string; listingUrl: string }> {
  const response = await axios.post(
    `${FETCHAI_API_URL}/marketplace/offers`,
    {
      agent: process.env.FETCHAI_AGENT_ADDRESS,
      service,
      availability: 'always',
      auto_accept: true,
    },
    { headers: getAuthHeaders() }
  );

  return {
    offerId: response.data.id,
    listingUrl: `https://agentverse.ai/services/${response.data.id}`,
  };
}

// Handle incoming service request
export async function handleServiceRequest(
  requestId: string,
  action: 'accept' | 'reject' | 'complete'
): Promise<{ success: boolean; status: string }> {
  const response = await axios.post(
    `${FETCHAI_API_URL}/requests/${requestId}/${action}`,
    {},
    { headers: getAuthHeaders() }
  );

  return response.data;
}

// Get agent analytics
export async function getAgentAnalytics(): Promise<{
  totalRevenue: number;
  completedServices: number;
  activeRequests: number;
  averageRating: number;
  recentTransactions: Array<{
    id: string;
    service: string;
    amount: number;
    timestamp: string;
  }>;
}> {
  const response = await axios.get(
    `${FETCHAI_API_URL}/agents/${process.env.FETCHAI_AGENT_ADDRESS}/analytics`,
    { headers: getAuthHeaders() }
  );

  return response.data;
}

// Discover other agents (e.g., research agents, verification agents)
export async function discoverAgents(
  query: {
    protocol?: string;
    capabilities?: string[];
    maxPrice?: number;
  }
): Promise<FetchAIAgent[]> {
  const response = await axios.get<{ agents: FetchAIAgent[] }>(
    `${FETCHAI_API_URL}/agents/search`,
    {
      headers: getAuthHeaders(),
      params: query,
    }
  );

  return response.data.agents;
}

// Delegate task to specialized agent
export async function delegateTask(
  targetAgent: string,
  task: {
    type: string;
    input: Record<string, unknown>;
    maxBudget: number;
    deadline?: string;
  }
): Promise<{
  delegationId: string;
  estimatedCost: number;
  estimatedTime: number;
}> {
  const response = await axios.post(
    `${FETCHAI_API_URL}/delegations`,
    {
      from: process.env.FETCHAI_AGENT_ADDRESS,
      to: targetAgent,
      task,
    },
    { headers: getAuthHeaders() }
  );

  return response.data;
}

// Finvisor pricing tiers as agent services
export const FINVISOR_SERVICES = {
  basic: {
    name: 'Basic Appeal Package',
    description: 'AI-powered intake, document parsing, gap analysis, and basic appeal letter',
    price: 9,
    deliverables: [
      'Personalized intake conversation',
      'Document parsing and analysis',
      'Gap strategy analysis',
      'Basic appeal letter template',
    ],
  },
  pro: {
    name: 'Pro Appeal Package',
    description: 'Everything in Basic plus research citations, auto-submission, and advisor session',
    price: 29,
    deliverables: [
      'Everything in Basic',
      'Research citations and data',
      'Automated submission via Browserbase',
      '15-minute Zoom advisor session',
    ],
  },
  premium: {
    name: 'Premium Appeal Package',
    description: 'Full-service appeal with counter-offer templates and priority support',
    price: 49,
    deliverables: [
      'Everything in Pro',
      'Counter-offer negotiation templates',
      'Multi-round strategy support',
      'Priority advisor access',
      'Appeal tracking dashboard',
    ],
  },
};

// Create subscription for recurring services
export async function createSubscription(
  userId: string,
  plan: 'basic' | 'pro' | 'premium',
  billingCycle: 'monthly' | 'yearly'
): Promise<{
  subscriptionId: string;
  nextBillingDate: string;
  amount: number;
}> {
  const service = FINVISOR_SERVICES[plan];
  const multiplier = billingCycle === 'yearly' ? 10 : 1; // 2 months free yearly
  
  const response = await axios.post(
    `${FETCHAI_API_URL}/subscriptions`,
    {
      user: userId,
      agent: process.env.FETCHAI_AGENT_ADDRESS,
      plan,
      amount: service.price * multiplier,
      billing_cycle: billingCycle,
    },
    { headers: getAuthHeaders() }
  );

  return response.data;
}
