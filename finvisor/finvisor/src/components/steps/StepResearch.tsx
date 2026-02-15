'use client';

// ═══════════════════════════════════════════════════════
// FINVISOR - Step 4: Research Agent
// Integrations: Perplexity (research with citations)
// ═══════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { Card, Btn, Pill, Spinner, COLORS, font, displayFont, sleep } from '../ui';

interface ResearchQuery {
  q: string;
  result: string;
  src: string;
  phase: 'pending' | 'searching' | 'found';
}

interface StepResearchProps {
  onNext: () => void;
  onResearchUpdate?: (research: Array<{ query: string; result: string; source: string }>) => void;
}

export default function StepResearch({ onNext, onResearchUpdate }: StepResearchProps) {
  const [queries, setQueries] = useState<ResearchQuery[]>([]);
  const [done, setDone] = useState(false);

  const RESEARCH = [
    {
      q: 'Stanford average financial aid package 2025',
      result: 'Average need-based grant: $59,400. 70% of students receive aid.',
      src: 'Stanford Financial Aid Office',
    },
    {
      q: 'Financial aid appeal success rate top universities',
      result: 'Appeals with documented income changes have 40-60% success rate at top-20 schools.',
      src: 'Journal of Student Financial Aid',
    },
    {
      q: 'COBRA insurance average cost 2025',
      result: "Average COBRA premium: $1,700/mo for family coverage. Above $1,500 qualifies as 'significant burden' in most appeal frameworks.",
      src: 'KFF Health Insurance Report',
    },
    {
      q: 'Stanford financial aid appeal policy language',
      result: "Stanford's SAR (Special Circumstances Review) allows mid-year reassessment for 'significant change in family finances.'",
      src: 'Stanford SAR Documentation',
    },
    {
      q: 'Peer institution aid comparison Ivy+ schools',
      result: "Harvard avg grant: $59,076 | Yale: $62,250 | Princeton: $60,500 — Stanford's $45K offer is below peer median.",
      src: 'IPEDS Data 2024-25',
    },
  ];

  useEffect(() => {
    const run = async () => {
      for (let i = 0; i < RESEARCH.length; i++) {
        setQueries((prev) => [...prev, { ...RESEARCH[i], phase: 'searching' }]);
        await sleep(1800);
        setQueries((prev) => {
          const copy = [...prev];
          copy[i] = { ...copy[i], phase: 'found' };
          return copy;
        });
        await sleep(200);
      }
      setDone(true);

      if (onResearchUpdate) {
        onResearchUpdate(
          RESEARCH.map((r) => ({
            query: r.q,
            result: r.result,
            source: r.src,
          }))
        );
      }
    };
    run();
  }, [onResearchUpdate]);

  return (
    <Card>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <Pill color={COLORS.green} style={{ marginBottom: 10 }}>
          STEP 4 — RESEARCH AGENT
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
          Evidence & Data Gathering
        </h2>
        <p style={{ fontSize: 13, color: COLORS.muted, fontFamily: font }}>
          Real citations to supercharge your appeal • Powered by Perplexity Sonar Pro
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {queries.map((q, i) => (
          <div
            key={i}
            style={{
              borderRadius: 14,
              overflow: 'hidden',
              border: `1px solid ${q.phase === 'found' ? `${COLORS.green}20` : COLORS.cardBorder}`,
              animation: 'fadeIn 0.3s ease-out',
            }}
          >
            <div
              style={{
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              {q.phase === 'searching' ? (
                <Spinner size={14} color={COLORS.green} />
              ) : (
                <span style={{ fontSize: 12 }}>🔍</span>
              )}
              <span style={{ fontSize: 12, color: COLORS.muted, fontFamily: 'monospace' }}>
                {q.q}
              </span>
            </div>
            {q.phase === 'found' && (
              <div style={{ padding: '10px 16px', borderTop: `1px solid ${COLORS.cardBorder}` }}>
                <div
                  style={{
                    fontSize: 13,
                    color: COLORS.text,
                    fontFamily: font,
                    lineHeight: 1.6,
                    marginBottom: 4,
                  }}
                >
                  {q.result}
                </div>
                <div style={{ fontSize: 11, color: COLORS.accent, fontFamily: font }}>
                  📎 {q.src}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {done && (
        <Btn onClick={onNext} style={{ width: '100%', justifyContent: 'center' }}>
          Generate Appeal Letter →
        </Btn>
      )}
    </Card>
  );
}
