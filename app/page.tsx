"use client";
import { useState, useTransition, useEffect, useRef } from "react";
import {
  Cross,
  Activity,
  BookOpen,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { FixtureInput } from "@/components/FixtureInput";
import {
  ProphecyCard,
  ProphecyErrorBoundary,
  isCompleteProphecy,
} from "@/components/ProphecyCard";
import { ProphecySkeleton } from "@/components/ProphecySkeleton";
import { ShareButtons } from "@/components/ShareButtons";
import { HUMILITY, CLOSING } from "@/components/HumilityFooter";
import { Button } from "@/components/ui/button";
import {
  ToastProvider,
  Toast,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { parseFixture } from "@/lib/parseFixture";
import { saveHistory } from "@/lib/history";

export default function Page() {
  const [prophecy, setProphecy] = useState("");
  const [fixture, setFixture] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  async function prophesy(nextFixture: string) {
    if (loading) return;
    try {
      parseFixture(nextFixture);
    } catch {
      setError("Use a fixture like Arsenal vs Bournemouth.");
      return;
    }
    controller.current?.abort();
    const abort = new AbortController();
    controller.current = abort;
    setFixture(nextFixture);
    setError("");
    setProphecy("");
    setSaved(false);
    setLoading(true);
    try {
      const response = await fetch("/api/prophecy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fixture: nextFixture }),
        signal: abort.signal,
      });
      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error || "The scroll was torn. Try again.");
      }
      if (!response.body) throw new Error("No scroll was received. Try again.");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          full += decoder.decode(value, { stream: true });
          startTransition(() => setProphecy(full));
        }
        full += decoder.decode();
      } finally {
        reader.releaseLock();
      }
      if (!isCompleteProphecy(full))
        throw new Error(
          "The scroll arrived incomplete. Regenerate to receive all seven sections.",
        );
      if (!/\*\*7\.\s/.test(full))
        full +=
          "\n\n**7. A Final Word of Humility**\n\n" +
          HUMILITY +
          "\n\n" +
          CLOSING;
      setProphecy(full);
    } catch (e) {
      if (!abort.signal.aborted)
        setError(
          e instanceof Error ? e.message : "The scroll was torn. Try again.",
        );
    } finally {
      if (!abort.signal.aborted) setLoading(false);
    }
  }
  function save() {
    try {
      saveHistory({
        id: crypto.randomUUID(),
        fixture,
        parsed: parseFixture(fixture),
        prophecy,
        createdAt: new Date().toISOString(),
      });
      setSaved(true);
      setNotice("Your prophecy is saved in the book.");
    } catch (e) {
      setNotice(
        e instanceof Error ? e.message : "Unable to save the prophecy.",
      );
    }
  }
  function reset() {
    controller.current?.abort();
    setLoading(false);
    setProphecy("");
    setError("");
  }
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-5 pb-12 pt-10 sm:px-0 sm:pt-14">
        <div className="mb-9 flex items-center gap-2 text-xs uppercase tracking-[.18em] text-muted-foreground">
          <span className="h-px w-8 bg-gold" />
          Wisdom meets the beautiful game
        </div>
        <div className="mb-8">
          <h1 className="font-display text-5xl font-medium leading-[1.05] sm:text-6xl">
            Let the data
            <br />
            <span className="italic text-gold">tell the story.</span>
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-muted-foreground">
            Form, tactics, and the fine margins of football.
            <br className="hidden sm:block" /> Seven chapters of insight. Always
            a little humility.
          </p>
        </div>
        {!loading && !prophecy && (
          <section className="sticky top-0 z-10 rounded-2xl border border-border bg-card p-5 shadow-xl shadow-black/5 sm:static sm:p-7">
            <FixtureInput onSubmit={prophesy} loading={loading || pending} />
          </section>
        )}
        {error && (
          <div
            role="alert"
            className="my-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-5 text-sm"
          >
            <p>{error}</p>
            {prophecy && (
              <Button
                className="mt-3"
                variant="outline"
                onClick={() => prophesy(fixture)}
              >
                Try again
              </Button>
            )}
          </div>
        )}
        {(loading || prophecy) && (
          <div className="mt-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <Button variant="ghost" onClick={reset}>
                <ArrowLeft size={16} />
                {loading ? "Cancel" : "New fixture"}
              </Button>
              <span className="text-sm text-muted-foreground">{fixture}</span>
            </div>
            <div aria-live="polite" aria-busy={loading}>
              {!prophecy ? (
                <ProphecySkeleton />
              ) : (
                <ProphecyErrorBoundary key={fixture}>
                  <ProphecyCard markdown={prophecy} streaming={loading} />
                </ProphecyErrorBoundary>
              )}
            </div>
            {!loading && prophecy && !error && (
              <ShareButtons
                fixture={fixture}
                prophecy={prophecy}
                onRegenerate={() => prophesy(fixture)}
                onSave={save}
                onNotice={setNotice}
                saved={saved}
              />
            )}
          </div>
        )}
        {!loading && !prophecy && (
          <>
            <div className="my-8 grid grid-cols-3 gap-3 border-b border-border pb-8 text-xs text-muted-foreground">
              {[
                [Activity, "Real match data"],
                [BookOpen, "Seven-part analysis"],
                [ShieldCheck, "Measured confidence"],
              ].map(([Icon, label]) => {
                const I = Icon as typeof Activity;
                return (
                  <div
                    key={String(label)}
                    className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center"
                  >
                    <I className="h-4 w-4 text-gold" />
                    {String(label)}
                  </div>
                );
              })}
            </div>
            <div className="flex flex-col items-center py-7 text-center">
              <svg
                viewBox="0 0 160 100"
                className="mb-5 h-24 w-40 text-gold/60"
                aria-hidden="true"
              >
                <path
                  d="M54 10v70M32 32h44"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
                <circle
                  cx="112"
                  cy="60"
                  r="25"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
                <path
                  d="m112 47 12 9-5 14h-14l-5-14zM112 47V35M124 56l12-5M119 70l8 12M105 70l-8 12M100 56l-12-5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
                <path d="M25 90h115" stroke="currentColor" strokeOpacity=".3" />
              </svg>
              <p className="font-display text-2xl text-muted-foreground">
                Type any fixture. The data shall speak.
              </p>
            </div>
          </>
        )}
        <footer className="mt-10 flex flex-col items-center gap-3 border-t border-border pt-6 text-center text-xs leading-6 text-muted-foreground">
          <Cross size={14} className="text-gold" />
          <p>
            Predictions are possibilities. The game always has the final word.
          </p>
          <span>Data, not divine intent. For insight and entertainment.</span>
        </footer>
      </main>
      <ToastProvider>
        <Toast
          open={Boolean(notice)}
          onOpenChange={(open) => {
            if (!open) setNotice("");
          }}
        >
          <ToastTitle>{notice}</ToastTitle>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    </>
  );
}
