import type { CustomerDocPage } from "@/lib/clipstitchr/docs/CustomerDocPage";

export const gettingStartedDoc = {
  slug: "getting-started",
  title: "Get Started",
  description:
    "Set up your first product, add a few clips, and create your first ad batch.",
  summary:
    "The shortest path from a new account to your first Stitchr batch.",
  category: "start",
  order: 0,
  updated: "2026-06-22",
  sections: [
    {
      title: "The fastest first session",
      body: [
        "You do not need a perfect library to start. Use one product, a few saved clips, and one product demo. That is enough to create your first batch and see how ClipStitchr fits into your content work.",
      ],
      bullets: [
        "Create or sign in to your account.",
        "Open Settings and save the product you want to make content for.",
        "Upload UGC and product demos into the Library.",
        "Open Stitchr, leave Batch mode selected, and pick the product demo you want to promote.",
        "Choose text style settings or leave them on Any.",
        "Create the batch, then review and download the finished ads.",
      ],
    },
    {
      title: "What to add first",
      body: [
        "Start with clips that already have a job. UGC gets attention. Product demos show proof. Avatar photos help when you need to make more clips later.",
      ],
      cards: [
        {
          title: "UGC",
          description:
            "Reactions, testimonials, quick demos, or talking clips that can open an ad.",
          href: "/docs/stitchr",
        },
        {
          title: "Product demos",
          description:
            "Clear footage of the product, result, app, or offer that should come after the opener.",
          href: "/docs/stitchr",
        },
        {
          title: "Avatar photos",
          description:
            "Saved people or characters you can reuse when you need more Clipr or Swapr footage.",
          href: "/docs/avatars",
        },
      ],
    },
    {
      title: "How the library stays organized",
      body: [
        "The Library keeps your UGC, demos, avatar photos, templates, carousels, and finished ads in one place. Use the tabs when you need to find UGC, Demos, Swaps, Swipes, Stitches, Avatars, or Templates.",
        "ClipStitchr prepares uploads for vertical social posts before they enter the library, so you do not have to fix the same clip every time you use it.",
      ],
    },
    {
      title: "Where to go next",
      body: [
        "Use Stitchr when you already have footage and need finished ads. Use scores, templates, Clipr, Swapr, Swipr, and Avatars when you want a stronger batch, more clips, or a carousel post.",
      ],
      cards: [
        {
          title: "Make ad variants",
          description:
            "Pick a product demo and create a batch of finished vertical ads.",
          href: "/docs/stitchr",
        },
        {
          title: "Improve the batch",
          description:
            "Use clip scores, stitch scores, and templates to pick better inputs and reuse what worked.",
          href: "/docs/clip-scores",
        },
        {
          title: "Create source clips",
          description:
            "Use Clipr or Swapr when your library needs fresh UGC-style material.",
          href: "/docs/clipr",
        },
        {
          title: "Check usage limits",
          description:
            "See the limits for uploads, downloads, generation, and library actions.",
          href: "/docs/rate-limits",
        },
      ],
    },
  ],
} satisfies CustomerDocPage;
