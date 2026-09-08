import { describe, it, expect } from "vitest";
import { applySm2 } from "../src/lib/sm2";

describe("SM-2", () => {
  it("increases interval on good response", () => {
    const out = applySm2({ easeFactor: 2.5, interval: 1, repetitions: 1, dueAt: new Date() }, 5);
    expect(out.interval).toBe(6);
    expect(out.repetitions).toBe(2);
  });
});
