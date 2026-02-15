'use client';

// ═══════════════════════════════════════════════════════
// FINVISOR - Step 2: Document Upload & Parsing
// Integrations: OpenAI (vision), Modal (batch processing)
// ═══════════════════════════════════════════════════════

import { useState } from 'react';
import { Card, Btn, Pill, GlowDot, Spinner, COLORS, font, displayFont } from '../ui';

interface ParsedField {
  k: string;
  v: string;
  flag?: boolean;
}

interface ParsedDocument {
  type: string;
  fields: ParsedField[];
}

interface StepUploadProps {
  onNext: () => void;
  onDocumentsUpdate?: (docs: ParsedDocument[]) => void;
}

export default function StepUpload({ onNext, onDocumentsUpdate }: StepUploadProps) {
  const [uploaded, setUploaded] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState<ParsedDocument | null>(null);
  const [allDocs, setAllDocs] = useState<ParsedDocument[]>([]);

  const handleUpload = async (type: string) => {
    setUploaded(type);
    setParsing(true);

    // In production, this would call the API
    // const response = await fetch('/api/documents', { ... });
    
    // Demo data
    setTimeout(() => {
      setParsing(false);
      const docData: ParsedDocument = type === 'w2'
        ? {
            type: 'W-2 Form',
            fields: [
              { k: 'Gross Income', v: '$62,450', flag: false },
              { k: 'Federal Tax Withheld', v: '$8,340', flag: false },
              { k: 'Filing Status', v: 'Head of Household', flag: false },
              { k: 'Employer', v: 'Terminated Oct 2025', flag: true },
              { k: 'YoY Income Change', v: '−34.2%', flag: true },
            ],
          }
        : {
            type: 'FAFSA / Aid Letter',
            fields: [
              { k: 'EFC (Expected Family Contribution)', v: '$12,800', flag: false },
              { k: 'Federal Pell Grant', v: '$3,200', flag: false },
              { k: 'Institutional Grant', v: '$32,000', flag: false },
              { k: 'Subsidized Loan', v: '$5,500', flag: false },
              { k: 'Unmet Need', v: '$17,300', flag: true },
              { k: 'Total Package', v: '$45,000', flag: false },
            ],
          };

      setParsed(docData);
      setAllDocs((prev) => [...prev, docData]);
      
      if (onDocumentsUpdate) {
        onDocumentsUpdate([...allDocs, docData]);
      }
    }, 2800);
  };

  return (
    <Card>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <Pill color={COLORS.accentAlt} style={{ marginBottom: 10 }}>
          STEP 2 — DOCUMENT INTELLIGENCE
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
          Upload Your Documents
        </h2>
        <p style={{ fontSize: 13, color: COLORS.muted, fontFamily: font }}>
          AI agents extract structured financial data • Powered by OpenAI Vision + Modal
        </p>
      </div>

      {!uploaded && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
          {[
            { id: 'w2', icon: '📄', title: 'W-2 Form', desc: "Parent's wage statement" },
            { id: 'fafsa', icon: '🎓', title: 'Aid Letter / FAFSA', desc: 'Current financial aid offer' },
          ].map((d) => (
            <div
              key={d.id}
              onClick={() => handleUpload(d.id)}
              style={{
                padding: '28px 20px',
                borderRadius: 16,
                textAlign: 'center',
                cursor: 'pointer',
                background: 'rgba(255,255,255,0.03)',
                border: `2px dashed ${COLORS.cardBorder}`,
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 10 }}>{d.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, fontFamily: font }}>
                {d.title}
              </div>
              <div style={{ fontSize: 12, color: COLORS.muted, fontFamily: font, marginTop: 4 }}>
                {d.desc}
              </div>
              <div style={{ fontSize: 11, color: COLORS.accent, fontFamily: font, marginTop: 8 }}>
                Click to upload (demo)
              </div>
            </div>
          ))}
        </div>
      )}

      {parsing && (
        <div
          style={{
            background: `${COLORS.accent}08`,
            border: `1px solid ${COLORS.accent}20`,
            borderRadius: 16,
            padding: 28,
            textAlign: 'center',
            animation: 'fadeIn 0.3s ease-out',
          }}
        >
          <Spinner size={28} />
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: COLORS.accent,
              fontFamily: font,
              marginTop: 14,
            }}
          >
            AI Agent parsing {uploaded === 'w2' ? 'W-2' : 'Aid Letter'}...
          </div>
          <div style={{ fontSize: 12, color: COLORS.muted, fontFamily: font, marginTop: 6 }}>
            OpenAI Vision → Structured JSON output → Modal batch processing
          </div>
        </div>
      )}

      {parsed && (
        <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <GlowDot color={COLORS.green} />
            <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.green, fontFamily: font }}>
              {parsed.type} — Parsed Successfully
            </span>
          </div>
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 14,
              overflow: 'hidden',
              border: `1px solid ${COLORS.cardBorder}`,
            }}
          >
            {parsed.fields.map((f, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 18px',
                  borderBottom: i < parsed.fields.length - 1 ? `1px solid ${COLORS.cardBorder}` : 'none',
                  background: f.flag ? `${COLORS.amber}06` : 'transparent',
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    color: f.flag ? COLORS.amber : COLORS.muted,
                    fontFamily: font,
                  }}
                >
                  {f.flag ? '⚠ ' : ''}
                  {f.k}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: f.flag ? COLORS.amber : COLORS.text,
                    fontFamily: font,
                  }}
                >
                  {f.v}
                </span>
              </div>
            ))}
          </div>

          {/* JSON preview */}
          <div
            style={{
              marginTop: 14,
              background: 'rgba(0,0,0,0.3)',
              borderRadius: 10,
              padding: '12px 16px',
              fontFamily: 'monospace',
              fontSize: 11,
              color: COLORS.accent,
              lineHeight: 1.6,
              overflow: 'hidden',
            }}
          >
            <span style={{ color: COLORS.dim }}>// structured output</span>
            <br />
            {`{ "type": "${parsed.type}", "fields": ${parsed.fields.length}, "flags": ${parsed.fields.filter((f) => f.flag).length} }`}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            {(!uploaded || uploaded === 'w2') && (
              <Btn
                variant="outline"
                onClick={() => {
                  setUploaded(null);
                  setParsed(null);
                }}
                style={{ flex: 1, justifyContent: 'center', fontSize: 13 }}
              >
                + Upload Another Doc
              </Btn>
            )}
            <Btn onClick={onNext} style={{ flex: 1, justifyContent: 'center', fontSize: 13 }}>
              Run Gap Strategy Agent →
            </Btn>
          </div>
        </div>
      )}
    </Card>
  );
}
