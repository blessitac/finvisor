// ═══════════════════════════════════════════════════════
// FINVISOR - Zoom Integration (MVP)
// Server-to-Server OAuth for meeting creation
// ═══════════════════════════════════════════════════════

import axios, { AxiosError } from 'axios';

const ZOOM_API_URL = 'https://api.zoom.us/v2';
const ZOOM_OAUTH_URL = 'https://zoom.us/oauth/token';

// Required environment variables for Zoom S2S OAuth
const REQUIRED_ENV_VARS = [
  'ZOOM_CLIENT_ID',
  'ZOOM_CLIENT_SECRET',
  'ZOOM_ACCOUNT_ID',
  'ZOOM_USER_EMAIL',
] as const;

interface ZoomToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface ZoomMeeting {
  id: number;
  uuid: string;
  host_id: string;
  topic: string;
  start_url: string;
  join_url: string;
  password?: string;
  status: string;
  created_at: string;
}

interface ZoomParticipant {
  id: string;
  user_id: string;
  user_name: string;
  device: string;
  join_time: string;
  leave_time?: string;
}

interface TranscriptSegment {
  speaker_name: string;
  text: string;
  start_time: number;
  end_time: number;
}

// Custom error class for Zoom API errors
export class ZoomError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly zoomMessage?: string;

  constructor(message: string, status: number, code?: string, zoomMessage?: string) {
    super(message);
    this.name = 'ZoomError';
    this.status = status;
    this.code = code;
    this.zoomMessage = zoomMessage;
  }
}

// Validate that all required environment variables are set
export function validateZoomEnvVars(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  
  for (const varName of REQUIRED_ENV_VARS) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }
  
  return {
    valid: missing.length === 0,
    missing,
  };
}

