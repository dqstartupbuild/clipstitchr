import type { CustomerDocPage } from "@/lib/clipstitchr/docs/CustomerDocPage";

export const clipScoreDoc = {
  slug: "clip-scores",
  title: "Clip Scores",
  description:
    "See which clips are worth using before you spend time turning them into posts.",
  summary:
    "Upload a UGC clip or demo, then use the score and quick notes to decide what to use next.",
  category: "feature",
  order: 15,
  updated: "2026-06-14",
  sections: [
    {
      title: "What clip scores do",
      body: [
        "Clip scores help you decide what to use before you build another ad. A score is a quick read on whether a clip has a strong opener, clear camera presence, good pacing, and a useful fit for short-form posts.",
        "The score is a guide, not a rule. Use it to find the clips that deserve your attention first.",
      ],
    },
    {
      title: "Where scores appear",
      body: [
        "When a clip has been analyzed, its score can appear on the clip card and inside the clip details view. You can use it while organizing uploads or while choosing clips for Stitchr. Finished Stitches have their own Stitch Score after you score them from the Stitch menu.",
      ],
      bullets: [
        "Open the Library.",
        "Upload UGC or product demo clips.",
        "Wait for ClipStitchr to finish describing the clip.",
        "Look for the simple score badge on the clip card.",
        "Open the clip details to see the reason, best use, strengths, and quick fixes.",
        "Use Score clip or Rescore clip from the clip menu when you want a fresh read.",
      ],
    },
    {
      title: "What the score looks at",
      body: [
        "The score focuses on the things that usually decide whether a clip is easy to use in a short video.",
      ],
      bullets: [
        "Hook: does the clip give someone a reason to keep watching?",
        "On camera: does the person, product, or action feel easy to watch?",
        "Pace: does the clip move quickly enough?",
        "Clarity: is it obvious what is happening?",
        "Platform fit: does it feel right for short-form feeds?",
        "Stitch fit: will it pair cleanly with another UGC or demo clip?",
      ],
    },
    {
      title: "How to use the notes",
      body: [
        "Start with clips marked Worth using or Good with a trim. If a clip says Needs a quick fix, open the details and fix the simplest issue first, like trimming a pause or picking a clearer start.",
        "Skip for now does not mean the clip is useless. It means it probably needs more work before it is the fastest choice for the next ad.",
      ],
    },
  ],
} satisfies CustomerDocPage;
