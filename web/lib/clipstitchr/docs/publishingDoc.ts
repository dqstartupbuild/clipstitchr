import type { CustomerDocPage } from "@/lib/clipstitchr/docs/CustomerDocPage";

export const publishingDoc = {
  slug: "publishing",
  title: "Publishing",
  description: "Plan and publish to Instagram and TikTok.",
  summary:
    "Connect an Instagram or TikTok account, publish finished Stitches and Swipes, and follow every post from draft to published.",
  category: "feature",
  order: 80,
  updated: "2026-08-02",
  sections: [
    {
      title: "What Publishing does",
      body: [
        "Publishing is the ClipStitchr workspace for sending finished work to Instagram and TikTok. Connect an account once, then publish a saved Stitch or Swipe without downloading and re-uploading it yourself.",
        "You can publish right away, save a draft, or pick an exact date and time. Posts and the calendar show what is queued, what went live, and what needs another try.",
      ],
    },
    {
      title: "Connect an account",
      body: [
        "Open Publishing and go to Integrations to connect an Instagram or TikTok account. ClipStitchr sends you to the provider to approve the connection, then brings you back when it is ready.",
        "You can disconnect an account from the same place when you no longer want to publish to it.",
      ],
      bullets: [
        "Open Publishing, then Integrations.",
        "Choose Instagram or TikTok and approve the connection.",
        "Return to Integrations anytime to reconnect or disconnect.",
      ],
    },
    {
      title: "Publish finished work",
      body: [
        "Start from a saved Stitch or Swipe with the Publish action, or open the composer from the Publishing workspace. The composer keeps the caption and media with the draft so you can review everything before it goes out.",
        "Choose Publish now to post immediately, save the composer as a draft, or pick an exact date and time to schedule the post.",
      ],
      bullets: [
        "Use Publish on a saved Stitch or Swipe to open the composer with that media.",
        "Publish now when the post is ready to go live.",
        "Save a draft when the post still needs work.",
        "Pick an exact date and time when the post should go out later.",
      ],
    },
    {
      title: "Track queued, published, and failed posts",
      body: [
        "Posts lists everything you have queued, published, or tried, and Calendar shows the same work on the days it is planned. If a post fails, you can review it and try again instead of starting over.",
      ],
      bullets: [
        "Open Posts to check queued, published, and failed states.",
        "Open Calendar to see what is planned for each day.",
        "Retry a failed post after you have fixed the problem.",
      ],
    },
    {
      title: "Check results",
      body: [
        "Analytics shows the results available for your connected accounts and published posts. Use it to see what landed before you decide what to make next.",
      ],
    },
  ],
} satisfies CustomerDocPage;
