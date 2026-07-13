import type { GuidedResourceDefinition } from "@/lib/clipstitchr/tools/resources/GuidedResourceDefinition";

export const appUgcAdBriefTemplateDefinition = {
  completionLabel: "App UGC ad brief",
  estimatedMinutes: 20,
  faqs: [
    {
      answer:
        "Yes. The first two sections are a blank brief you can fill in, copy, and download as Markdown. The final section is a complete fictional example you can use as a reference.",
      question: "Is the blank template included on this page?",
    },
    {
      answer:
        "No. Everything is available immediately. The optional mailing-list form sends only the name and email you enter; it does not email or store your brief.",
      question: "Do I need to enter my email to get the template?",
    },
    {
      answer:
        "No. The usage section helps you ask clear questions, but it does not create a contract, confirm ownership, or verify that you have permission to use footage.",
      question: "Does this template handle creator usage rights?",
    },
    {
      answer:
        "The template prepares a clean production request. A paid ClipStitchr workspace is where you organize source clips and turn approved UGC and app demos into finished variants.",
      question: "What remains inside paid ClipStitchr?",
    },
  ],
  guideParagraphs: [
    "A useful brief gives a creator enough direction to capture reusable material without scripting every breath. Start with the audience, real app payoff, and claims your team can support. Then ask for short individual takes instead of one long edited video.",
    "Keep proof and usage questions separate. A creator can record an honest experience, but your team still owns claim review and permission records. If a statement is not approved, place it in the do-not-say field before filming begins.",
    "Use the fictional example to judge the level of detail, not as copy for your app. Replace every product fact, filename, deadline, and usage question with information your team has actually confirmed.",
  ],
  guideTitle: "How to send a brief that produces reusable footage",
  resourceKey: "app-ugc-ad-brief-template",
  sections: [
    {
      description:
        "Fill these fields with confirmed product context. Each note is included when you copy or download the brief.",
      id: "brief-foundation",
      items: [
        {
          body: "Name the app, campaign, owner, creator, due date, and one person who can answer filming questions.",
          id: "brief-project-details",
          noteLabel: "Project details",
          notePlaceholder:
            "App: …\nCampaign: …\nCreator: …\nDue date: …\nContact: …",
          title: "Project and contact details",
        },
        {
          body: "Describe one specific person, the moment they feel the problem, and the plain-language outcome this ad should make clear.",
          id: "brief-audience-outcome",
          noteLabel: "Audience, problem, and outcome",
          notePlaceholder:
            "For [person] who struggles with [moment], show how the app helps them [supported outcome].",
          title: "Audience and honest payoff",
        },
        {
          body: "List only statements your product and marketing teams can support with current evidence.",
          critical: true,
          id: "brief-approved-claims",
          noteLabel: "Approved statements",
          notePlaceholder: "The creator may say…\nEvidence or product source…",
          title: "Approved claims and proof source",
        },
        {
          body: "Write down promises, comparisons, health or money outcomes, and superlatives the creator must avoid.",
          critical: true,
          id: "brief-forbidden-claims",
          noteLabel: "Do-not-say list",
          notePlaceholder:
            "Do not say guaranteed, fastest, saves everyone…, or any claim not listed above.",
          title: "Claim guardrails",
        },
        {
          body: "Choose the desired tone and give two natural opening directions. Ask for separate takes so each opening can be tested.",
          id: "brief-hook-directions",
          noteLabel: "Tone and opening directions",
          notePlaceholder:
            "Tone: …\nOpening direction 1: …\nOpening direction 2: …",
          title: "Tone and opening options",
        },
      ],
      title: "1. Blank brief — strategy and guardrails",
    },
    {
      description:
        "Define the source files and handoff before recording. This keeps clean clips available for more than one edit.",
      id: "brief-delivery",
      items: [
        {
          body: "Request the exact number of opening takes, talking sections, reactions, b-roll clips, demo recordings, and CTA takes as separate files.",
          id: "brief-deliverables",
          noteLabel: "Deliverable list",
          notePlaceholder:
            "3 openings, 2 problem takes, 2 reactions, 5 b-roll clips, 1 clean demo, 2 CTAs…",
          title: "Individual deliverables",
        },
        {
          body: "Ask for clean starts and endings, a quiet beat around each line, no baked-in captions or music, and the original files.",
          id: "brief-reusable-takes",
          noteLabel: "Reusable-take directions",
          notePlaceholder:
            "Leave 1–2 seconds before and after each take. Deliver clean originals without text or music…",
          title: "Reusable capture rules",
        },
        {
          body: "Describe the exact app screen, action, and payoff the demo must show. Name any private information that must be replaced with safe sample data.",
          critical: true,
          id: "brief-demo-handoff",
          noteLabel: "Demo handoff",
          notePlaceholder:
            "Start on… Tap… End when… Use this sample account/data… Never show…",
          title: "Product-demo handoff",
        },
        {
          body: "Give one filename pattern and folder layout so the creator can deliver openings, UGC, b-roll, demos, and CTAs without guesswork.",
          id: "brief-naming",
          noteLabel: "Naming and folders",
          notePlaceholder:
            "Folders: 01_openings, 02_ugc, 03_broll, 04_demo, 05_cta\nExample: app_creator_opening_01_v1.mov",
          title: "File naming and organization",
        },
        {
          body: "Ask who appears in the footage, what channels and regions are being discussed, the proposed usage period, whether raw footage and paid usage are included, and where approval is documented.",
          critical: true,
          id: "brief-usage-questions",
          noteLabel: "Usage information to confirm separately",
          notePlaceholder:
            "People shown: …\nChannels/regions/term being discussed: …\nRaw footage included: …\nApproval record owner: …",
          title: "Usage-information questions",
        },
        {
          body: "Define what counts as a missed instruction, how quickly the team will review, who approves a reshoot, and the new delivery date if one is needed.",
          id: "brief-reshoot-process",
          noteLabel: "Review and reshoot process",
          notePlaceholder:
            "Review within… A reshoot is requested when… Approval contact… Revised due date…",
          title: "Review and reshoot expectations",
        },
      ],
      title: "2. Blank brief — capture and delivery",
    },
    {
      description:
        "This fictional example shows the intended detail. Its product facts are illustrative and must not be reused as claims for a real app.",
      id: "brief-example",
      items: [
        {
          body: "Fictional app: TempoList. Campaign: voice-note planning launch. Audience: busy freelance designers who remember tasks between meetings. Goal: show one voice note becoming a reviewable task list.",
          id: "example-context",
          title: "Example project context",
        },
        {
          body: "Approved: “TempoList turns this recorded voice note into a draft task list I can review.” Product source: current voice-note import and review flow. Avoid: “perfect,” “instant every time,” “never miss a deadline,” or time-saved claims.",
          critical: true,
          id: "example-claims",
          title: "Example claims and guardrails",
        },
        {
          body: "Warm, lightly frustrated, then relieved. Opening A: show sticky notes and say, “This is where my between-meeting tasks used to disappear.” Opening B: hold the phone and say, “I needed somewhere to put a task before I forgot it.”",
          id: "example-openings",
          title: "Example opening directions",
        },
        {
          body: "Deliver three opening takes, two desk reactions, five silent vertical b-roll clips, one clean 12–18 second product demo, and two separate CTA takes. Record each as its own file with clean handles.",
          id: "example-deliverables",
          title: "Example deliverables",
        },
        {
          body: "Demo: open the safe sample project, record “Send the invoice and book Tuesday review,” stop recording, wait for the draft, tap Review, then show the two draft tasks. Do not show notifications, client names, or a personal account.",
          critical: true,
          id: "example-demo",
          title: "Example demo handoff",
        },
        {
          body: "Folders: 01_openings, 02_reactions, 03_broll, 04_demo, 05_cta. Filename example: tempolist_maya_opening_01_v1.mov. Deliver original portrait files without captions, filters, logos, or music.",
          id: "example-files",
          title: "Example files and naming",
        },
        {
          body: "Confirm in the separate agreement who appears, whether raw footage and paid social usage are included, proposed channels, regions and usage period, and who retains the approval record. This brief does not confirm those rights.",
          critical: true,
          id: "example-usage",
          title: "Example usage-information request",
        },
        {
          body: "Team reviews within two business days. A reshoot request names the missed instruction, affected filename, and replacement shot. Creator confirms feasibility and a revised date before recording again.",
          id: "example-reshoot",
          title: "Example review and reshoot process",
        },
      ],
      title: "3. Complete fictional example",
    },
  ],
} satisfies GuidedResourceDefinition;
