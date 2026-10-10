import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseFixture } from "@/lib/parseFixture";
import { findFixtures } from "@/lib/footballApi";
export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  const result = z
    .string()
    .trim()
    .min(3)
    .max(120)
    .safeParse(request.nextUrl.searchParams.get("fixture"));
  if (!result.success)
    return NextResponse.json(
      { error: "Provide a fixture of 3–120 characters." },
      { status: 400 },
    );
  let parsed;
  try {
    parsed = parseFixture(result.data);
  } catch {
    return NextResponse.json(
      { error: "Could not parse fixture" },
      { status: 400 },
    );
  }
  const fixtures = await findFixtures(parsed, request.signal);
  return NextResponse.json(
    {
      fixtures,
      source: fixtures.length ? "api-football" : "web-search",
      message: fixtures.length
        ? null
        : "No confirmed fixture records available. Prophecy research will use Gemini Google Search.",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
