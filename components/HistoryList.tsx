"use client";
import { useEffect, useState } from "react";
import { BookOpen, Trash2, ChevronDown } from "lucide-react";
import type { HistoryEntry } from "@/types";
import { readHistory, deleteHistory, clearHistory } from "@/lib/history";
import { formatDate, getConfidence } from "@/lib/utils";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { ProphecyCard, ProphecyErrorBoundary } from "./ProphecyCard";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "./ui/dialog";
export function HistoryList() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    setEntries(readHistory());
    setLoaded(true);
    const listener = () => setEntries(readHistory());
    window.addEventListener("storage", listener);
    return () => window.removeEventListener("storage", listener);
  }, []);
  function remove(id: string) {
    try {
      deleteHistory(id);
      setEntries(readHistory());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to delete.");
    }
  }
  function clear() {
    try {
      clearHistory();
      setEntries([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to clear history.");
    }
  }
  if (!loaded)
    return (
      <p role="status" className="py-10 text-muted-foreground">
        Opening the book...
      </p>
    );
  return (
    <div>
      {error && (
        <p role="alert" className="mb-4 text-rose-500">
          {error}
        </p>
      )}
      {entries.length ? (
        <>
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {entries.length} saved{" "}
              {entries.length === 1 ? "scroll" : "scrolls"}
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost">
                  <Trash2 size={16} />
                  Clear all
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle className="font-display text-3xl">
                  Clear the book?
                </DialogTitle>
                <DialogDescription className="my-4 text-sm text-muted-foreground">
                  All saved prophecies on this device will be deleted. This
                  cannot be undone.
                </DialogDescription>
                <div className="flex gap-3">
                  <DialogClose asChild>
                    <Button variant="outline">Keep my scrolls</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button onClick={clear}>Clear all</Button>
                  </DialogClose>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-4">
            {entries.map((e) => (
              <section
                key={e.id}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    aria-expanded={expanded === e.id}
                    aria-controls={`scroll-${e.id}`}
                    onClick={() => setExpanded(expanded === e.id ? null : e.id)}
                    className="flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  >
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                      <h2 className="font-display text-2xl">{e.fixture}</h2>
                      <ConfidenceBadge confidence={getConfidence(e.prophecy)} />
                      <ChevronDown
                        size={16}
                        className={expanded === e.id ? "rotate-180" : ""}
                      />
                    </div>
                    <time
                      dateTime={e.createdAt}
                      className="text-xs text-muted-foreground"
                    >
                      {formatDate(e.createdAt)}
                    </time>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(e.id)}
                    aria-label={`Delete ${e.fixture}`}
                  >
                    <Trash2 size={17} />
                  </Button>
                </div>
                {expanded === e.id && (
                  <div id={`scroll-${e.id}`} className="mt-6">
                    <ProphecyErrorBoundary>
                      <ProphecyCard markdown={e.prophecy} />
                    </ProphecyErrorBoundary>
                  </div>
                )}
              </section>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border py-20 text-center">
          <BookOpen size={40} strokeWidth={1} className="mb-5 text-gold" />
          <p className="font-display text-3xl">
            No prophecies yet. The book is blank.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Generate a prophecy and save your first scroll.
          </p>
        </div>
      )}
    </div>
  );
}
