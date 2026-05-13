import type { CustomerDocPage } from "@/lib/clipstitchr/docs/CustomerDocPage";

export const swiprDoc = {
  slug: "swipr",
  title: "Swipr",
  description:
    "Create carousel posts you can save, revise, and download later.",
  summary:
    "Build a Swipe with 3 to 8 slides, one background, and editable text on each slide.",
  category: "feature",
  order: 30,
  updated: "2026-05-12",
  sections: [
    {
      title: "What Swipr creates",
      body: [
        "Swipr makes vertical carousel posts called Swipes. Save a Swipe when you want to come back later, revise the text, change the background, or download the latest version.",
      ],
    },
    {
      title: "Build a carousel",
      body: [
        "Each Swipe has 3 to 8 slides and one shared background. Edit the text on each slide so the carousel tells a clear story.",
      ],
      bullets: [
        "Choose a saved product.",
        "Choose 3 to 8 carousel images.",
        "Choose a shared background from the Background Library, upload one, or generate one.",
        "Edit text on each slide.",
        "Save the editable Swipe.",
        "Download the current saved version as a set of vertical PNG slides.",
      ],
    },
    {
      title: "Auto text",
      body: [
        "Swipr can draft slide text from your product settings. The first slide opens the idea, and the rest of the slides support it. Edit the text before you save.",
      ],
    },
    {
      title: "Saved Swipes",
      body: [
        "Saved Swipes appear in the Content Library under Swipes and in All. From there, preview, download, keep editing, or delete a Swipe.",
      ],
    },
  ],
} satisfies CustomerDocPage;
