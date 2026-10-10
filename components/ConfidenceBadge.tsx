import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
export function ConfidenceBadge({
  confidence,
}: {
  confidence: "High" | "Medium" | "Low" | null;
}) {
  if (!confidence) return null;
  return (
    <Badge
      className={cn(
        "border-transparent",
        confidence === "High"
          ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
          : confidence === "Medium"
            ? "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
            : "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200",
      )}
    >
      {confidence} confidence
    </Badge>
  );
}
