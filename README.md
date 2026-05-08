# TRANSLTR

Real-time speech-to-speech translation between English, Tiv, and Idoma.
Designed for Benue State — built for everyone in it.

## Stack

- Next.js 15 (App Router)
- React 19
- Tailwind CSS v4
- Framer Motion
- Recharts
- Browser Web Speech API
- MyMemory public translation API

## Getting started

```bash
npm install
npm run dev
```

App runs at http://localhost:3000

## Deploy

Push to GitHub and import at [vercel.com/new](https://vercel.com/new) — zero config needed.

## Pages

| Route | Description |
|---|---|
| `/` | Landing page |
| `/translator` | Solo & conversation translation |
| `/dashboard` | Session analytics |
| `/projector` | Live broadcast view |

## Notes

- No API keys required
- Audio never leaves the device
- Speech recognition works in Chrome and Edge only
