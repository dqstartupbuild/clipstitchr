import type { CustomerDocPage } from "@/lib/clipstitchr/docs/CustomerDocPage";

export const stitchrDoc = {
  slug: "stitchr",
  title: "Stitchr",
  description:
    "Turn UGC and product demos into finished vertical ads.",
  summary:
    "Choose UGC, pick one demo, preview each ad, and export finished variants.",
  category: "feature",
  order: 10,
  updated: "2026-06-21",
  sections: [
    {
      title: "What Stitchr does",
      body: [
        "Use Stitchr when you have clips, but not finished ads. It pairs a UGC opener with a product demo so you can turn saved footage into ad variants without opening a timeline editor.",
        "Every stitch follows a simple order: UGC first, product demo second.",
      ],
    },
    {
      title: "Make a batch",
      body: [
        "Choose up to 20 UGC and one product demo. Stitchr makes one finished ad for each UGC selection and reuses the same demo for the batch.",
        "When a clip has a score, use it as a quick clue for which UGC or demo is worth trying first.",
        "In Batch mode, choose Any text styling for fresh variety or pick exact text, background, and outline colors before you queue drafts.",
      ],
      bullets: [
        "Choose UGC and Demo clips from the library.",
        "Select the UGC you want to test.",
        "Select one demo clip for the batch.",
        "Preview each ad before export.",
        "Create one finished stitch for each selected UGC.",
      ],
    },
    {
      title: "Music",
      body: [
        "You can add a shared music track when creating stitches or later from a saved stitch card. Uploads are added to the shared music pool, so only upload tracks you have the rights to share and use.",
        "When you download a stitch with music enabled, ClipStitchr renders a fresh export with the current music settings. You can remove music, choose another track, or change volume later.",
      ],
    },
    {
      title: "Text overlay",
      body: [
        "Add one text hook per selected ad when the batch needs it. Use different text for each UGC opener, or copy the active overlay to all selected ads.",
        "Write the hook yourself or generate a starting point from your product settings. Edit each overlay before export.",
      ],
    },
    {
      title: "Saved outputs",
      body: [
        "Finished stitches appear in the Library under Stitches. Your original UGC and demo clips stay unchanged, so you can reuse them in the next batch.",
        "Open the Stitch menu to score a saved Stitch before posting, save the setup as a Template, or load it in Stitchr later.",
      ],
    },
  ],
} satisfies CustomerDocPage;
