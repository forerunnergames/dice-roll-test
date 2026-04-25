import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ROLL_WINDOW_CLOSE_HOUR reads process.env at module load time,
// so we need to set the env var before importing, then reset the module
// cache between tests that need different values.

describe("isRollWindowOpen", () => {
  // Default ROLL_WINDOW_CLOSE_HOUR is 7 (from env or fallback).
  it("returns true before close hour", async () => {
    const { isRollWindowOpen } = await import("@/lib/config");
    // 3 AM UTC — before 7 AM UTC close.
    const earlyMorning = new Date("2026-04-20T03:00:00Z");
    expect(isRollWindowOpen(earlyMorning)).toBe(true);
  });

  it("returns false at exactly close hour", async () => {
    const { isRollWindowOpen } = await import("@/lib/config");
    // 7 AM UTC — window is closed.
    const closeTime = new Date("2026-04-20T07:00:00Z");
    expect(isRollWindowOpen(closeTime)).toBe(false);
  });

  it("returns false after close hour", async () => {
    const { isRollWindowOpen } = await import("@/lib/config");
    // 10 AM UTC — after close.
    const afterClose = new Date("2026-04-20T10:00:00Z");
    expect(isRollWindowOpen(afterClose)).toBe(false);
  });

  it("returns true at midnight UTC (start of new window)", async () => {
    const { isRollWindowOpen } = await import("@/lib/config");
    const midnight = new Date("2026-04-21T00:00:00Z");
    expect(isRollWindowOpen(midnight)).toBe(true);
  });

  it("returns true one minute before close", async () => {
    const { isRollWindowOpen } = await import("@/lib/config");
    // 6:59 AM UTC — still open (getUTCHours() returns 6).
    const justBefore = new Date("2026-04-20T06:59:59Z");
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

  it("defaults to 7 when env var is not set", async () => {
    delete process.env.ROLL_WINDOW_CLOSE_HOUR;
    const { ROLL_WINDOW_CLOSE_HOUR } = await import("@/lib/config");
    expect(ROLL_WINDOW_CLOSE_HOUR).toBe(7);
  });

  it("uses the env var when it's a valid hour", async () => {
    process.env.ROLL_WINDOW_CLOSE_HOUR = "18";
    const { ROLL_WINDOW_CLOSE_HOUR } = await import("@/lib/config");
    expect(ROLL_WINDOW_CLOSE_HOUR).toBe(18);
  });

  it("falls back to 7 for empty string", async () => {
    process.env.ROLL_WINDOW_CLOSE_HOUR = "";
    const { ROLL_WINDOW_CLOSE_HOUR } = await import("@/lib/config");
    expect(ROLL_WINDOW_CLOSE_HOUR).toBe(7);
  });

  it("falls back to 7 for whitespace-only string", async () => {
    process.env.ROLL_WINDOW_CLOSE_HOUR = "  ";
    const { ROLL_WINDOW_CLOSE_HOUR } = await import("@/lib/config");
    expect(ROLL_WINDOW_CLOSE_HOUR).toBe(7);
  });

  it("falls back to 7 for non-numeric values", async () => {
    process.env.ROLL_WINDOW_CLOSE_HOUR = "banana";
    const { ROLL_WINDOW_CLOSE_HOUR } = await import("@/lib/config");
    expect(ROLL_WINDOW_CLOSE_HOUR).toBe(7);
  });

  it("falls back to 7 for out-of-range values", async () => {
    process.env.ROLL_WINDOW_CLOSE_HOUR = "25";
    const { ROLL_WINDOW_CLOSE_HOUR } = await import("@/lib/config");
    expect(ROLL_WINDOW_CLOSE_HOUR).toBe(7);
  });

  it("falls back to 7 for negative values", async () => {
    process.env.ROLL_WINDOW_CLOSE_HOUR = "-1";
    const { ROLL_WINDOW_CLOSE_HOUR } = await import("@/lib/config");
    expect(ROLL_WINDOW_CLOSE_HOUR).toBe(7);
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
