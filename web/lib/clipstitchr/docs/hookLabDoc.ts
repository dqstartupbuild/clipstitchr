import type { CustomerDocPage } from "@/lib/clipstitchr/docs/CustomerDocPage";

export const hookLabDoc = {
  slug: "hook-lab",
  title: "Hook Lab",
  description:
    "Study every beat of a public post, remake it for your active product, and browse original hook patterns.",
  summary:
    "Paste one public post link. Hook Lab catches expressions, prop moves, timing, words, and likely meaning, then writes an editable scene-by-scene version for your active product.",
  category: "feature",
  order: 18,
  updated: "2026-07-22",
  sections: [
    {
      title: "Add a post",
      body: [
        "Open Hook Lab, paste a public TikTok or Instagram video, Reel, or slideshow link, then choose Save and analyze. Short mobile share links work too.",
        "The post appears in your saved list while ClipStitchr reads the full video or every slide in order.",
      ],
    },
    {
      title: "Read the analysis",
      body: [
        "Open a completed post to see its caption, on-screen text, summary, public engagement numbers, performance explanation, and complete timestamped play-by-play.",
        "The play-by-play calls out expressions, body language, important objects, where they sit, the order they move, reactions, cuts, sound, and timing. Likely meaning and cultural context stay clearly labeled as interpretation.",
      ],
    },
    {
      title: "Browse the Hook Library",
      body: [
        "Choose Hook Library at the top of Hook Lab to browse more than a thousand reusable opening patterns.",
        "Search for a word or outcome, filter by category, feeling, tool, or intensity, then copy a hook you want to adapt. Results load 24 at a time so the page stays quick.",
      ],
    },
    {
      title: "Use the format for your product",
      body: [
        "Choose your product with the dashboard product picker, then open a completed report and choose Use this format.",
        "Hook Lab writes the exact concept for that product, including the opening reaction, scene order, spoken lines, text, props, product demonstration, CTA, and caption. The script stays in the report so you can edit, save, copy, or regenerate it.",
        "Each generation or regeneration costs 1 creation credit. Editing and copying an existing script are free.",
      ],
    },
    {
      title: "When a post cannot be analyzed",
      body: [
        "The post must be public and must expose a downloadable video or image set. Private posts, removed posts, and provider-blocked downloads cannot be analyzed.",
        "If the source or model has a temporary problem, use Retry from the saved post.",
      ],
    },
  ],
} satisfies CustomerDocPage;
