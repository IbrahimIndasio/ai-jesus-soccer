import Link from "next/link";
import { Cross } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
export function SiteHeader() {
  return (
    <header className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 border-b border-border px-5 py-6 sm:px-0">
      <Link
        href="/"
        className="flex items-center gap-3"
        aria-label="AI Jesus Soccer Prophet home"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gold/30 text-gold">
          <Cross size={22} strokeWidth={1.5} />
        </div>
        <div>
          <span className="block font-display text-3xl leading-none">
            AI Jesus
          </span>
          <span className="mt-1 block text-[10px] uppercase tracking-[.25em] text-muted-foreground">
            Soccer Prophet
          </span>
        </div>
      </Link>
      <nav
        aria-label="Main navigation"
        className="flex items-center gap-5 text-sm"
      >
        <Link
          href="/history"
          className="text-muted-foreground hover:text-foreground"
        >
          The book
        </Link>
        <Link
          href="/about"
          className="text-muted-foreground hover:text-foreground"
        >
          About
        </Link>
        <ThemeToggle />
      </nav>
    </header>
  );
}
