import type { AppMarketingCalendarInput } from "@/lib/clipstitchr/tools/appMarketingCalendar/AppMarketingCalendarInput";
import type { AppMarketingCalendarRow } from "@/lib/clipstitchr/tools/appMarketingCalendar/AppMarketingCalendarRow";
import { normalizeAppMarketingCalendarValues } from "@/lib/clipstitchr/tools/appMarketingCalendar/normalizeAppMarketingCalendarValues";

const weekdayOffsets = {
  2: [1, 4],
  3: [1, 3, 5],
  5: [1, 2, 3, 4, 5],
} as const;

export function generateAppMarketingCalendar(
  input: AppMarketingCalendarInput,
): AppMarketingCalendarRow[] {
  const [year = 2026, month = 1] = input.month.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const channels = normalizeAppMarketingCalendarValues(
    input.channels,
    "Primary channel",
  );
  const pillars = normalizeAppMarketingCalendarValues(
    input.pillars,
    "Product truth",
  );
  const owners = normalizeAppMarketingCalendarValues(
    input.owners,
    "Unassigned",
  );
  const assets = normalizeAppMarketingCalendarValues(
    input.assets,
    "Assign source",
  );
  const campaigns = new Map(
    input.campaigns
      .filter((campaign) => campaign.date.trim())
      .map((campaign) => [
        campaign.date.trim(),
        campaign.name.trim() || "Key date",
      ]),
  );
  const allowedWeekdays: readonly number[] = weekdayOffsets[input.postsPerWeek];
  const rows: AppMarketingCalendarRow[] = [];

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(Date.UTC(year, month - 1, day));
    const weekday = date.getUTCDay();
    const isoDate = date.toISOString().slice(0, 10);
    const campaignName = campaigns.get(isoDate);
    const isCampaignDate = campaignName !== undefined;
    if (!allowedWeekdays.includes(weekday) && !isCampaignDate) continue;

    const index = rows.length;

    rows.push({
      asset: assets[index % assets.length] ?? assets[0]!,
      channel: channels[index % channels.length] ?? channels[0]!,
      ctaRole: isCampaignDate
        ? `Campaign: ${campaignName}`
        : index % 3 === 0
          ? "Learn more"
          : index % 3 === 1
            ? "See the product"
            : "View paid plans",
      date: isoDate,
      id: `slot-${isoDate}`,
      owner: owners[index % owners.length] ?? owners[0]!,
      pillar: pillars[index % pillars.length] ?? pillars[0]!,
      status: "Planned",
    });
  }

  return rows;
}
