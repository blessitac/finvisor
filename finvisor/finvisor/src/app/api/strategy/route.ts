// ═══════════════════════════════════════════════════════
// FINVISOR - Gap Strategy API Route
// Integrations: Anthropic (reasoning), Modal (prediction)
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { analyzeGapStrategy, deepAnalysis } from '@/lib/anthropic';
import { predictAppealSuccess } from '@/lib/modal';

interface StrategyRequest {
  studentProfile: {
    school: string;
    currentAid: number;
    totalCost: number;
    gap: number;
    gpa?: number;
    circumstances: Array<{
      type: string;
      description: string;
      impact?: number;
    }>;
    documents: Array<{
      type: string;
      summary: string;
    }>;
  };
  options?: {
    includeExtendedThinking?: boolean;
    includePrediction?: boolean;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: StrategyRequest = await request.json();
    const { studentProfile, options } = body;

    if (!studentProfile || !studentProfile.school) {
      return NextResponse.json(
        { error: 'Student profile with school is required' },
        { status: 400 }
      );
    }

    // Use Anthropic Claude for gap strategy analysis
    const strategyResult = await analyzeGapStrategy(studentProfile);

    // Optional: Get success prediction from Modal
    let prediction = null;
    if (options?.includePrediction && process.env.MODAL_TOKEN_ID) {
      const incomeChange = studentProfile.circumstances.find(
        (c) => c.type === 'job_loss' || c.type === 'income_change'
      );

      prediction = await predictAppealSuccess({
        school_tier: getSchoolTier(studentProfile.school),
        current_aid: studentProfile.currentAid,
        gap_amount: studentProfile.gap,
        income_change_percent: incomeChange?.impact
          ? (incomeChange.impact / studentProfile.currentAid) * 100
          : 0,
        has_medical_hardship: studentProfile.circumstances.some(
          (c) => c.type === 'medical'
        ),
        has_job_loss: studentProfile.circumstances.some(
          (c) => c.type === 'job_loss'
        ),
        has_competing_offers: studentProfile.circumstances.some(
          (c) => c.type === 'competing_offer'
        ),
        gpa: studentProfile.gpa || 3.5,
        document_count: studentProfile.documents.length,
      });
    }

    // Optional: Extended thinking for complex cases
    let extendedAnalysis = null;
    if (options?.includeExtendedThinking) {
      const context = `Student applying to ${studentProfile.school} with a $${studentProfile.gap} gap. 
Circumstances: ${studentProfile.circumstances.map((c) => c.description).join('; ')}`;

      extendedAnalysis = await deepAnalysis(
        'What are the most effective negotiation strategies for this specific case?',
        context
      );
    }

    // Format steps for frontend
    const formattedSteps = strategyResult.steps.map((step, index) => ({
      id: `step-${index}`,
      label: step.label,
      result: step.result,
      status: step.status === 'positive' ? 'done' : step.status === 'skip' ? 'skipped' : 'done',
      color: step.status === 'positive' ? '#34d399' : step.status === 'skip' ? 'rgba(255,255,255,0.45)' : '#fbbf24',
    }));

    return NextResponse.json({
      success: true,
      data: {
        steps: formattedSteps,
        negotiationPlan: strategyResult.negotiationPlan,
        confidence: strategyResult.confidence,
        prediction: prediction
          ? {
              successProbability: prediction.success_probability,
              confidenceInterval: prediction.confidence_interval,
              keyFactors: prediction.key_factors,
            }
          : null,
        extendedAnalysis: extendedAnalysis
          ? {
              analysis: extendedAnalysis.analysis,
              thinking: extendedAnalysis.thinking,
            }
          : null,
      },
      metadata: {
        provider: 'anthropic',
        model: 'claude-sonnet-4-20250514',
      },
    });
  } catch (error) {
    console.error('Strategy API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// Helper function to determine school tier
function getSchoolTier(school: string): number {
  const tiers: Record<string, number> = {
    // Tier 1: Ivy+ (strongest aid programs)
    harvard: 1,
    yale: 1,
    princeton: 1,
    stanford: 1,
    mit: 1,
    columbia: 1,
    penn: 1,
    duke: 1,
    caltech: 1,
    // Tier 2: Top 20
    northwestern: 2,
    uchicago: 2,
    johns_hopkins: 2,
    dartmouth: 2,
    brown: 2,
    cornell: 2,
    vanderbilt: 2,
    rice: 2,
    notre_dame: 2,
    // Tier 3: Top 50
    emory: 3,
    georgetown: 3,
    carnegie_mellon: 3,
    usc: 3,
    ucla: 3,
    berkeley: 3,
    // Default
    default: 4,
  };

  const normalizedSchool = school.toLowerCase().replace(/[^a-z]/g, '_');
  
  for (const [key, tier] of Object.entries(tiers)) {
    if (normalizedSchool.includes(key)) {
      return tier;
    }
  }

  return tiers.default;
}
