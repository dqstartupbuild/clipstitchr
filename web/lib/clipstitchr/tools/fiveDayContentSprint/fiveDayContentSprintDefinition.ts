import type { GuidedResourceDefinition } from "@/lib/clipstitchr/tools/resources/GuidedResourceDefinition";

export const fiveDayContentSprintDefinition: GuidedResourceDefinition = {
  completionLabel: "Five-Day App Content Sprint",
  estimatedMinutes: 150,
  faqs: [
    {
      question: "Will the five days be emailed to me?",
      answer:
        "Yes. After you confirm your email, Day 1 opens right away and each next day opens 24 hours later. Your work is saved so you can continue on another device.",
    },
    {
      question: "Will I finish with five edited ads?",
      answer:
        "You will finish with five concrete concepts and a production handoff. Recording, editing, stitching, scheduling, and publishing remain separate work.",
    },
  ],
  guideParagraphs: [
    "Block about thirty focused minutes per day. The work builds in order, so resist writing concepts before you know which footage and proof are actually available.",
    "Use the note fields as your working document. Your confirmed course access keeps progress across devices, and the download gives you a portable copy whenever you want one.",
    "A complete sprint ends with five source-aware concepts and a learning board. It does not hide missing footage behind polished copy.",
  ],
  guideTitle: "Move from scattered clips to a shoot-ready week.",
  resourceKey: "five-day-app-content-sprint",
  sections: [
    {
      description:
        "Find the raw material you can use before inventing new production work.",
      id: "day-one",
      items: [
        {
          body: "List every usable UGC opening, reaction, lifestyle clip, and spoken CTA.",
          id: "ugc-inventory",
          noteLabel: "UGC inventory",
          title: "Inventory UGC",
        },
        {
          body: "List product demos by the exact action and visible payoff each one shows.",
          id: "demo-inventory",
          noteLabel: "Demo inventory",
          title: "Inventory demos",
        },
        {
          body: "List only proof you can support, including the source and any usage limit.",
          id: "proof-inventory",
          noteLabel: "Approved proof",
          title: "Inventory proof",
        },
        {
          body: "Mark each asset ready, needs work, rights unclear, or missing.",
          id: "asset-status",
          noteLabel: "Asset status",
          title: "Name the gaps",
        },
        {
          body: "Choose one product outcome this sprint will support.",
          id: "sprint-outcome",
          noteLabel: "One outcome",
          title: "Narrow the sprint",
        },
      ],
      title: "Day 1 · Know what you have",
    },
    {
      description:
        "Give every concept one audience, one frustrating moment, and one visible payoff.",
      id: "day-two",
      items: [
        {
          body: "Describe the audience in the words they would use for themselves.",
          id: "audience",
          noteLabel: "Audience",
          title: "Name the viewer",
        },
        {
          body: "Describe the specific moment that creates friction before the app helps.",
          id: "problem",
          noteLabel: "Frustrating moment",
          title: "Name the problem",
        },
        {
          body: "Describe the product action the viewer can actually watch.",
          id: "action",
          noteLabel: "Visible action",
          title: "Choose the action",
        },
        {
          body: "Describe the honest result visible at the end of the demo.",
          id: "payoff",
          noteLabel: "Visible payoff",
          title: "Choose the payoff",
        },
        {
          body: "Write claims and proof the sprint must not invent.",
          id: "claim-boundary",
          noteLabel: "Claim boundary",
          title: "Set the guardrail",
        },
      ],
      title: "Day 2 · Lock the audience and payoff",
    },
    {
      description:
        "Create five concepts that differ for a reason instead of five cosmetic rewrites.",
      id: "day-three",
      items: [
        {
          body: "Build one problem-first concept using a real audience frustration.",
          id: "concept-problem",
          noteLabel: "Concept card",
          title: "Problem-first concept",
        },
        {
          body: "Build one demo-first concept that starts on the product action.",
          id: "concept-demo",
          noteLabel: "Concept card",
          title: "Demo-first concept",
        },
        {
          body: "Build one objection concept that answers a real reason people hesitate.",
          id: "concept-objection",
          noteLabel: "Concept card",
          title: "Objection concept",
        },
        {
          body: "Build one outcome concept without promising a guaranteed result.",
          id: "concept-outcome",
          noteLabel: "Concept card",
          title: "Outcome concept",
        },
        {
          body: "Build one founder or user-identity concept grounded in a real point of view.",
          id: "concept-identity",
          noteLabel: "Concept card",
          title: "Identity concept",
        },
      ],
      title: "Day 3 · Build five concept cards",
    },
    {
      description:
        "Translate concepts into separate source files that are easy to reuse.",
      id: "day-four",
      items: [
        {
          body: "List every opening, reaction, b-roll, demo, proof, and CTA capture still needed.",
          id: "capture-list",
          noteLabel: "Capture list",
          title: "Create the shot list",
        },
        {
          body: "Request two clean takes per spoken beat with handles before and after the line.",
          id: "clean-takes",
          noteLabel: "Take directions",
          title: "Plan reusable takes",
        },
        {
          body: "Keep UGC and product demos as separate source files with no baked-in captions or music.",
          id: "separate-sources",
          noteLabel: "Handoff rule",
          title: "Protect clean sources",
        },
        {
          body: "Define a filename pattern that identifies concept, role, creator, and version.",
          id: "naming",
          noteLabel: "Filename pattern",
          title: "Name the files",
        },
        {
          body: "Assign an owner and deadline to every missing capture.",
          id: "owners",
          noteLabel: "Owners and deadlines",
          title: "Close the handoff",
        },
      ],
      title: "Day 4 · Prepare capture and handoff",
    },
    {
      description:
        "Choose what will be published and what evidence will guide the next week.",
      id: "day-five",
      items: [
        {
          body: "Place the five concepts into a realistic publishing order based on readiness.",
          id: "publish-order",
          noteLabel: "Publishing order",
          title: "Order the concepts",
        },
        {
          body: "Name the control and the one variable each challenger changes.",
          id: "test-order",
          noteLabel: "Control and changes",
          title: "Protect the learning",
        },
        {
          body: "Choose the evidence you will review and use the same window across comparable cells.",
          id: "evidence",
          noteLabel: "Evidence contract",
          title: "Define evidence",
        },
        {
          body: "Schedule one review moment and assign the person who will record the decision.",
          id: "review",
          noteLabel: "Review date and owner",
          title: "Book the review",
        },
        {
          body: "Write the first missing asset you will capture after the sprint.",
          id: "next-asset",
          noteLabel: "Next capture",
          title: "Keep the system moving",
        },
      ],
      title: "Day 5 · Build the publishing and learning board",
    },
  ],
};
