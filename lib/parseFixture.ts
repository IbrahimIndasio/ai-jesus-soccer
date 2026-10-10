export interface ParsedFixture {
  home: string;
  away: string;
  competition: string | null;
  inferred: boolean;
  raw: string;
}
const competitions: [RegExp, string][] = [
  [/(?:Premier League|EPL|PL)$/i, "Premier League"],
  [/(?:UEFA Champions League|Champions League|UCL)$/i, "UEFA Champions League"],
  [/(?:UEFA Europa League|Europa League|UEL)$/i, "UEFA Europa League"],
  [/(?:La Liga|LL)$/i, "La Liga"],
  [/Serie A$/i, "Serie A"],
  [/Bundesliga$/i, "Bundesliga"],
  [/Ligue 1$/i, "Ligue 1"],
  [/MLS$/i, "MLS"],
  [/(?:World Cup|WC)$/i, "World Cup"],
  [/FA Cup$/i, "FA Cup"],
  [/Copa del Rey$/i, "Copa del Rey"],
  [/Carabao Cup$/i, "Carabao Cup"],
];
function titleCase(name: string): string {
  return name
    .toLocaleLowerCase()
    .replace(
      /(^|[\s-])([\p{L}])/gu,
      (_, space: string, letter: string) => space + letter.toLocaleUpperCase(),
    );
}
export function parseFixture(input: string): ParsedFixture {
  const fail = () => {
    throw new Error("Could not parse fixture");
  };
  if (typeof input !== "string") return fail();
  const parts = input
    .trim()
    .replace(/\s+/g, " ")
    .split(/\s+(?:vs\.?|v\.?|-)\s+/i);
  if (parts.length !== 2 || !parts[0] || !parts[1]) return fail();
  const home = parts[0].trim();
  let away = parts[1].trim();
  let competition: string | null = null;
  for (const [alias, canonical] of competitions) {
    const match = away.match(alias);
    if (
      match &&
      match.index !== undefined &&
      match.index > 0 &&
      /[\s(]/.test(away[match.index - 1])
    ) {
      competition = canonical;
      away = away.slice(0, match.index).replace(/[\s(]+$/, "");
      break;
    }
  }
  if (
    !home ||
    !away ||
    !/\p{L}/u.test(home) ||
    !/\p{L}/u.test(away) ||
    /[<>\n]/.test(home + away)
  )
    return fail();
  return {
    home: titleCase(home),
    away: titleCase(away),
    competition,
    inferred: competition === null,
    raw: input,
  };
}
