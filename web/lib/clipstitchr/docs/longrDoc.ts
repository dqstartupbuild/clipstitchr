import type { CustomerDocPage } from "@/lib/clipstitchr/docs/CustomerDocPage";

export const longrDoc = {
  slug: "longr",
  title: "Longr",
  description:
    "Build one long-form vertical video from multiple saved clips.",
  summary:
    "Select UGC and demos, reorder them, and export one combined 9:16 video.",
  category: "feature",
  order: 15,
  updated: "2026-05-13",
  sections: [
    {
      title: "What Longr does",
      body: [
        "Use Longr when you want one longer video instead of many short ad variants. Pick saved UGC and Demo clips, arrange them in order, and build one continuous vertical output.",
      ],
    },
    {
      title: "How selection works",
      body: [
        "Selection order becomes the first play order. Use the compact timeline strip below the preview to drag clips into a different order before building.",
      ],
      bullets: [
        "Select multiple UGC and Demo clips.",
        "Use the running duration meter to stay under 5 minutes.",
        "Drag timeline cards to reorder the sequence.",
        "Build one saved Longr output.",
      ],
    },
    {
      title: "Saved outputs",
      body: [
        "Finished Longr videos appear in the Content Library under Longr. Source clips stay unchanged, so you can reuse the same UGC and demos in Stitchr, Longr, or another workflow.",
      ],
    },
  ],
} satisfies CustomerDocPage;
