import { useState, useEffect, useRef, useCallback } from "react";

// ══════════════════════════════════════════════
// FINVISOR — Full 11-Step Hackathon Demo
// ══════════════════════════════════════════════

const COLORS = {
  bg: "#060b18",
  card: "rgba(255,255,255,0.025)",
  cardBorder: "rgba(255,255,255,0.06)",
  accent: "#22d3ee",
  accentAlt: "#a78bfa",
  green: "#34d399",
  amber: "#fbbf24",
  red: "#f87171",
  text: "rgba(255,255,255,0.88)",
  muted: "rgba(255,255,255,0.45)",
  dim: "rgba(255,255,255,0.25)",
};

const font = "'Outfit', sans-serif";
const displayFont = "'Fraunces', serif";

// ── Utility ──
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const Pill = ({ children, color = COLORS.accent, style }) => (
  <span style={{
    display: "inline-block", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
    textTransform: "uppercase", color, background: `${color}15`,
    border: `1px solid ${color}30`, borderRadius: 20, padding: "3px 10px",
    fontFamily: font, ...style
  }}>{children}</span>
);

const GlowDot = ({ color = COLORS.green, pulse }) => (
  <span style={{
    display: "inline-block", width: 8, height: 8, borderRadius: "50%",
    background: color, boxShadow: `0 0 8px ${color}80`,
    animation: pulse ? "pulse 1.5s infinite" : "none"
  }} />
);

// ── Background ──
function Background() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", background: COLORS.bg }}>
      <div style={{
        position: "absolute", top: "-25%", right: "-15%", width: "55vw", height: "55vw",
        background: "radial-gradient(circle, rgba(34,211,238,0.06) 0%, transparent 65%)",
        borderRadius: "50%", filter: "blur(80px)", animation: "drift1 22s ease-in-out infinite"
      }} />
      <div style={{
        position: "absolute", bottom: "-20%", left: "-10%", width: "45vw", height: "45vw",
        background: "radial-gradient(circle, rgba(167,139,250,0.05) 0%, transparent 65%)",
        borderRadius: "50%", filter: "blur(90px)", animation: "drift2 28s ease-in-out infinite"
      }} />
      <div style={{
        position: "absolute", top: "30%", left: "50%", width: "30vw", height: "30vw",
        background: "radial-gradient(circle, rgba(52,211,153,0.04) 0%, transparent 60%)",
        borderRadius: "50%", filter: "blur(60px)", animation: "drift3 18s ease-in-out infinite"
      }} />
      <style>{`
        @keyframes drift1{0%,100%{transform:translate(0,0)}50%{transform:translate(-30px,25px)}}
        @keyframes drift2{0%,100%{transform:translate(0,0)}50%{transform:translate(25px,-35px)}}
        @keyframes drift3{0%,100%{transform:translate(0,0)}50%{transform:translate(-20px,-20px)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes typeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideRight{from{width:0%}to{width:100%}}
      `}</style>
    </div>
  );
}

// ── Card ──
function Card({ children, style, wide }) {
  return (
    <div style={{
      background: COLORS.card, backdropFilter: "blur(24px)",
      border: `1px solid ${COLORS.cardBorder}`, borderRadius: 22,
      padding: "36px 32px", maxWidth: wide ? 960 : 620, width: "100%",
      margin: "0 auto", boxShadow: "0 24px 80px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)",
      position: "relative", zIndex: 2, animation: "fadeIn 0.45s ease-out", ...style
    }}>{children}</div>
  );
}

function Btn({ children, onClick, variant = "primary", style, disabled }) {
  const v = {
    primary: { background: `linear-gradient(135deg, ${COLORS.accent}, #06b6d4)`, color: "#000", fontWeight: 700, boxShadow: `0 4px 24px ${COLORS.accent}30` },
    purple: { background: `linear-gradient(135deg, ${COLORS.accentAlt}, #7c3aed)`, color: "#fff", boxShadow: `0 4px 24px ${COLORS.accentAlt}30` },
    green: { background: `linear-gradient(135deg, ${COLORS.green}, #059669)`, color: "#000", fontWeight: 700, boxShadow: `0 4px 24px ${COLORS.green}30` },
    outline: { background: "transparent", color: COLORS.text, border: `1px solid ${COLORS.cardBorder}` },
    ghost: { background: "rgba(255,255,255,0.05)", color: COLORS.muted },
  };
  return (
    <button onClick={disabled ? undefined : onClick} style={{
      padding: "13px 28px", borderRadius: 12, border: "none", cursor: disabled ? "default" : "pointer",
      fontSize: 14, fontFamily: font, letterSpacing: "0.01em", transition: "all 0.2s",
      opacity: disabled ? 0.45 : 1, display: "inline-flex", alignItems: "center", gap: 8,
      ...v[variant], ...style
    }}>{children}</button>
  );
}

