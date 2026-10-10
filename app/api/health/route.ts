import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export function GET() {
  return NextResponse.json(
    {
      status: "ok",
      aiConfigured: Boolean(
        process.env.ANTHROPIC_API_KEY &&
        process.env.ANTHROPIC_API_KEY !== "dummy",
      ),
      footballConfigured: Boolean(process.env.FOOTBALL_API_KEY),
      rateLimitConfigured: Boolean(
        process.env.UPSTASH_REDIS_REST_URL &&
        process.env.UPSTASH_REDIS_REST_TOKEN,
      ),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
