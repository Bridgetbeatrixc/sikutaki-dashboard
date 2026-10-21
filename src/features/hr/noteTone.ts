import type { NoteType } from "@/lib/catalog";

/** Tag color per HR note type. */
export const NOTE_TONE: Record<NoteType, "brand" | "info" | "sand"> = { dilakukan: "brand", rencana: "info", pantau: "sand" };