// ── Progress bar ──
function StepNav({ current, total, labels }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 2, padding: "14px 0",
      position: "relative", zIndex: 2, justifyContent: "center", flexWrap: "wrap"
    }}>
      {labels.map((l, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <div style={{
              width: active ? "auto" : 24, height: 24, borderRadius: 12,
              padding: active ? "0 10px" : 0,
              background: done ? `${COLORS.accent}25` : active ? `${COLORS.accent}18` : "rgba(255,255,255,0.04)",
              border: `1px solid ${done ? `${COLORS.accent}40` : active ? `${COLORS.accent}30` : "rgba(255,255,255,0.08)"}`,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
              transition: "all 0.3s ease"
            }}>
              <span style={{
                fontSize: 10, fontWeight: 700, fontFamily: font,
                color: done || active ? COLORS.accent : COLORS.dim
              }}>{done ? "✓" : i + 1}</span>
              {active && <span style={{
                fontSize: 10, fontWeight: 600, color: COLORS.accent, fontFamily: font,
                whiteSpace: "nowrap"
              }}>{l}</span>}
            </div>
            {i < labels.length - 1 && <div style={{
              width: 12, height: 1, background: done ? `${COLORS.accent}30` : "rgba(255,255,255,0.06)"
            }} />}
          </div>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════
// STEP 1: FINNIE CHATBOT
// ════════════════════════════════════════════
function StepFinnie({ onNext }) {
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState("");
  const [typing, setTyping] = useState(false);
  const [phase, setPhase] = useState(0);
  const bottomRef = useRef(null);

  const CONVO = [
    { bot: "Hey! I'm Finnie, your financial aid advisor. 💙 I'm here to help you build the strongest possible appeal. First — what school are you attending?" },
    { user: "Stanford University" },
    { bot: "Great choice! Stanford has a strong financial aid program, and they do review appeals seriously. What's your current total aid package amount?" },
    { user: "They offered me $45,000 but tuition is $62,000" },
    { bot: "So you have a gap of about $17,000 — that's significant. Has anything changed in your family's financial situation recently? This could be job loss, medical expenses, divorce, or anything that affects income." },
    { user: "My mom lost her job in October and our income dropped a lot. Plus she's paying $1800/mo for COBRA insurance now" },
    { bot: "I'm really sorry to hear about your mom's job loss. That sounds incredibly stressful, and I want you to know — this is exactly the kind of circumstance that financial aid offices take very seriously. 💛\n\nA sudden income drop + high COBRA costs gives us a very strong foundation. I have a few more questions to strengthen your case:\n\n• Did you have to make any housing changes?\n• Do you have siblings who are also in school?\n• Has your family taken on any new debt?" },
    { user: "Yes we had to move to a smaller place and my two younger siblings had to switch schools. No new debt though" },
    { bot: "That's really helpful context. Housing displacement plus impact on siblings adds emotional weight to your appeal.\n\nHere's what I've gathered so far:\n\n📋 **Your Appeal Profile**\n• School: Stanford University\n• Current aid: $45,000 | Gap: ~$17,000\n• Trigger: Parent job loss (Oct 2025)\n• Income drop: ~34%\n• Added burden: COBRA ($1,800/mo)\n• Housing: Forced relocation\n• Family impact: 2 siblings displaced\n\nI'm feeling really good about this appeal. Ready to move to document upload so I can analyze your actual numbers?" },
  ];

  useEffect(() => {
    const run = async () => {
      for (let i = 0; i < CONVO.length; i++) {
        const entry = CONVO[i];
        if (entry.bot) {
          setTyping(true);
          await sleep(1200 + entry.bot.length * 4);
          setTyping(false);
          setMessages((prev) => [...prev, { role: "bot", text: entry.bot }]);
        } else {
          await sleep(800);
          setMessages((prev) => [...prev, { role: "user", text: entry.user }]);
        }
        setPhase(i + 1);
        await sleep(400);
      }
    };
    run();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        padding: "18px 24px", borderBottom: `1px solid ${COLORS.cardBorder}`,
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.green})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18
          }}>🐬</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text, fontFamily: font }}>Finnie</div>
            <div style={{ fontSize: 11, color: COLORS.muted, fontFamily: font, display: "flex", alignItems: "center", gap: 5 }}>
              <GlowDot color={COLORS.green} pulse /> AI Financial Aid Advisor
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <Pill color={COLORS.accent}>Claude SDK</Pill>
          <Pill color={COLORS.accentAlt}>Memory</Pill>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        height: 420, overflowY: "auto", padding: "20px 24px",
        display: "flex", flexDirection: "column", gap: 14
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            animation: "typeIn 0.3s ease-out"
          }}>
            <div style={{
              maxWidth: "80%", padding: "12px 16px", borderRadius: 16,
              borderBottomLeftRadius: m.role === "bot" ? 4 : 16,
              borderBottomRightRadius: m.role === "user" ? 4 : 16,
              background: m.role === "user"
                ? `linear-gradient(135deg, ${COLORS.accent}20, ${COLORS.accent}10)`
                : "rgba(255,255,255,0.04)",
              border: `1px solid ${m.role === "user" ? `${COLORS.accent}25` : COLORS.cardBorder}`,
              fontSize: 13.5, color: COLORS.text, lineHeight: 1.7, fontFamily: font,
              whiteSpace: "pre-line"
            }}>{m.text}</div>
          </div>
        ))}
        {typing && (
          <div style={{ display: "flex", gap: 5, padding: "8px 16px", animation: "typeIn 0.2s ease-out" }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{
                width: 7, height: 7, borderRadius: "50%", background: COLORS.accent,
                opacity: 0.5, animation: `pulse 1s ${i * 0.2}s infinite`
              }} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{
        padding: "14px 20px", borderTop: `1px solid ${COLORS.cardBorder}`,
        display: "flex", gap: 10, alignItems: "center"
      }}>
        <input
          placeholder="Type a message..."
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          style={{
            flex: 1, padding: "11px 16px", borderRadius: 12,
            background: "rgba(255,255,255,0.04)", border: `1px solid ${COLORS.cardBorder}`,
            color: COLORS.text, fontSize: 14, fontFamily: font, outline: "none"
          }}
        />
        {phase >= CONVO.length ? (
          <Btn onClick={onNext} style={{ padding: "11px 20px", fontSize: 13 }}>
            Continue →
          </Btn>
        ) : (
          <Btn variant="ghost" style={{ padding: "11px 16px", fontSize: 13 }}>Send</Btn>
        )}
      </div>
    </Card>
  );
}

