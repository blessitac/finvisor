# 🐬 Finvisor — AI Financial Aid Advisor

> **AI-powered financial aid appeal platform built for TreeHacks 2026**

Finvisor is a comprehensive AI platform that helps students navigate the financial aid appeal process. From initial intake to document analysis, strategy development, research, letter generation, and automated submission — Finvisor leverages cutting-edge AI to maximize students' chances of securing additional financial aid.

![Finvisor Demo](https://img.shields.io/badge/TreeHacks-2026-cyan?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)

## ✨ Features

### 🎯 8-Step AI Workflow

1. **Finnie Chat** — Empathetic AI intake conversation (OpenAI + Decagon)
2. **Document Upload** — Intelligent document parsing (OpenAI Vision + Modal)
3. **Gap Strategy** — Multi-step reasoning analysis (Anthropic Claude)
4. **Research Agent** — Citation-backed research (Perplexity Sonar Pro)
5. **Appeal Generation** — Professional letter writing (Claude + Modal)
6. **Auto-Submit** — Browser automation (Browserbase)
7. **Live Advisor** — Zoom integration with AI insights (Zoom API + Render)
8. **Dashboard** — Analytics and monetization (Fetch.ai + Vercel)

## 🛠 Sponsor Integrations

| Sponsor | Integration | Purpose |
|---------|-------------|---------|
| **OpenAI** | GPT-4 Turbo, Vision | Core intelligence, intake chat, document parsing |
| **Anthropic** | Claude Sonnet 4 | Chain-of-thought reasoning, appeal letter generation |
| **Modal** | Serverless GPU | Scalable inference, batch processing, ML predictions |
| **Zoom** | Meetings API | Live advisor sessions with transcription |
| **Render** | Backend hosting | API deployment and webhook endpoints |
| **Browserbase** | Browser automation | Automated form submission to aid portals |
| **Perplexity** | Sonar Pro | Real-time research with citations |
| **Vercel** | Frontend hosting | Production deployment with edge functions |
| **Fetch.ai** | Agent marketplace | Monetized agent services and payments |
| **Decagon** | Conversational AI | Enhanced UX with intent detection |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- API keys for the sponsors you want to use

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/finvisor.git
cd finvisor

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Add your API keys to .env.local

# Start development server
npm run dev
```

### Environment Variables

```env
# Core AI Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Research & Search
PERPLEXITY_API_KEY=pplx-...

# Browser Automation
BROWSERBASE_API_KEY=bb_...
BROWSERBASE_PROJECT_ID=...

# Video Communication (Zoom Server-to-Server OAuth)
ZOOM_CLIENT_ID=...        # From Zoom App credentials
ZOOM_CLIENT_SECRET=...    # From Zoom App credentials
ZOOM_ACCOUNT_ID=...       # From Zoom App credentials
ZOOM_USER_EMAIL=...       # Email of the Zoom user to create meetings for

# Compute Infrastructure
MODAL_TOKEN_ID=...
MODAL_TOKEN_SECRET=...

# Agent Monetization
FETCHAI_API_KEY=...
FETCHAI_AGENT_ADDRESS=agent1...

# Conversational UX
DECAGON_API_KEY=...
DECAGON_BOT_ID=...
```

## 📁 Project Structure

```
finvisor/
├── src/
│   ├── app/
│   │   ├── api/              # API Routes
│   │   │   ├── chat/         # OpenAI + Decagon chat
│   │   │   ├── documents/    # Document parsing
│   │   │   ├── strategy/     # Claude reasoning
│   │   │   ├── research/     # Perplexity search
│   │   │   ├── appeal/       # Letter generation
│   │   │   ├── submit/       # Browserbase automation
│   │   │   ├── zoom/         # Meeting management
│   │   │   ├── payment/      # Fetch.ai payments
│   │   │   └── analytics/    # Dashboard data
│   │   ├── globals.css       # Theme & animations
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Main app
│   ├── components/
│   │   ├── ui.tsx            # Shared UI components
│   │   └── steps/            # Step components
│   │       ├── StepFinnie.tsx
│   │       ├── StepUpload.tsx
│   │       ├── StepStrategy.tsx
│   │       ├── StepResearch.tsx
│   │       ├── StepAppeal.tsx
│   │       ├── StepSubmit.tsx
│   │       ├── StepZoom.tsx
│   │       └── StepDashboard.tsx
│   ├── lib/                  # API integrations
│   │   ├── openai.ts         # OpenAI SDK wrapper
│   │   ├── anthropic.ts      # Claude SDK wrapper
│   │   ├── perplexity.ts     # Research API
│   │   ├── browserbase.ts    # Browser automation
│   │   ├── zoom.ts           # Meeting API
│   │   ├── modal.ts          # Inference infra
│   │   ├── fetchai.ts        # Payment agents
│   │   └── decagon.ts        # Conversational UX
│   └── types/                # TypeScript definitions
└── public/                   # Static assets
```

## 🎨 Design System

The UI features a sophisticated dark theme with:

- **Colors**: Cyan accent (#22d3ee), Purple alt (#a78bfa), Green success (#34d399)
- **Typography**: Outfit (body), Fraunces (display)
- **Animations**: Smooth fades, drifting gradients, typing effects
- **Components**: Glass morphism cards, glowing indicators, step navigation

## 💰 Monetization Model

Finvisor uses Fetch.ai's agent marketplace for payments:

| Tier | Price | Features |
|------|-------|----------|
| **Basic** | $9/appeal | AI intake, document parsing, gap analysis, basic letter |
| **Pro** | $29/appeal | + Research citations, auto-submit, Zoom advisor |
| **Premium** | $49/appeal | + Counter-offers, multi-round strategy, priority access |

## 🔌 API Reference

### Zoom Meeting API (MVP)

Create a Zoom meeting using Server-to-Server OAuth:

```typescript
POST /api/zoom
{
  "topic": "Financial Aid Consultation",   // Required
  "duration": 30,                          // Optional, default: 30 minutes
  "scheduledTime": "2024-03-15T10:00:00Z"  // Optional, omit for instant meeting
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "meetingId": 12345678901,
    "joinUrl": "https://zoom.us/j/...",
    "startUrl": "https://zoom.us/s/...",
    "password": "abc123",
    "scheduledTime": "instant",
    "instructions": [...]
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Missing required Zoom environment variables: ZOOM_USER_EMAIL",
  "details": {
    "missing": ["ZOOM_USER_EMAIL"],
    "hint": "Ensure ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET, ZOOM_ACCOUNT_ID, and ZOOM_USER_EMAIL are set"
  }
}
```

**Test with curl:**
```bash
curl -X POST http://localhost:3000/api/zoom \
  -H "Content-Type: application/json" \
  -d '{"topic":"Test Session","duration":30}'
```

### Chat API
```typescript
POST /api/chat
{
  "messages": [{ "role": "user", "content": "..." }],
  "userId": "optional",
  "useDecagon": false
}
```

### Document Parsing
```typescript
POST /api/documents
{
  "documents": [{
    "id": "doc-1",
    "type": "w2",
    "content": "base64...",
    "contentType": "image"
  }]
}
```

### Strategy Analysis
```typescript
POST /api/strategy
{
  "studentProfile": {
    "school": "Stanford University",
    "currentAid": 45000,
    "totalCost": 62000,
    "gap": 17000,
    "circumstances": [...]
  }
}
```

### Research
```typescript
POST /api/research
{
  "queries": ["Stanford financial aid 2025"],
  "school": "Stanford University",
  "type": "general"
}
```

### Appeal Generation
```typescript
POST /api/appeal
{
  "studentProfile": {...},
  "researchData": [...],
  "strategy": [...]
}
```

## 🧪 Demo Mode

The app includes a demo mode that simulates the full workflow without requiring API keys. This is useful for:

- Hackathon presentations
- Testing the UI/UX flow
- Onboarding new users

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Add environment variables in the Vercel dashboard.

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🏆 The YC Pitch

> College advising is a **$2B industry** built on human gatekeepers. Finvisor replaces the entire workflow — intake, analysis, research, writing, and submission — with AI agents.
>
> **Outcome-driven. Measurable. Scalable to 100K concurrent students on Modal.**

### Key Metrics (Projected)
- 68% appeal success rate (vs. 40% industry average)
- $8,420 average aid increase per successful appeal
- $12.4k MRR with 1,247 appeals filed

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

Built with ❤️ at TreeHacks 2026

Special thanks to our sponsors:
- OpenAI
- Anthropic
- Modal
- Zoom
- Render
- Browserbase
- Perplexity
- Vercel
- Fetch.ai
- Decagon

---

<p align="center">
  <a href="https://finvisor.ai">finvisor.ai</a> · 
  <a href="https://twitter.com/finvisor">Twitter</a> · 
  <a href="mailto:team@finvisor.ai">Contact</a>
</p>
