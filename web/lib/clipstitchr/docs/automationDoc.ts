import type { CustomerDocPage } from "@/lib/clipstitchr/docs/CustomerDocPage";

export const automationDoc = {
  slug: "automation",
  title: "Automation",
  description:
    "Let ClipStitchr prepare daily drafts when showing up on social keeps falling off your real work list, then review everything before use.",
  summary:
    "Choose what ClipStitchr can prepare each day, then review everything before anything leaves the app.",
  category: "feature",
  order: 70,
  updated: "2026-06-22",
  sections: [
    {
      title: "What automation does",
      body: [
        "Automation helps when consistency matters but social is not the work you woke up wanting to do. It prepares new Stitchr drafts, Hook/UGC clips, and carousel drafts in the background. It is built for review, not auto-posting.",
        "You stay in control. Pause it anytime, edit the drafts, and only use the ones that fit.",
      ],
    },
    {
      title: "Turn it on",
      body: [
        "Open Settings and use the Automation panel to choose what ClipStitchr can prepare.",
      ],
      bullets: [
        "Enable or pause daily drafts.",
        "Choose Stitchr, Clipr, or Swipr.",
        "Pick Any, Reaction, or B-roll for generated Hook/UGC.",
        "Choose the default text style and colors for Stitchr drafts.",
        "Save your changes.",
      ],
    },
    {
      title: "Daily window",
      body: [
        "Daily drafts run during the app's daily window. The current window shown in Settings is 09:00-13:00 UTC.",
        "If a draft needs Hook/UGC clips, saved product settings, or saved avatar choices, ClipStitchr uses what is available in your account.",
      ],
    },
    {
      title: "Review before using",
      body: [
        "Automation creates drafts so you have something to start from instead of a blank task on the calendar. Check the output, edit the parts that need work, and use it only when it feels ready.",
      ],
      bullets: [
        "Preview Stitchr drafts before exporting.",
        "Edit generated Hook/UGC or use it as source footage.",
        "Open saved Swipes and change the text before downloading.",
      ],
    },
  ],
} satisfies CustomerDocPage;