// ════════════════════════════════════════════
// STEP 2: DOCUMENT UPLOAD & PARSING
// ════════════════════════════════════════════
function StepUpload({ onNext }) {
  const [uploaded, setUploaded] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState(null);

  const handleUpload = (type) => {
    setUploaded(type);
    setParsing(true);
    setTimeout(() => {
      setParsing(false);
      setParsed(type === "w2" ? {
        type: "W-2 Form",
        fields: [
          { k: "Gross Income", v: "$62,450", flag: false },
          { k: "Federal Tax Withheld", v: "$8,340", flag: false },
          { k: "Filing Status", v: "Head of Household", flag: false },
          { k: "Employer", v: "Terminated Oct 2025", flag: true },
          { k: "YoY Income Change", v: "−34.2%", flag: true },
        ]
      } : {
        type: "FAFSA / Aid Letter",
        fields: [
          { k: "EFC (Expected Family Contribution)", v: "$12,800", flag: false },
          { k: "Federal Pell Grant", v: "$3,200", flag: false },
          { k: "Institutional Grant", v: "$32,000", flag: false },
          { k: "Subsidized Loan", v: "$5,500", flag: false },
          { k: "Unmet Need", v: "$17,300", flag: true },
          { k: "Total Package", v: "$45,000", flag: false },
        ]
      });
    }, 2800);
  };

  return (
    <Card>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <Pill color={COLORS.accentAlt} style={{ marginBottom: 10 }}>STEP 2 — DOCUMENT INTELLIGENCE</Pill>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, fontFamily: displayFont, margin: "8px 0 4px" }}>
          Upload Your Documents
        </h2>
        <p style={{ fontSize: 13, color: COLORS.muted, fontFamily: font }}>
          Our AI agents extract structured financial data in seconds
        </p>
      </div>

      {!uploaded && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
          {[
            { id: "w2", icon: "📄", title: "W-2 Form", desc: "Parent's wage statement" },
            { id: "fafsa", icon: "🎓", title: "Aid Letter / FAFSA", desc: "Current financial aid offer" },
          ].map((d) => (
            <div key={d.id} onClick={() => handleUpload(d.id)} style={{
              padding: "28px 20px", borderRadius: 16, textAlign: "center", cursor: "pointer",
              background: "rgba(255,255,255,0.03)", border: `2px dashed ${COLORS.cardBorder}`,
              transition: "all 0.2s"
            }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>{d.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, fontFamily: font }}>{d.title}</div>
              <div style={{ fontSize: 12, color: COLORS.muted, fontFamily: font, marginTop: 4 }}>{d.desc}</div>
              <div style={{ fontSize: 11, color: COLORS.accent, fontFamily: font, marginTop: 8 }}>Click to upload (demo)</div>
            </div>
          ))}
        </div>
      )}

      {parsing && (
        <div style={{
          background: `${COLORS.accent}08`, border: `1px solid ${COLORS.accent}20`,
          borderRadius: 16, padding: 28, textAlign: "center", animation: "fadeIn 0.3s ease-out"
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            border: `2.5px solid ${COLORS.accent}30`, borderTopColor: COLORS.accent,
            animation: "spin 0.7s linear infinite", margin: "0 auto 14px"
          }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.accent, fontFamily: font }}>
            AI Agent parsing {uploaded === "w2" ? "W-2" : "Aid Letter"}...
          </div>
          <div style={{ fontSize: 12, color: COLORS.muted, fontFamily: font, marginTop: 6 }}>
            Extracting fields → Structured JSON output
          </div>
        </div>
      )}

      {parsed && (
        <div style={{ animation: "fadeIn 0.4s ease-out" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8, marginBottom: 14
          }}>
            <GlowDot color={COLORS.green} />
            <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.green, fontFamily: font }}>
              {parsed.type} — Parsed Successfully
            </span>
          </div>
          <div style={{
            background: "rgba(255,255,255,0.03)", borderRadius: 14, overflow: "hidden",
            border: `1px solid ${COLORS.cardBorder}`
          }}>
            {parsed.fields.map((f, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "12px 18px",
                borderBottom: i < parsed.fields.length - 1 ? `1px solid ${COLORS.cardBorder}` : "none",
                background: f.flag ? `${COLORS.amber}06` : "transparent"
              }}>
                <span style={{ fontSize: 13, color: f.flag ? COLORS.amber : COLORS.muted, fontFamily: font }}>
                  {f.flag ? "⚠ " : ""}{f.k}
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: f.flag ? COLORS.amber : COLORS.text, fontFamily: font }}>
                  {f.v}
                </span>
              </div>
            ))}
          </div>

          {/* JSON preview */}
          <div style={{
            marginTop: 14, background: "rgba(0,0,0,0.3)", borderRadius: 10,
            padding: "12px 16px", fontFamily: "monospace", fontSize: 11,
            color: COLORS.accent, lineHeight: 1.6, overflow: "hidden"
          }}>
            <span style={{ color: COLORS.dim }}>// structured output</span><br />
            {`{ "type": "${parsed.type}", "fields": ${parsed.fields.length}, "flags": ${parsed.fields.filter(f=>f.flag).length} }`}
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            {!uploaded || uploaded === "w2" ? (
              <Btn variant="outline" onClick={() => { setUploaded(null); setParsed(null); }} style={{ flex: 1, justifyContent: "center", fontSize: 13 }}>
                + Upload Another Doc
              </Btn>
            ) : null}
            <Btn onClick={onNext} style={{ flex: 1, justifyContent: "center", fontSize: 13 }}>
              Run Gap Strategy Agent →
            </Btn>
          </div>
        </div>
      )}
    </Card>
  );
}

