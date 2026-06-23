import type { CustomerDocPage } from "@/lib/clipstitchr/docs/CustomerDocPage";

export const stitchrDoc = {
  slug: "stitchr",
  title: "Stitchr",
  description:
    "Create batches of finished vertical ads from saved clips and one product demo.",
  summary:
    "Pick the product demo, create a batch, then review and export finished variants.",
  category: "feature",
  order: 10,
  updated: "2026-06-23",
  sections: [
    {
      title: "What Stitchr does",
      body: [
        "Use Stitchr when you have clips, but not finished ads. Batch mode turns saved footage into finished ad variants without making you rebuild each video by hand.",
        "Each finished stitch follows a simple order: source clip first, product demo second.",
      ],
    },
    {
      title: "Create a batch",
      body: [
        "Batch mode is the default Stitchr flow. Pick the product demo you want to promote, choose text styling, and create the batch. ClipStitchr chooses useful clip pairings from your saved library and prepares finished drafts for review.",
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
        "You can add a shared music track when creating stitches or later from a saved stitch card. Uploads are added to the shared music pool, so only upload tracks you have the rights to share and use.",
        "When you download a stitch with music enabled, ClipStitchr renders a fresh export with the current music settings. You can remove music, choose another track, or change volume later.",
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
        "Batch mode writes hooks for the whole batch together when it can. That helps the hooks feel less repetitive across the finished drafts.",
        "Open Library, then Hooks, to copy hooks, save the ones you like, or add weak ones to the avoid list. Those choices help the next batch sound closer to your taste.",
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
