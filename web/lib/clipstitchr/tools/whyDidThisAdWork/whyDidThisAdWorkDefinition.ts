import type { GuidedResourceDefinition } from "@/lib/clipstitchr/tools/resources/GuidedResourceDefinition";

export const whyDidThisAdWorkDefinition: GuidedResourceDefinition = {
  completionLabel: "Why Did This Ad Work? Breakdown",
  estimatedMinutes: 18,
  faqs: [
    {
      question: "Does this template prove why an ad performed well?",
      answer:
        "No. It helps you separate what you observed from what you infer. Performance data can support a conclusion, but one ad rarely proves a single cause.",
    },
    {
      question: "Can I analyze an ad without performance data?",
      answer:
        "Yes. Record the creative facts you can see, label every explanation as an inference, and use the final hypothesis as something to test rather than a fact.",
    },
  ],
  guideParagraphs: [
    "Watch the ad more than once. Use the first pass to record only timing, words, visuals, proof, product moments, and the call to action.",
    "Use the second pass to explain what each beat may be doing. Keep those explanations in the inference fields so a confident story does not turn into invented evidence.",
    "Finish with one transferable principle and one controlled follow-up. Changing one meaningful variable gives the next result a chance to teach you something.",
  ],
  guideTitle: "Turn one ad into a careful next test.",
  resourceKey: "why-did-this-ad-work-template",
  sections: [
    {
      description:
        "Record the source and the evidence you actually have before explaining anything.",
      id: "source",
      items: [
        {
          body: "Save the public URL, platform, date observed, advertiser, and ad length.",
          id: "source-context",
          noteLabel: "Source context",
          notePlaceholder: "URL, platform, advertiser, date, and length",
          title: "Identify the source",
        },
        {
          body: "Write down any real spend, impression, view, click, install, or conversion evidence you are allowed to use. Leave this blank when it is unknown.",
          id: "performance-evidence",
          noteLabel: "Observed performance evidence",
          notePlaceholder: "Facts only—no guessed performance",
          title: "Name the available evidence",
        },
      ],
      title: "1. Source and evidence",
    },
    {
      description:
        "Describe the ad beat by beat. Timestamps keep the analysis concrete.",
      id: "beats",
      items: [
        {
          body: "Write the exact opening words and what appears in the first visible moment.",
          id: "hook-beat",
          noteLabel: "Timestamp, hook, and opening visual",
          title: "Hook and opening visual",
        },
        {
          body: "Record the problem, tension, or audience situation the ad makes visible.",
          id: "problem-beat",
          noteLabel: "Timestamp and observed problem",
          title: "Problem beat",
        },
        {
          body: "Record the proof shown or stated, including what is not substantiated on screen.",
          id: "proof-beat",
          noteLabel: "Timestamp and proof",
          title: "Proof beat",
        },
        {
          body: "Describe the product action and visible payoff without adding benefits the ad does not show.",
          id: "demo-beat",
          noteLabel: "Timestamp, action, and payoff",
          title: "Demo and payoff",
        },
        {
          body: "Record the exact requested next step and the destination it appears to promise.",
          id: "cta-beat",
          noteLabel: "Timestamp and call to action",
          title: "Call to action",
        },
        {
          body: "Note cuts, holds, captions, sound changes, and deliberate pauses that shape the pace.",
          id: "pacing-beat",
          noteLabel: "Pacing map",
          title: "Pacing",
        },
      ],
      title: "2. Creative beats",
    },
    {
      description: "Keep facts and explanations in different boxes.",
      id: "interpretation",
      items: [
        {
          body: "List three creative facts another reviewer could verify from the ad itself.",
          id: "observations",
          noteLabel: "Three observations",
          title: "Observable facts",
        },
        {
          body: "List your explanations for those facts and label how confident you are in each one.",
          id: "inferences",
          noteLabel: "Inferences and confidence",
          title: "Possible explanations",
        },
      ],
      title: "3. Observation versus inference",
    },
    {
      description: "Extract an idea without copying the original execution.",
      id: "transfer",
      items: [
        {
          body: "Write one abstract pattern you can reuse, such as revealing the product immediately after naming a familiar frustration.",
          id: "principle",
          noteLabel: "Transferable principle",
          title: "Name the reusable pattern",
        },
        {
          body: "Write what should not be copied: exact wording, creator identity, brand assets, footage, or unsupported proof.",
          id: "copy-boundary",
          noteLabel: "Do-not-copy boundary",
          title: "Protect originality",
        },
      ],
      title: "4. Transfer the principle",
    },
    {
      description: "Turn the analysis into one falsifiable next step.",
      id: "next-test",
      items: [
        {
          body: "State what you expect to learn, the one variable you will change, what stays controlled, and the evidence you will review.",
          id: "hypothesis",
          noteLabel: "Controlled follow-up hypothesis",
          title: "Write one next test",
        },
      ],
      title: "5. Next hypothesis",
    },
  ],
};
