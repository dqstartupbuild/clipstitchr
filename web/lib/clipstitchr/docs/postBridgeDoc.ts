import type { CustomerDocPage } from "@/lib/clipstitchr/docs/CustomerDocPage";

export const postBridgeDoc = {
  slug: "post-bridge",
  title: "Post Bridge",
  description:
    "Use Post Bridge after a draft is ready: schedule TikTok, Instagram, or YouTube posts from ClipStitchr and check simple post results later.",
  summary:
    "Schedule finished work through Post Bridge, then check how posted content is doing without making scheduling the whole point.",
  category: "feature",
  order: 80,
  updated: "2026-06-29",
  sections: [
    {
      title: "What Post Bridge adds",
      body: [
        "Post Bridge is for the handoff after a draft already feels ready. ClipStitchr is still about making better ads, clips, and carousels first. Post Bridge helps you send that finished work to the accounts where it needs to go.",
        "Use it when you want scheduling and basic post results in the same workflow instead of downloading everything, opening another calendar, and trying to remember what happened later.",
      ],
    },
    {
      title: "Before you use it",
      body: [
        "Connect your Post Bridge key in Account settings first. Then choose the TikTok, Instagram, or YouTube accounts you want each saved product to use by default.",
        "These defaults save time, but they do not lock you in. You can still review the post, change the account choices, and decide whether to post now or schedule it for later.",
      ],
      bullets: [
        "Add your Post Bridge key in Account settings.",
        "Connect social accounts inside Post Bridge.",
        "Pick default accounts for each saved product in product settings.",
        "Review the post before it leaves ClipStitchr.",
      ],
    },
    {
      title: "Schedule finished work",
      body: [
        "When a saved Stitch or Swipe is ready, open the post options and choose whether it should go out now or later. ClipStitchr sends the media, caption, and account choices to Post Bridge.",
        "This is meant to remove the last annoying step, not take away your judgment. Score the clip, edit the copy, and only schedule the version you would be okay seeing live.",
      ],
      bullets: [
        "Post a saved Stitch after you have reviewed the finished video.",
        "Post a saved Swipe when the carousel text and slides feel ready.",
        "Use scheduled posts when you want the content queue handled ahead of time.",
        "Use post-now when you are ready to publish immediately.",
      ],
    },
    {
      title: "Check what happened",
      body: [
        "After posts go live, the Analytics page can sync Post Bridge results so you can see simple performance numbers in ClipStitchr. Use that read to decide what to reuse, what to fix, and what should stay in the library but not get another slot.",
        "Analytics are there to help the next creative decision. They are not the main product promise, and they should not replace looking at the actual post and audience response.",
      ],
      bullets: [
        "Open Analytics to refresh Post Bridge results.",
        "Compare views and engagement across posted content.",
        "Use the results to choose better hooks, demos, captions, and formats next time.",
      ],
    },
  ],
} satisfies CustomerDocPage;
