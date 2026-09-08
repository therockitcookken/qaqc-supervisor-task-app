import { describe, it, expect } from "vitest";
import { scoreQuiz } from "../src/lib/quiz";

describe("quiz scoring", () => {
  it("scores mcq and gap fill", () => {
    const questions = [
      { id: "1", type: "MCQ", correctAnswer: "A" },
      { id: "2", type: "gap_fill", correctAnswer: "world" }
    ];
    const res = scoreQuiz(questions, { "1": "a", "2": "world" });
    expect(res.correct).toBe(2);
    expect(res.score).toBe(100);
  });
});
