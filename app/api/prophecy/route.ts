import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseFixture } from "@/lib/parseFixture";
import { createProphecyStream } from "@/lib/gemini";
import { checkRateLimit } from "@/lib/rateLimit";
import { getFootballContext } from "@/lib/footballApi";

export const runtime = "nodejs";
export const maxDuration = 60;
const schema = z
  .object({ fixture: z.string().trim().min(3).max(120) })
  .strict();

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Send a valid JSON fixture." },
      { status: 400 },
    );
  }
  const result = schema.safeParse(body);
  if (!result.success)
    return NextResponse.json(
      { error: "Fixture must be between 3 and 120 characters." },
      { status: 400 },
    );
  const ip =
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.ip ||
    "unknown";
  try {
    const limit = await checkRateLimit(ip);
    if (!limit.success)
      return NextResponse.json(
        { error: "Ten readings per minute. Pause a moment, then try again." },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.max(1, Math.ceil((limit.reset - Date.now()) / 1000)),
            ),
          },
        },
      );
  } catch {
    return NextResponse.json(
      { error: "The service is temporarily unavailable. Try again shortly." },
      { status: 503 },
    );
  }
  let parsed;
  try {
    parsed = parseFixture(result.data.fixture);
  } catch {
    return NextResponse.json(
      { error: "Could not parse fixture" },
      { status: 400 },
    );
  }
  try {
    const signal = AbortSignal.any([
      request.signal,
      AbortSignal.timeout(55_000),
    ]);
    const context = await getFootballContext(parsed, signal);
    const upstream = await createProphecyStream(
      result.data.fixture,
      signal,
      context,
    );
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const citations = new Map<string, string>();
          for await (const event of upstream) {
            if (event.type === "text")
              controller.enqueue(encoder.encode(event.text));
            if (event.type === "source" && /^https?:\/\//i.test(event.url))
              citations.set(event.url, event.title);
          }
          if (citations.size)
            controller.enqueue(
              encoder.encode(
                "\n\n**Research sources**\n" +
                  Array.from(
                    citations,
                    ([url, title]) =>
                      `- [${title.replace(/[\[\]\\]/g, "")}](<${url}>)`,
                  ).join("\n"),
              ),
            );
          controller.close();
        } catch {
          controller.error(new Error("The scroll was interrupted. Try again."));
        }
      },
      cancel() {
        upstream.controller.abort();
      },
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "The prophecy service is unavailable. Check GEMINI_API_KEY and your free-tier quota, then try again.",
      },
      { status: 502 },
    );
  }
}
