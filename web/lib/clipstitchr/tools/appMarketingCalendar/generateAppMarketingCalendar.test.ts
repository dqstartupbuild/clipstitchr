import { describe, expect, it } from "vitest";
import { createAppMarketingCalendarCsv } from "@/lib/clipstitchr/tools/appMarketingCalendar/createAppMarketingCalendarCsv";
import { defaultAppMarketingCalendarInput } from "@/lib/clipstitchr/tools/appMarketingCalendar/defaultAppMarketingCalendarInput";
import { generateAppMarketingCalendar } from "@/lib/clipstitchr/tools/appMarketingCalendar/generateAppMarketingCalendar";

describe("generateAppMarketingCalendar", () => {
  it("creates dated publish slots instead of a thirty-day action plan", () => {
    const rows = generateAppMarketingCalendar(defaultAppMarketingCalendarInput);

    expect(rows.length).toBeGreaterThan(10);
    expect(rows.length).toBeLessThan(30);
    expect(rows.every((row) => row.status === "Planned")).toBe(true);
    expect(rows.some((row) => row.ctaRole === "Campaign: Paid launch")).toBe(
      true,
    );
    expect(
      rows.some((row) => row.ctaRole === "Campaign: Month-end offer"),
    ).toBe(true);
    expect(rows.every((row) => row.asset !== "Assign source")).toBe(true);
    expect(new Set(rows.map((row) => row.id)).size).toBe(rows.length);
  });

  it("exports valid CSV with escaped edited fields", () => {
    const rows = generateAppMarketingCalendar(defaultAppMarketingCalendarInput);
    const csv = createAppMarketingCalendarCsv([
      { ...rows[0]!, pillar: 'Proof, "without hype"' },
    ]);

    expect(csv).toContain("Date,Channel,Pillar,CTA role,Owner,Asset,Status");
    expect(csv).toContain('"Proof, ""without hype"""');
    expect(csv.split("\r\n")).toHaveLength(2);
  });
});
