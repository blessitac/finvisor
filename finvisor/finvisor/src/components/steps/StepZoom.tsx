'use client';

// ═══════════════════════════════════════════════════════
// FINVISOR - Step 7: Live Zoom Advisor (MVP)
// Real Zoom meeting creation via Server-to-Server OAuth
// ═══════════════════════════════════════════════════════

import { useState, useCallback } from 'react';
import { Card, Btn, Pill, GlowDot, Spinner, COLORS, font } from '../ui';

interface MeetingData {
  meetingId: number;
  joinUrl: string;
  startUrl: string;
  password: string;
  scheduledTime: string;
}

interface ApiError {
  error: string;
  details?: {
    status?: number;
    code?: string;
    zoomMessage?: string;
    missing?: string[];
    hint?: string;
  };
}

type MeetingState = 'idle' | 'loading' | 'success' | 'error';

interface StepZoomProps {
  onNext: () => void;
}

export default function StepZoom({ onNext }: StepZoomProps) {
  const [state, setState] = useState<MeetingState>('idle');
  const [meetingData, setMeetingData] = useState<MeetingData | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  
  // Form fields for optional scheduling
  const [topic, setTopic] = useState('Financial Aid Appeal Consultation');
  const [duration, setDuration] = useState(30);
  const [scheduledTime, setScheduledTime] = useState('');

  const createMeeting = useCallback(async () => {
    setState('loading');
    setError(null);
    setMeetingData(null);

    try {
      const payload: Record<string, unknown> = {
        topic,
        duration,
      };
      
      if (scheduledTime) {
        payload.scheduledTime = new Date(scheduledTime).toISOString();
      }

      const response = await fetch('/api/zoom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setState('error');
        setError({
          error: data.error || 'Failed to create meeting',
          details: data.details,
        });
        return;
      }

      setState('success');
      setMeetingData(data.data);
    } catch (err) {
      setState('error');
      setError({
        error: err instanceof Error ? err.message : 'Network error occurred',
      });
    }
  }, [topic, duration, scheduledTime]);

  const resetState = useCallback(() => {
    setState('idle');
    setMeetingData(null);
    setError(null);
  }, []);

  // Idle state - show meeting creation form
  if (state === 'idle') {
    return (
      <Card wide>
        <div
          style={{
            padding: '14px 20px',
            borderBottom: `1px solid ${COLORS.cardBorder}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            margin: '-20px -20px 20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>🎥</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, fontFamily: font }}>
              Schedule Zoom Advisory Session
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <Pill color={COLORS.accent}>Zoom API</Pill>
            <Pill color={COLORS.green}>S2S OAuth</Pill>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Topic */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: COLORS.muted,
                marginBottom: 6,
                fontFamily: font,
              }}
            >
              Meeting Topic *
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: 14,
                fontFamily: font,
                background: COLORS.card,
                border: `1px solid ${COLORS.cardBorder}`,
                borderRadius: 8,
                color: COLORS.text,
                outline: 'none',
              }}
              placeholder="Enter meeting topic..."
            />
          </div>

          {/* Duration */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: COLORS.muted,
                marginBottom: 6,
                fontFamily: font,
              }}
            >
              Duration (minutes)
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: 14,
                fontFamily: font,
                background: COLORS.card,
                border: `1px solid ${COLORS.cardBorder}`,
                borderRadius: 8,
                color: COLORS.text,
                outline: 'none',
              }}
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
          </div>

          {/* Scheduled Time (Optional) */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: COLORS.muted,
                marginBottom: 6,
                fontFamily: font,
              }}
            >
              Schedule For (optional - leave empty for instant meeting)
            </label>
            <input
              type="datetime-local"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: 14,
                fontFamily: font,
                background: COLORS.card,
                border: `1px solid ${COLORS.cardBorder}`,
                borderRadius: 8,
                color: COLORS.text,
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginTop: 8 }}>
            <Btn onClick={createMeeting} disabled={!topic.trim()}>
              🎥 Create Zoom Meeting
            </Btn>
          </div>
        </div>
      </Card>
    );
  }

  // Loading state
  if (state === 'loading') {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spinner size={32} />
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: COLORS.text,
              fontFamily: font,
              marginTop: 20,
            }}
          >
            Creating Zoom Meeting...
          </div>
          <div style={{ fontSize: 12, color: COLORS.muted, fontFamily: font, marginTop: 8 }}>
            Authenticating with Zoom via Server-to-Server OAuth
          </div>
        </div>
      </Card>
    );
  }

  // Error state
  if (state === 'error' && error) {
    return (
      <Card wide>
        <div
          style={{
            padding: '14px 20px',
            borderBottom: `1px solid ${COLORS.red}40`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            margin: '-20px -20px 20px',
            background: `${COLORS.red}10`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <GlowDot color={COLORS.red} />
            <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.red, fontFamily: font }}>
              Meeting Creation Failed
            </span>
          </div>
        </div>

        <div
          style={{
            padding: 16,
            background: `${COLORS.red}08`,
            borderRadius: 8,
            border: `1px solid ${COLORS.red}20`,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: COLORS.red,
              fontFamily: font,
              marginBottom: 8,
            }}
          >
            {error.error}
          </div>
          
          {error.details && (
            <div style={{ fontSize: 12, color: COLORS.muted, fontFamily: font }}>
              {error.details.zoomMessage && (
                <div style={{ marginBottom: 4 }}>Zoom: {error.details.zoomMessage}</div>
              )}
              {error.details.status && (
                <div style={{ marginBottom: 4 }}>Status: {error.details.status}</div>
              )}
              {error.details.missing && error.details.missing.length > 0 && (
                <div style={{ marginBottom: 4 }}>
                  Missing env vars: {error.details.missing.join(', ')}
                </div>
              )}
              {error.details.hint && (
                <div style={{ marginTop: 8, color: COLORS.amber }}>
                  💡 {error.details.hint}
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <Btn onClick={resetState}>← Try Again</Btn>
          <Btn onClick={onNext} style={{ background: COLORS.muted }}>
            Skip to Dashboard →
          </Btn>
        </div>
      </Card>
    );
  }

  // Success state - show meeting info
  if (state === 'success' && meetingData) {
    return (
      <Card wide>
        <div
          style={{
            padding: '14px 20px',
            borderBottom: `1px solid ${COLORS.green}40`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            margin: '-20px -20px 20px',
            background: `${COLORS.green}10`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <GlowDot color={COLORS.green} />
            <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.green, fontFamily: font }}>
              Zoom Meeting Created Successfully
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <Pill color={COLORS.accent}>Zoom API</Pill>
            <Pill color={COLORS.green}>Live</Pill>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: COLORS.dim,
                marginBottom: 8,
                fontFamily: font,
              }}
            >
              MEETING DETAILS
            </div>
            <div
              style={{
                background: COLORS.card,
                border: `1px solid ${COLORS.cardBorder}`,
                borderRadius: 8,
                padding: 16,
              }}
            >
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 11, color: COLORS.muted, fontFamily: font }}>Meeting ID</span>
                <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, fontFamily: font }}>
                  {meetingData.meetingId}
                </div>
              </div>
              {meetingData.password && (
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: 11, color: COLORS.muted, fontFamily: font }}>Password</span>
                  <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, fontFamily: font }}>
                    {meetingData.password}
                  </div>
                </div>
              )}
              <div>
                <span style={{ fontSize: 11, color: COLORS.muted, fontFamily: font }}>Type</span>
                <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, fontFamily: font }}>
                  {meetingData.scheduledTime === 'instant' ? 'Instant Meeting' : `Scheduled: ${new Date(meetingData.scheduledTime).toLocaleString()}`}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: COLORS.dim,
                marginBottom: 8,
                fontFamily: font,
              }}
            >
              MEETING LINKS
            </div>
            <div
              style={{
                background: COLORS.card,
                border: `1px solid ${COLORS.cardBorder}`,
                borderRadius: 8,
                padding: 16,
              }}
            >
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 11, color: COLORS.muted, fontFamily: font }}>Join URL (for student)</span>
                <a
                  href={meetingData.joinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block',
                    fontSize: 12,
                    color: COLORS.accent,
                    fontFamily: font,
                    wordBreak: 'break-all',
                    marginTop: 4,
                  }}
                >
                  {meetingData.joinUrl}
                </a>
              </div>
              <div>
                <span style={{ fontSize: 11, color: COLORS.muted, fontFamily: font }}>Start URL (for host)</span>
                <a
                  href={meetingData.startUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block',
                    fontSize: 12,
                    color: COLORS.green,
                    fontFamily: font,
                    wordBreak: 'break-all',
                    marginTop: 4,
                  }}
                >
                  Open as Host →
                </a>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            background: `${COLORS.amber}08`,
            border: `1px solid ${COLORS.amber}20`,
            borderRadius: 8,
            padding: 14,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: COLORS.amber,
              fontFamily: font,
              marginBottom: 6,
            }}
          >
            📋 Next Steps
          </div>
          <ul
            style={{
              margin: 0,
              paddingLeft: 20,
              fontSize: 12,
              color: COLORS.text,
              fontFamily: font,
              lineHeight: 1.8,
            }}
          >
            <li>Share the Join URL with the student</li>
            <li>Use the Start URL to begin the meeting as host</li>
            <li>Recording and transcription are enabled automatically</li>
          </ul>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <Btn onClick={resetState}>Create Another Meeting</Btn>
          <Btn onClick={onNext}>View Dashboard & Pricing →</Btn>
        </div>
      </Card>
    );
  }

  return null;
}
