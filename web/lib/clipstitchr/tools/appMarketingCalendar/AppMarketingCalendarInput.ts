import type { AppMarketingCalendarCampaign } from "@/lib/clipstitchr/tools/appMarketingCalendar/AppMarketingCalendarCampaign";

export type AppMarketingCalendarInput = {
  month: string;
  postsPerWeek: 2 | 3 | 5;
  channels: readonly string[];
  pillars: readonly string[];
  owners: readonly string[];
  assets: readonly string[];
  campaigns: readonly AppMarketingCalendarCampaign[];
};
