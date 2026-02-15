// ═══════════════════════════════════════════════════════
// FINVISOR - Zoom Integration (DEMO MODE)
// All real Zoom logic removed for hackathon stability
// ═══════════════════════════════════════════════════════

// Dummy error class (kept for compatibility)
export class ZoomError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ZoomError";
  }
}

// Always return valid (no env vars required)
export function validateZoomEnvVars() {
  return { valid: true, missing: [] };
}

// Mock meeting creation
export async function createAdvisorMeeting() {
  return {
    meetingId: 12345,
    joinUrl: "https://zoom.us/j/DEMO_MEETING",
    startUrl: "https://zoom.us/s/DEMO_START",
    password: "123456",
  };
}

// Mock meeting details
export async function getMeetingDetails() {
  return {
    id: 12345,
    topic: "Demo Advisory Session",
    status: "waiting",
    join_url: "https://zoom.us/j/DEMO_MEETING",
    start_url: "https://zoom.us/s/DEMO_START",
  };
}

// Mock transcript
export async function getMeetingTranscript() {
  return [
    {
      speaker_name: "Advisor",
      text: "Welcome to the Finvisor demo session.",
      start_time: 0,
      end_time: 5,
    },
    {
      speaker_name: "Student",
      text: "Thank you for helping me with my appeal.",
      start_time: 5,
      end_time: 10,
    },
  ];
}

// Mock meeting summary
export async function generateMeetingSummary() {
  return {
    summary: "Demo summary of financial aid appeal discussion.",
    keyPoints: [
      "Reviewed appeal documentation",
      "Discussed negotiation strategy",
    ],
    actionItems: [
      "Submit appeal by Friday",
      "Prepare follow-up email",
    ],
    followUpNeeded: true,
  };
}

// Mock webhook processor
export function processWebhookEvent(payload: any) {
  return {
    event: payload?.event || "demo.event",
    meetingId: "demo-12345",
    data: {},
  };
}
