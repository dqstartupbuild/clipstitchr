import type { GuidedResourceDefinition } from "@/lib/clipstitchr/tools/resources/GuidedResourceDefinition";

export const appRawFootageIntakeDefinition = {
  completionLabel: "App raw-footage intake request",
  estimatedMinutes: 15,
  faqs: [
    {
      answer:
        "Check the asset types you want, add quantities and directions in the note fields, then copy or download the complete request as Markdown.",
      question: "How do I turn this into my own intake request?",
    },
    {
      answer:
        "No. It creates a request and receipt checklist only. Media is not uploaded, stored, inspected, or shared through this page.",
      question: "Can a creator deliver footage here?",
    },
    {
      answer:
        "No. It prompts you to request consent evidence and proposed usage details, but it does not create a contract, confirm ownership, or verify permission.",
      question: "Does completing it confirm usage rights?",
    },
    {
      answer:
        "No. The generated request is available immediately. The optional mailing-list form is separate and does not receive your notes or selections.",
      question: "Will ClipStitchr email the intake request?",
    },
  ],
  guideParagraphs: [
    "Request source footage by role instead of asking for one finished video. Separate openings, talking takes, reactions, b-roll, demos, and CTAs give an editor clean choices and make reshoots easier to identify.",
    "Be specific about file delivery and clean handles. Original files, one take per file, a quiet beat before and after each take, and a predictable filename prevent avoidable cleanup and missing-file confusion.",
    "Usage information belongs in the request but still requires a proper approval process. Ask who appears, what material is included, the proposed channels, regions and term, and where consent evidence is held; do not treat a checked box here as permission.",
  ],
  guideTitle: "Request raw app-ad footage your team can actually use",
  resourceKey: "app-raw-footage-intake-checklist",
  sections: [
    {
      description:
        "Check every source role you want delivered and write the quantity or direction beside it. Unchecked roles remain visible in the copied request as not selected.",
      id: "intake-deliverables",
      items: [
        {
          body: "Request short, separate spoken or visual openings that can start an ad without a lead-in sentence.",
          id: "intake-openings",
          noteLabel: "Opening quantity and angles",
          notePlaceholder: "Quantity… Angles or prompt directions…",
          title: "Opening takes",
        },
        {
          body: "Request problem, experience, explanation, proof-context, and CTA lines as individual takes rather than one continuous monologue.",
          id: "intake-talking-takes",
          noteLabel: "Talking-take request",
          notePlaceholder: "Quantity… Required beats… Lines to avoid…",
          title: "UGC talking takes",
        },
        {
          body: "Request silent vertical reactions and lifestyle actions that can sit before, during, or after a product demo.",
          id: "intake-broll",
          noteLabel: "B-roll request",
          notePlaceholder: "Actions… Locations… Quantity…",
          title: "Reactions and b-roll",
        },
        {
          body: "Request a clean screen recording that starts before the action, shows the complete product moment, and holds on the payoff.",
          critical: true,
          id: "intake-demo",
          noteLabel: "Demo flow",
          notePlaceholder: "Start screen… Action… Payoff… Safe sample data…",
          title: "App demo recording",
        },
        {
          body: "Request separate CTA deliveries with the exact approved next action and enough clean space before and after each line.",
          id: "intake-cta",
          noteLabel: "CTA request",
          notePlaceholder: "Exact CTA… Alternate delivery… Quantity…",
          title: "CTA takes",
        },
      ],
      title: "1. Choose the footage roles",
    },
    {
      description:
        "Include these delivery rules in the request so originals arrive intact and easy to identify.",
      id: "intake-files",
      items: [
        {
          body: "Deliver the original camera or screen-recording files at full available resolution. Do not substitute social-platform downloads or compressed message attachments.",
          critical: true,
          id: "intake-originals",
          title: "Original full-resolution files",
        },
        {
          body: "Put each opening, line, reaction, action, demo take, and CTA in its own file. Do not preassemble the source material into one edit.",
          id: "intake-individual-files",
          title: "One usable take per file",
        },
        {
          body: "Keep originals free of baked-in captions, music, filters, transitions, logos, watermarks, beauty effects, and color treatments unless a separately labeled reference is requested.",
          critical: true,
          id: "intake-clean-files",
          title: "Clean source versions",
        },
        {
          body: "Use an approved folder layout and filename pattern that identifies app, creator, source role, concept, take, and version.",
          id: "intake-naming",
          noteLabel: "Folder and naming pattern",
          notePlaceholder:
            "Folders…\nPattern: app_creator_role_concept_take_version.ext\nExample…",
          title: "Predictable folders and filenames",
        },
        {
          body: "Share through the approved delivery service by a specific date and time. Name the person who should be contacted if an upload fails.",
          id: "intake-deadline",
          noteLabel: "Delivery details",
          notePlaceholder:
            "Service… Folder/link owner… Due date/time… Failure contact…",
          title: "Delivery service and deadline",
        },
      ],
      title: "2. File delivery requirements",
    },
    {
      description:
        "Ask for footage with room to trim and a demo that is safe to show.",
      id: "intake-capture",
      items: [
        {
          body: "Leave one to two quiet seconds before speaking or moving and after the take ends. Keep hands, face, phone, and important props in frame during those handles.",
          id: "intake-clean-handles",
          title: "Clean start and end handles",
        },
        {
          body: "Record several genuinely different opening deliveries while keeping the approved meaning and claim boundaries unchanged.",
          id: "intake-opening-variation",
          title: "Distinct opening options",
        },
        {
          body: "Use a privacy-safe sample account. Hide notifications and remove real names, customer data, payment details, messages, locations, and account identifiers.",
          critical: true,
          id: "intake-demo-privacy",
          title: "Privacy-safe demo data",
        },
        {
          body: "Move through the demo slowly enough to follow, pause after meaningful changes, and hold the successful result before stopping the recording.",
          id: "intake-demo-pace",
          title: "Readable demo movement",
        },
        {
          body: "If a reference edit is included, place it in a separate folder and keep every clean source clip used to make it.",
          id: "intake-reference-edit",
          title: "Reference edits stay separate",
        },
      ],
      title: "3. Clean handles and product demos",
    },
    {
      description:
        "Capture voice cleanly without locking the source footage to one soundtrack or edit.",
      id: "intake-audio",
      items: [
        {
          body: "Record spoken takes in a quiet space with the microphone position held consistent. Listen for room echo, fans, traffic, clothing noise, and automatic noise reduction artifacts.",
          id: "intake-voice-quality",
          title: "Clear spoken audio",
        },
        {
          body: "Deliver clean voice without baked-in music or sound effects. If natural app sound is important, label a separate take that contains it.",
          id: "intake-music-free",
          title: "Music-free source audio",
        },
        {
          body: "Provide the approved pronunciation for the app, feature, company, and any unfamiliar term before recording.",
          id: "intake-pronunciation",
          noteLabel: "Pronunciation notes",
          notePlaceholder: "Word… Spoken like… Example…",
          title: "Product pronunciation",
        },
        {
          body: "Label intentional silent b-roll as silent in the manifest so missing audio is not mistaken for a broken file.",
          id: "intake-silent-broll",
          title: "Intentional silence is labeled",
        },
      ],
      title: "4. Audio directions",
    },
    {
      description:
        "Request the information your team needs to review permission separately. These checks do not create or verify rights.",
      id: "intake-usage",
      items: [
        {
          body: "List every person, voice, recognizable private location, logo, artwork, product, and third-party screen expected in the footage.",
          critical: true,
          id: "intake-people-material",
          noteLabel: "People and material expected",
          notePlaceholder: "People… Voices… Locations… Logos/art/screens…",
          title: "People and third-party material",
        },
        {
          body: "State whether the proposed request includes raw footage, edited derivatives, still frames, organic use, paid media, or creator-handle advertising.",
          id: "intake-proposed-uses",
          noteLabel: "Proposed use to confirm",
          notePlaceholder:
            "Raw footage… Derivatives… Organic… Paid… Creator handle…",
          title: "Proposed usage types",
        },
        {
          body: "Record the proposed channels, regions, start date, and usage period for the appropriate reviewers to confirm.",
          id: "intake-proposed-term",
          noteLabel: "Placement details",
          notePlaceholder: "Channels… Regions… Start… Proposed period…",
          title: "Channels, regions, and term",
        },
        {
          body: "Ask where written consent or approval evidence is stored, who owns it, and what remains unconfirmed. Do not place private contracts in the public media folder.",
          critical: true,
          id: "intake-consent-evidence",
          noteLabel: "Consent evidence request",
          notePlaceholder:
            "Record owner… Secure location… Confirmed scope… Open questions…",
          title: "Consent evidence and owner",
        },
      ],
      title: "5. Usage-information questions",
    },
    {
      description:
        "Make the receipt and follow-up process clear before the folder arrives.",
      id: "intake-handoff",
      items: [
        {
          body: "Include one manifest row per file with filename, source role, take, action or spoken line, duration, original/reference status, and known issue.",
          id: "intake-manifest",
          noteLabel: "Manifest fields or example row",
          notePlaceholder:
            "Filename | Role | Take | Content | Duration | Original/reference | Known issue",
          title: "File manifest",
        },
        {
          body: "Ask the sender to list anything unavailable, changed from the brief, still uploading, or replaced by a different file.",
          id: "intake-unavailable",
          noteLabel: "Unavailable-item response",
          notePlaceholder: "Brief item… Status… Reason… Proposed replacement…",
          title: "Unavailable and changed items",
        },
        {
          body: "Name who will confirm receipt, the review window, the person who can approve a replacement request, and the expected response channel.",
          id: "intake-review-window",
          noteLabel: "Receipt and review process",
          notePlaceholder:
            "Receipt owner… Review within… Replacement approver… Reply channel…",
          title: "Receipt and review owners",
        },
        {
          body: "If a replacement is needed, identify the original filename, missed capture direction, observable issue, required correction, and revised delivery date.",
          id: "intake-reshoot-format",
          noteLabel: "Replacement request format",
          notePlaceholder:
            "Original… Direction… Issue… Correction… Feasibility… Revised delivery…",
          title: "Specific replacement request",
        },
      ],
      title: "6. Handoff and follow-up",
    },
  ],
} satisfies GuidedResourceDefinition;
