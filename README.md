# TRANSLTR

Real-time speech-to-speech translation for Tiv, Idoma, and English.

## Features

- Hands-free, always-on microphone listening
- English → Tiv translation
- English → Idoma translation
- Powered by OpenAI Whisper (transcription), GPT-4o (translation), and TTS (speech output)
- Session history of all translations

## Getting Started

1. Clone the repo
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_key_here
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- [Next.js](https://nextjs.org/)
- [OpenAI API](https://platform.openai.com/) — Whisper, GPT-4o, TTS
- [Tailwind CSS](https://tailwindcss.com/)
- TypeScript
