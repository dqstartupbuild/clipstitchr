import type { CustomerDocPage } from "@/lib/clipstitchr/docs/CustomerDocPage";

export const hookLabDoc = {
  slug: "hook-lab",
  title: "Hook Lab",
  description:
    "Study a public TikTok or Instagram video or slideshow, then browse reusable hooks.",
  summary:
    "Paste one public post link. Hook Lab saves the post, explains what happens, and keeps the caption and on-screen text easy to find. The Hook Library gives you more opening ideas when you are ready to create.",
  category: "feature",
  order: 18,
  updated: "2026-07-21",
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
        "The analysis separates facts visible in the video from conclusions based on the public numbers that were available when the post was saved.",
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
      title: "When a post cannot be analyzed",
      body: [
        "The post must be public and must expose a downloadable video or image set. Private posts, removed posts, and provider-blocked downloads cannot be analyzed.",
        "If the source or model has a temporary problem, use Retry from the saved post.",
      ],
    },
  ],
} satisfies CustomerDocPage;
