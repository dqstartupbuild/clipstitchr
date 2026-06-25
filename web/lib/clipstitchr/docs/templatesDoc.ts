import type { CustomerDocPage } from "@/lib/clipstitchr/docs/CustomerDocPage";

export const templatesDoc = {
  slug: "templates",
  title: "Templates",
  description:
    "Save a Stitch setup so the next ad does not start with rebuilding the same structure all over again from memory.",
  summary:
    "Turn a finished Stitch into a reusable setup, then use it when the blank start is the thing slowing you down.",
  category: "feature",
  order: 18,
  updated: "2026-06-22",
  sections: [
    {
      title: "What templates save",
      body: [
        "Templates save the setup from a finished Stitch. They are for the parts you do not want to rebuild, not for storing another finished video file.",
      ],
      bullets: [
        "The UGC and demo clip choices.",
        "Clip trims and sequence settings.",
        "Text overlay timing and style.",
        "Caption and hashtag copy.",
        "Audio on/off choices and playback speed.",
      ],
    },
    {
      title: "Save a template",
      body: [
        "Use templates when you make a Stitch that has a structure you know you will want again and do not want to reconstruct from memory.",
      ],
      bullets: [
        "Open a saved Stitch.",
        "Choose Save as Template.",
        "ClipStitchr saves the reusable setup.",
        "Open Templates from the dashboard sidebar to rename, delete, or reuse it.",
      ],
    },
    {
      title: "Use a template",
      body: [
        "Open Stitchr and choose a saved template from the Template picker. In Batch mode, the template supplies the saved text and caption style while ClipStitchr still picks fresh clip pairings from your library.",
        "In Normal mode, ClipStitchr fills in the saved setup so you can preview faster. You can still change the UGC, demo, text, trims, caption, and audio choices before creating the next Stitch.",
      ],
    },
    {
      title: "What templates are best for",
      body: [
        "Templates are useful when a format keeps working: the same offer style, the same hook structure, the same caption style, or the same UGC-to-demo rhythm.",
        "They help you make another version without rebuilding every small choice, which is usually the part that makes you put the task off.",
      ],
    },
  ],
} satisfies CustomerDocPage;
