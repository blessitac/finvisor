// ═══════════════════════════════════════════════════════
// FINVISOR - OpenAI Integration
// Sponsor: OpenAI - Core Intelligence
// ═══════════════════════════════════════════════════════

import OpenAI from 'openai';

// Lazy initialization to avoid build-time errors
let openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Creative intake conversation - uses GPT-4 for empathetic interactions
export async function generateChatResponse(
  messages: OpenAIMessage[],
  systemPrompt?: string
): Promise<{ content: string; usage: { tokens: number } }> {
  const systemMessage: OpenAIMessage = {
    role: 'system',
    content: systemPrompt || `You are Finnie, a warm and empathetic AI financial aid advisor. 
Your goal is to help students build the strongest possible appeal for additional financial aid.
Be supportive, professional, and thorough in gathering information about their circumstances.
Ask follow-up questions to understand their full situation. Use emojis sparingly for warmth.
Focus on: school name, current aid amount, tuition cost, and any changed circumstances 
(job loss, medical expenses, housing changes, family situations).`,
  };

  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [systemMessage, ...messages],
    temperature: 0.7,
    max_tokens: 1000,
  });

  return {
    content: response.choices[0]?.message?.content || '',
    usage: {
      tokens: response.usage?.total_tokens || 0,
    },
  };
}

// Document parsing with vision capabilities
export async function parseDocumentWithVision(
  imageBase64: string,
  documentType: string
): Promise<{
  fields: Array<{ key: string; value: string; confidence: number }>;
  rawText: string;
}> {
  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `You are a document parsing expert. Extract structured data from financial documents.
Return a JSON object with "fields" array containing objects with "key", "value", and "confidence" (0-1).
Also include "rawText" with the full text content.
For ${documentType}, focus on relevant financial fields.`,
      },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`,
            },
          },
          {
            type: 'text',
            text: `Parse this ${documentType} document and extract all relevant financial information as structured JSON.`,
          },
        ],
      },
    ],
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(response.choices[0]?.message?.content || '{}');
  return {
    fields: result.fields || [],
    rawText: result.rawText || '',
  };
}

// Embedding generation for semantic search
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const response = await getOpenAI().embeddings.create({
    model: 'text-embedding-3-small',
    input: texts,
  });

  return response.data.map((item) => item.embedding);
}

// Structured data extraction
export async function extractStructuredData(
  text: string,
  schema: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `Extract structured data from the text according to this schema: ${JSON.stringify(schema)}
Return valid JSON matching the schema.`,
      },
      {
        role: 'user',
        content: text,
      },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 1000,
  });

  return JSON.parse(response.choices[0]?.message?.content || '{}');
}

// Function calling for tool use
export async function executeWithTools(
  messages: OpenAIMessage[],
  tools: OpenAI.ChatCompletionTool[]
): Promise<{
  response: string;
  toolCalls?: Array<{ name: string; arguments: Record<string, unknown> }>;
}> {
  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages,
    tools,
    tool_choice: 'auto',
  });

  const message = response.choices[0]?.message;
  const toolCalls = message?.tool_calls
    ?.filter((tc): tc is { type: 'function'; function: { name: string; arguments: string }; id: string } => 
      tc.type === 'function' && 'function' in tc
    )
    .map((tc) => ({
      name: tc.function.name,
      arguments: JSON.parse(tc.function.arguments),
    }));

  return {
    response: message?.content || '',
    toolCalls,
  };
}

export default getOpenAI;