// ════════════════════════════════════════════
// STEP 3: GAP STRATEGY AGENT
// ════════════════════════════════════════════
function StepStrategy({ onNext }) {
  const [steps, setSteps] = useState([]);
  const [done, setDone] = useState(false);

  const REASONING = [
    { label: "Checking income change...", result: "✅ Income outdated — 34% drop detected", color: COLORS.green },
    { label: "Evaluating medical expenses...", result: "✅ COBRA $1,800/mo = $21,600/yr burden", color: COLORS.green },
    { label: "Scanning competing offers...", result: "⏭ No competing offer on file — skip", color: COLORS.muted },
    { label: "Assessing merit leverage...", result: "✅ 3.8 GPA + research — merit angle viable", color: COLORS.green },
    { label: "Dependency override check...", result: "⏭ Not applicable — standard dependency", color: COLORS.muted },
    { label: "Housing hardship analysis...", result: "✅ Forced relocation — strong hardship signal", color: COLORS.green },
    { label: "Building negotiation plan...", result: "🔥 4 strong appeal vectors identified", color: COLORS.amber },
  ];

  useEffect(() => {
    const run = async () => {
      for (let i = 0; i < REASONING.length; i++) {
        setSteps((prev) => [...prev, { ...REASONING[i], phase: "thinking" }]);
        await sleep(1200);
        setSteps((prev) => {
          const copy = [...prev];
          copy[i] = { ...copy[i], phase: "done" };
          return copy;
        });
        await sleep(300);
      }
      setDone(true);
    };
    run();
  }, []);

  return (
    <Card>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <Pill color={COLORS.amber} style={{ marginBottom: 10 }}>STEP 3 — MULTI-STEP REASONING</Pill>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, fontFamily: displayFont, margin: "8px 0 4px" }}>
          Gap Strategy Agent
        </h2>
        <p style={{ fontSize: 13, color: COLORS.muted, fontFamily: font }}>
          Chain-of-thought analysis to build your negotiation plan
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {steps.map((s, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
            borderRadius: 12, background: "rgba(255,255,255,0.02)",
            border: `1px solid ${s.phase === "done" ? `${s.color}20` : COLORS.cardBorder}`,
            animation: "fadeIn 0.3s ease-out", transition: "border-color 0.3s"
          }}>
            {s.phase === "thinking" ? (
              <div style={{
                width: 16, height: 16, borderRadius: "50%",
                border: `2px solid ${COLORS.accent}30`, borderTopColor: COLORS.accent,
                animation: "spin 0.7s linear infinite", flexShrink: 0
              }} />
            ) : (
              <GlowDot color={s.color} />
            )}
            <span style={{
              fontSize: 13, fontFamily: font, fontWeight: 500,
              color: s.phase === "done" ? s.color : COLORS.muted
            }}>
              {s.phase === "done" ? s.result : s.label}
            </span>
          </div>
        ))}
      </div>

      {done && (
        <div style={{ animation: "fadeIn 0.5s ease-out" }}>
          <div style={{
            background: `${COLORS.amber}08`, border: `1px solid ${COLORS.amber}25`,
            borderRadius: 14, padding: 20, marginBottom: 20
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.amber, fontFamily: font, marginBottom: 10 }}>
              🔥 NEGOTIATION PLAN
            </div>
            {[
              "Lead with income documentation — 34% drop is the strongest vector",
              "Quantify COBRA burden ($21,600/yr) as concrete additional hardship",
              "Include housing displacement narrative for emotional resonance",
              "Mention academic merit (3.8 GPA) to frame as investment worth protecting",
            ].map((p, i) => (
              <div key={i} style={{
                fontSize: 13, color: COLORS.text, fontFamily: font, lineHeight: 1.7,
                padding: "4px 0 4px 16px", borderLeft: `2px solid ${COLORS.amber}40`,
                marginBottom: 6
              }}>{i + 1}. {p}</div>
            ))}
          </div>
          <Btn onClick={onNext} style={{ width: "100%", justifyContent: "center" }}>
            Research & Gather Evidence →
          </Btn>
        </div>
      )}
    </Card>
  );
}

