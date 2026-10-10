import { SiteHeader } from "@/components/SiteHeader";
import { HistoryList } from "@/components/HistoryList";
export default function HistoryPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-5 py-12 sm:px-0">
        <p className="mb-3 text-xs uppercase tracking-widest text-gold">
          Your saved prophecies
        </p>
        <h1 className="mb-4 font-display text-5xl">The book of matches.</h1>
        <p className="mb-10 text-sm text-muted-foreground">
          A record of the readings you chose to keep. Saved on this device.
        </p>
        <HistoryList />
      </main>
    </>
  );
}
