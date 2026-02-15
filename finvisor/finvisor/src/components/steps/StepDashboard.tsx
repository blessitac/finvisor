'use client';

// ═══════════════════════════════════════════════════════
// FINVISOR - Step 8: Dashboard & Monetization
// Integrations: Fetch.ai (payments), Vercel (deploy), All sponsors
// ═══════════════════════════════════════════════════════

import { Card, Btn, Pill, COLORS, font, displayFont } from '../ui';

export default function StepDashboard() {
  const stats = [
    { label: 'Appeals Filed', val: '1,247', color: COLORS.accent },
    { label: 'Success Rate', val: '68%', color: COLORS.green },
    { label: 'Avg Aid Increase', val: '$8,420', color: COLORS.amber },
    { label: 'Revenue (MRR)', val: '$12.4k', color: COLORS.accentAlt },
  ];

  const pricingTiers = [
    {
      name: 'Basic',
      price: '$9',
      features: ['AI intake conversation', 'Document parsing', 'Gap analysis', 'Basic appeal letter'],
      accent: COLORS.muted,
    },
    {
      name: 'Pro',
      price: '$29',
      features: [
        'Everything in Basic',
        'Research citations',
        'Auto-submission agent',
        'Zoom advisor session',
      ],
      accent: COLORS.accent,
      pop: true,
    },
    {
      name: 'Premium',
      price: '$49',
      features: [
        'Everything in Pro',
        'Counter-offer templates',
        'Multi-round strategy',
        'Priority advisor access',
      ],
      accent: COLORS.accentAlt,
    },
  ];

  const sponsors = [
    { name: 'OpenAI', tag: 'Core Intelligence' },
    { name: 'Anthropic (Claude)', tag: 'Reasoning + Generation' },
    { name: 'Zoom', tag: 'Live Advisor' },
    { name: 'Render', tag: 'Backend Infra' },
    { name: 'Perplexity', tag: 'Research Agent' },
    { name: 'Browserbase', tag: 'Auto-Submit' },
    { name: 'Modal', tag: 'Scalable Compute' },
    { name: 'Vercel', tag: 'Frontend Deploy' },
    { name: 'Fetch.ai', tag: 'Payment Agents' },
    { name: 'Decagon', tag: 'Conversational UX' },
  ];

  return (
    <Card wide>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <Pill color={COLORS.accent} style={{ marginBottom: 10 }}>
          FINVISOR — SHIPPED PRODUCT
        </Pill>
        <h2
          style={{
            fontSize: 26,
            fontWeight: 800,
            color: COLORS.text,
            fontFamily: displayFont,
            margin: '8px 0 4px',
          }}
        >
          Dashboard & Monetization
        </h2>
        <p style={{ fontSize: 13, color: COLORS.muted, fontFamily: font }}>
          Production-ready • Deployed on Vercel • Revenue-generating via Fetch.ai
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {stats.map((s) => (
          <div
            key={s.label}
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 14,
              padding: '18px 16px',
              border: `1px solid ${COLORS.cardBorder}`,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color, fontFamily: font }}>
              {s.val}
            </div>
            <div style={{ fontSize: 11, color: COLORS.muted, fontFamily: font, marginTop: 4 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Pricing */}
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: COLORS.dim,
            fontFamily: font,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: 14,
          }}
        >
          PRICING TIERS (Fetch.ai Agent Marketplace)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              style={{
                background: tier.pop ? `${tier.accent}08` : 'rgba(255,255,255,0.02)',
                borderRadius: 16,
                padding: '24px 20px',
                border: `1px solid ${tier.pop ? `${tier.accent}30` : COLORS.cardBorder}`,
                position: 'relative',
              }}
            >
              {tier.pop && (
                <div
                  style={{
                    position: 'absolute',
                    top: -8,
                    right: 16,
                    background: COLORS.accent,
                    color: '#000',
                    fontSize: 10,
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 6,
                    fontFamily: font,
                  }}
                >
                  POPULAR
                </div>
              )}
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: tier.accent,
                  fontFamily: font,
                  marginBottom: 4,
                }}
              >
                {tier.name}
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: COLORS.text,
                  fontFamily: font,
                  marginBottom: 14,
                }}
              >
                {tier.price}
                <span style={{ fontSize: 13, color: COLORS.muted }}>/appeal</span>
              </div>
              {tier.features.map((f, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: 12,
                    color: COLORS.muted,
                    fontFamily: font,
                    padding: '4px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span style={{ color: tier.accent, fontSize: 10 }}>✓</span> {f}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack / Sponsors */}
      <div
        style={{
          background: 'rgba(255,255,255,0.02)',
          borderRadius: 14,
          padding: 20,
          border: `1px solid ${COLORS.cardBorder}`,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: COLORS.dim,
            fontFamily: font,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: 14,
          }}
        >
          SPONSOR INTEGRATIONS
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {sponsors.map((s) => (
            <div
              key={s.name}
              style={{
                background: 'rgba(255,255,255,0.04)',
                borderRadius: 8,
                padding: '6px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                border: `1px solid ${COLORS.cardBorder}`,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.text, fontFamily: font }}>
                {s.name}
              </span>
              <span style={{ fontSize: 10, color: COLORS.muted, fontFamily: font }}>· {s.tag}</span>
            </div>
          ))}
        </div>
      </div>

      {/* YC Angle */}
      <div
        style={{
          background: `${COLORS.amber}06`,
          borderRadius: 14,
          padding: 20,
          border: `1px solid ${COLORS.amber}20`,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 28, marginBottom: 8 }}>🚀</div>
        <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.amber, fontFamily: displayFont }}>
          The YC Pitch
        </div>
        <div
          style={{
            fontSize: 14,
            color: COLORS.text,
            fontFamily: font,
            lineHeight: 1.7,
            marginTop: 8,
            maxWidth: 500,
            margin: '8px auto 0',
          }}
        >
          College advising is a $2B industry built on human gatekeepers. Finvisor replaces the entire
          workflow — intake, analysis, research, writing, and submission — with AI agents.
          Outcome-driven. Measurable. Scalable to 100K concurrent students on Modal.
        </div>
        <Btn variant="ghost" style={{ marginTop: 16, cursor: 'default' }}>
          finvisor.ai · Live on Vercel ✨
        </Btn>
      </div>
    </Card>
  );
}
