'use client';

// ═══════════════════════════════════════════════════════
// FINVISOR - Step 5: Appeal Letter Generation
// Integrations: Anthropic (Claude generation), Modal (enhancement)
// ═══════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { Card, Btn, Pill, COLORS, font, displayFont, sleep } from '../ui';

interface StepAppealProps {
  onNext: () => void;
  onLetterUpdate?: (letter: string) => void;
}

export default function StepAppeal({ onNext, onLetterUpdate }: StepAppealProps) {
  const [lines, setLines] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const LETTER = [
    'Dear Stanford University Office of Financial Aid,',
    '',
    'I am writing to request a Special Circumstances Review of my financial aid package for the 2025–2026 academic year. A significant and unforeseen change in my family\'s financial situation has created a substantial gap between our demonstrated need and my current award.',
    '',
    'In October 2025, my mother — our household\'s primary earner — experienced an unexpected job termination. As documented in the attached W-2, this resulted in a 34.2% decrease in household income, from $95,800 to $62,450. This figure no longer reflects our family\'s ability to contribute to educational costs.',
    '',
    'The financial strain extends well beyond lost wages. We now carry $1,800 per month ($21,600 annually) in COBRA health insurance premiums — a figure that exceeds the national family average of $1,700/month (KFF, 2025). Additionally, our family was forced to relocate to more affordable housing, displacing my two younger siblings from their schools.',
    '',
    'I would also respectfully note that my current institutional grant of $32,000 falls below the peer-institution median. According to IPEDS 2024–25 data, comparable need-based grants at Harvard ($59,076), Yale ($62,250), and Princeton ($60,500) significantly exceed my current award. Stanford\'s own published average need-based grant of $59,400 further illustrates this gap.',
    '',
    'Throughout these challenges, I have maintained a 3.8 GPA and continued my research contributions. I am deeply committed to my education at Stanford and believe a revised assessment of my family\'s financial circumstances will confirm eligibility for additional need-based support.',
    '',
    'I have attached supporting documentation including my mother\'s W-2, proof of unemployment, COBRA enrollment confirmation, and our current lease agreement. I am available to provide any additional materials your office may require.',
    '',
    'Thank you for your time and careful consideration.',
    '',
    'Sincerely,',
    'Sarah Chen',
    'Stanford University, Class of 2028',
  ];

  useEffect(() => {
    const run = async () => {
      for (let i = 0; i < LETTER.length; i++) {
        setLines((prev) => [...prev, LETTER[i]]);
        await sleep(LETTER[i] === '' ? 80 : 150 + LETTER[i].length * 2);
      }
      setDone(true);

      if (onLetterUpdate) {
        onLetterUpdate(LETTER.join('\n'));
      }
    };
    run();
  }, [onLetterUpdate]);

  return (
    <Card style={{ maxWidth: 720 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <Pill color={COLORS.accentAlt} style={{ marginBottom: 8 }}>
            STEP 5 — AI GENERATION
          </Pill>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: COLORS.text,
              fontFamily: displayFont,
              margin: 0,
            }}
          >
            Your Appeal Letter
          </h2>
          <p style={{ fontSize: 12, color: COLORS.muted, fontFamily: font, marginTop: 4 }}>
            Powered by Anthropic Claude • Enhanced with Modal
          </p>
        </div>
        {done && (
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="outline" style={{ padding: '8px 14px', fontSize: 12 }}>
              📋 Copy
            </Btn>
            <Btn variant="green" style={{ padding: '8px 14px', fontSize: 12 }}>
              📄 Export PDF
            </Btn>
          </div>
        )}
      </div>

      <div
        style={{
          background: 'rgba(0,0,0,0.2)',
          borderRadius: 14,
          padding: '28px 24px',
          border: `1px solid ${COLORS.cardBorder}`,
          minHeight: 280,
        }}
      >
        {lines.map((line, i) => (
          <p
            key={i}
            style={{
              fontSize: 13.5,
              color: COLORS.text,
              lineHeight: 1.85,
              fontFamily: font,
              margin: line === '' ? '14px 0' : '0',
              fontWeight: i === 0 || i >= LETTER.length - 3 ? 600 : 400,
              animation: 'typeIn 0.2s ease-out',
            }}
          >
            {line}
          </p>
        ))}
        {!done && (
          <span
            style={{
              display: 'inline-block',
              width: 2,
              height: 18,
              background: COLORS.accentAlt,
              animation: 'blink 0.8s infinite',
              borderRadius: 1,
              verticalAlign: 'middle',
              marginLeft: 2,
            }}
          />
        )}
      </div>

      {done && (
        <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
          <div
            style={{
              flex: 1,
              background: `${COLORS.green}08`,
              border: `1px solid ${COLORS.green}20`,
              borderRadius: 10,
              padding: '10px 14px',
              fontSize: 12,
              color: COLORS.green,
              fontFamily: font,
            }}
          >
            ✅ Tone: Professional & empathetic
          </div>
          <div
            style={{
              flex: 1,
              background: `${COLORS.accent}08`,
              border: `1px solid ${COLORS.accent}20`,
              borderRadius: 10,
              padding: '10px 14px',
              fontSize: 12,
              color: COLORS.accent,
              fontFamily: font,
            }}
          >
            📊 3 data citations included
          </div>
        </div>
      )}

      {done && (
        <Btn onClick={onNext} style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}>
          Auto-Submit via Browser Agent →
        </Btn>
      )}
    </Card>
  );
}