// ════════════════════════════════════════════
// STEP 4: RESEARCH AGENT (Perplexity-style)
// ════════════════════════════════════════════
function StepResearch({ onNext }) {
  const [queries, setQueries] = useState([]);
  const [done, setDone] = useState(false);

  const RESEARCH = [
    { q: "Stanford average financial aid package 2025", result: "Average need-based grant: $59,400. 70% of students receive aid.", src: "Stanford Financial Aid Office" },
    { q: "Financial aid appeal success rate top universities", result: "Appeals with documented income changes have 40-60% success rate at top-20 schools.", src: "Journal of Student Financial Aid" },
    { q: "COBRA insurance average cost 2025", result: "Average COBRA premium: $1,700/mo for family coverage. Above $1,500 qualifies as 'significant burden' in most appeal frameworks.", src: "KFF Health Insurance Report" },
    { q: "Stanford financial aid appeal policy language", result: "Stanford's SAR (Special Circumstances Review) allows mid-year reassessment for 'significant change in family finances.'", src: "Stanford SAR Documentation" },
    { q: "Peer institution aid comparison Ivy+ schools", result: "Harvard avg grant: $59,076 | Yale: $62,250 | Princeton: $60,500 — Stanford's $45K offer is below peer median.", src: "IPEDS Data 2024-25" },
  ];

  useEffect(() => {
    const run = async () => {
      for (let i = 0; i < RESEARCH.length; i++) {
        setQueries((prev) => [...prev, { ...RESEARCH[i], phase: "searching" }]);
        await sleep(1800);
        setQueries((prev) => {
          const copy = [...prev];
          copy[i] = { ...copy[i], phase: "found" };
          return copy;
        });
        await sleep(200);
      }
      setDone(true);
    };
    run();
  }, []);

  return (
    <Card>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <Pill color={COLORS.green} style={{ marginBottom: 10 }}>STEP 4 — RESEARCH AGENT</Pill>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, fontFamily: displayFont, margin: "8px 0 4px" }}>
          Evidence & Data Gathering
        </h2>
        <p style={{ fontSize: 13, color: COLORS.muted, fontFamily: font }}>
          Real citations to supercharge your appeal
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {queries.map((q, i) => (
          <div key={i} style={{
            borderRadius: 14, overflow: "hidden",
            border: `1px solid ${q.phase === "found" ? `${COLORS.green}20` : COLORS.cardBorder}`,
            animation: "fadeIn 0.3s ease-out"
          }}>
            <div style={{
              padding: "10px 16px", display: "flex", alignItems: "center", gap: 10,
              background: "rgba(255,255,255,0.02)"
            }}>
              {q.phase === "searching" ? (
                <div style={{
                  width: 14, height: 14, borderRadius: "50%",
                  border: `2px solid ${COLORS.green}30`, borderTopColor: COLORS.green,
                  animation: "spin 0.7s linear infinite", flexShrink: 0
                }} />
              ) : (
                <span style={{ fontSize: 12 }}>🔍</span>
              )}
              <span style={{ fontSize: 12, color: COLORS.muted, fontFamily: "monospace" }}>
                {q.q}
              </span>
            </div>
            {q.phase === "found" && (
              <div style={{ padding: "10px 16px", borderTop: `1px solid ${COLORS.cardBorder}` }}>
                <div style={{ fontSize: 13, color: COLORS.text, fontFamily: font, lineHeight: 1.6, marginBottom: 4 }}>
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
        <Btn onClick={onNext} style={{ width: "100%", justifyContent: "center" }}>
          Generate Appeal Letter →
        </Btn>
      )}
    </Card>
  );
}

// ════════════════════════════════════════════
// STEP 5: APPEAL GENERATION
// ════════════════════════════════════════════
function StepAppeal({ onNext }) {
  const [lines, setLines] = useState([]);
  const [done, setDone] = useState(false);

  const LETTER = [
    "Dear Stanford University Office of Financial Aid,",
    "",
    "I am writing to request a Special Circumstances Review of my financial aid package for the 2025–2026 academic year. A significant and unforeseen change in my family's financial situation has created a substantial gap between our demonstrated need and my current award.",
    "",
    "In October 2025, my mother — our household's primary earner — experienced an unexpected job termination. As documented in the attached W-2, this resulted in a 34.2% decrease in household income, from $95,800 to $62,450. This figure no longer reflects our family's ability to contribute to educational costs.",
    "",
    "The financial strain extends well beyond lost wages. We now carry $1,800 per month ($21,600 annually) in COBRA health insurance premiums — a figure that exceeds the national family average of $1,700/month (KFF, 2025). Additionally, our family was forced to relocate to more affordable housing, displacing my two younger siblings from their schools.",
    "",
    "I would also respectfully note that my current institutional grant of $32,000 falls below the peer-institution median. According to IPEDS 2024–25 data, comparable need-based grants at Harvard ($59,076), Yale ($62,250), and Princeton ($60,500) significantly exceed my current award. Stanford's own published average need-based grant of $59,400 further illustrates this gap.",
    "",
    "Throughout these challenges, I have maintained a 3.8 GPA and continued my research contributions. I am deeply committed to my education at Stanford and believe a revised assessment of my family's financial circumstances will confirm eligibility for additional need-based support.",
    "",
    "I have attached supporting documentation including my mother's W-2, proof of unemployment, COBRA enrollment confirmation, and our current lease agreement. I am available to provide any additional materials your office may require.",
    "",
    "Thank you for your time and careful consideration.",
    "",
    "Sincerely,",
    "Sarah Chen",
    "Stanford University, Class of 2028"
  ];

  useEffect(() => {
    const run = async () => {
      for (let i = 0; i < LETTER.length; i++) {
        setLines((prev) => [...prev, LETTER[i]]);
        await sleep(LETTER[i] === "" ? 80 : 150 + LETTER[i].length * 2);
      }
      setDone(true);
    };
    run();
  }, []);

  return (
    <Card style={{ maxWidth: 720 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <Pill color={COLORS.accentAlt} style={{ marginBottom: 8 }}>STEP 5 — AI GENERATION</Pill>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, fontFamily: displayFont, margin: 0 }}>
            Your Appeal Letter
          </h2>
        </div>
        {done && (
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="outline" style={{ padding: "8px 14px", fontSize: 12 }}>📋 Copy</Btn>
            <Btn variant="green" style={{ padding: "8px 14px", fontSize: 12 }}>📄 Export PDF</Btn>
          </div>
        )}
      </div>

      <div style={{
        background: "rgba(0,0,0,0.2)", borderRadius: 14, padding: "28px 24px",
        border: `1px solid ${COLORS.cardBorder}`, minHeight: 280
      }}>
        {lines.map((line, i) => (
          <p key={i} style={{
            fontSize: 13.5, color: COLORS.text, lineHeight: 1.85, fontFamily: font,
            margin: line === "" ? "14px 0" : "0",
            fontWeight: (i === 0 || i >= LETTER.length - 3) ? 600 : 400,
            animation: "typeIn 0.2s ease-out"
          }}>{line}</p>
        ))}
        {!done && (
          <span style={{
            display: "inline-block", width: 2, height: 18,
            background: COLORS.accentAlt, animation: "blink 0.8s infinite",
            borderRadius: 1, verticalAlign: "middle", marginLeft: 2
          }} />
        )}
      </div>

      {done && (
        <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
          <div style={{
            flex: 1, background: `${COLORS.green}08`, border: `1px solid ${COLORS.green}20`,
            borderRadius: 10, padding: "10px 14px", fontSize: 12, color: COLORS.green, fontFamily: font
          }}>✅ Tone: Professional & empathetic</div>
          <div style={{
            flex: 1, background: `${COLORS.accent}08`, border: `1px solid ${COLORS.accent}20`,
            borderRadius: 10, padding: "10px 14px", fontSize: 12, color: COLORS.accent, fontFamily: font
          }}>📊 3 data citations included</div>
        </div>
      )}

      {done && (
        <Btn onClick={onNext} style={{ width: "100%", justifyContent: "center", marginTop: 16 }}>
          Auto-Submit via Browser Agent →
        </Btn>
      )}
    </Card>
  );
}

// ════════════════════════════════════════════
// STEP 6: BROWSER AUTOMATION
// ════════════════════════════════════════════
function StepSubmit({ onNext }) {
  const [steps, setSteps] = useState([]);
  const [done, setDone] = useState(false);

  const ACTIONS = [
    { icon: "🌐", text: "Opening Stanford financial aid portal..." },
    { icon: "🔑", text: "Authenticating with student credentials..." },
    { icon: "📝", text: 'Navigating to "Special Circumstances Review" form...' },
    { icon: "✍️", text: "Filling in personal & financial details..." },
    { icon: "📎", text: "Attaching appeal letter PDF + W-2 + supporting docs..." },
    { icon: "🔍", text: "Reviewing submission for completeness..." },
    { icon: "🚀", text: "Submitting appeal — confirmation received!" },
  ];

  useEffect(() => {
    const run = async () => {
      for (let i = 0; i < ACTIONS.length; i++) {
        setSteps((prev) => [...prev, { ...ACTIONS[i], phase: "running" }]);
        await sleep(1600);
        setSteps((prev) => {
          const copy = [...prev];
          copy[i] = { ...copy[i], phase: "done" };
          return copy;
        });
        await sleep(200);
      }
      setDone(true);
    };
    run();
  }, []);

  return (
    <Card>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <Pill color={COLORS.red} style={{ marginBottom: 10 }}>STEP 6 — BROWSER AUTOMATION</Pill>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, fontFamily: displayFont, margin: "8px 0 4px" }}>
          Auto-Submission Agent
        </h2>
        <p style={{ fontSize: 13, color: COLORS.muted, fontFamily: font }}>
          Browserbase agent submits your appeal automatically
        </p>
      </div>

      {/* Fake browser chrome */}
      <div style={{
        borderRadius: 14, overflow: "hidden", border: `1px solid ${COLORS.cardBorder}`, marginBottom: 20
      }}>
        <div style={{
          background: "rgba(255,255,255,0.04)", padding: "10px 16px",
          display: "flex", alignItems: "center", gap: 8, borderBottom: `1px solid ${COLORS.cardBorder}`
        }}>
          <div style={{ display: "flex", gap: 5 }}>
            {["#f87171", "#fbbf24", "#34d399"].map((c) => (
              <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.7 }} />
            ))}
          </div>
          <div style={{
            flex: 1, background: "rgba(255,255,255,0.05)", borderRadius: 6,
            padding: "5px 12px", fontSize: 11, color: COLORS.muted, fontFamily: "monospace"
          }}>
            https://financialaid.stanford.edu/special-circumstances
          </div>
        </div>

        <div style={{ padding: 20, minHeight: 200 }}>
          {steps.map((s, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
              animation: "fadeIn 0.3s ease-out"
            }}>
              {s.phase === "running" ? (
                <div style={{
                  width: 16, height: 16, borderRadius: "50%",
                  border: `2px solid ${COLORS.accent}30`, borderTopColor: COLORS.accent,
                  animation: "spin 0.7s linear infinite", flexShrink: 0
                }} />
              ) : (
                <span style={{ fontSize: 14 }}>{s.icon}</span>
              )}
              <span style={{
                fontSize: 13, fontFamily: font,
                color: s.phase === "done" ? COLORS.green : COLORS.muted
              }}>{s.text}</span>
            </div>
          ))}
        </div>
      </div>

      {done && (
        <div style={{
          background: `${COLORS.green}08`, border: `1px solid ${COLORS.green}25`,
          borderRadius: 14, padding: 20, textAlign: "center",
          marginBottom: 16, animation: "fadeIn 0.5s ease-out"
        }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🎉</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.green, fontFamily: font }}>
            Appeal Successfully Submitted!
          </div>
          <div style={{ fontSize: 12, color: COLORS.muted, fontFamily: font, marginTop: 4 }}>
            Confirmation #SFA-2026-04821 · Estimated response: 2-3 weeks
          </div>
        </div>
      )}

      {done && <Btn onClick={onNext} style={{ width: "100%", justifyContent: "center" }}>
        Continue to Advisor Mode →
      </Btn>}
    </Card>
  );
}

