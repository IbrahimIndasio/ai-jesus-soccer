import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}
export function getConfidence(text: string): "High" | "Medium" | "Low" | null {
  return (
    (text.match(/\*\*Confidence:\*\*\s*(High|Medium|Low)/i)?.[1] as
      "High" | "Medium" | "Low") || null
  );
}
