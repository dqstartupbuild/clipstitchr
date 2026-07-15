import type { GuidedResourceDefinition } from "@/lib/clipstitchr/tools/resources/GuidedResourceDefinition";

export const ugcMiniCourseDefinition: GuidedResourceDefinition = {
  completionLabel: "UGC-to-App-Ad Mini-Course Workbook",
  estimatedMinutes: 75,
  faqs: [
    {
      question: "Is this course sent by email?",
      answer:
        "Yes. After you confirm your email, Lesson 1 opens right away and each next lesson opens 24 hours later. Your progress stays with you across devices.",
    },
    {
      question: "Does the course create the finished ad?",
      answer:
        "No. It teaches the source, message, demo, testing, and learning decisions that make production clearer. ClipStitchr's paid workspace handles production work.",
    },
  ],
  guideParagraphs: [
    "Complete the lessons in order because each exercise becomes part of the final campaign worksheet.",
    "Examples demonstrate the reasoning, not a promise that the same words or structure will perform for your app.",
    "Use the answer rationale to check your work, then rewrite your own answer in language that is true for your product and audience.",
  ],
  guideTitle: "Learn the handoff from raw UGC to a testable app ad.",
  resourceKey: "ugc-to-app-ad-mini-course",
  sections: [
    {
      description:
        "Usable UGC is one clean, reusable beat—not a fully edited ad trapped in one take.",
      id: "lesson-one",
      items: [
        {
          body: "Example: a creator records one direct-to-camera frustration, one silent reaction, and one CTA as separate files with clean handles.",
          id: "l1-example",
          title: "Study the source pattern",
        },
        {
          body: "List three independent creator beats your campaign needs and what each beat must communicate.",
          id: "l1-exercise",
          noteLabel: "My three UGC beats",
          title: "Exercise",
        },
        {
          body: "Strong answers name one job per clip, keep the product UI out of the creator footage, and preserve edit room before and after the beat.",
          id: "l1-rationale",
          title: "Answer rationale",
        },
        {
          body: "Confirm your plan requests clean source clips without baked-in captions, music, transitions, or watermarks.",
          id: "l1-check",
          critical: true,
          title: "Lesson check",
        },
      ],
      title: "Lesson 1 · Build reusable UGC source clips",
    },
    {
      description:
        "A hook should connect a real viewer situation to proof the ad can honestly support.",
      id: "lesson-two",
      items: [
        {
          body: "Example: “Still rebuilding your task list every Monday?” names a situation; the next beat must show the relevant workflow rather than an unrelated feature montage.",
          id: "l2-example",
          title: "Study hook-to-proof alignment",
        },
        {
          body: "Write one audience situation, one safe hook, and the proof or demo beat that earns the claim.",
          id: "l2-exercise",
          noteLabel: "Situation, hook, and proof",
          title: "Exercise",
        },
        {
          body: "Strong answers avoid rankings, guaranteed outcomes, invented numbers, and proof the founder cannot document.",
          id: "l2-rationale",
          title: "Answer rationale",
        },
        {
          body: "Confirm the first visual can begin supporting the hook within the opening seconds.",
          id: "l2-check",
          critical: true,
          title: "Lesson check",
        },
      ],
      title: "Lesson 2 · Align hooks with honest proof",
    },
    {
      description:
        "The product demo should show one complete action and a visible payoff without forcing the viewer to decode the interface.",
      id: "lesson-three",
      items: [
        {
          body: "Example: begin from the messy before-state, complete one action, and hold the changed result long enough to read it.",
          id: "l3-example",
          title: "Study the demo handoff",
        },
        {
          body: "Describe the starting state, user action, visible result, and handoff sentence for one product moment.",
          id: "l3-exercise",
          noteLabel: "My demo handoff",
          title: "Exercise",
        },
        {
          body: "Strong answers show the payoff rather than narrating an invisible benefit, and they hide private or customer data before recording.",
          id: "l3-rationale",
          title: "Answer rationale",
        },
        {
          body: "Confirm the UGC and demo are captured as separate source files.",
          id: "l3-check",
          critical: true,
          title: "Lesson check",
        },
      ],
      title: "Lesson 3 · Hand off to the product demo",
    },
    {
      description:
        "Variants teach you more when each challenger changes one important variable against a stable control.",
      id: "lesson-four",
      items: [
        {
          body: "Example: hold the same visual, proof, demo, and CTA while comparing three meaningfully different hooks before testing a new visual.",
          id: "l4-example",
          title: "Study the control pattern",
        },
        {
          body: "Name your control, two hook challengers, the controlled elements, and the evidence you will compare.",
          id: "l4-exercise",
          noteLabel: "My controlled test",
          title: "Exercise",
        },
        {
          body: "Strong answers do not change hook, creator, demo, CTA, audience, and offer at the same time and then credit one variable.",
          id: "l4-rationale",
          title: "Answer rationale",
        },
        {
          body: "Confirm every test cell names exactly what changed.",
          id: "l4-check",
          critical: true,
          title: "Lesson check",
        },
      ],
      title: "Lesson 4 · Build controlled variants",
    },
    {
      description:
        "A campaign becomes a system when evidence changes the next production decision.",
      id: "lesson-five",
      items: [
        {
          body: "Example: after a hook test, keep the control footage, archive unsafe claims, reuse the strongest demo, and capture the one missing reaction needed for the next question.",
          id: "l5-example",
          title: "Study the learning loop",
        },
        {
          body: "Write your evidence window, keep/stop/start rules, reusable asset decision, and one next hypothesis.",
          id: "l5-exercise",
          noteLabel: "My learning loop",
          title: "Exercise",
        },
        {
          body: "Strong answers acknowledge inconclusive evidence and make the next question smaller instead of declaring a universal winner.",
          id: "l5-rationale",
          title: "Answer rationale",
        },
        {
          body: "Confirm your campaign worksheet now contains source clips, hook/proof, demo handoff, controlled variants, and a review rule.",
          id: "l5-check",
          critical: true,
          title: "Course check",
        },
      ],
      title: "Lesson 5 · Turn results into the next cycle",
    },
  ],
};
