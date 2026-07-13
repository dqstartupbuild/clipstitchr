import type { GuidedResourceDefinition } from "@/lib/clipstitchr/tools/resources/GuidedResourceDefinition";

export const campaignRetrospectiveDefinition: GuidedResourceDefinition = {
  completionLabel: "Short-Form Campaign Retrospective",
  estimatedMinutes: 25,
  faqs: [
    {
      question: "Does this connect to my ad accounts?",
      answer:
        "No. You enter the evidence you trust, and the worksheet stays in this browser session until you copy or download it.",
    },
    {
      question: "What if the campaign did not produce a clear winner?",
      answer:
        "Record that honestly. An inconclusive result can still reveal tracking gaps, weak controls, reusable footage, or a better next question.",
    },
  ],
  guideParagraphs: [
    "Start with the objective and tested changes so the review does not drift into every opinion the team has about the campaign.",
    "Treat metrics as evidence only when their definitions and windows match. Keep observations separate from explanations, especially when spend or event volume is limited.",
    "The most useful retrospective ends with asset decisions and a smaller next hypothesis—not a long list of vague lessons.",
  ],
  guideTitle: "Close the campaign without losing the learning.",
  resourceKey: "short-form-campaign-retrospective-template",
  sections: [
    {
      description:
        "Anchor the review in the decision the campaign was meant to support.",
      id: "scope",
      items: [
        {
          body: "Name the objective, date range, audience, channels, and product or offer.",
          id: "campaign-scope",
          noteLabel: "Campaign scope",
          title: "Define the campaign",
        },
        {
          body: "List the control and every tested change. Mark cells that changed more than one important variable.",
          id: "tested-changes",
          noteLabel: "Control and tested changes",
          title: "Record what changed",
        },
      ],
      title: "1. Scope",
    },
    {
      description: "Record comparable evidence and its limits.",
      id: "evidence",
      items: [
        {
          body: "Enter spend, impressions, clicks, installs, conversions, watch signals, and each metric window you relied on.",
          id: "metric-table",
          noteLabel: "Evidence table",
          title: "Campaign evidence",
        },
        {
          body: "Name missing events, unequal delivery, attribution differences, small samples, or campaign changes that weaken comparison.",
          id: "evidence-limits",
          noteLabel: "Evidence limits",
          title: "Limits and confounders",
        },
      ],
      title: "2. Evidence",
    },
    {
      description:
        "Separate creative facts from the story you tell about them.",
      id: "learning",
      items: [
        {
          body: "List what the data and creative review directly show.",
          id: "observations",
          noteLabel: "Observed facts",
          title: "Observations",
        },
        {
          body: "List plausible explanations and what additional evidence would raise confidence.",
          id: "interpretations",
          noteLabel: "Interpretations and needed evidence",
          title: "Interpretations",
        },
      ],
      title: "3. Learning",
    },
    {
      description:
        "Make an explicit decision for the campaign and its source material.",
      id: "decisions",
      items: [
        {
          body: "Name what should continue unchanged because it is useful or still needed as a control.",
          id: "keep",
          noteLabel: "Keep",
          title: "Keep",
        },
        {
          body: "Name what should stop because it is contradicted, unsafe, too costly, or no longer useful.",
          id: "stop",
          noteLabel: "Stop",
          title: "Stop",
        },
        {
          body: "Name the smallest new behavior, asset, or test the team should begin.",
          id: "start",
          noteLabel: "Start",
          title: "Start",
        },
        {
          body: "Sort hooks, UGC, demos, proof, and CTAs into reuse now, needs work, archive, and rights unclear.",
          id: "asset-disposition",
          noteLabel: "Asset disposition",
          title: "Reuse the right footage",
        },
      ],
      title: "4. Decisions",
    },
    {
      description: "Carry one clear question into the next cycle.",
      id: "next-cycle",
      items: [
        {
          body: "Write the next hypothesis, changed variable, control, evidence floor, owner, and review date.",
          id: "next-hypothesis",
          noteLabel: "Next-cycle hypothesis",
          title: "Define the next test",
        },
      ],
      title: "5. Next cycle",
    },
  ],
};
