// ═══════════════════════════════════════════════════════
// FINVISOR - Zoom API Route (MVP)
// Server-to-Server OAuth meeting creation
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import {
  createAdvisorMeeting,
  getMeetingDetails,
  getMeetingTranscript,
  generateMeetingSummary,
  processWebhookEvent,
  validateZoomEnvVars,
  ZoomError,
  type ZoomWebhookPayload,
} from '@/lib/zoom';
import { advisorResponse } from '@/lib/anthropic';

interface MeetingRequest {
  topic: string;
  duration?: number;
  scheduledTime?: string;
  studentContext?: string;
}

// Create a new Zoom meeting
export async function POST(request: NextRequest) {
  console.log('[API/Zoom] POST request received');
  
  // Validate environment variables before proceeding
  const { valid, missing } = validateZoomEnvVars();
  if (!valid) {
    console.error('[API/Zoom] Missing environment variables:', missing);
    return NextResponse.json(
      {
        success: false,
        error: `Missing required Zoom environment variables: ${missing.join(', ')}`,
        details: {
          missing,
          hint: 'Ensure ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET, ZOOM_ACCOUNT_ID, and ZOOM_USER_EMAIL are set',
        },
      },
      { status: 400 }
    );
  }

  try {
    const body: MeetingRequest = await request.json();
    const { topic, duration, scheduledTime } = body;

    console.log('[API/Zoom] Creating meeting with params:', { topic, duration, scheduledTime });

    if (!topic) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Meeting topic is required',
        },
        { status: 400 }
      );
    }

    const scheduledDate = scheduledTime ? new Date(scheduledTime) : undefined;

    const meeting = await createAdvisorMeeting(
      topic,
      duration || 30,
      scheduledDate
    );

    console.log('[API/Zoom] Meeting created successfully:', meeting.meetingId);

    return NextResponse.json({
      success: true,
      data: {
        meetingId: meeting.meetingId,
        joinUrl: meeting.joinUrl,
        startUrl: meeting.startUrl,
        password: meeting.password,
        scheduledTime: scheduledDate?.toISOString() || 'instant',
        instructions: [
          'Share the join URL with the student',
          'Use the start URL to begin the meeting as host',
          'Recording and transcription are enabled automatically',
        ],
      },
    });
  } catch (error) {
    console.error('[API/Zoom] Meeting creation failed:', error);

    // Handle ZoomError specifically
    if (error instanceof ZoomError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          details: {
            status: error.status,
            code: error.code,
            zoomMessage: error.zoomMessage,
          },
        },
        { status: error.status }
      );
    }

    // Handle generic errors
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Meeting creation failed',
        details: {
          type: error instanceof Error ? error.name : 'UnknownError',
        },
      },
      { status: 500 }
    );
  }
}

// Get meeting details or transcript
export async function GET(request: NextRequest) {
  console.log('[API/Zoom] GET request received');

  // Validate environment variables
  const { valid, missing } = validateZoomEnvVars();
  if (!valid) {
    return NextResponse.json(
      {
        success: false,
        error: `Missing required Zoom environment variables: ${missing.join(', ')}`,
      },
      { status: 400 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const meetingId = searchParams.get('meetingId');
    const action = searchParams.get('action') || 'details';

    if (!meetingId) {
      return NextResponse.json(
        { success: false, error: 'Meeting ID required' },
        { status: 400 }
      );
    }

    console.log('[API/Zoom] GET action:', { meetingId, action });

    switch (action) {
      case 'details':
        const details = await getMeetingDetails(meetingId);
        return NextResponse.json({
          success: true,
          data: details,
        });

      case 'transcript':
        const transcript = await getMeetingTranscript(meetingId);
        return NextResponse.json({
          success: true,
          data: {
            segments: transcript,
            totalDuration: transcript.length > 0
              ? transcript[transcript.length - 1].end_time
              : 0,
          },
        });

      case 'summary':
        const transcriptForSummary = await getMeetingTranscript(meetingId);
        const summary = await generateMeetingSummary(
          transcriptForSummary,
          searchParams.get('context') || ''
        );
        return NextResponse.json({
          success: true,
          data: summary,
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[API/Zoom] GET error:', error);

    if (error instanceof ZoomError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          details: {
            status: error.status,
            code: error.code,
            zoomMessage: error.zoomMessage,
          },
        },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Request failed',
      },
      { status: 500 }
    );
  }
}

// Real-time transcript analysis during meeting
export async function PUT(request: NextRequest) {
  try {
    const body: {
      transcript: Array<{ speaker: string; text: string }>;
      studentContext: string;
    } = await request.json();

    const { transcript, studentContext } = body;

    // Use Claude to generate real-time insights
    const response = await advisorResponse(transcript, studentContext);

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Transcript analysis error:', error);
    return NextResponse.json(
      { success: false, error: 'Analysis failed' },
      { status: 500 }
    );
  }
}

// Webhook endpoint for Zoom events
export async function PATCH(request: NextRequest) {
  try {
    const payload: ZoomWebhookPayload = await request.json();

    // Verify webhook (in production, verify the signature)
    const event = processWebhookEvent(payload);

    // Handle different event types
    switch (event.event) {
      case 'meeting.started':
        console.log(`Meeting ${event.meetingId} started`);
        break;

      case 'meeting.ended':
        console.log(`Meeting ${event.meetingId} ended`);
        // Could trigger transcript processing here
        break;

      case 'meeting.participant_joined':
        console.log(`Participant joined meeting ${event.meetingId}`);
        break;

      case 'recording.completed':
        console.log(`Recording completed for meeting ${event.meetingId}`);
        break;

      default:
        console.log(`Unhandled event: ${event.event}`);
    }

    return NextResponse.json({
      success: true,
      received: event.event,
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { success: false, error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
