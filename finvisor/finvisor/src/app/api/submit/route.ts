// ═══════════════════════════════════════════════════════
// FINVISOR - Auto-Submit API Route
// Integrations: Browserbase (automation)
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import {
  submitFinancialAidAppeal,
  checkSubmissionStatus,
  scrapePortalInfo,
  generateAutomationCode,
} from '@/lib/browserbase';

interface SubmitRequest {
  portalUrl: string;
  credentials: {
    username: string;
    password: string;
  };
  appealData: {
    letterContent: string;
    documents: Array<{ name: string; base64: string }>;
    formFields: Record<string, string>;
  };
  options?: {
    dryRun?: boolean;
    takeScreenshots?: boolean;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: SubmitRequest = await request.json();
    const { portalUrl, credentials, appealData, options } = body;

    // Validate required fields
    if (!portalUrl || !credentials || !appealData?.letterContent) {
      return NextResponse.json(
        { error: 'Portal URL, credentials, and appeal letter required' },
        { status: 400 }
      );
    }

    // Dry run mode - generate automation code without executing
    if (options?.dryRun) {
      const portalType = detectPortalType(portalUrl);
      const code = generateAutomationCode(portalType, appealData);
      
      return NextResponse.json({
        success: true,
        data: {
          mode: 'dry_run',
          portalType,
          generatedCode: code,
          estimatedSteps: countSteps(code),
        },
      });
    }

    // Execute actual submission
    const result = await submitFinancialAidAppeal(
      portalUrl,
      credentials,
      appealData
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          confirmationNumber: result.confirmationNumber,
          submittedAt: new Date().toISOString(),
          screenshots: options?.takeScreenshots ? result.screenshots : [],
          nextSteps: [
            'Save your confirmation number for reference',
            'Expect a response within 2-4 weeks',
            'Check your email and portal for updates',
            'Consider sending a follow-up email in 7-10 days',
          ],
        },
        metadata: {
          provider: 'browserbase',
        },
      });
    }

    return NextResponse.json({
      success: false,
      error: result.error || 'Submission failed',
      data: {
        screenshots: result.screenshots,
      },
    }, { status: 400 });
  } catch (error) {
    console.error('Submit API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Submission failed',
      },
      { status: 500 }
    );
  }
}

// Check submission status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    const status = await checkSubmissionStatus(sessionId);

    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { success: false, error: 'Status check failed' },
      { status: 500 }
    );
  }
}

// Scrape portal info before submission
export async function PUT(request: NextRequest) {
  try {
    const body: {
      portalUrl: string;
      credentials: { username: string; password: string };
    } = await request.json();

    const portalInfo = await scrapePortalInfo(
      body.portalUrl,
      body.credentials
    );

    return NextResponse.json({
      success: true,
      data: portalInfo,
    });
  } catch (error) {
    console.error('Portal scrape error:', error);
    return NextResponse.json(
      { success: false, error: 'Portal scrape failed' },
      { status: 500 }
    );
  }
}

// Helper functions
function detectPortalType(url: string): 'stanford' | 'harvard' | 'generic' {
  if (url.includes('stanford.edu')) return 'stanford';
  if (url.includes('harvard.edu')) return 'harvard';
  return 'generic';
}

function countSteps(code: string): number {
  const actionPatterns = [
    /await page\./g,
    /click\(/g,
    /fill\(/g,
    /navigate/g,
  ];
  
  let count = 0;
  for (const pattern of actionPatterns) {
    const matches = code.match(pattern);
    count += matches ? matches.length : 0;
  }
  
  return count;
}
