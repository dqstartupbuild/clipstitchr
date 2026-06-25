import type { CustomerDocPage } from "@/lib/clipstitchr/docs/CustomerDocPage";
import { isCliprScriptModeEnabled } from "@/lib/clipstitchr/constants/isCliprScriptModeEnabled";

const cliprModeBullets = [
  "Choose Reaction or B-roll.",
  ...(isCliprScriptModeEnabled
    ? [
        "Choose Script when you want a quick talking-avatar clip.",
        "For Script clips, choose a voice.",
        "For Script clips, optionally paste an idea for Clipr to turn into a full script.",
        "For Script clips, optionally choose a shared music track. This is off by default.",
      ]
    : []),
];

const cliprStyleDescription = isCliprScriptModeEnabled
  ? "Reaction clips are quick silent facial reactions. B-roll clips are short silent everyday shots that fit the product context. Script clips are talking-avatar videos."
  : "Reaction clips are quick silent facial reactions. B-roll clips are short silent everyday shots that fit the product context.";

export const cliprDoc = {
  slug: "clipr",
  title: "Clipr",
  description:
    "Create reusable reaction and b-roll clips when your library is too thin and you do not want to film more footage from scratch.",
  summary:
    "Make short reaction and b-roll clips, save them as UGC, and reuse them when Stitchr needs more openers.",
  category: "feature",
  order: 20,
  updated: "2026-06-16",
  sections: [
    {
      title: "What Clipr is for",
      body: [
        "Use Clipr when you need more material, but the idea of shooting another clip from scratch makes you avoid the whole task. It creates short reaction and b-roll clips you can use before a demo.",
        "Clipr is not for direct product pitches. The clip should feel useful, not like a sales script.",
      ],
    },
    {
      title: "How Clipr works",
      body: [
        "Clipr uses your saved product settings to understand the audience and topic. You choose the style, the avatar, and the simple scene details.",
      ],
      bullets: [
        "Choose a saved product.",
        ...cliprModeBullets,
        "Choose an avatar to appear in the clip.",
        "Generate the avatar video.",
        "Save the result into UGC.",
      ],
    },
    {
      title: "Clip styles",
      body: [
        cliprStyleDescription,
        "Reaction and b-roll clips are single-shot videos, usually just a few seconds long.",
      ],
    },
    {
      title: "Music",
      body: [
        "Clipr music is saved separately from the video. You can remove it, choose another shared track, or change the music volume later.",
        "Music uploads are added to the shared music pool, so only upload tracks you have the rights to share and use.",
        "When you download a Clip with music enabled, ClipStitchr renders a fresh export with the current music settings. The saved library video stays clean.",
      ],
    },
    {
      title: "Where Clipr videos appear",
      body: [
        "Generated reaction and b-roll clips appear in the Library under UGC. Preview them, download them, or select them in Stitchr.",
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
