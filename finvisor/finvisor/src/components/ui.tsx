'use client';

// ═══════════════════════════════════════════════════════
// FINVISOR - Shared UI Components
// ═══════════════════════════════════════════════════════

import { ReactNode, CSSProperties } from 'react';

export const COLORS = {
  bg: '#060b18',
  card: 'rgba(255,255,255,0.025)',
  cardBorder: 'rgba(255,255,255,0.06)',
  accent: '#22d3ee',
  accentAlt: '#a78bfa',
  green: '#34d399',
  amber: '#fbbf24',
  red: '#f87171',
  text: 'rgba(255,255,255,0.88)',
  muted: 'rgba(255,255,255,0.45)',
  dim: 'rgba(255,255,255,0.25)',
};

export const font = "'Outfit', sans-serif";
export const displayFont = "'Fraunces', serif";

// Utility function
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Pill component
interface PillProps {
  children: ReactNode;
  color?: string;
  style?: CSSProperties;
}

export function Pill({ children, color = COLORS.accent, style }: PillProps) {
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color,
        background: `${color}15`,
        border: `1px solid ${color}30`,
        borderRadius: 20,
        padding: '3px 10px',
        fontFamily: font,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

// Glowing dot indicator
interface GlowDotProps {
  color?: string;
  pulse?: boolean;
}

export function GlowDot({ color = COLORS.green, pulse }: GlowDotProps) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: color,
        boxShadow: `0 0 8px ${color}80`,
        animation: pulse ? 'pulse 1.5s infinite' : 'none',
      }}
    />
  );
}

// Background with animated gradients
export function Background() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        background: COLORS.bg,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-25%',
          right: '-15%',
          width: '55vw',
          height: '55vw',
          background: 'radial-gradient(circle, rgba(34,211,238,0.06) 0%, transparent 65%)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          animation: 'drift1 22s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-20%',
          left: '-10%',
          width: '45vw',
          height: '45vw',
          background: 'radial-gradient(circle, rgba(167,139,250,0.05) 0%, transparent 65%)',
          borderRadius: '50%',
          filter: 'blur(90px)',
          animation: 'drift2 28s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          width: '30vw',
          height: '30vw',
          background: 'radial-gradient(circle, rgba(52,211,153,0.04) 0%, transparent 60%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          animation: 'drift3 18s ease-in-out infinite',
        }}
      />
    </div>
  );
}

// Card component
interface CardProps {
  children: ReactNode;
  style?: CSSProperties;
  wide?: boolean;
}

export function Card({ children, style, wide }: CardProps) {
  return (
    <div
      style={{
        background: COLORS.card,
        backdropFilter: 'blur(24px)',
        border: `1px solid ${COLORS.cardBorder}`,
        borderRadius: 22,
        padding: '36px 32px',
        maxWidth: wide ? 960 : 620,
        width: '100%',
        margin: '0 auto',
        boxShadow: '0 24px 80px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)',
        position: 'relative',
        zIndex: 2,
        animation: 'fadeIn 0.45s ease-out',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// Button component
interface BtnProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'purple' | 'green' | 'outline' | 'ghost';
  style?: CSSProperties;
  disabled?: boolean;
}

export function Btn({ children, onClick, variant = 'primary', style, disabled }: BtnProps) {
  const variants: Record<string, CSSProperties> = {
    primary: {
      background: `linear-gradient(135deg, ${COLORS.accent}, #06b6d4)`,
      color: '#000',
      fontWeight: 700,
      boxShadow: `0 4px 24px ${COLORS.accent}30`,
    },
    purple: {
      background: `linear-gradient(135deg, ${COLORS.accentAlt}, #7c3aed)`,
      color: '#fff',
      boxShadow: `0 4px 24px ${COLORS.accentAlt}30`,
    },
    green: {
      background: `linear-gradient(135deg, ${COLORS.green}, #059669)`,
      color: '#000',
      fontWeight: 700,
      boxShadow: `0 4px 24px ${COLORS.green}30`,
    },
    outline: {
      background: 'transparent',
      color: COLORS.text,
      border: `1px solid ${COLORS.cardBorder}`,
    },
    ghost: {
      background: 'rgba(255,255,255,0.05)',
      color: COLORS.muted,
    },
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{
        padding: '13px 28px',
        borderRadius: 12,
        border: 'none',
        cursor: disabled ? 'default' : 'pointer',
        fontSize: 14,
        fontFamily: font,
        letterSpacing: '0.01em',
        transition: 'all 0.2s',
        opacity: disabled ? 0.45 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        ...variants[variant],
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// Step navigation
interface StepNavProps {
  current: number;
  labels: string[];
}

export function StepNav({ current, labels }: StepNavProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        padding: '14px 0',
        position: 'relative',
        zIndex: 2,
        justifyContent: 'center',
        flexWrap: 'wrap',
      }}
    >
      {labels.map((l, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <div
              style={{
                width: active ? 'auto' : 24,
                height: 24,
                borderRadius: 12,
                padding: active ? '0 10px' : 0,
                background: done
                  ? `${COLORS.accent}25`
                  : active
                  ? `${COLORS.accent}18`
                  : 'rgba(255,255,255,0.04)',
                border: `1px solid ${
                  done
                    ? `${COLORS.accent}40`
                    : active
                    ? `${COLORS.accent}30`
                    : 'rgba(255,255,255,0.08)'
                }`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                transition: 'all 0.3s ease',
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  fontFamily: font,
                  color: done || active ? COLORS.accent : COLORS.dim,
                }}
              >
                {done ? '✓' : i + 1}
              </span>
              {active && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: COLORS.accent,
                    fontFamily: font,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {l}
                </span>
              )}
            </div>
            {i < labels.length - 1 && (
              <div
                style={{
                  width: 12,
                  height: 1,
                  background: done ? `${COLORS.accent}30` : 'rgba(255,255,255,0.06)',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Spinner component
export function Spinner({ size = 16, color = COLORS.accent }: { size?: number; color?: string }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `2px solid ${color}30`,
        borderTopColor: color,
        animation: 'spin 0.7s linear infinite',
        flexShrink: 0,
      }}
    />
  );
}

// Typing indicator
export function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: 5, padding: '8px 16px', animation: 'typeIn 0.2s ease-out' }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: COLORS.accent,
            opacity: 0.5,
            animation: `pulse 1s ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// Header component
export function Header() {
  return (
    <div
      style={{
        position: 'relative',
        zIndex: 2,
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.green})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            fontWeight: 800,
            color: '#000',
            fontFamily: displayFont,
          }}
        >
          F
        </div>
        <span
          style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', fontFamily: font }}
        >
          finvisor
        </span>
        <Pill color={COLORS.muted} style={{ marginLeft: 8 }}>
          TreeHacks 2026
        </Pill>
      </div>
    </div>
  );
}
