import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { createProphecyStream } from "@/lib/gemini";
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
function mockResponse(data: string, split = 11) {
  const bytes = new TextEncoder().encode(data);
  return new Response(
    new ReadableStream({
      start(controller) {
        for (let i = 0; i < bytes.length; i += split)
          controller.enqueue(bytes.slice(i, i + split));
        controller.close();
      },
    }),
  );
}
function frame(chunk: unknown) {
  return `data: ${JSON.stringify(chunk)}\r\n\r\n`;
}
describe("Gemini server stream", () => {
  it("parses split SSE frames, skips thinking, and preserves grounded sources", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-secret");
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        mockResponse(
          frame({
            candidates: [
              {
                content: {
                  parts: [
                    { text: "private", thought: true },
                    { text: "✝️ Analysis" },
                  ],
                },
              },
            ],
          }) +
            frame({
              candidates: [
                {
                  content: { parts: [{ text: " complete" }] },
                  finishReason: "STOP",
                  groundingMetadata: {
                    groundingChunks: [
                      {
                        web: {
                          uri: "https://example.com/report",
                          title: "Report",
                        },
                      },
                    ],
                  },
                },
              ],
            }),
        ),
      );
    vi.stubGlobal("fetch", fetchMock);
    const stream = await createProphecyStream(
      "Arsenal vs Bournemouth",
      new AbortController().signal,
    );
    const events = [];
    for await (const event of stream) events.push(event);
    expect(events).toEqual([
      { type: "text", text: "✝️ Analysis" },
      { type: "text", text: " complete" },
      { type: "source", url: "https://example.com/report", title: "Report" },
    ]);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain(
      "gemini-2.5-flash-lite:streamGenerateContent?alt=sse",
    );
    expect(url).not.toContain("test-secret");
    expect(options.headers["x-goog-api-key"]).toBe("test-secret");
    expect(JSON.parse(options.body).tools).toEqual([{ google_search: {} }]);
  });
  it("rejects a missing key before contacting Google", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(
      createProphecyStream("A vs B", new AbortController().signal),
    ).rejects.toThrow("GEMINI_API_KEY");
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("handles quota exhaustion without paid fallback", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-secret");
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("quota", { status: 429 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(
      createProphecyStream("A vs B", new AbortController().signal),
    ).rejects.toThrow("quota");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it("rejects empty and blocked responses", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-secret");
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          mockResponse(frame({ promptFeedback: { blockReason: "SAFETY" } })),
        ),
    );
    const stream = await createProphecyStream(
      "A vs B",
      new AbortController().signal,
    );
    await expect(
      (async () => {
        for await (const event of stream) void event;
      })(),
    ).rejects.toThrow("blocked");
  });
});
