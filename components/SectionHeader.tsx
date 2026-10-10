export function SectionHeader({
  number,
  title,
}: {
  number: number;
  title: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-4">
      <span className="mt-1.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gold/30 text-xs text-gold">
        {String(number).padStart(2, "0")}
      </span>
      <h2 className="flex-1 border-b border-gold/25 pb-3 font-display text-3xl font-medium leading-tight">
        {title}
      </h2>
    </div>
  );
}
