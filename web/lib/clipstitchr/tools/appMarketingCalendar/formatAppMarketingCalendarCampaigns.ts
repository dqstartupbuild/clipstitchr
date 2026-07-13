import type { AppMarketingCalendarCampaign } from "@/lib/clipstitchr/tools/appMarketingCalendar/AppMarketingCalendarCampaign";

export function formatAppMarketingCalendarCampaigns(
  campaigns: readonly AppMarketingCalendarCampaign[],
) {
  return campaigns
    .map((campaign) => `${campaign.date} | ${campaign.name}`)
    .join("\n");
}
