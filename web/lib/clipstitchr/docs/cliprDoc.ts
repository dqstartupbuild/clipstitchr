import type { CustomerDocPage } from "@/lib/clipstitchr/docs/CustomerDocPage";
import { isCliprScriptModeEnabled } from "@/lib/clipstitchr/constants/isCliprScriptModeEnabled";

const cliprModeBullets = [
  "Choose Reaction, B-roll, or Demo.",
  "Choose Demo when you want to make a new demo from a saved demo video.",
  ...(isCliprScriptModeEnabled
    ? [
        "Choose Script when you want a quick talking-avatar clip.",
        "For Script clips, choose a voice.",
        "For Script clips, optionally paste an idea for Clipr to turn into a full script.",
        "For Script clips, optionally choose a sound. This is off by default.",
      ]
    : []),
];

const cliprStyleDescription = isCliprScriptModeEnabled
  ? "Reaction clips are quick silent facial reactions. B-roll clips are short silent everyday shots that fit the product context. Demo clips remix one saved demo video into a fresh product demo. Script clips are talking-avatar videos."
  : "Reaction clips are quick silent facial reactions. B-roll clips are short silent everyday shots that fit the product context. Demo clips remix one saved demo video into a fresh product demo.";

export const cliprDoc = {
  slug: "clipr",
  title: "Clipr",
  description:
    "Create reusable reaction, b-roll, and demo clips when your library is too thin and you do not want to film more footage from scratch.",
  summary:
    "Make short reaction and b-roll clips for Hook/UGC, or remix a saved demo into a new Product demo.",
  category: "feature",
  order: 20,
  updated: "2026-06-16",
  sections: [
    {
      title: "What Clipr is for",
      body: [
        "Use Clipr when you need more material, but the idea of shooting another clip from scratch makes you avoid the whole task. It creates short reaction and b-roll clips you can use before a demo, and it can turn one saved demo into a fresh demo.",
        "Clipr is not for direct product pitches. The clip should feel useful, not like a sales script.",
      ],
    },
    {
      title: "How Clipr works",
      body: [
        "Clipr uses your saved product settings to understand the audience and topic. For Reaction and B-roll, you choose the avatar and simple scene details. For Demo, you choose the saved demo video to remix.",
      ],
      bullets: [
        "Choose a saved product.",
        ...cliprModeBullets,
        "For Reaction or B-roll, choose an avatar to appear in the clip.",
        "For Demo, choose the saved demo video you want to remix.",
        "Generate the video.",
        "Save the result into Hook/UGC or Product demos.",
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
        "Clipr sounds are saved separately from the video. You can remove a sound, choose another one, or change the volume later.",
        "When you download a Clip with sound enabled, ClipStitchr renders a fresh export with the current sound settings. The saved library video stays clean.",
      ],
    },
    {
      title: "Where Clipr videos appear",
      body: [
        "Generated reaction and b-roll clips appear in the Library under Hook/UGC. Generated Demo clips appear under Product demos. Preview them, download them, or select them in Stitchr.",
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
