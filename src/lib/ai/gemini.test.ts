import { afterEach, describe, expect, it, vi } from "vitest";
import { analyzeWithGemini, GeminiRequestError } from "./gemini";

const input = {
  idempotencyKey: "1dc8894a-7df0-4b82-bbb0-74c62fe8409d",
  primaryEmotion: "calm" as const,
  energyScore: 3,
  stressScore: 2,
  causeCategory: null,
  artworkId: "artwork-1",
  artworkUrl: "https://example.com/artwork.jpg",
  artDescription: "Một khung cảnh yên tĩnh và nhẹ nhàng.",
  additionalSharing: "",
};

const validAnalysis = {
  nlpEmotionScores: {
    joy: 0.05,
    trust: 0.05,
    calm: 0.6,
    surprise: 0.05,
    sadness: 0.05,
    fear_anxiety: 0.05,
    anger: 0.05,
    disgust_discomfort: 0.05,
    overwhelmed: 0.05,
  },
  intensity: 2,
  reasonShort: "Có vẻ bạn đang cảm nhận sự yên tĩnh.",
  actionSuggestion: "Hãy thở chậm ba nhịp.",
  contentTags: ["calm"],
  safetyLevel: "normal",
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
  delete process.env.GEMINI_API_KEY;
});

describe("Gemini retry", () => {
  it("retries transient 503 responses and returns structured output", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    vi.useFakeTimers();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response("unavailable", { status: 503 }))
      .mockResolvedValueOnce(new Response("unavailable", { status: 503 }))
      .mockResolvedValueOnce(Response.json({
        candidates: [{ content: { parts: [{ text: JSON.stringify(validAnalysis) }] } }],
      }));
    vi.stubGlobal("fetch", fetchMock);

    const resultPromise = analyzeWithGemini(input);
    await vi.runAllTimersAsync();

    await expect(resultPromise).resolves.toEqual(validAnalysis);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("returns a retryable error after retries are exhausted", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    vi.useFakeTimers();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("unavailable", { status: 503 })));

    const resultPromise = analyzeWithGemini(input);
    const rejection = expect(resultPromise).rejects.toBeInstanceOf(GeminiRequestError);
    await vi.runAllTimersAsync();
    await rejection;
  });
});
