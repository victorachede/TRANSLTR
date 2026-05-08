import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const TRANSLATION_PROMPTS: Record<string, string> = {
  "english->tiv": `You are a professional translator specializing in Tiv (a Benue-Congo language spoken in Benue State, Nigeria) and English.
Translate the given English text into Tiv accurately.
If certain English concepts don't have direct Tiv equivalents, use the closest natural Tiv expression.
Provide ONLY the Tiv translation — no explanations, no alternatives, no English.
Tiv is a tonal language — use standard Tiv orthography.`,

  "english->idoma": `You are a professional translator specializing in Idoma (a Kwa language spoken in Benue State, Nigeria) and English.
Translate the given English text into Idoma accurately.
If certain English concepts don't have direct Idoma equivalents, use the closest natural Idoma expression.
Provide ONLY the Idoma translation — no explanations, no alternatives, no English.
Idoma is a tonal language — use standard Idoma orthography.`,

  "tiv->english": `You are a professional translator specializing in Tiv (a Benue-Congo language spoken in Benue State, Nigeria) and English.
Translate the given Tiv text into natural, fluent English.
Provide ONLY the English translation — no explanations, no alternatives, no Tiv.`,

  "idoma->english": `You are a professional translator specializing in Idoma (a Kwa language spoken in Benue State, Nigeria) and English.
Translate the given Idoma text into natural, fluent English.
Provide ONLY the English translation — no explanations, no alternatives, no Idoma.`,
};

const TTS_VOICES: Record<string, "alloy" | "nova" | "shimmer" | "echo" | "fable" | "onyx"> = {
  english: "alloy",
  tiv: "nova",
  idoma: "shimmer",
};

const WHISPER_LANG: Record<string, string | undefined> = {
  english: "en",
  tiv: undefined,
  idoma: undefined,
};

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }

    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;
    const sourceLang = (formData.get("sourceLang") as string) || "english";
    const targetLang = (formData.get("targetLang") as string) || "tiv";

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    if (audioFile.size < 500) {
      return NextResponse.json({ transcript: "", translation: "", audioBase64: null });
    }

    const whisperParams: Parameters<typeof openai.audio.transcriptions.create>[0] = {
      file: audioFile,
      model: "whisper-1",
      response_format: "text",
    };
    if (WHISPER_LANG[sourceLang]) {
      whisperParams.language = WHISPER_LANG[sourceLang];
    }

    const transcriptionResponse = await openai.audio.transcriptions.create(whisperParams);
    const transcript = (transcriptionResponse as unknown as string).trim();

    if (!transcript || transcript.length === 0) {
      return NextResponse.json({ transcript: "", translation: "", audioBase64: null });
    }

    const directionKey = `${sourceLang}->${targetLang}`;
    const systemPrompt = TRANSLATION_PROMPTS[directionKey] || TRANSLATION_PROMPTS["english->tiv"];

    const translationResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: transcript },
      ],
      temperature: 0.2,
      max_tokens: 600,
    });

    const translation = translationResponse.choices[0]?.message?.content?.trim() || "";

    const voice = TTS_VOICES[targetLang] ?? "nova";
    const ttsText = targetLang === "english"
      ? translation
      : `${translation}`;

    const ttsResponse = await openai.audio.speech.create({
      model: "tts-1",
      voice,
      input: ttsText,
      speed: 0.88,
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
