import { describe, expect, it } from "vitest";
import { parseFixture } from "../lib/parseFixture";
describe("parseFixture", () => {
  it.each(["vs", "VS", "v", "vs.", "-", "v."])(
    "handles %s separator",
    (separator) => {
      expect(
        parseFixture(`  arsenal   ${separator}   bournemouth  `),
      ).toMatchObject({
        home: "Arsenal",
        away: "Bournemouth",
        competition: null,
        inferred: true,
      });
    },
  );
  it.each([
    ["EPL", "Premier League"],
    ["PL", "Premier League"],
    ["Premier League", "Premier League"],
    ["UCL", "UEFA Champions League"],
    ["Champions League", "UEFA Champions League"],
    ["UEL", "UEFA Europa League"],
    ["Europa League", "UEFA Europa League"],
    ["La Liga", "La Liga"],
    ["LL", "La Liga"],
    ["Serie A", "Serie A"],
    ["Bundesliga", "Bundesliga"],
    ["Ligue 1", "Ligue 1"],
    ["MLS", "MLS"],
    ["World Cup", "World Cup"],
    ["WC", "World Cup"],
    ["FA Cup", "FA Cup"],
    ["Copa del Rey", "Copa del Rey"],
    ["Carabao Cup", "Carabao Cup"],
  ])("normalizes %s", (alias, canonical) => {
    expect(parseFixture(`Real Madrid vs Barcelona ${alias}`)).toMatchObject({
      away: "Barcelona",
      competition: canonical,
      inferred: false,
    });
  });
  it.each([
    "",
    "Arsenal",
    "Arsenal vs",
    "vs Bournemouth",
    "Arsenal vs Bournemouth vs Chelsea",
    "123 vs 456",
    "<script> vs Arsenal",
  ])("rejects malformed %s", (input) =>
    expect(() => parseFixture(input)).toThrow("Could not parse fixture"),
  );
  it("preserves raw input and multiword names", () => {
    const raw = "manchester united vs paris saint-germain ucl";
    expect(parseFixture(raw)).toEqual({
      home: "Manchester United",
      away: "Paris Saint-Germain",
      competition: "UEFA Champions League",
      inferred: false,
      raw,
    });
  });
  it("does not strip aliases embedded in a name", () =>
    expect(parseFixture("Arsenal vs Examplepl").away).toBe("Examplepl"));
});
