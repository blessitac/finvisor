'use client';

// ═══════════════════════════════════════════════════════
// FINVISOR — Full 11-Step Hackathon Demo
// AI-powered financial aid appeal platform
// ═══════════════════════════════════════════════════════

import { useState } from 'react';
import { Background, Header, StepNav } from '@/components/ui';
import {
  StepFinnie,
  StepUpload,
  StepStrategy,
  StepResearch,
  StepAppeal,
  StepSubmit,
  StepZoom,
  StepDashboard,
} from '@/components/steps';

const STEP_LABELS = [
  'Finnie Chat',
  'Upload Docs',
  'Gap Strategy',
  'Research',
  'Generate Appeal',
  'Auto-Submit',
  'Live Advisor',
  'Dashboard',
];

export default function Finvisor() {
  const [step, setStep] = useState(0);

  const next = () => setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,700;9..144,800&display=swap"
        rel="stylesheet"
      />

      <Background />
      <Header />
      <StepNav current={step} labels={STEP_LABELS} />

      <div
        style={{
          padding: '8px 20px 60px',
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {step === 0 && <StepFinnie onNext={next} />}
        {step === 1 && <StepUpload onNext={next} />}
        {step === 2 && <StepStrategy onNext={next} />}
        {step === 3 && <StepResearch onNext={next} />}
        {step === 4 && <StepAppeal onNext={next} />}
        {step === 5 && <StepSubmit onNext={next} />}
        {step === 6 && <StepZoom onNext={next} />}
        {step === 7 && <StepDashboard />}
      </div>
    </div>
  );
}
