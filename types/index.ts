import type { ParsedFixture } from "@/lib/parseFixture";
export type Fixture = ParsedFixture;
export interface Prophecy {
  markdown: string;
  confidence: "High" | "Medium" | "Low" | null;
}
export interface HistoryEntry {
  id: string;
  fixture: string;
  parsed: ParsedFixture;
  prophecy: string;
  createdAt: string;
}
