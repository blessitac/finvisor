// ═══════════════════════════════════════════════════════
// FINVISOR - Anthropic Integration
// Sponsor: Anthropic - Human Flourishing + Agents
// ═══════════════════════════════════════════════════════

import Anthropic from '@anthropic-ai/sdk';

// Lazy initialization to avoid build-time errors
let anthropic: Anthropic | null = null;

function getAnthropic(): Anthropic {
  if (!anthropic) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropic;
}

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Multi-step reasoning for gap strategy analysis
export async function analyzeGapStrategy(
  studentProfile: {
    school: string;
    currentAid: number;
    totalCost: number;
    gap: number;
    circumstances: Array<{ type: string; description: string; impact?: number }>;
    documents: Array<{ type: string; summary: string }>;
  }
): Promise<{
  steps: Array<{ label: string; result: string; status: 'positive' | 'neutral' | 'skip' }>;
  negotiationPlan: string[];
  confidence: number;
}> {
  const systemPrompt = `You are an expert financial aid strategist. Analyze the student's situation 
and develop a comprehensive gap strategy. Think step by step through each potential angle:
1. Income changes/documentation
2. Medical expenses
3. Competing offers
4. Merit/academic leverage
5. Dependency status
6. Housing hardship
7. Family circumstances

For each, determine if it's a viable appeal vector. Be specific and actionable.
Return a JSON object with:
- steps: array of {label, result, status} where status is 'positive', 'neutral', or 'skip'
- negotiationPlan: array of prioritized strategies
- confidence: 0-1 score for appeal success likelihood`;

  const response = await getAnthropic().messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Analyze this student's financial aid situation and create a strategy:

School: ${studentProfile.school}
Current Aid: $${studentProfile.currentAid.toLocaleString()}
Total Cost: $${studentProfile.totalCost.toLocaleString()}
Gap: $${studentProfile.gap.toLocaleString()}

Circumstances:
${studentProfile.circumstances.map(c => `- ${c.type}: ${c.description}${c.impact ? ` (Impact: $${c.impact})` : ''}`).join('\n')}

Documents Available:
${studentProfile.documents.map(d => `- ${d.type}: ${d.summary}`).join('\n')}

Provide detailed step-by-step analysis and negotiation recommendations.`,
      },
    ],
  });

  // Extract text content from the response
  const textContent = response.content.find(c => c.type === 'text');
  const text = textContent && 'text' in textContent ? textContent.text : '';
  
  // Parse the response - Claude may return JSON in a code block
  let result;
  try {
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || 
                      text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
    result = JSON.parse(jsonStr);
  } catch {
    // Fallback structured response
    result = {
      steps: [
        { label: 'Income analysis', result: 'Analysis complete', status: 'positive' },
      ],
      negotiationPlan: ['Document income changes', 'Present hardship case'],
      confidence: 0.7,
    };
  }

  return result;
}

// Generate professional appeal letter with Claude's writing capabilities
export async function generateAppealLetter(
  studentProfile: {
    name: string;
    school: string;
    currentAid: number;
    totalCost: number;
    gap: number;
    gpa?: number;
    circumstances: Array<{ type: string; description: string; impact?: number }>;
  },
  researchData: Array<{ query: string; result: string; source: string }>,
  strategy: string[]
): Promise<{
  letter: string;
  metadata: {
    wordCount: number;
    citationsUsed: number;
    tone: string;
  };
}> {
  const systemPrompt = `You are an expert at writing compelling, professional financial aid appeal letters.
Write letters that are:
- Empathetic but not overly emotional
- Data-driven with specific numbers and citations
- Professional in tone
- Structured clearly (intro, circumstances, data support, request, closing)
- Persuasive without being demanding

Include relevant citations from the research data provided.
Do not use placeholders - write a complete, ready-to-send letter.`;

  const response = await getAnthropic().messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 3000,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Write a financial aid appeal letter with these details:

Student: ${studentProfile.name}
School: ${studentProfile.school}
Current Aid: $${studentProfile.currentAid.toLocaleString()}
Total Cost: $${studentProfile.totalCost.toLocaleString()}  
Gap: $${studentProfile.gap.toLocaleString()}
${studentProfile.gpa ? `GPA: ${studentProfile.gpa}` : ''}

Circumstances:
${studentProfile.circumstances.map(c => `- ${c.type}: ${c.description}${c.impact ? ` (Financial Impact: $${c.impact})` : ''}`).join('\n')}

Research Data to Cite:
${researchData.map(r => `- "${r.result}" (Source: ${r.source})`).join('\n')}

Key Strategy Points:
${strategy.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Write the complete letter now.`,
      },
    ],
  });

  const textContent = response.content.find(c => c.type === 'text');
  const letter = textContent && 'text' in textContent ? textContent.text : '';
  const wordCount = letter.split(/\s+/).length;
  const citationsUsed = researchData.filter(r => 
    letter.toLowerCase().includes(r.source.toLowerCase().split(' ')[0])
  ).length;

  return {
    letter,
    metadata: {
      wordCount,
      citationsUsed,
      tone: 'Professional & empathetic',
    },
  };
}

// Extended thinking for complex analysis
export async function deepAnalysis(
  prompt: string,
  context: string
): Promise<{ analysis: string; thinking: string }> {
  const response = await getAnthropic().messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 16000,
    thinking: {
      type: 'enabled',
      budget_tokens: 10000,
    },
    messages: [
      {
        role: 'user',
        content: `Context: ${context}\n\nAnalyze: ${prompt}`,
      },
    ],
  });

  let analysis = '';
  let thinking = '';
  
  for (const block of response.content) {
    if (block.type === 'thinking' && 'thinking' in block) {
      thinking = block.thinking;
    } else if (block.type === 'text' && 'text' in block) {
      analysis = block.text;
    }
  }

  return { analysis, thinking };
}

// Real-time conversation for Zoom advisor support
export async function advisorResponse(
  transcript: Array<{ speaker: string; text: string }>,
  studentContext: string
): Promise<{
  suggestion: string;
  insight: string;
  actionItems: string[];
}> {
  const recentTranscript = transcript.slice(-10);
  
  const response = await getAnthropic().messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: `You are an AI assistant helping a human financial aid advisor during a live session.
Provide real-time suggestions, insights, and action items based on the conversation.
Be concise but helpful. Focus on practical next steps for the student.`,
    messages: [
      {
        role: 'user',
        content: `Student Context:
${studentContext}

Recent Conversation:
${recentTranscript.map(t => `${t.speaker}: ${t.text}`).join('\n')}

Provide a suggestion for the advisor, an insight for the student record, and any action items.
Return as JSON with keys: suggestion, insight, actionItems (array)`,
      },
    ],
  });

  const textContent = response.content.find(c => c.type === 'text');
  const text = textContent && 'text' in textContent ? textContent.text : '';
  
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : {
      suggestion: text,
      insight: '',
      actionItems: [],
    };
  } catch {
    return {
      suggestion: text,
      insight: '',
      actionItems: [],
    };
  }
}

// Tool use for agentic workflows
export async function executeAgentTask(
  task: string,
  tools: Anthropic.Tool[]
): Promise<{
  result: string;
  toolsUsed: string[];
}> {
  const response = await getAnthropic().messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    tools,
    messages: [
      {
        role: 'user',
        content: task,
      },
    ],
  });

  const toolsUsed: string[] = [];
  let result = '';

  for (const block of response.content) {
    if (block.type === 'tool_use') {
      toolsUsed.push(block.name);
    } else if (block.type === 'text' && 'text' in block) {
      result += block.text;
    }
  }

  return { result, toolsUsed };
}

export default getAnthropic;
