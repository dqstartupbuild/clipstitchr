import type { CustomerDocPage } from "@/lib/clipstitchr/docs/CustomerDocPage";

export const swaprDoc = {
  slug: "swapr",
  title: "Swapr",
  description:
    "Turn a saved photo and UGC into another source clip when the library needs more than you have and another shoot is not happening.",
  summary:
    "Choose a person photo, choose UGC, and save the generated result for reuse in Stitchr.",
  category: "feature",
  order: 40,
  updated: "2026-05-12",
  sections: [
    {
      title: "What Swapr does",
      body: [
        "Use Swapr when you need more UGC-style footage but do not want to start from nothing. Pick a saved person or character photo, then pair it with UGC for motion.",
        "Swapr creates a new generated clip. Treat it like fresh footage, not a perfect edit of the original video.",
      ],
    },
    {
      title: "Make a Swapr clip",
      body: [
        "Pick one saved photo and saved UGC. Demo videos stay out of Swapr because Swapr outputs are meant to become UGC-style footage.",
      ],
      bullets: [
        "Choose a saved avatar or photo.",
        "Choose saved UGC as the motion reference.",
        "Add scene or style guidance if you need it.",
        "Start the generation and follow its status.",
        "Save the successful output into the Library under Swaps.",
      ],
    },
    {
      title: "Using Swapr outputs",
      body: [
        "Preview or download Swapr outputs from the library. You can also select them in Stitchr like other UGC.",
      ],
    },
    {
      title: "What to expect",
      body: [
        "Generated video can change details such as hands, clothing, backgrounds, face details, and timing. Review the result before you use it in an ad batch.",
      ],
    },
  ],
} satisfies CustomerDocPage;
