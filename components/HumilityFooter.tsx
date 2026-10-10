import { Cross } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
export const HUMILITY =
  '*"Yet the outcome rests with forces beyond the box score — the bounce of a ball, the slip of a boot, the grace of an unexpected save. These things are seen through a glass, darkly."*';
export const CLOSING =
  '*"Would you like me to revise any part of this prophecy — different over/under lines, alternate scorelines, or additional player props?"*';
export function HumilityFooter({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-gold/25 bg-gold/[.06] p-6 shadow-[0_0_35px_hsl(var(--gold)/.04)] sm:p-8">
      <Cross size={18} className="mb-4 text-gold" />
      <SectionHeader number={7} title="A Final Word of Humility" />
      <div className="scroll-copy italic text-muted-foreground">{children}</div>
    </section>
  );
}