// ════════════════════════════════════════════
// STEP 7+8: ZOOM LIVE ADVISOR
// ════════════════════════════════════════════
function StepZoom({ onNext }) {
  const [phase, setPhase] = useState("connecting");
  const [transcript, setTranscript] = useState([]);
  const [insights, setInsights] = useState([]);
  const tIdx = useRef(0);

  const SCRIPT = [
    { speaker: "Advisor", text: "Sarah, great to connect. I've reviewed everything Finnie compiled — your appeal is already submitted, so let's talk strategy for the follow-up." },
    { speaker: "Student", text: "Thank you! I'm a bit nervous about waiting. Is there anything else I should do?" },
    { speaker: "Advisor", text: "Great question. I'd recommend sending a brief follow-up email to your aid officer in about a week. Reference your confirmation number and express continued interest." },
    { speaker: "Student", text: "Okay, that makes sense. What if they come back with only a partial increase?" },
    { speaker: "Advisor", text: "That's actually common. If they offer a partial increase, we can do a second round citing the peer data — your package is still below the Ivy+ median even after a bump." },
  ];

  const INSIGHTS_DATA = [
    "📋 AI Summary: Student submitted appeal #SFA-2026-04821",
    "💡 Advisor recommends: Follow-up email in 7 days",
    "⚡ Strategy note: Peer comparison data reserved for potential round 2",
    "🎯 Action item: Prepare counter-offer template if partial increase",
  ];

  useEffect(() => {
    setTimeout(() => setPhase("live"), 2500);
  }, []);

  useEffect(() => {
    if (phase !== "live") return;
    const interval = setInterval(() => {
      const idx = tIdx.current;
      if (idx < SCRIPT.length) {
        setTranscript((prev) => [...prev, SCRIPT[idx]]);
        if (idx > 0 && idx - 1 < INSIGHTS_DATA.length) {
          setTimeout(() => setInsights((prev) => [...prev, INSIGHTS_DATA[idx - 1]]), 600);
        }
        tIdx.current++;
      } else {
        clearInterval(interval);
        setTimeout(() => setPhase("ended"), 1500);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [phase]);

  if (phase === "connecting") {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎥</div>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            border: `2.5px solid ${COLORS.accent}30`, borderTopColor: COLORS.accent,
            animation: "spin 0.7s linear infinite", margin: "0 auto 16px"
          }} />
          <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, fontFamily: font }}>Connecting to Zoom...</div>
          <div style={{ fontSize: 12, color: COLORS.muted, fontFamily: font, marginTop: 6 }}>
            Zoom API · Real-time transcription · Deployed on Render
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card wide style={{ padding: 0, overflow: "hidden" }}>
      <div style={{
        padding: "14px 20px", borderBottom: `1px solid ${COLORS.cardBorder}`,
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <GlowDot color={phase === "live" ? COLORS.red : COLORS.muted} pulse={phase === "live"} />
          <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, fontFamily: font }}>
            {phase === "live" ? "LIVE — Zoom Advisory" : "Session Complete"}
          </span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <Pill color={COLORS.accent}>Zoom API</Pill>
          <Pill color={COLORS.green}>Render</Pill>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: 350 }}>
        <div style={{
          padding: 20, borderRight: `1px solid ${COLORS.cardBorder}`,
          overflowY: "auto", maxHeight: 380
        }}>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
            color: COLORS.dim, marginBottom: 14, fontFamily: font
          }}>LIVE TRANSCRIPT</div>
          {transcript.map((t, i) => (
            <div key={i} style={{ marginBottom: 12, animation: "typeIn 0.3s ease-out" }}>
              <span style={{
                fontSize: 11, fontWeight: 700, fontFamily: font,
                color: t.speaker === "Advisor" ? COLORS.accent : COLORS.green
              }}>{t.speaker}</span>
              <p style={{ margin: "3px 0 0", fontSize: 13, color: COLORS.text, lineHeight: 1.6, fontFamily: font }}>
                {t.text}
              </p>
            </div>
          ))}
          {phase === "live" && (
            <div style={{ display: "flex", gap: 4, paddingTop: 4 }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: "50%", background: COLORS.accent,
                  animation: `pulse 1s ${i * 0.2}s infinite`
                }} />
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: 20, overflowY: "auto", maxHeight: 380 }}>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
            color: COLORS.dim, marginBottom: 14, fontFamily: font
          }}>AI REAL-TIME INSIGHTS</div>
          {insights.map((ins, i) => (
            <div key={i} style={{
              fontSize: 12, color: COLORS.text, fontFamily: font, lineHeight: 1.6,
              padding: "8px 12px", background: `${COLORS.amber}06`,
              borderRadius: 8, marginBottom: 6, animation: "typeIn 0.3s ease-out",
              border: `1px solid ${COLORS.amber}15`
            }}>{ins}</div>
          ))}
        </div>
      </div>

      {phase === "ended" && (
        <div style={{
          padding: "16px 20px", borderTop: `1px solid ${COLORS.cardBorder}`,
          textAlign: "center"
        }}>
          <Btn onClick={onNext}>View Dashboard & Pricing →</Btn>
        </div>
      )}
    </Card>
  );
}

