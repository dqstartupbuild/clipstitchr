import type { CustomerDocPage } from "@/lib/clipstitchr/docs/CustomerDocPage";

export const gettingStartedDoc = {
  slug: "getting-started",
  title: "Get Started",
  description:
    "Set up your first product, add a few clips, and make your first finished ad.",
  summary:
    "The shortest path from a new account to your first Stitchr export.",
  category: "start",
  order: 0,
  updated: "2026-05-12",
  sections: [
    {
      title: "The fastest first session",
      body: [
        "You do not need a perfect library to start. Use one product, a few pieces of UGC, and one product demo. That is enough to make your first ad and see how ClipStitchr fits into your content work.",
      ],
      bullets: [
        "Create or sign in to your account.",
        "Open Settings and save the product you want to make content for.",
        "Upload UGC and product demos into the Content Library.",
        "Open Stitchr and choose up to 20 UGC with one demo.",
        "Preview each ad before you export.",
        "Add one text hook if the batch needs it, then create and download the finished ads.",
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
        "The Content Library keeps your UGC, demos, generated footage, carousels, and finished ads in one place. Use the tabs when you need to find UGC, Demos, Swaps, Swipes, or Stitches.",
        "ClipStitchr prepares uploads for vertical social posts before they enter the library, so you do not have to fix the same clip every time you use it.",
      ],
    },
    {
      title: "Where to go next",
      body: [
        "Use Stitchr when you already have footage and need finished ads. Use Clipr, Swapr, Swipr, and Avatars when you need more clips or a carousel post.",
      ],
      cards: [
        {
          title: "Make ad variants",
          description:
            "Pair UGC with a demo and export finished vertical ads.",
          href: "/docs/stitchr",
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
