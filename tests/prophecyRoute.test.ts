import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const mocks = vi.hoisted(() => ({
  stream: vi.fn(),
  limit: vi.fn(),
  context: vi.fn(),
}));
vi.mock("@/lib/anthropic", () => ({ createProphecyStream: mocks.stream }));
vi.mock("@/lib/rateLimit", () => ({ checkRateLimit: mocks.limit }));
vi.mock("@/lib/footballApi", () => ({ getFootballContext: mocks.context }));
import { POST } from "@/app/api/prophecy/route";
function request(body: unknown) {
  return new NextRequest("http://localhost/api/prophecy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
beforeEach(() => {
  vi.resetAllMocks();
  mocks.limit.mockResolvedValue({ success: true, reset: 0 });
  mocks.context.mockResolvedValue(undefined);
});
describe("prophecy API boundary", () => {
  it("rejects malformed and oversized fixtures before provider calls", async () => {
    expect((await POST(request({ fixture: "Arsenal" }))).status).toBe(400);
    expect((await POST(request({ fixture: "A".repeat(121) }))).status).toBe(
      400,
    );
    expect(mocks.stream).not.toHaveBeenCalled();
  });
  it("streams text incrementally and preserves source links", async () => {
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    async function* events() {
      yield {
        type: "content_block_delta",
        delta: { type: "text_delta", text: "First chunk" },
      };
      await gate;
      yield {
        type: "content_block_delta",
        delta: { type: "text_delta", text: " second chunk" },
      };
      yield {
        type: "content_block_delta",
        delta: {
          type: "citations_delta",
          citation: {
            type: "web_search_result_location",
            url: "https://example.com/report",
            title: "Test source",
          },
        },
      };
    }
    const upstream = events();
    mocks.stream.mockResolvedValue(
      Object.assign(upstream, { controller: new AbortController() }),
    );
    const response = await POST(request({ fixture: "Arsenal vs Bournemouth" }));
    expect(response.status).toBe(200);
    const reader = response.body!.getReader();
    const first = await reader.read();
    expect(new TextDecoder().decode(first.value)).toBe("First chunk");
    expect(first.done).toBe(false);
    release();
    let rest = "";
    while (true) {
      const result = await reader.read();
      if (result.done) break;
      rest += new TextDecoder().decode(result.value);
    }
    expect(rest).toContain("second chunk");
    expect(rest).toContain("https://example.com/report");
  });
  it("returns a graceful 502 without disclosing upstream errors", async () => {
    mocks.stream.mockRejectedValue(new Error("sensitive-provider-details"));
    const response = await POST(request({ fixture: "Arsenal vs Bournemouth" }));
    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain("sensitive-provider-details");
  });
  it("enforces configured throttling with Retry-After", async () => {
    mocks.limit.mockResolvedValue({
      success: false,
      reset: Date.now() + 50000,
    });
    const response = await POST(request({ fixture: "Arsenal vs Bournemouth" }));
    expect(response.status).toBe(429);
    expect(Number(response.headers.get("Retry-After"))).toBeGreaterThan(0);
    expect(mocks.stream).not.toHaveBeenCalled();
  });
  it("fails closed on configured limiter failure", async () => {
    mocks.limit.mockRejectedValue(new Error("Redis unavailable"));
    expect(
      (await POST(request({ fixture: "Arsenal vs Bournemouth" }))).status,
    ).toBe(503);
  });
});
