"use client";
import { useEffect, useState } from "react";
import { Sparkles, Search } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
const examples = [
  "Arsenal vs Bournemouth",
  "Real Madrid vs Barcelona La Liga",
  "Inter vs Juventus Serie A",
];
export function FixtureInput({
  onSubmit,
  loading,
}: {
  onSubmit: (fixture: string) => void;
  loading: boolean;
}) {
  const [value, setValue] = useState("");
  const [hint, setHint] = useState(0);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const timer = setInterval(
      () => setHint((v) => (v + 1) % examples.length),
      4500,
    );
    return () => clearInterval(timer);
  }, []);
  function submit(e: React.FormEvent) {
    e.preventDefault();
    setOpen(false);
    if (value.trim()) onSubmit(value.trim());
  }
  return (
    <form onSubmit={submit} className="relative space-y-4">
      <label htmlFor="fixture" className="block text-sm font-medium">
        Choose your fixture
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
          <Input
            id="fixture"
            name="fixture"
            autoFocus
            autoComplete="off"
            placeholder={examples[hint]}
            minLength={3}
            maxLength={120}
            required
            disabled={loading}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            className="h-14 rounded-xl pl-12"
            aria-describedby="fixture-help"
            list="fixture-examples"
          />
          <datalist id="fixture-examples">
            {examples.map((e) => (
              <option key={e} value={e} />
            ))}
          </datalist>
        </div>
        <Button
          type="submit"
          disabled={loading || !value.trim()}
          className="h-14 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 px-7 text-[#201608]"
        >
          <Sparkles size={17} />
          Prophesy
        </Button>
      </div>
      <p id="fixture-help" className="text-xs text-muted-foreground">
        Home team first. Add a competition, or let the data find it.
      </p>
      {open && !value && (
        <div aria-label="Example fixtures" className="flex flex-wrap gap-2">
          {examples.map((example) => (
            <button
              key={example}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setValue(example);
                setOpen(false);
              }}
              className="rounded-full border border-border px-3 py-2 text-xs text-muted-foreground hover:border-gold hover:text-gold"
            >
              {example}
            </button>
          ))}
        </div>
      )}
    </form>
  );
}
