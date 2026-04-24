import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ROLL_WINDOW_CLOSE_HOUR reads process.env at module load time,
// so we need to set the env var before importing, then reset the module
// cache between tests that need different values.

describe("isRollWindowOpen", () => {
  // Default ROLL_WINDOW_CLOSE_HOUR is 21 (from env or fallback).
  it("returns true before close hour", async () => {
    const { isRollWindowOpen } = await import("@/lib/config");
    // 8 AM UTC — well before 9 PM UTC close.
    const morning = new Date("2026-04-20T08:00:00Z");
    expect(isRollWindowOpen(morning)).toBe(true);
  });

  it("returns false at exactly close hour", async () => {
    const { isRollWindowOpen } = await import("@/lib/config");
    // 9 PM UTC — window is closed.
    const closeTime = new Date("2026-04-20T21:00:00Z");
    expect(isRollWindowOpen(closeTime)).toBe(false);
  });

  it("returns false after close hour", async () => {
    const { isRollWindowOpen } = await import("@/lib/config");
    // 11 PM UTC — after close.
    const lateNight = new Date("2026-04-20T23:00:00Z");
    expect(isRollWindowOpen(lateNight)).toBe(false);
  });

  it("returns true at midnight UTC (start of new window)", async () => {
    const { isRollWindowOpen } = await import("@/lib/config");
    const midnight = new Date("2026-04-21T00:00:00Z");
    expect(isRollWindowOpen(midnight)).toBe(true);
  });

  it("returns true one minute before close", async () => {
    const { isRollWindowOpen } = await import("@/lib/config");
    // 8:59 PM UTC — still open (getUTCHours() returns 20).
    const justBefore = new Date("2026-04-20T20:59:59Z");
    expect(isRollWindowOpen(justBefore)).toBe(true);
  });
});

describe("getRollWindowCloseTime", () => {
  it("returns the correct close time for a given date", async () => {
    const { getRollWindowCloseTime, ROLL_WINDOW_CLOSE_HOUR } = await import(
      "@/lib/config"
    );
    const date = new Date("2026-04-20T14:30:00Z");
    const close = getRollWindowCloseTime(date);

    expect(close.getUTCHours()).toBe(ROLL_WINDOW_CLOSE_HOUR);
    expect(close.getUTCMinutes()).toBe(0);
    expect(close.getUTCSeconds()).toBe(0);
    expect(close.getUTCMilliseconds()).toBe(0);
    // Same date.
    expect(close.getUTCDate()).toBe(20);
  });

  it("does not mutate the input date", async () => {
    const { getRollWindowCloseTime } = await import("@/lib/config");
    const original = new Date("2026-04-20T14:30:00Z");
    const originalTime = original.getTime();
    getRollWindowCloseTime(original);
    expect(original.getTime()).toBe(originalTime);
  });
});

describe("ROLL_WINDOW_CLOSE_HOUR validation", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    delete process.env.ROLL_WINDOW_CLOSE_HOUR;
  });

  it("defaults to 21 when env var is not set", async () => {
    delete process.env.ROLL_WINDOW_CLOSE_HOUR;
    const { ROLL_WINDOW_CLOSE_HOUR } = await import("@/lib/config");
    expect(ROLL_WINDOW_CLOSE_HOUR).toBe(21);
  });

  it("uses the env var when it's a valid hour", async () => {
    process.env.ROLL_WINDOW_CLOSE_HOUR = "18";
    const { ROLL_WINDOW_CLOSE_HOUR } = await import("@/lib/config");
    expect(ROLL_WINDOW_CLOSE_HOUR).toBe(18);
  });

  it("falls back to 21 for empty string", async () => {
    process.env.ROLL_WINDOW_CLOSE_HOUR = "";
    const { ROLL_WINDOW_CLOSE_HOUR } = await import("@/lib/config");
    expect(ROLL_WINDOW_CLOSE_HOUR).toBe(21);
  });

  it("falls back to 21 for whitespace-only string", async () => {
    process.env.ROLL_WINDOW_CLOSE_HOUR = "  ";
    const { ROLL_WINDOW_CLOSE_HOUR } = await import("@/lib/config");
    expect(ROLL_WINDOW_CLOSE_HOUR).toBe(21);
  });

  it("falls back to 21 for non-numeric values", async () => {
    process.env.ROLL_WINDOW_CLOSE_HOUR = "banana";
    const { ROLL_WINDOW_CLOSE_HOUR } = await import("@/lib/config");
    expect(ROLL_WINDOW_CLOSE_HOUR).toBe(21);
  });

  it("falls back to 21 for out-of-range values", async () => {
    process.env.ROLL_WINDOW_CLOSE_HOUR = "25";
    const { ROLL_WINDOW_CLOSE_HOUR } = await import("@/lib/config");
    expect(ROLL_WINDOW_CLOSE_HOUR).toBe(21);
  });

  it("falls back to 21 for negative values", async () => {
    process.env.ROLL_WINDOW_CLOSE_HOUR = "-1";
    const { ROLL_WINDOW_CLOSE_HOUR } = await import("@/lib/config");
    expect(ROLL_WINDOW_CLOSE_HOUR).toBe(21);
  });

  it("accepts 0 (midnight) as a valid close hour", async () => {
    process.env.ROLL_WINDOW_CLOSE_HOUR = "0";
    const { ROLL_WINDOW_CLOSE_HOUR } = await import("@/lib/config");
    expect(ROLL_WINDOW_CLOSE_HOUR).toBe(0);
  });

  it("accepts 23 as a valid close hour", async () => {
    process.env.ROLL_WINDOW_CLOSE_HOUR = "23";
    const { ROLL_WINDOW_CLOSE_HOUR } = await import("@/lib/config");
    expect(ROLL_WINDOW_CLOSE_HOUR).toBe(23);
  });
});
