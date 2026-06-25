import type { CustomerDocPage } from "@/lib/clipstitchr/docs/CustomerDocPage";

export const stitchScoreDoc = {
  slug: "stitch-scores",
  title: "Stitch Scores",
  description:
    "Check a finished Stitch before you post it, fix the wrong thing, or find out too late that the opener dragged.",
  summary:
    "Score a saved Stitch, see where people may drop off, and get quick trim or text ideas before you use it.",
  category: "feature",
  order: 16,
  updated: "2026-06-14",
  sections: [
    {
      title: "What stitch scores do",
      body: [
        "Stitch scores help you decide if a finished Stitch is ready to post before it becomes a public mistake. The score looks at the opener, how smoothly it moves into the demo, and where someone may lose interest.",
        "Use it as a quick gut check before you download, post, or make another version you did not need.",
      ],
    },
    {
      title: "How to score a Stitch",
      body: [
        "Open your saved Stitches, choose the Stitch menu, and select Score stitch. ClipStitchr saves the score on that Stitch when it is done.",
      ],
      bullets: [
        "Open the Library.",
        "Go to Stitches.",
        "Open the Stitch menu.",
        "Choose Score stitch.",
        "Open the details to see the risks, trims, overlay ideas, and stronger opening line.",
      ],
    },
    {
      title: "What you get back",
      body: [
        "The score is not a promise that a post will perform. It is a simple editing read so you can decide what to fix first.",
      ],
      bullets: [
        "Retention estimate: a quick read on whether the Stitch keeps moving.",
        "Hook to demo flow: how well the opener earns the demo.",
        "Drop-off risks: moments where viewers may leave.",
        "Suggested trims: what to cut or start sooner.",
        "Overlay ideas: short text that may make the Stitch easier to watch.",
        "Stronger opening line: one cleaner first line to try.",
      ],
    },
  ],
} satisfies CustomerDocPage;
