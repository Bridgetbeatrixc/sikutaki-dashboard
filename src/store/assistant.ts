import type { AssistantContext } from "@/lib/assistant";

/* The AI assistant runs on the server (/api/assistant), which holds the Gemini key. */

export type ChatTurn = { role: "user" | "model"; text: string };

export async function askAssistant(context: AssistantContext, turns: ChatTurn[]): Promise<string> {
  let res: Response;
  try {
    res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/assistant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ context, turns }),
    });
  } catch {
    throw new Error("Gagal tersambung ke server. Periksa koneksi internet.");
  }
  const data = (await res.json().catch(() => ({}))) as { text?: string; error?: string };
  if (!res.ok || !data.text) throw new Error(data.error ?? `Asisten tidak menjawab (HTTP ${res.status}). Coba lagi.`);
  return data.text;
}
