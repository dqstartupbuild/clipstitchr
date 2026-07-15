import type { GuidedResourceDefinition } from "@/lib/clipstitchr/tools/resources/GuidedResourceDefinition";

export const testingSystemWorkshopDefinition: GuidedResourceDefinition = {
  completionLabel: "Creative Testing Operating Charter",
  estimatedMinutes: 45,
  faqs: [
    {
      question: "How is this different from the test plan and blueprint tools?",
      answer:
        "Those tools plan one campaign. This workshop defines the recurring rules, roles, names, evidence, reviews, and asset flow your team uses across campaigns.",
    },
    {
      question: "Does this connect to an ad platform or project manager?",
      answer:
        "No. It creates a portable operating charter. Test execution, performance ingestion, task management, and creative production stay outside this free workshop.",
    },
  ],
  guideParagraphs: [
    "Treat the workshop like a short working session, not an article. Write the rule your team can follow when the original decision-maker is not in the room.",
    "The charter should be specific enough to prevent accidental multi-variable tests and flexible enough to survive a new campaign objective.",
    "Review the downloaded charter with everyone who briefs, produces, launches, or evaluates creative before calling the system ready.",
  ],
  guideTitle: "Create the rules that make each campaign easier to learn from.",
  resourceKey: "app-creative-testing-system-workshop",
  sections: [
    {
      description:
        "State what creative testing is responsible for and what it is not.",
      id: "purpose",
      items: [
        {
          body: "Name the business or campaign decisions creative tests should inform.",
          id: "testing-purpose",
          noteLabel: "Testing purpose",
          title: "Define the purpose",
        },
        {
          body: "List decisions that require another owner, such as bidding, attribution policy, legal approval, or product positioning.",
          id: "out-of-scope",
          noteLabel: "Out of scope",
          title: "Set the boundary",
        },
      ],
      title: "1. Testing purpose",
    },
    {
      description:
        "Choose the order in which the system isolates meaningful variables.",
      id: "variables",
      items: [
        {
          body: "Rank concept, hook, opening visual, proof, demo, CTA, audience, and offer for your normal testing order.",
          id: "variable-order",
          noteLabel: "Variable hierarchy",
          title: "Build the hierarchy",
        },
        {
          body: "Write the rule that prevents more than one important variable changing in an isolation test.",
          id: "control-rule",
          noteLabel: "Control rule",
          title: "Protect the control",
        },
      ],
      title: "2. Variable hierarchy",
    },
    {
      description: "Give every decision a person rather than a vague team.",
      id: "roles",
      items: [
        {
          body: "Assign who owns the hypothesis, brief, source assets, production review, launch, evidence, and final decision.",
          id: "role-map",
          noteLabel: "Role map",
          title: "Assign owners",
        },
        {
          body: "Define who can stop unsafe claims, missing rights, broken tracking, or uncontrolled tests before launch.",
          id: "stop-authority",
          noteLabel: "Stop authority",
          title: "Name stop authority",
        },
      ],
      title: "3. Roles and handoffs",
    },
    {
      description:
        "Make every file and test cell understandable without opening a meeting note.",
      id: "naming",
      items: [
        {
          body: "Choose required filename tokens for product, campaign, concept, role, creator, market, date, and version.",
          id: "asset-naming",
          noteLabel: "Asset naming rule",
          title: "Name source assets",
        },
        {
          body: "Choose a test-cell label that states control/challenger and the changed variable.",
          id: "cell-naming",
          noteLabel: "Test-cell naming rule",
          title: "Name test cells",
        },
      ],
      title: "4. Naming rules",
    },
    {
      description:
        "Agree on what evidence is comparable before results arrive.",
      id: "evidence",
      items: [
        {
          body: "Name the primary decision metric, guardrails, evidence window, and visitor-defined minimum spend or event floor.",
          id: "evidence-contract",
          noteLabel: "Evidence contract",
          title: "Define comparable evidence",
        },
        {
          body: "Write how the team records inconclusive, contradictory, or tracking-limited results.",
          id: "uncertainty-rule",
          noteLabel: "Uncertainty rule",
          title: "Protect uncertainty",
        },
      ],
      title: "5. Evidence rules",
    },
    {
      description:
        "Make review and asset disposition part of the operating rhythm.",
      id: "cadence",
      items: [
        {
          body: "Choose the recurring review day, attendees, required evidence, and decision recorder.",
          id: "review-cadence",
          noteLabel: "Review cadence",
          title: "Schedule the review",
        },
        {
          body: "Define ready, needs-work, reuse, archive, and rights-unclear asset states and who updates them.",
          id: "asset-flow",
          noteLabel: "Asset flow",
          title: "Close the asset loop",
        },
      ],
      title: "6. Review cadence and asset flow",
    },
    {
      description:
        "Turn the decisions above into one charter the team can approve.",
      id: "charter",
      items: [
        {
          body: "Summarize purpose, variable hierarchy, owners, names, evidence, review cadence, and asset states in plain language.",
          id: "charter-draft",
          noteLabel: "Operating charter",
          title: "Draft the charter",
        },
        {
          body: "Name the charter owner, approval date, next review date, and condition that triggers an earlier revision.",
          id: "charter-owner",
          noteLabel: "Ownership and review",
          title: "Set ownership",
        },
      ],
      title: "7. Operating charter",
    },
  ],
};
