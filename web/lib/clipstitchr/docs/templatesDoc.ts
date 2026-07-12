import type { CustomerDocPage } from "@/lib/clipstitchr/docs/CustomerDocPage";

export const templatesDoc = {
  slug: "templates",
  title: "Saved setup Ideas",
  description:
    "Save a Stitch as an Idea so your next ad can start from a setup that already works.",
  summary:
    "Turn a finished Stitch into a reusable Idea, then start from it whenever a blank setup slows you down.",
  category: "feature",
  order: 18,
  updated: "2026-07-12",
  sections: [
    {
      title: "What saved setup Ideas keep",
      body: [
        "A saved setup Idea keeps the reusable choices from a finished Stitch. It remembers the setup without storing another finished video file.",
      ],
      bullets: [
        "The Hook/UGC and demo clip choices.",
        "Clip trims and sequence settings.",
        "Text overlay timing and style.",
        "Caption and hashtag copy.",
        "Audio on/off choices and playback speed.",
      ],
    },
    {
      title: "Save an Idea",
      body: [
        "Save an Idea when a Stitch has a structure you know you will want again.",
      ],
      bullets: [
        "Open a saved Stitch.",
        "Choose Save as idea.",
        "ClipStitchr saves the reusable setup.",
        "Open Hook Lab Ideas to rename, archive, delete, or reuse it.",
      ],
    },
    {
      title: "Start from an Idea",
      body: [
        "Open Stitchr and choose a saved setup from Start from an idea. In Batch mode, the Idea supplies the saved text and caption style while ClipStitchr still picks fresh clip pairings from your library.",
        "In Normal mode, ClipStitchr fills in the saved setup so you can preview faster. You can still change the Hook/UGC, demo, text, trims, caption, and audio choices before creating the next Stitch.",
      ],
    },
    {
      title: "What saved setup Ideas are best for",
      body: [
        "Saved setup Ideas are useful when a format keeps working: the same offer style, hook structure, caption style, or Hook/UGC-to-demo rhythm.",
        "They help you make another version without rebuilding every small choice, which is usually the part that makes you put the task off.",
      ],
    },
  ],
} satisfies CustomerDocPage;
