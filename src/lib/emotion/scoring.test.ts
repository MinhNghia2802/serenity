import { describe, expect, it } from "vitest";
import { calculateFinalScores, topEmotion } from "./scoring";

describe("emotion scoring", () => {
  it("prioritizes NLP description over the quick selection", () => {
    const scores = calculateFinalScores({ nlp: { sadness: 0.9, joy: 0.1 }, selected: "joy", stress: 3, energy: 2 });
    expect(topEmotion(scores)).toBe("sadness");
  });

  it("transfers history weight to NLP when fewer than three sessions exist", () => {
    const scores = calculateFinalScores({ nlp: { calm: 1 }, selected: "anger", stress: 1, energy: 3 });
    expect(scores.calm).toBeGreaterThan(scores.anger);
    expect(Object.values(scores).reduce((sum, value) => sum + value, 0)).toBeCloseTo(1);
  });
});
