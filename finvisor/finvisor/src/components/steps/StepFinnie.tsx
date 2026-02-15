'use client';

// ═══════════════════════════════════════════════════════
// FINVISOR - Step 1: Finnie Chatbot
// Integrations: OpenAI (chat), Anthropic (reasoning), Decagon (UX)
// ═══════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Btn, Pill, GlowDot, TypingIndicator, COLORS, font, sleep } from '../ui';

interface Message {
  role: 'bot' | 'user';
  text: string;
}

interface StepFinnieProps {
  onNext: () => void;
  onProfileUpdate?: (profile: Record<string, unknown>) => void;
}

export default function StepFinnie({ onNext, onProfileUpdate }: StepFinnieProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [typing, setTyping] = useState(false);
  const [phase, setPhase] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Demo conversation (will be replaced with live API in production)
  const DEMO_CONVO = [
    { bot: "Hey! I'm Finnie, your financial aid advisor. 💙 I'm here to help you build the strongest possible appeal. First — what school are you attending?" },
    { user: 'Stanford University' },
    { bot: "Great choice! Stanford has a strong financial aid program, and they do review appeals seriously. What's your current total aid package amount?" },
    { user: 'They offered me $45,000 but tuition is $62,000' },
    { bot: "So you have a gap of about $17,000 — that's significant. Has anything changed in your family's financial situation recently? This could be job loss, medical expenses, divorce, or anything that affects income." },
    { user: 'My mom lost her job in October and our income dropped a lot. Plus she\'s paying $1800/mo for COBRA insurance now' },
    { bot: "I'm really sorry to hear about your mom's job loss. That sounds incredibly stressful, and I want you to know — this is exactly the kind of circumstance that financial aid offices take very seriously. 💛\n\nA sudden income drop + high COBRA costs gives us a very strong foundation. I have a few more questions to strengthen your case:\n\n• Did you have to make any housing changes?\n• Do you have siblings who are also in school?\n• Has your family taken on any new debt?" },
    { user: 'Yes we had to move to a smaller place and my two younger siblings had to switch schools. No new debt though' },
    { bot: "That's really helpful context. Housing displacement plus impact on siblings adds emotional weight to your appeal.\n\nHere's what I've gathered so far:\n\n📋 **Your Appeal Profile**\n• School: Stanford University\n• Current aid: $45,000 | Gap: ~$17,000\n• Trigger: Parent job loss (Oct 2025)\n• Income drop: ~34%\n• Added burden: COBRA ($1,800/mo)\n• Housing: Forced relocation\n• Family impact: 2 siblings displaced\n\nI'm feeling really good about this appeal. Ready to move to document upload so I can analyze your actual numbers?" },
  ];

  // Live chat function (uses API)
  const sendLiveMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setTyping(true);

    try {
      const apiMessages = messages.map((m) => ({
        role: m.role === 'bot' ? 'assistant' : 'user',
        content: m.text,
      }));
      apiMessages.push({ role: 'user', content: userMessage });

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages((prev) => [...prev, { role: 'bot', text: data.data.content }]);
      } else {
        setMessages((prev) => [...prev, { role: 'bot', text: 'Sorry, I encountered an error. Please try again.' }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [...prev, { role: 'bot', text: 'Connection error. Please try again.' }]);
    } finally {
      setTyping(false);
    }
  }, [messages]);

  // Demo mode: auto-play conversation
  useEffect(() => {
    if (isLive) return;

    const run = async () => {
      for (let i = 0; i < DEMO_CONVO.length; i++) {
        const entry = DEMO_CONVO[i];
        if ('bot' in entry && entry.bot) {
          setTyping(true);
          await sleep(1200 + entry.bot.length * 4);
          setTyping(false);
          setMessages((prev) => [...prev, { role: 'bot', text: entry.bot }]);
        } else if ('user' in entry && entry.user) {
          await sleep(800);
          setMessages((prev) => [...prev, { role: 'user', text: entry.user }]);
        }
        setPhase(i + 1);
        await sleep(400);
      }

      if (onProfileUpdate) {
        onProfileUpdate({
          school: 'Stanford University',
          currentAid: 45000,
          totalCost: 62000,
          gap: 17000,
          circumstances: [
            { type: 'job_loss', description: 'Parent lost job in October', impact: 30000 },
            { type: 'medical', description: 'COBRA insurance $1,800/mo', impact: 21600 },
            { type: 'housing', description: 'Forced relocation to smaller place' },
          ],
        });
      }
    };

    run();
  }, [isLive, onProfileUpdate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleSubmit = () => {
    if (isLive && inputVal.trim()) {
      sendLiveMessage(inputVal);
      setInputVal('');
    }
  };

  return (
    <Card style={{ padding: 0, overflow: 'hidden' }}>
      <div
        style={{
          padding: '18px 24px',
          borderBottom: `1px solid ${COLORS.cardBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.green})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
            }}
          >
            🐬
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text, fontFamily: font }}>
              Finnie
            </div>
            <div
              style={{
                fontSize: 11,
                color: COLORS.muted,
                fontFamily: font,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <GlowDot color={COLORS.green} pulse />
              AI Financial Aid Advisor
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <Pill color={COLORS.accent}>OpenAI</Pill>
          <Pill color={COLORS.accentAlt}>Anthropic</Pill>
          <Pill color={COLORS.green}>Decagon</Pill>
        </div>
      </div>

      <div
        style={{
          height: 420,
          overflowY: 'auto',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
              animation: 'typeIn 0.3s ease-out',
            }}
          >
            <div
              style={{
                maxWidth: '80%',
                padding: '12px 16px',
                borderRadius: 16,
                borderBottomLeftRadius: m.role === 'bot' ? 4 : 16,
                borderBottomRightRadius: m.role === 'user' ? 4 : 16,
                background:
                  m.role === 'user'
                    ? `linear-gradient(135deg, ${COLORS.accent}20, ${COLORS.accent}10)`
                    : 'rgba(255,255,255,0.04)',
                border: `1px solid ${m.role === 'user' ? `${COLORS.accent}25` : COLORS.cardBorder}`,
                fontSize: 13.5,
                color: COLORS.text,
                lineHeight: 1.7,
                fontFamily: font,
                whiteSpace: 'pre-line',
              }}
            >
              {m.text}
            </div>
          </div>
        ))}
        {typing && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      <div
        style={{
          padding: '14px 20px',
          borderTop: `1px solid ${COLORS.cardBorder}`,
          display: 'flex',
          gap: 10,
          alignItems: 'center',
        }}
      >
        <input
          placeholder={isLive ? 'Type a message...' : 'Demo mode - watching conversation...'}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          disabled={!isLive}
          style={{
            flex: 1,
            padding: '11px 16px',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${COLORS.cardBorder}`,
            color: COLORS.text,
            fontSize: 14,
            fontFamily: font,
            outline: 'none',
            opacity: isLive ? 1 : 0.5,
          }}
        />
        {phase >= DEMO_CONVO.length || isLive ? (
          <Btn onClick={onNext} style={{ padding: '11px 20px', fontSize: 13 }}>
            Continue →
          </Btn>
        ) : (
          <Btn variant="ghost" style={{ padding: '11px 16px', fontSize: 13 }} disabled>
            {isLive ? 'Send' : 'Demo'}
          </Btn>
        )}
      </div>
    </Card>
  );
}
