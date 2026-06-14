import type { CustomerDocPage } from "@/lib/clipstitchr/docs/CustomerDocPage";

export const automationDoc = {
  slug: "automation",
  title: "Automation",
  description:
    "Let ClipStitchr prepare daily drafts you can review, edit, and use when they feel right.",
  summary:
    "Choose which daily drafts ClipStitchr can make, then review everything before you use it.",
  category: "feature",
  order: 70,
  updated: "2026-06-14",
  sections: [
    {
      title: "What automation does",
      body: [
        "Automation helps keep your library moving by preparing new drafts in the background. It is built for review, not auto-posting.",
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
        "Pick Reaction or B-roll for generated UGC.",
        "Choose the default text style and colors for Stitchr drafts.",
        "Save your changes.",
      ],
    },
    {
      title: "Daily window",
      body: [
        "Daily drafts run during the app's daily window. The current window shown in Settings is 09:00-13:00 UTC.",
        "If a draft needs source clips, saved product settings, or saved avatar choices, ClipStitchr uses what is available in your account.",
      ],
    },
    {
      title: "Review before using",
      body: [
        "Automation creates drafts so you have something to start from. Check the output, edit the parts that need work, and use it only when it feels ready.",
      ],
      bullets: [
        "Preview Stitchr drafts before exporting.",
        "Edit generated UGC or use it as source footage.",
        "Open saved Swipes and change the text before downloading.",
      ],
    },
  ],
} satisfies CustomerDocPage;
