// ═══════════════════════════════════════════════════════
// FINVISOR - Analytics API Route
// Aggregated data from all integrations
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { getAgentAnalytics } from '@/lib/fetchai';
import { getModalStatus } from '@/lib/modal';
import { getConversationAnalytics } from '@/lib/decagon';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = {
      start: searchParams.get('start') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end: searchParams.get('end') || new Date().toISOString(),
    };

    // Gather analytics from all sources
    const [agentAnalytics, modalStatus, conversationAnalytics] = await Promise.allSettled([
      process.env.FETCHAI_API_KEY ? getAgentAnalytics() : Promise.resolve(null),
      process.env.MODAL_TOKEN_ID ? getModalStatus() : Promise.resolve(null),
      process.env.DECAGON_API_KEY ? getConversationAnalytics(timeRange) : Promise.resolve(null),
    ]);

    // Extract successful results
    const agent = agentAnalytics.status === 'fulfilled' ? agentAnalytics.value : null;
    const modal = modalStatus.status === 'fulfilled' ? modalStatus.value : null;
    const conversations = conversationAnalytics.status === 'fulfilled' ? conversationAnalytics.value : null;

    // Aggregate metrics
    const analytics = {
      overview: {
        totalAppeals: agent?.completedServices || 0,
        successRate: 68, // Would come from tracking actual outcomes
        avgAidIncrease: 8420, // Would be calculated from actual data
        revenue: agent?.totalRevenue || 0,
        activeUsers: conversations?.totalConversations || 0,
      },
      conversations: conversations
        ? {
            total: conversations.totalConversations,
            resolved: conversations.resolvedCount,
            escalated: conversations.escalatedCount,
            avgResolutionTime: conversations.averageResolutionTime,
            satisfaction: conversations.satisfactionScore,
            topIntents: conversations.topIntents,
          }
        : null,
      infrastructure: modal
        ? {
            healthy: modal.healthy,
            activeFunctions: modal.active_functions,
            gpuUtilization: modal.gpu_utilization,
            queueDepth: modal.queue_depth,
          }
        : null,
      payments: agent
        ? {
            totalRevenue: agent.totalRevenue,
            completedServices: agent.completedServices,
            activeRequests: agent.activeRequests,
            averageRating: agent.averageRating,
            recentTransactions: agent.recentTransactions,
          }
        : null,
      sponsors: {
        openai: { status: 'active', usage: 'Chat, Document Parsing' },
        anthropic: { status: 'active', usage: 'Strategy, Appeal Generation' },
        perplexity: { status: 'active', usage: 'Research' },
        browserbase: { status: 'active', usage: 'Auto-Submit' },
        zoom: { status: 'active', usage: 'Advisor Meetings' },
        modal: { status: modal?.healthy ? 'active' : 'inactive', usage: 'Inference' },
        fetchai: { status: 'active', usage: 'Payments' },
        decagon: { status: 'active', usage: 'Conversational UX' },
        vercel: { status: 'active', usage: 'Deployment' },
      },
    };

    return NextResponse.json({
      success: true,
      data: analytics,
      metadata: {
        generatedAt: new Date().toISOString(),
        timeRange,
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Analytics fetch failed',
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      'X-Status': 'healthy',
      'X-Version': '1.0.0',
    },
  });
}