// ════════════════════════════════════════════
// STEP 9+10+11: DASHBOARD / MONETIZATION / DEPLOY
// ════════════════════════════════════════════
function StepDashboard() {
  return (
    <Card wide>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <Pill color={COLORS.accent} style={{ marginBottom: 10 }}>FINVISOR — SHIPPED PRODUCT</Pill>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: COLORS.text, fontFamily: displayFont, margin: "8px 0 4px" }}>
          Dashboard & Monetization
        </h2>
        <p style={{ fontSize: 13, color: COLORS.muted, fontFamily: font }}>
          Production-ready • Deployed on Vercel • Revenue-generating
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
        {[
          { label: "Appeals Filed", val: "1,247", color: COLORS.accent },
          { label: "Success Rate", val: "68%", color: COLORS.green },
          { label: "Avg Aid Increase", val: "$8,420", color: COLORS.amber },
          { label: "Revenue (MRR)", val: "$12.4k", color: COLORS.accentAlt },
        ].map((s) => (
          <div key={s.label} style={{
            background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: "18px 16px",
            border: `1px solid ${COLORS.cardBorder}`, textAlign: "center"
          }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color, fontFamily: font }}>{s.val}</div>
            <div style={{ fontSize: 11, color: COLORS.muted, fontFamily: font, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Pricing */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.dim, fontFamily: font, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>
          PRICING TIERS
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { name: "Basic", price: "$9", features: ["AI intake conversation", "Document parsing", "Gap analysis", "Basic appeal letter"], accent: COLORS.muted },
            { name: "Pro", price: "$29", features: ["Everything in Basic", "Research citations", "Auto-submission agent", "Zoom advisor session"], accent: COLORS.accent, pop: true },
            { name: "Premium", price: "$49", features: ["Everything in Pro", "Counter-offer templates", "Multi-round strategy", "Priority advisor access"], accent: COLORS.accentAlt },
          ].map((tier) => (
            <div key={tier.name} style={{
              background: tier.pop ? `${tier.accent}08` : "rgba(255,255,255,0.02)",
              borderRadius: 16, padding: "24px 20px",
              border: `1px solid ${tier.pop ? `${tier.accent}30` : COLORS.cardBorder}`,
              position: "relative"
            }}>
              {tier.pop && (
                <div style={{
                  position: "absolute", top: -8, right: 16,
                  background: COLORS.accent, color: "#000",
                  fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 6,
                  fontFamily: font
                }}>POPULAR</div>
              )}
              <div style={{ fontSize: 14, fontWeight: 700, color: tier.accent, fontFamily: font, marginBottom: 4 }}>{tier.name}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.text, fontFamily: font, marginBottom: 14 }}>
                {tier.price}<span style={{ fontSize: 13, color: COLORS.muted }}>/appeal</span>
              </div>
              {tier.features.map((f, i) => (
                <div key={i} style={{
                  fontSize: 12, color: COLORS.muted, fontFamily: font,
                  padding: "4px 0", display: "flex", alignItems: "center", gap: 6
                }}>
                  <span style={{ color: tier.accent, fontSize: 10 }}>✓</span> {f}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div style={{
        background: "rgba(255,255,255,0.02)", borderRadius: 14, padding: 20,
        border: `1px solid ${COLORS.cardBorder}`, marginBottom: 20
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.dim, fontFamily: font, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>
          SPONSOR INTEGRATIONS
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {[
            { name: "Anthropic (Claude)", tag: "Reasoning + Generation" },
            { name: "OpenAI", tag: "Creative + Intake" },
            { name: "Zoom", tag: "Live Advisor" },
            { name: "Render", tag: "Backend Infra" },
            { name: "Perplexity", tag: "Research Agent" },
            { name: "Browserbase", tag: "Auto-Submit" },
            { name: "Modal", tag: "Scalable Compute" },
            { name: "Vercel", tag: "Frontend Deploy" },
            { name: "Fetch.ai", tag: "Payment Agents" },
            { name: "Visa", tag: "Commerce Layer" },
          ].map((s) => (
            <div key={s.name} style={{
              background: "rgba(255,255,255,0.04)", borderRadius: 8,
              padding: "6px 12px", display: "flex", alignItems: "center", gap: 6,
              border: `1px solid ${COLORS.cardBorder}`
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.text, fontFamily: font }}>{s.name}</span>
              <span style={{ fontSize: 10, color: COLORS.muted, fontFamily: font }}>· {s.tag}</span>
            </div>
          ))}
        </div>
      </div>

      {/* YC Angle */}
      <div style={{
        background: `${COLORS.amber}06`, borderRadius: 14, padding: 20,
        border: `1px solid ${COLORS.amber}20`, textAlign: "center"
      }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>🚀</div>
        <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.amber, fontFamily: displayFont }}>
          The YC Pitch
        </div>
        <div style={{ fontSize: 14, color: COLORS.text, fontFamily: font, lineHeight: 1.7, marginTop: 8, maxWidth: 500, margin: "8px auto 0" }}>
          College advising is a $2B industry built on human gatekeepers.
          Finvisor replaces the entire workflow — intake, analysis, research, writing, and submission — with AI agents.
          Outcome-driven. Measurable. Scalable to 100K concurrent students on Modal.
        </div>
        <Btn variant="ghost" style={{ marginTop: 16, cursor: "default" }}>
          finvisor.ai · Live on Vercel ✨
        </Btn>
      </div>
    </Card>
  );
}

// ════════════════════════════════════════════
// MAIN APP
// ════════════════════════════════════════════
const STEP_LABELS = [
  "Finnie Chat", "Upload Docs", "Gap Strategy", "Research",
  "Generate Appeal", "Auto-Submit", "Live Advisor", "Dashboard"
];

export default function Finvisor() {
  const [step, setStep] = useState(0);

  const next = () => setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));

  return (
    <div style={{ minHeight: "100vh", fontFamily: font, color: COLORS.text, position: "relative" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,700;9..144,800&display=swap" rel="stylesheet" />
      <Background />

      {/* Header */}
      <div style={{
        position: "relative", zIndex: 2, padding: "16px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.green})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 800, color: "#000", fontFamily: displayFont
          }}>F</div>
          <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", fontFamily: font }}>finvisor</span>
          <Pill color={COLORS.muted} style={{ marginLeft: 8 }}>TreeHacks 2026</Pill>
        </div>
      </div>

      <StepNav current={step} total={STEP_LABELS.length} labels={STEP_LABELS} />

      <div style={{
        padding: "8px 20px 60px", position: "relative", zIndex: 2,
        display: "flex", justifyContent: "center"
      }}>
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
