import type { AppMarketingCalendarInput } from "@/lib/clipstitchr/tools/appMarketingCalendar/AppMarketingCalendarInput";

export const defaultAppMarketingCalendarInput: AppMarketingCalendarInput = {
  month: "2026-01",
  postsPerWeek: 3,
  channels: ["TikTok", "Instagram Reels"],
  pillars: ["Problem", "Product demo", "Proof and learning"],
  owners: ["Founder", "Marketing"],
  assets: ["Clean app demo", "UGC source clip", "App screenshots"],
  campaigns: [
    { date: "2026-01-20", name: "Paid launch" },
    { date: "2026-01-30", name: "Month-end offer" },
  ],
};
