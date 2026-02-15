// ═══════════════════════════════════════════════════════
// FINVISOR - Chat API Route
// Integrations: OpenAI (intake), Anthropic (reasoning), Decagon (UX)
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { generateChatResponse, type OpenAIMessage } from '@/lib/openai';
import { startConversation, sendMessage } from '@/lib/decagon';

export const runtime = 'edge';

interface ChatRequest {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  userId?: string;
  conversationId?: string;
  useDecagon?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { messages, userId, conversationId, useDecagon } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages are required' },
        { status: 400 }
      );
    }

    // Check if we should use Decagon for conversational UX
    if (useDecagon && process.env.DECAGON_API_KEY) {
      let convId = conversationId;
      
      // Start new conversation if needed
      if (!convId && userId) {
        const conversation = await startConversation(userId);
        convId = conversation.id;
      }

      if (convId) {
        const lastMessage = messages[messages.length - 1];
        const decagonResponse = await sendMessage(convId, lastMessage.content);

        return NextResponse.json({
          success: true,
          data: {
            content: decagonResponse.response.content,
            conversationId: convId,
            intent: decagonResponse.intent,
            suggestedActions: decagonResponse.suggestedActions,
            provider: 'decagon',
          },
        });
      }
    }

    // Default to OpenAI for the conversational intake
    const openAIMessages: OpenAIMessage[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const response = await generateChatResponse(openAIMessages);

    return NextResponse.json({
      success: true,
      data: {
        content: response.content,
        usage: response.usage,
        provider: 'openai',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// Stream response for better UX
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get('conversationId');

  if (!conversationId) {
    return NextResponse.json(
      { error: 'Conversation ID required' },
      { status: 400 }
    );
  }

  // Return conversation history
  // This would fetch from Decagon or a database
  return NextResponse.json({
    success: true,
    data: {
      conversationId,
      messages: [],
    },
  });
}
