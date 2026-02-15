// ═══════════════════════════════════════════════════════
// FINVISOR - Research API Route
// Integrations: Perplexity (research), Modal (batch)
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import {
  researchQuery,
  batchResearch,
  getSchoolComparison,
  researchAidPolicy,
  factCheck,
} from '@/lib/perplexity';

interface ResearchRequest {
  queries?: string[];
  school?: string;
  type?: 'general' | 'policy' | 'comparison' | 'fact_check';
  topic?: 'appeal_process' | 'special_circumstances' | 'deadlines' | 'requirements';
  comparisons?: string[];
  claim?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ResearchRequest = await request.json();
    const { queries, school, type = 'general', topic, comparisons, claim } = body;

    let results;

    switch (type) {
      case 'policy':
        // Research specific school policies
        if (!school || !topic) {
          return NextResponse.json(
            { error: 'School and topic required for policy research' },
            { status: 400 }
          );
        }
        const policyResult = await researchAidPolicy(school, topic);
        results = {
          type: 'policy',
          school,
          topic,
          ...policyResult,
        };
        break;

      case 'comparison':
        // Get peer school comparison data
        if (!school) {
          return NextResponse.json(
            { error: 'School required for comparison' },
            { status: 400 }
          );
        }
        const comparisonResult = await getSchoolComparison(
          school,
          comparisons || ['Harvard', 'Yale', 'Princeton']
        );
        results = {
          type: 'comparison',
          targetSchool: school,
          ...comparisonResult,
        };
        break;

      case 'fact_check':
        // Verify a claim with citations
        if (!claim) {
          return NextResponse.json(
            { error: 'Claim required for fact checking' },
            { status: 400 }
          );
        }
        const factCheckResult = await factCheck(claim);
        results = {
          type: 'fact_check',
          claim,
          ...factCheckResult,
        };
        break;

      case 'general':
      default:
        // Batch research queries
        if (!queries || queries.length === 0) {
          // Generate default queries based on school
          const defaultQueries = school
            ? [
                `${school} average financial aid package 2025`,
                `Financial aid appeal success rate top universities`,
                `${school} financial aid appeal policy`,
                `COBRA insurance average cost 2025`,
                `Peer institution financial aid comparison Ivy+ schools`,
              ]
            : [];

          if (defaultQueries.length === 0) {
            return NextResponse.json(
              { error: 'Queries or school required' },
              { status: 400 }
            );
          }

          results = await batchResearch(defaultQueries);
        } else {
          results = await batchResearch(queries);
        }
        break;
    }

    return NextResponse.json({
      success: true,
      data: results,
      metadata: {
        provider: 'perplexity',
        model: 'sonar-pro',
      },
    });
  } catch (error) {
    console.error('Research API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Research failed',
      },
      { status: 500 }
    );
  }
}

// Single query endpoint for real-time research
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const focus = searchParams.get('focus') as 'academic' | 'news' | 'general' || 'academic';

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter required' },
        { status: 400 }
      );
    }

    const result = await researchQuery(query, focus);

    return NextResponse.json({
      success: true,
      data: {
        query,
        ...result,
      },
      metadata: {
        provider: 'perplexity',
        focus,
      },
    });
  } catch (error) {
    console.error('Research GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Research query failed' },
      { status: 500 }
    );
  }
}
