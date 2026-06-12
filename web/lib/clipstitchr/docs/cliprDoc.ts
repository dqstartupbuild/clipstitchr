import type { CustomerDocPage } from "@/lib/clipstitchr/docs/CustomerDocPage";

export const cliprDoc = {
  slug: "clipr",
  title: "Clipr",
  description:
    "Create reusable engagement clips when your library needs more footage.",
  summary:
    "Make short avatar-led Clips, save them to the library, and reuse them in Stitchr.",
  category: "feature",
  order: 20,
  updated: "2026-06-12",
  sections: [
    {
      title: "What Clipr is for",
      body: [
        "Use Clipr when you need more material, but do not want to shoot another clip from scratch. It creates short avatar-led Clips for education, opinions, stories, tests, and problem-aware content.",
        "Clipr is not for direct product pitches. A Clip should feel useful, not like a sales script.",
      ],
    },
    {
      title: "How Clipr works",
      body: [
        "Clipr uses your saved product settings to understand the audience and topic. You choose the style of Clip, the avatar, and the extra options that fit that style.",
      ],
      bullets: [
        "Choose a saved product.",
        "Choose Any, Script, Reaction, or B-roll.",
        "Choose an avatar to appear in the clip.",
        "For Script clips, choose a voice.",
        "For Script clips, optionally paste an idea for Clipr to turn into a full script.",
        "For Script clips, optionally generate background music. This is off by default.",
        "Generate the avatar video.",
        "Save the result into the Content Library as a Clip.",
      ],
    },
    {
      title: "Clip styles",
      body: [
        "Script clips are talking-avatar videos. Reaction clips are quick silent facial reactions. B-roll clips are short silent everyday shots that fit the product context.",
        "Reaction and b-roll clips are single-shot videos, usually just a few seconds long.",
      ],
    },
    {
      title: "Music",
      body: [
        "Clipr music is saved separately from the video. You can remove it, generate a new track, or change the music volume later.",
        "When you download a Clip with music enabled, ClipStitchr renders a fresh export with the current music settings. The saved library video stays clean.",
      ],
    },
    {
      title: "Where Clips appear",
      body: [
        "Generated Clips appear in the Content Library under Clips. Use them like UGC: preview them, download them, or select them in Stitchr.",
      ],
    },
    {
      title: "Copy boundaries",
      body: [
        "Clipr keeps the writing system behind the scenes. You only see the generated Clip and the text that matters to your audience.",
      ],
      bullets: [
        "No direct product pitch inside Clipr clips.",
        "No calls to buy, sign up, follow, save, or comment.",
        "Generated text stays editable when you use it in other features.",
      ],
    },
  ],
} satisfies CustomerDocPage;
