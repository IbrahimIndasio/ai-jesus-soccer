import { z } from "zod";
import type { HistoryEntry } from "@/types";
export const HISTORY_KEY = "aij_history_v1";
const entry = z.object({
  id: z.string(),
  fixture: z.string().max(120),
  parsed: z.object({
    home: z.string(),
    away: z.string(),
    competition: z.string().nullable(),
    inferred: z.boolean(),
    raw: z.string(),
  }),
  prophecy: z.string().max(100000),
  createdAt: z.string().datetime(),
});
export function readHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const result = z.array(entry).safeParse(JSON.parse(raw));
    return result.success ? result.data.slice(0, 50) : [];
  } catch {
    return [];
  }
}
function writeHistory(entries: HistoryEntry[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
  } catch {
    throw new Error(
      "Your browser could not save this scroll. Check storage permissions or free some space.",
    );
  }
}
export function saveHistory(value: HistoryEntry) {
  entry.parse(value);
  writeHistory(
    [value, ...readHistory().filter((e) => e.id !== value.id)].slice(0, 50),
  );
}
export function deleteHistory(id: string) {
  writeHistory(readHistory().filter((e) => e.id !== id));
}
export function clearHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    throw new Error("Unable to clear browser history.");
  }
}
