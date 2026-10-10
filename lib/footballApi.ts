import "server-only";
import type { ParsedFixture } from "./parseFixture";
const BASE = "https://api-football-v1.p.rapidapi.com/v3";
type Team = { id: number; name: string };
type RecordData = Record<string, unknown>;
async function footballFetch(
  path: string,
  signal?: AbortSignal,
): Promise<RecordData[]> {
  const key = process.env.FOOTBALL_API_KEY;
  if (!key) return [];
  const response = await fetch(BASE + path, {
    headers: {
      "x-rapidapi-key": key,
      "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
    },
    cache: "no-store",
    signal: signal
      ? AbortSignal.any([signal, AbortSignal.timeout(7000)])
      : AbortSignal.timeout(7000),
  });
  if (!response.ok) throw new Error("Football provider unavailable");
  const data = await response.json();
  if (!Array.isArray(data.response)) return [];
  return data.response;
}
function normalize(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}
async function findTeam(
  name: string,
  signal?: AbortSignal,
): Promise<Team | null> {
  const rows = await footballFetch(
    `/teams?search=${encodeURIComponent(name)}`,
    signal,
  );
  const teams = rows
    .map((row) => row.team)
    .filter((team): team is Team =>
      Boolean(
        team && typeof team === "object" && "id" in team && "name" in team,
      ),
    );
  const exact = teams.filter((t) => normalize(t.name) === normalize(name));
  return exact.length === 1 ? exact[0] : null;
}
export async function findFixtures(
  fixture: ParsedFixture,
  signal?: AbortSignal,
) {
  if (!process.env.FOOTBALL_API_KEY) return [];
  try {
    const [home, away] = await Promise.all([
      findTeam(fixture.home, signal),
      findTeam(fixture.away, signal),
    ]);
    if (!home || !away) return [];
    const records = await footballFetch(
      `/fixtures?team=${home.id}&next=10`,
      signal,
    );
    return records.filter((row) => {
      const teams = row.teams as { home?: Team; away?: Team } | undefined;
      return teams?.home?.id === home.id && teams?.away?.id === away.id;
    });
  } catch {
    return [];
  }
}
export async function getFootballContext(
  fixture: ParsedFixture,
  signal?: AbortSignal,
): Promise<string | undefined> {
  if (!process.env.FOOTBALL_API_KEY) return;
  try {
    const [home, away] = await Promise.all([
      findTeam(fixture.home, signal),
      findTeam(fixture.away, signal),
    ]);
    if (!home || !away) return;
    const [homeForm, awayForm, h2h] = await Promise.all([
      footballFetch(`/fixtures?team=${home.id}&last=6`, signal),
      footballFetch(`/fixtures?team=${away.id}&last=6`, signal),
      footballFetch(
        `/fixtures/headtohead?h2h=${home.id}-${away.id}&last=5`,
        signal,
      ),
    ]);
    return JSON.stringify({
      source: "API-Football",
      retrievedAt: new Date().toISOString(),
      home,
      away,
      homeForm,
      awayForm,
      h2h,
    }).slice(0, 30000);
  } catch {
    return;
  }
}
