// ═══════════════════════════════════════════════════════
// FINVISOR - Appeal Letter Generation API Route
// Integrations: Anthropic (generation), Modal (enhancement)
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { generateAppealLetter } from '@/lib/anthropic';
import { enhanceAppealLetter } from '@/lib/modal';

interface AppealRequest {
  studentProfile: {
    name: string;
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
  };
  researchData: Array<{
    query: string;
    result: string;
    source: string;
  }>;
  strategy: string[];
  options?: {
    enhance?: boolean;
    format?: 'plain' | 'markdown' | 'pdf';
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: AppealRequest = await request.json();
    const { studentProfile, researchData, strategy, options } = body;

    // Validate required fields
    if (!studentProfile || !studentProfile.name || !studentProfile.school) {
      return NextResponse.json(
        { error: 'Student profile with name and school required' },
        { status: 400 }
      );
    }

    // Generate appeal letter using Claude
    const result = await generateAppealLetter(
      studentProfile,
      researchData || [],
      strategy || []
    );

    let finalLetter = result.letter;
    let enhancementData = null;

    // Optionally enhance with Modal
    if (options?.enhance && process.env.MODAL_TOKEN_ID) {
      try {
        const enhanced = await enhanceAppealLetter(
          result.letter,
          studentProfile as Record<string, unknown>
        );
        finalLetter = enhanced.enhanced_letter;
        enhancementData = {
          improvements: enhanced.improvements,
          toneScore: enhanced.tone_score,
          persuasionScore: enhanced.persuasion_score,
        };
      } catch (error) {
        console.error('Enhancement error (continuing with original):', error);
      }
    }

    // Format response based on requested format
    let formattedContent = finalLetter;
    if (options?.format === 'markdown') {
      formattedContent = formatAsMarkdown(finalLetter);
    }

    return NextResponse.json({
      success: true,
      data: {
        letter: formattedContent,
        metadata: {
          wordCount: result.metadata.wordCount,
          citationsCount: result.metadata.citationsUsed,
          tone: result.metadata.tone,
          generatedBy: 'anthropic',
        },
        enhancement: enhancementData,
      },
    });
  } catch (error) {
    console.error('Appeal API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Generation failed',
      },
      { status: 500 }
    );
  }
}

// Stream generation for real-time typing effect
export async function PUT(request: NextRequest) {
  try {
    const body: AppealRequest = await request.json();
    
    // For streaming, we'd use a different approach
    // This is a placeholder for the streaming implementation
    const result = await generateAppealLetter(
      body.studentProfile,
      body.researchData || [],
      body.strategy || []
    );

    // Return as streamable response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const words = result.letter.split(' ');
        for (const word of words) {
          controller.enqueue(encoder.encode(word + ' '));
          await new Promise((r) => setTimeout(r, 50)); // Simulate typing
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Streaming error:', error);
    return NextResponse.json(
      { success: false, error: 'Streaming failed' },
      { status: 500 }
    );
  }
}

// Helper to format as markdown
function formatAsMarkdown(letter: string): string {
  // Add markdown formatting
  const lines = letter.split('\n');
  const formatted = lines.map((line) => {
    if (line.startsWith('Dear ')) {
      return `**${line}**\n`;
    }
    if (line.startsWith('Sincerely,')) {
      return `\n---\n\n*${line}*`;
    }
    if (line.match(/^\d+\./)) {
      return `- ${line.substring(line.indexOf('.') + 1).trim()}`;
    }
    return line;
  });

  return formatted.join('\n');
}
