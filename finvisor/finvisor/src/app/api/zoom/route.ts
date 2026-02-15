// ═══════════════════════════════════════════════════════
// FINVISOR - Zoom API Route (DEMO MODE)
// No real Zoom calls. Safe for hackathon demo.
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";

/**
 * DEMO MODE
 * This route simulates Zoom behavior without calling the real API.
 * No environment variables required.
 */

// Create a new "meeting"
export async function POST(request: NextRequest) {
  console.log("[API/Zoom] DEMO POST request received");

  const body = await request.json().catch(() => ({}));

  return NextResponse.json({
    success: true,
    data: {
      meetingId: "demo-12345",
      joinUrl: "https://zoom.us/j/DEMO_MEETING",
      startUrl: "https://zoom.us/s/DEMO_START",
      password: "123456",
      scheduledTime: body?.scheduledTime || "instant",
      topic: body?.topic || "Demo Advisory Session",
      duration: body?.duration || 30,
      instructions: [
        "Demo mode: no real Zoom meeting was created.",
        "Use this mock URL for presentation purposes.",
      ],
    },
  });
}

// Get meeting details
export async function GET() {
  console.log("[API/Zoom] DEMO GET request received");

  return NextResponse.json({
    success: true,
    data: {
      id: "demo-12345",
      topic: "Demo Advisory Session",
      status: "waiting",
      join_url: "https://zoom.us/j/DEMO_MEETING",
      start_url: "https://zoom.us/s/DEMO_START",
      password: "123456",
    },
  });
}

// Real-time transcript analysis (still works with Anthropic if you want)
export async function PUT(request: NextRequest) {
  console.log("[API/Zoom] DEMO PUT request received");

  const body = await request.json().catch(() => ({}));

  return NextResponse.json({
    success: true,
    data: {
      insights: [
        "Demo insight: recommend follow-up email within 7 days.",
        "Demo insight: gather additional financial documentation.",
      ],
      transcriptLength: body?.transcript?.length || 0,
    },
  });
}

// Webhook simulation
export async function PATCH() {
  console.log("[API/Zoom] DEMO PATCH request received");

  return NextResponse.json({
    success: true,
    received: "demo.webhook",
  });
}
