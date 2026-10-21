import { KEYS, read, write } from "./local";

/*
 * Gemini API, called straight from the browser. For testing only: the API key is visible to anyone who uses
 * this browser (or, with NEXT_PUBLIC_GEMINI_API_KEY, to anyone who opens the site). Production needs a server
 * that holds the key.
 */

export const GEMINI_MODELS = ["gemini-3.5-flash-lite", "gemini-3.8-flash", "gemini-3.6-flash", "gemini-2.5-flash"];
export type GeminiSettings = { apiKey: string; model: string };
export type ChatTurn = { role: "user" | "model"; text: string };

const ENV_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? "";

export const loadGemini = (): GeminiSettings => ({ apiKey: "", model: GEMINI_MODELS[0], ...read<Partial<GeminiSettings>>(KEYS.gemini, {}) });
export const saveGemini = (s: GeminiSettings) => write(KEYS.gemini, s);
/** The key typed in the app wins over the one built into the site. */
export const geminiKey = (s: GeminiSettings) => s.apiKey.trim() || ENV_KEY;
export const hasBuiltInKey = () => Boolean(ENV_KEY);

type GeminiResponse = {
  candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] }; finishReason?: string }[];
  promptFeedback?: { blockReason?: string };
  error?: { message?: string; status?: string };
};

export async function askGemini(settings: GeminiSettings, system: string, turns: ChatTurn[]): Promise<string> {
  const key = geminiKey(settings);
  if (!key) throw new Error("Isi API key Gemini dulu di pengaturan asisten.");
  const model = settings.model.trim() || GEMINI_MODELS[0];
  let res: Response;
  try {
    res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: turns.map((t) => ({ role: t.role, parts: [{ text: t.text }] })),
        generationConfig: { temperature: 0.6, maxOutputTokens: 1024 },
      }),
    });
  } catch {
    throw new Error("Gagal tersambung ke Gemini. Periksa koneksi internet.");
  }
  const data = (await res.json().catch(() => ({}))) as GeminiResponse;
  if (!res.ok) {
    const msg = data.error?.message ?? `HTTP ${res.status}`;
    if (res.status === 404) throw new Error(`Model "${model}" tidak ditemukan. Ganti model di pengaturan asisten. (${msg})`);
    if (res.status === 400 || res.status === 401 || res.status === 403) throw new Error(`API key ditolak atau permintaan tidak valid: ${msg}`);
    if (res.status === 429) throw new Error("Kuota Gemini habis atau terlalu banyak permintaan. Coba lagi sebentar lagi.");
    throw new Error(`Gemini mengembalikan kesalahan: ${msg}`);
  }
  if (data.promptFeedback?.blockReason) throw new Error("Pesan ini diblokir oleh filter keamanan Gemini. Coba tulis dengan kata lain.");
  const text = (data.candidates?.[0]?.content?.parts ?? []).filter((p) => !p.thought).map((p) => p.text ?? "").join("").trim();
  if (!text) throw new Error("Gemini tidak memberi jawaban. Coba lagi.");
  return text;
}
