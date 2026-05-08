import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPTS: Record<string, string> = {
  tiv: `You are a professional translator specializing in Tiv (a Benue-Congo language spoken in Benue State, Nigeria) and English.
Translate the given English text into Tiv accurately. 
If certain English concepts don't have direct Tiv equivalents, use the closest natural Tiv expression.
Provide ONLY the Tiv translation, no explanations or alternative translations.
Tiv is a tonal language — use standard Tiv orthography where possible.`,

  idoma: `You are a professional translator specializing in Idoma (a Kwa language spoken in Benue State, Nigeria) and English.
Translate the given English text into Idoma accurately.
If certain English concepts don't have direct Idoma equivalents, use the closest natural Idoma expression.
Provide ONLY the Idoma translation, no explanations or alternative translations.
Idoma is a tonal language — use standard Idoma orthography where possible.`,
};

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }

    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;
    const targetLang = (formData.get("targetLang") as string) || "tiv";

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    if (audioFile.size < 500) {
      return NextResponse.json({ transcript: "", translation: "", audioBase64: null });
    }

    const transcriptionResponse = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "en",
      response_format: "text",
    });

    const transcript = (transcriptionResponse as unknown as string).trim();

    if (!transcript || transcript.length === 0) {
      return NextResponse.json({ transcript: "", translation: "", audioBase64: null });
    }

    const systemPrompt = SYSTEM_PROMPTS[targetLang] || SYSTEM_PROMPTS.tiv;

    const translationResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: transcript },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const translation = translationResponse.choices[0]?.message?.content?.trim() || "";

    const ttsResponse = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova",
      input: `${translation}. In English: ${transcript}`,
      speed: 0.9,
    });

    const audioBuffer = Buffer.from(await ttsResponse.arrayBuffer());
    const audioBase64 = audioBuffer.toString("base64");

    return NextResponse.json({ transcript, translation, audioBase64 });
  } catch (err) {
    console.error("Translation error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