// Get OAuth access token using Server-to-Server OAuth
async function getAccessToken(): Promise<string> {
  console.log('[Zoom] Requesting access token via Server-to-Server OAuth...');
  
  // Validate environment variables
  const { valid, missing } = validateZoomEnvVars();
  if (!valid) {
    throw new ZoomError(
      `Missing required environment variables: ${missing.join(', ')}`,
      400
    );
  }

  const credentials = Buffer.from(
    `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
  ).toString('base64');

  try {
    const response = await axios.post<ZoomToken>(
      ZOOM_OAUTH_URL,
      new URLSearchParams({
        grant_type: 'account_credentials',
        account_id: process.env.ZOOM_ACCOUNT_ID!,
      }),
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    console.log('[Zoom] Access token obtained successfully');
    return response.data.access_token;
  } catch (error) {
    const axiosError = error as AxiosError<{ reason?: string; error?: string }>;
    
    console.error('[Zoom] Token request failed:', {
      status: axiosError.response?.status,
      data: axiosError.response?.data,
    });

    throw new ZoomError(
      'Failed to obtain Zoom access token',
      axiosError.response?.status || 500,
      axiosError.response?.data?.error,
      axiosError.response?.data?.reason
    );
  }
}

// Meeting creation response type
export interface MeetingCreationResult {
  meetingId: number;
  joinUrl: string;
  startUrl: string;
  password: string;
}

// Create a scheduled meeting for advisor session
// Uses /users/{userId}/meetings endpoint for S2S OAuth (not /users/me)
export async function createAdvisorMeeting(
  topic: string,
  duration: number = 30,
  scheduledTime?: Date
): Promise<MeetingCreationResult> {
  console.log('[Zoom] Creating advisor meeting:', { topic, duration, scheduledTime });
  
  const token = await getAccessToken();
  const userEmail = process.env.ZOOM_USER_EMAIL;

  if (!userEmail) {
    throw new ZoomError('ZOOM_USER_EMAIL is required for S2S OAuth', 400);
  }

  // For S2S OAuth, use /users/{userId}/meetings where userId is the email
  const meetingEndpoint = `${ZOOM_API_URL}/users/${encodeURIComponent(userEmail)}/meetings`;
  
  const meetingPayload = {
    topic: `Finvisor Advisory Session: ${topic}`,
    type: scheduledTime ? 2 : 1, // 1 = instant, 2 = scheduled
    start_time: scheduledTime?.toISOString(),
    duration,
    timezone: 'America/Los_Angeles',
    settings: {
      host_video: true,
      participant_video: true,
      join_before_host: false,
      mute_upon_entry: false,
      waiting_room: true,
      audio: 'both',
      auto_recording: 'cloud',
      meeting_authentication: false,
    },
  };

  try {
    const response = await axios.post<ZoomMeeting>(
      meetingEndpoint,
      meetingPayload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('[Zoom] Meeting created successfully:', {
      meetingId: response.data.id,
      topic: response.data.topic,
    });

    return {
      meetingId: response.data.id,
      joinUrl: response.data.join_url,
      startUrl: response.data.start_url,
      password: response.data.password || '',
    };
  } catch (error) {
    const axiosError = error as AxiosError<{ code?: number; message?: string }>;
    
    console.error('[Zoom] Meeting creation failed:', {
      status: axiosError.response?.status,
      data: axiosError.response?.data,
    });

    throw new ZoomError(
      axiosError.response?.data?.message || 'Failed to create Zoom meeting',
      axiosError.response?.status || 500,
      axiosError.response?.data?.code?.toString(),
      axiosError.response?.data?.message
    );
  }
}

// Get meeting details
export async function getMeetingDetails(meetingId: string): Promise<ZoomMeeting> {
  const token = await getAccessToken();

  const response = await axios.get<ZoomMeeting>(
    `${ZOOM_API_URL}/meetings/${meetingId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

// Get meeting participants
export async function getMeetingParticipants(
  meetingId: string
): Promise<ZoomParticipant[]> {
  const token = await getAccessToken();

  const response = await axios.get<{ participants: ZoomParticipant[] }>(
    `${ZOOM_API_URL}/past_meetings/${meetingId}/participants`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data.participants;
}

// Get meeting transcript (after meeting ends)
export async function getMeetingTranscript(
  meetingId: string
): Promise<TranscriptSegment[]> {
  const token = await getAccessToken();

  // Get recordings which include transcripts
  const response = await axios.get<{
    recording_files: Array<{
      file_type: string;
      download_url: string;
      recording_type: string;
    }>;
  }>(
    `${ZOOM_API_URL}/meetings/${meetingId}/recordings`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  // Find transcript file
  const transcriptFile = response.data.recording_files.find(
    f => f.file_type === 'TRANSCRIPT' || f.recording_type === 'audio_transcript'
  );

  if (!transcriptFile) {
    return [];
  }

  // Download transcript
  const transcriptResponse = await axios.get<string>(
    transcriptFile.download_url,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  // Parse VTT or plain transcript format
  return parseTranscript(transcriptResponse.data);
}

// Parse transcript text into segments
function parseTranscript(transcriptText: string): TranscriptSegment[] {
  const segments: TranscriptSegment[] = [];
  const lines = transcriptText.split('\n');
  
  let currentSpeaker = '';
  let currentText = '';
  let startTime = 0;
  let endTime = 0;

  for (const line of lines) {
    // VTT timestamp format: 00:00:00.000 --> 00:00:05.000
    const timeMatch = line.match(/(\d{2}:\d{2}:\d{2}[.,]\d{3}) --> (\d{2}:\d{2}:\d{2}[.,]\d{3})/);
    if (timeMatch) {
      startTime = parseTimestamp(timeMatch[1]);
      endTime = parseTimestamp(timeMatch[2]);
      continue;
    }

    // Speaker label: "Speaker Name:"
    const speakerMatch = line.match(/^([^:]+):\s*(.*)$/);
    if (speakerMatch) {
      if (currentText && currentSpeaker) {
        segments.push({
          speaker_name: currentSpeaker,
          text: currentText.trim(),
          start_time: startTime,
          end_time: endTime,
        });
      }
      currentSpeaker = speakerMatch[1];
      currentText = speakerMatch[2];
    } else if (line.trim() && currentSpeaker) {
      currentText += ' ' + line.trim();
    }
  }

  // Add last segment
  if (currentText && currentSpeaker) {
    segments.push({
      speaker_name: currentSpeaker,
      text: currentText.trim(),
      start_time: startTime,
      end_time: endTime,
    });
  }

  return segments;
}

// Parse timestamp to seconds
function parseTimestamp(ts: string): number {
  const [time, ms] = ts.split(/[.,]/);
  const [hours, minutes, seconds] = time.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds + Number(ms) / 1000;
}

// Real-time meeting status via webhooks
export interface ZoomWebhookPayload {
  event: string;
  payload: {
    object: {
      id: string;
      uuid: string;
      host_id: string;
      topic: string;
      participant?: {
        user_id: string;
        user_name: string;
      };
    };
  };
}

// Process webhook events
export function processWebhookEvent(
  payload: ZoomWebhookPayload
): {
  event: string;
  meetingId: string;
  data: Record<string, unknown>;
} {
  const { event, payload: eventPayload } = payload;
  
  return {
    event,
    meetingId: eventPayload.object.id.toString(),
    data: {
      uuid: eventPayload.object.uuid,
      topic: eventPayload.object.topic,
      participant: eventPayload.object.participant,
    },
  };
}

// Generate meeting summary using AI
export async function generateMeetingSummary(
  transcript: TranscriptSegment[],
  studentContext: string
): Promise<{
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  followUpNeeded: boolean;
}> {
  // This would call Claude or another AI to summarize
  // For now, return a structured placeholder
  const fullText = transcript.map(t => `${t.speaker_name}: ${t.text}`).join('\n');
  
  return {
    summary: `Meeting covered financial aid appeal strategy. ${transcript.length} exchanges recorded.`,
    keyPoints: [
      'Discussed appeal submission status',
      'Reviewed documentation requirements',
      'Planned follow-up strategy',
    ],
    actionItems: [
      'Send follow-up email in 7 days',
      'Prepare counter-offer template if needed',
      'Gather additional supporting documents',
    ],
    followUpNeeded: true,
  };
}

// Schedule recurring advisor availability
export async function createRecurringAvailability(
  advisorId: string,
  schedule: {
    dayOfWeek: number; // 0-6, Sunday = 0
    startTime: string; // HH:mm format
    endTime: string;
  }[]
): Promise<{ slots: Array<{ date: string; startTime: string; endTime: string }> }> {
  // This would integrate with a scheduling system
  // Returns available slots for the next 2 weeks
  const slots: Array<{ date: string; startTime: string; endTime: string }> = [];
  const now = new Date();
  
  for (let i = 0; i < 14; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    const dayOfWeek = date.getDay();
    
    const matchingSlots = schedule.filter(s => s.dayOfWeek === dayOfWeek);
    for (const slot of matchingSlots) {
      slots.push({
        date: date.toISOString().split('T')[0],
        startTime: slot.startTime,
        endTime: slot.endTime,
      });
    }
  }
  
  return { slots };
}
