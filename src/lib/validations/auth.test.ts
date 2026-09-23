import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "./auth";

describe("auth validation", () => {
  it("accepts a valid registration", () => {
    const result = registerSchema.safeParse({
      displayName: "Minh Nghĩa",
      email: "nghia@example.com",
      password: "serenity2026",
      confirmPassword: "serenity2026",
    });

    expect(result.success).toBe(true);
  });

  it("rejects weak and mismatched passwords", () => {
    const weak = registerSchema.safeParse({
      displayName: "Minh Nghĩa",
      email: "nghia@example.com",
      password: "abcdefgh",
      confirmPassword: "different1",
    });

    expect(weak.success).toBe(false);
  });

  it("requires a password for login", () => {
    expect(loginSchema.safeParse({ email: "nghia@example.com", password: "" }).success).toBe(false);
  });
});
