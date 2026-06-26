import type { CustomerDocPage } from "@/lib/clipstitchr/docs/CustomerDocPage";

export const stitchrDoc = {
  slug: "stitchr",
  title: "Stitchr",
  description:
    "Use saved clips and one product demo to make finished vertical ads without rebuilding each video by hand or hunting through folders.",
  summary:
    "Pick the product demo, create drafts, then review and export the ads worth using.",
  category: "feature",
  order: 10,
  updated: "2026-06-23",
  sections: [
    {
      title: "What Stitchr does",
      body: [
        "Use Stitchr when you have clips, but not finished ads. Batch mode is the UI label for making several drafts at once, but the point is simpler: stop rebuilding the same UGC-then-demo video by hand.",
        "Each finished stitch follows a simple order: source clip first, product demo second.",
      ],
    },
    {
      title: "Create several drafts",
      body: [
        "Batch mode is the default Stitchr flow. Pick the product demo you want to promote, choose text styling, and create drafts. ClipStitchr chooses useful clip pairings from your saved library and prepares finished work for review.",
        "When clips have scores, use them as quick guidance while you organize the library, trim weak moments, or decide what to use in Normal mode.",
        "Choose Any text styling for fresh variety, or pick exact text, background, and outline colors before you queue drafts.",
      ],
      bullets: [
        "Open Stitchr.",
        "Keep Batch mode selected.",
        "Pick the product demo you want to promote.",
        "Choose text style settings or leave them on Any.",
        "Create the batch and review the finished drafts.",
      ],
    },
    {
      title: "When to use Normal mode",
      body: [
        "Normal mode is for hands-on control. Use it when you want to manually select the UGC clips, preview each exact UGC-then-demo pairing, and customize text per selected output before export.",
      ],
      bullets: [
        "Select up to 20 UGC clips.",
        "Select one product demo.",
        "Preview each pairing.",
        "Create one finished stitch for each selected UGC.",
      ],
    },
    {
      title: "Music",
      body: [
        "You can add a sound when creating stitches or later from a saved stitch card.",
        "When you download a stitch with sound enabled, ClipStitchr renders a fresh export with the current sound settings. You can remove the sound, choose another one, or change volume later.",
      ],
    },
    {
      title: "Text overlay",
      body: [
        "Batch mode can vary text style automatically or follow the exact colors you choose before generation. Saved templates can also supply text and caption copy for every queued draft.",
        "In Normal mode, add one text hook per selected ad when the batch needs it. Use different text for each opener, or copy the active overlay to all selected ads.",
      ],
    },
    {
      title: "Hooks",
      body: [
        "Writing overlay text that does not sound fake is harder than it should be. Batch mode writes hooks together when it can, so the finished drafts do not all open with the same bland line.",
        "Open Library, then Hooks, to copy hooks, save the ones you like, or add weak ones to the avoid list. Those choices help the next drafts sound closer to your taste.",
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
