import "server-only";

/*
 * Gemini API, called from the server only: the key (GEMINI_API_KEY) never reaches the browser.
 * GEMINI_MODEL picks the model; the default is a fast, low-cost one.
 */

export type ChatTurn = { role: "user" | "model"; text: string };

export const geminiKey = () => process.env.GEMINI_API_KEY ?? "";
const model = () => process.env.GEMINI_MODEL?.trim() || "gemini-3.5-flash-lite";

type GeminiResponse = {
  candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] }; finishReason?: string }[];
  promptFeedback?: { blockReason?: string };
  error?: { message?: string; status?: string };
};

/** Error with a message that can be shown to the employee as is. */
export class GeminiError extends Error {
  constructor(message: string, readonly status = 502) { super(message); }
}

export async function askGemini(system: string, turns: ChatTurn[]): Promise<string> {
  const key = geminiKey();
  if (!key) throw new GeminiError("Asisten belum aktif: GEMINI_API_KEY belum diisi di server.", 503);
  const m = model();
  let res: Response;
  try {
    res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(m)}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: turns.map((t) => ({ role: t.role, parts: [{ text: t.text }] })),
        generationConfig: { temperature: 0.6, maxOutputTokens: 1024 },
      }),
    });
  } catch {
    throw new GeminiError("Server gagal tersambung ke Gemini. Coba lagi sebentar lagi.");
  }
  const data = (await res.json().catch(() => ({}))) as GeminiResponse;
  if (!res.ok) {
    // Details stay in the server log; the employee gets a plain message.
    console.error(`Gemini ${res.status}: ${data.error?.message ?? ""}`);
    if (res.status === 429) throw new GeminiError("Asisten sedang sibuk atau kuotanya habis. Coba lagi sebentar lagi.", 429);
    if (res.status === 404) throw new GeminiError(`Model "${m}" tidak ditemukan. Admin perlu mengganti GEMINI_MODEL.`);
    if (res.status === 400 || res.status === 401 || res.status === 403) throw new GeminiError("Asisten belum bisa dipakai: API key Gemini di server ditolak.");
    throw new GeminiError("Gemini sedang bermasalah. Coba lagi sebentar lagi.");
  }
  if (data.promptFeedback?.blockReason) throw new GeminiError("Pesan ini diblokir oleh filter keamanan Gemini. Coba tulis dengan kata lain.", 422);
  const text = (data.candidates?.[0]?.content?.parts ?? []).filter((p) => !p.thought).map((p) => p.text ?? "").join("").trim();
  if (!text) throw new GeminiError("Gemini tidak memberi jawaban. Coba lagi.");
  return text;
}
