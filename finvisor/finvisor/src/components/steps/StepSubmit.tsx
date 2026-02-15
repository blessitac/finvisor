'use client';

// ═══════════════════════════════════════════════════════
// FINVISOR - Step 6: Browser Automation
// Integrations: Browserbase (auto-submit)
// ═══════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { Card, Btn, Pill, GlowDot, Spinner, COLORS, font, displayFont, sleep } from '../ui';

interface SubmissionStep {
  icon: string;
  text: string;
  phase: 'pending' | 'running' | 'done';
}

interface StepSubmitProps {
  onNext: () => void;
  onSubmissionComplete?: (confirmation: string) => void;
}

export default function StepSubmit({ onNext, onSubmissionComplete }: StepSubmitProps) {
  const [steps, setSteps] = useState<SubmissionStep[]>([]);
  const [done, setDone] = useState(false);

  const ACTIONS = [
    { icon: '🌐', text: 'Opening Stanford financial aid portal...' },
    { icon: '🔑', text: 'Authenticating with student credentials...' },
    { icon: '📝', text: 'Navigating to "Special Circumstances Review" form...' },
    { icon: '✍️', text: 'Filling in personal & financial details...' },
    { icon: '📎', text: 'Attaching appeal letter PDF + W-2 + supporting docs...' },
    { icon: '🔍', text: 'Reviewing submission for completeness...' },
    { icon: '🚀', text: 'Submitting appeal — confirmation received!' },
  ];

  useEffect(() => {
    const run = async () => {
      for (let i = 0; i < ACTIONS.length; i++) {
        setSteps((prev) => [...prev, { ...ACTIONS[i], phase: 'running' }]);
        await sleep(1600);
        setSteps((prev) => {
          const copy = [...prev];
          copy[i] = { ...copy[i], phase: 'done' };
          return copy;
        });
        await sleep(200);
      }
      setDone(true);

      if (onSubmissionComplete) {
        onSubmissionComplete('SFA-2026-04821');
      }
    };
    run();
  }, [onSubmissionComplete]);

  return (
    <Card>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <Pill color={COLORS.red} style={{ marginBottom: 10 }}>
          STEP 6 — BROWSER AUTOMATION
        </Pill>
        <h2
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: COLORS.text,
            fontFamily: displayFont,
            margin: '8px 0 4px',
          }}
        >
          Auto-Submission Agent
        </h2>
        <p style={{ fontSize: 13, color: COLORS.muted, fontFamily: font }}>
          Browserbase agent submits your appeal automatically
        </p>
      </div>

      {/* Fake browser chrome */}
      <div
        style={{
          borderRadius: 14,
          overflow: 'hidden',
          border: `1px solid ${COLORS.cardBorder}`,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            background: 'rgba(255,255,255,0.04)',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            borderBottom: `1px solid ${COLORS.cardBorder}`,
          }}
        >
          <div style={{ display: 'flex', gap: 5 }}>
            {['#f87171', '#fbbf24', '#34d399'].map((c) => (
              <div
                key={c}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: c,
                  opacity: 0.7,
                }}
              />
            ))}
          </div>
          <div
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 6,
              padding: '5px 12px',
              fontSize: 11,
              color: COLORS.muted,
              fontFamily: 'monospace',
            }}
          >
            https://financialaid.stanford.edu/special-circumstances
          </div>
        </div>

        <div style={{ padding: 20, minHeight: 200 }}>
          {steps.map((s, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 0',
                animation: 'fadeIn 0.3s ease-out',
              }}
            >
              {s.phase === 'running' ? (
                <Spinner size={16} />
              ) : (
                <span style={{ fontSize: 14 }}>{s.icon}</span>
              )}
              <span
                style={{
                  fontSize: 13,
                  fontFamily: font,
                  color: s.phase === 'done' ? COLORS.green : COLORS.muted,
                }}
              >
                {s.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {done && (
        <div
          style={{
            background: `${COLORS.green}08`,
            border: `1px solid ${COLORS.green}25`,
            borderRadius: 14,
            padding: 20,
            textAlign: 'center',
            marginBottom: 16,
            animation: 'fadeIn 0.5s ease-out',
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 8 }}>🎉</div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: COLORS.green,
              fontFamily: font,
            }}
          >
            Appeal Successfully Submitted!
          </div>
          <div
            style={{
              fontSize: 12,
              color: COLORS.muted,
              fontFamily: font,
              marginTop: 4,
            }}
          >
            Confirmation #SFA-2026-04821 · Estimated response: 2-3 weeks
          </div>
        </div>
      )}

      {done && (
        <Btn onClick={onNext} style={{ width: '100%', justifyContent: 'center' }}>
          Continue to Advisor Mode →
        </Btn>
      )}
    </Card>
  );
}
