# Story Scenes｜英文故事場照

Write a short **English** story → get **corrections** (Speak-style tips) → auto-split into **4 sequential storyboard scenes** with images.

- UI chrome: **zh-Hant** (Cantonese-friendly labels)
- Story input & scene captions: **English**
- Live: **xAI Grok** (text) + **Grok Imagine** (images)
- No API key → **Demo mode** (heuristic grammar + coloured SVG placeholder panels)

## Quick start

```bash
npm install
cp .env.example .env.local   # optional: add XAI_API_KEY for live mode
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

| Variable | Required | Default | Notes |
|----------|----------|---------|-------|
| `XAI_API_KEY` | for live | — | Also accepts `GROK_API_KEY` |
| `XAI_MODEL` | no | `grok-3-mini` | Chat completions |
| `XAI_IMAGE_MODEL` | no | `grok-imagine-image-2.0` | Imagine image gen |
| `XAI_BASE_URL` | no | `https://api.x.ai/v1` | |

Never commit `.env.local`.

## API

- `GET /api/status` → `{ provider, demoMode, textModel, imageModel }`
- `POST /api/story` body `{ text }` → `{ correctedText, tips[], scenes[], provider, demoMode }`

Each scene: `{ index, title, caption, imagePrompt, imageUrl }`.

## Cost note

Imagine images are roughly **$0.02–0.04 each**. One generation (4 scenes) ≈ **$0.08–0.16**, plus a small text call for correction + storyboard planning. Demo mode costs **$0**.

## Deploy (Vercel)

1. Push this repo to GitHub
2. Import on Vercel
3. Set `XAI_API_KEY` (and optional model overrides) for Production
4. Deploy

Without the key, production stays in free Demo mode.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS · xAI Grok / Imagine
