import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "../src/lib/auth";

describe("auth", () => {
  it("hashes and verifies password", async () => {
    const h = await hashPassword("Admin123!");
    expect(await verifyPassword("Admin123!", h)).toBe(true);
  });
});
