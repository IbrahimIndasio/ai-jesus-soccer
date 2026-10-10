"use client";
import { Copy, Share2, RotateCcw, Bookmark } from "lucide-react";
import { Button } from "./ui/button";
export function ShareButtons({
  fixture,
  prophecy,
  onRegenerate,
  onSave,
  onNotice,
  saved,
}: {
  fixture: string;
  prophecy: string;
  onRegenerate: () => void;
  onSave: () => void;
  onNotice: (message: string) => void;
  saved: boolean;
}) {
  async function copy() {
    try {
      await navigator.clipboard.writeText(prophecy);
      onNotice("Copied to clipboard.");
    } catch {
      onNotice("Clipboard unavailable. Select the scroll to copy it.");
    }
  }
  async function share() {
    const data = {
      title: `AI Jesus: ${fixture}`,
      text: `${fixture}: a data-grounded soccer prophecy.`,
      url: window.location.origin,
    };
    try {
      if (navigator.share) {
        await navigator.share(data);
      } else {
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(data.text)}&url=${encodeURIComponent(data.url)}`,
          "_blank",
          "noopener,noreferrer",
        );
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError"))
        onNotice("Sharing is unavailable in this browser.");
    }
  }
  return (
    <div className="flex flex-wrap gap-2 border-t border-border pt-6">
      <Button variant="outline" onClick={copy}>
        <Copy size={16} />
        Copy
      </Button>
      <Button variant="outline" onClick={share}>
        <Share2 size={16} />
        Share
      </Button>
      <Button variant="outline" onClick={onRegenerate}>
        <RotateCcw size={16} />
        Regenerate
      </Button>
      <Button variant="outline" onClick={onSave} disabled={saved}>
        <Bookmark size={16} />
        {saved ? "Saved to the book" : "Save to History"}
      </Button>
    </div>
  );
}
