import type { AppMarketingCalendarCampaign } from "@/lib/clipstitchr/tools/appMarketingCalendar/AppMarketingCalendarCampaign";

export function parseAppMarketingCalendarCampaigns(
  value: string,
): AppMarketingCalendarCampaign[] {
  return value
    .split("\n")
    .map((line) => line.split("|"))
    .map(([date = "", name = ""]) => ({
      date: date.trim(),
      name: name.trim(),
    }))
    .filter((campaign) => campaign.date || campaign.name)
    .slice(0, 5);
}
