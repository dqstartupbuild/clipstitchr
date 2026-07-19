import type { CustomerDocPage } from "@/lib/clipstitchr/docs/CustomerDocPage";

export const hookLabDoc = {
  slug: "hook-lab",
  title: "Hook Lab",
  description:
    "Save a public TikTok or Instagram video and get a timestamped breakdown.",
  summary:
    "Paste one public post link. Hook Lab saves the post, reads the video, and explains what happens and how its public performance looks.",
  category: "feature",
  order: 18,
  updated: "2026-07-19",
  sections: [
    {
      title: "Add a post",
      body: [
        "Open Hook Lab, paste a public TikTok video or Instagram Reel or video post URL, then choose Save and analyze.",
        "The post appears in your saved list while ClipStitchr downloads the public video and reads it.",
      ],
    },
    {
      title: "Read the analysis",
      body: [
        "Open a completed post to see the summary, public engagement numbers, performance explanation, and a timestamped play-by-play of the full video.",
        "The analysis separates facts visible in the video from conclusions based on the public numbers that were available when the post was saved.",
      ],
    },
    {
      title: "When a post cannot be analyzed",
      body: [
        "The post must be public and must contain a downloadable video. Private posts, photo-only posts, removed posts, and provider-blocked downloads cannot be analyzed.",
        "If the source or model has a temporary problem, use Retry from the saved post.",
      ],
    },
  ],
} satisfies CustomerDocPage;
