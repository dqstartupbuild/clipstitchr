import { describe, expect, it } from "vitest";
import { formatIsoDateTimeForLocalInput } from "./formatIsoDateTimeForLocalInput";

describe("formatIsoDateTimeForLocalInput", () => {
  it("formats the instant with local date fields instead of UTC fields", () => {
    const value = "2026-08-01T13:45:00.000Z";
    const date = new Date(value);
    const expected = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

    expect(formatIsoDateTimeForLocalInput(value)).toBe(expected);
  });

  it("returns an empty input value for an invalid instant", () => {
    expect(formatIsoDateTimeForLocalInput("invalid")).toBe("");
  });
});
