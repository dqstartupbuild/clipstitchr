import type { CustomerDocPage } from "@/lib/clipstitchr/docs/CustomerDocPage";

export const swiprDoc = {
  slug: "swipr",
  title: "Swipr",
  description:
    "Create carousel posts you can save, revise, and download later.",
  summary:
    "Build a Swipe with editable photos and text on each slide.",
  category: "feature",
  order: 30,
  updated: "2026-05-12",
  sections: [
    {
      title: "What Swipr creates",
      body: [
        "Swipr makes vertical carousel posts called Swipes. Save a Swipe when you want to come back later, revise the text, change slide photos, or download the latest version.",
      ],
    },
    {
      title: "Build a carousel",
      body: [
        "Each Swipe has up to 8 slides. Add a photo and text to each slide so the carousel tells a clear story.",
      ],
      bullets: [
        "Choose a saved product.",
        "Add or remove slides.",
        "Search Pexels, choose an avatar photo, upload a photo, or generate one.",
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
