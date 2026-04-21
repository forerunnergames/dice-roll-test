import { describe, it, expect, vi, afterEach } from "vitest";
import { generateDice, maskEmail } from "@/lib/dice";

describe("generateDice", () => {
  it("returns exactly 5 dice", () => {
    const result = generateDice();
    expect(result).toHaveLength(5);
  });

  it("all values are between 1 and 6", () => {
    // Run multiple times to increase confidence.
    for (let i = 0; i < 100; i++) {
      const result = generateDice();
      for (const die of result) {
        expect(die).toBeGreaterThanOrEqual(1);
        expect(die).toBeLessThanOrEqual(6);
      }
    }
  });

  it("produces all 6 possible values over many rolls", () => {
    const mockBytes = [0, 1, 2, 3, 4, 5, 0, 1, 2, 3];
    let callIndex = 0;

    // Deterministic test: mock crypto.getRandomValues to return specific bytes.
    // Mocked bytes map to die faces with byte % 6 + 1
    vi.spyOn(crypto, "getRandomValues").mockImplementation((array) => {
      const bytes = array as Uint8Array;
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = mockBytes[callIndex++];
      }
      return array;
    });

    const seen = new Set<number>([...generateDice(), ...generateDice()]);
    expect(seen).toEqual(new Set([1, 2, 3, 4, 5, 6]));
  });

  it("rejects bytes >= 252 (rejection sampling)", () => {
    // Deterministic test: mock crypto.getRandomValues to return specific bytes.
    // Bytes 252-255 should be rejected (they cause modulo bias for 6-sided dice).
    // Bytes 0-251 should be accepted.
    const mockBytes = [
      252, 253, 254, 255, // These 4 should be rejected
      0, 5, 11, 251, 42,  // These 5 should be accepted → values 1, 6, 6, 6, 1
    ];
    let callIndex = 0;

    vi.spyOn(crypto, "getRandomValues").mockImplementation((array) => {
      const bytes = array as Uint8Array;
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = mockBytes[callIndex++];
      }
      return array;
    });

    const result = generateDice();

    // 0 % 6 + 1 = 1, 5 % 6 + 1 = 6, 11 % 6 + 1 = 6, 251 % 6 + 1 = 6, 42 % 6 + 1 = 1
    expect(result).toEqual([1, 6, 6, 6, 1]);

  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
});

describe("maskEmail", () => {
  it("masks a normal email", () => {
    expect(maskEmail("alice@example.com")).toBe("a***@example.com");
  });

  it("masks a single-character local part", () => {
    expect(maskEmail("a@example.com")).toBe("***@example.com");
  });

  it("returns unknown for undefined", () => {
    expect(maskEmail(undefined)).toBe("unknown");
  });

  it("returns unknown for null", () => {
    expect(maskEmail(null)).toBe("unknown");
  });

  it("returns unknown for empty string", () => {
    expect(maskEmail("")).toBe("unknown");
  });

  it("returns unknown for string without @", () => {
    expect(maskEmail("not-an-email")).toBe("unknown");
  });

  it("handles email with long local part", () => {
    expect(maskEmail("longusername@example.com")).toBe("l***@example.com");
  });
});
