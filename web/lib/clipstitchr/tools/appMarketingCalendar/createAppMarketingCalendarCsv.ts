import type { AppMarketingCalendarRow } from "@/lib/clipstitchr/tools/appMarketingCalendar/AppMarketingCalendarRow";
import { createCsvText } from "@/lib/clipstitchr/tools/csv/createCsvText";

export function createAppMarketingCalendarCsv(
  rows: readonly AppMarketingCalendarRow[],
) {
  return createCsvText([
    ["Date", "Channel", "Pillar", "CTA role", "Owner", "Asset", "Status"],
    ...rows.map((row) => [
      row.date,
      row.channel,
      row.pillar,
      row.ctaRole,
      row.owner,
      row.asset,
      row.status,
    ]),
  ]);
}
