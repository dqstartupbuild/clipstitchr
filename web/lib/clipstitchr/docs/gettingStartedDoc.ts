import type { CustomerDocPage } from "@/lib/clipstitchr/docs/CustomerDocPage";

export const gettingStartedDoc = {
  slug: "getting-started",
  title: "Get Started",
  description:
    "Set up one product, add a few clips, and make your first ads without turning the day into editing day or starting from a blank editor.",
  summary:
    "The shortest path from a new account to finished ads you can review.",
  category: "start",
  order: 0,
  updated: "2026-06-22",
  sections: [
    {
      title: "The fastest first session",
      body: [
        "You do not need a perfect library to start. Use one product, a few saved clips, and one product demo. That is enough to make your first ads and see whether ClipStitchr removes the part you keep avoiding.",
      ],
      bullets: [
        "Create or sign in to your account.",
        "Open Settings and save the product you want to grow.",
        "Upload Hook/UGC clips and product demos into the Library.",
        "Open Stitchr, leave Batch mode selected, and pick the product demo you want to promote.",
        "Choose text style settings or leave them on Any.",
        "Create the drafts, then review and download the finished ads.",
      ],
    },
    {
      title: "What to add first",
      body: [
        "Start with clips that already have a job. Hook/UGC clips earn attention. Product demos show what the app does. Avatar photos help when you need more Hook/UGC clips later.",
      ],
      cards: [
        {
          title: "Hook/UGC",
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
        "The Library keeps your Hook/UGC clips, demos, avatar photos, carousels, and finished ads in one place. Use the tabs when you need to find Hook/UGC, Demos, Swaps, Swipes, Stitches, Avatars, or Pexels.",
        "ClipStitchr prepares uploads for vertical posts before they enter the library, so you do not have to fix the same clip every time you use it.",
      ],
    },
    {
      title: "Where to go next",
      body: [
        "Use Stitchr when you already have footage and need finished ads. Use scores, Clipr, Swapr, Swipr, and Avatars when you want a cleaner ad, more clips, or a carousel post.",
      ],
      cards: [
        {
          title: "Make finished ads",
          description:
            "Pick a product demo and create finished vertical ads from saved clips.",
          href: "/docs/stitchr",
        },
        {
          title: "Catch weak clips sooner",
          description:
            "Use clip scores and stitch scores to pick better inputs and improve what you make.",
          href: "/docs/clip-scores",
        },
        {
          title: "Create Hook/UGC clips",
          description:
            "Use Clipr or Swapr when your library needs fresh Hook/UGC material.",
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
