import type { GuidedResourceDefinition } from "@/lib/clipstitchr/tools/resources/GuidedResourceDefinition";

export const ugcCreatorHandoffKitDefinition = {
  completionLabel: "UGC creator handoff kit",
  estimatedMinutes: 18,
  faqs: [
    {
      answer:
        "It includes a delivery checklist, folder layout, upload manifest, filename example, usage-information request, missing-file note, and reshoot request. You can customize the note fields and copy the full kit.",
      question: "What is included in the kit?",
    },
    {
      answer:
        "No. This page does not receive, host, store, or transfer media. Use the instructions with the approved delivery service your team already uses.",
      question: "Can creators upload footage here?",
    },
    {
      answer:
        "No. The usage questions help both sides document what still needs confirmation, but the kit does not create a contract, grant permission, or verify ownership.",
      question: "Does the kit confirm footage usage rights?",
    },
    {
      answer:
        "The complete kit is available immediately. The optional mailing-list form sends only the contact information entered into that separate form.",
      question: "Do I need email delivery to use it?",
    },
  ],
  guideParagraphs: [
    "A handoff is successful when another person can find every promised file, understand what it contains, and see what still needs confirmation. Deliver clean originals as individual clips before sending previews or edited references.",
    "Use the manifest as the bridge between filenames and creative intent. It should identify the clip role, take, spoken line or action, known issue, and whether the file is an original or reference export.",
    "Keep usage information separate from creative approval. Ask for the channels, regions, proposed term, people shown, raw-footage inclusion, and approval-record owner, then have the appropriate people confirm those details outside this kit.",
  ],
  guideTitle: "Hand off creator footage without the follow-up scramble",
  resourceKey: "ugc-creator-handoff-kit",
  sections: [
    {
      description:
        "Complete these checks before sharing a folder or transfer link.",
      id: "handoff-delivery",
      items: [
        {
          body: "Compare the delivered files with the approved brief and count every opening, talking take, reaction, b-roll clip, demo, and CTA.",
          critical: true,
          id: "handoff-deliverable-count",
          noteLabel: "Expected and delivered counts",
          notePlaceholder: "Expected… Delivered… Missing…",
          title: "Match the deliverable count",
        },
        {
          body: "Include the original full-resolution files as separate takes. Put previews or creator-edited references in their own folder so they cannot replace the originals by accident.",
          critical: true,
          id: "handoff-original-files",
          title: "Keep originals separate from previews",
        },
        {
          body: "Play the first and last seconds of every file and spot-check audio. Confirm the transfer finished and filenames did not change or duplicate.",
          id: "handoff-file-spotcheck",
          title: "Spot-check the delivered files",
        },
        {
          body: "Remove unrelated personal files, screenshots, account exports, and hidden temporary files before sharing the folder.",
          critical: true,
          id: "handoff-remove-private-files",
          title: "Remove unrelated private material",
        },
      ],
      title: "1. Delivery checklist",
    },
    {
      description:
        "Use this small folder tree so source roles stay obvious after download.",
      id: "handoff-folders",
      items: [
        {
          body: "Place one spoken or visual opening in each file, including alternate deliveries.",
          id: "handoff-folder-openings",
          title: "01_openings",
        },
        {
          body: "Place problem, experience, reaction, proof, and CTA takes here. Keep clean versions beside any reference edit.",
          id: "handoff-folder-ugc",
          title: "02_ugc",
        },
        {
          body: "Place silent lifestyle or product b-roll in the first folder and clean screen recordings in the second.",
          id: "handoff-folder-visuals",
          title: "03_broll and 04_demo",
        },
        {
          body: "Place optional edited examples in reference; place the manifest, brief, and usage-information record in documents.",
          id: "handoff-folder-reference",
          title: "05_reference and 06_documents",
        },
      ],
      title: "2. Folder layout",
    },
    {
      description:
        "Create one row per media file. The copied kit preserves your manifest notes.",
      id: "handoff-manifest",
      items: [
        {
          body: "Record the exact filename, folder, file type, orientation, duration, and whether it is an original or reference.",
          id: "handoff-manifest-facts",
          noteLabel: "File facts",
          notePlaceholder:
            "Filename | Folder | Type | Orientation | Duration | Original/reference",
          title: "File identity",
        },
        {
          body: "Name the creative role and summarize the spoken line, movement, or app action so an editor can search without opening every clip.",
          id: "handoff-manifest-content",
          noteLabel: "Content summary",
          notePlaceholder: "Role | Spoken line/action | Intended use",
          title: "Creative content",
        },
        {
          body: "Call out background noise, a stumble, focus change, blocked screen, cut-off handle, or any other known limitation without hiding it.",
          id: "handoff-manifest-issues",
          noteLabel: "Known issues",
          notePlaceholder: "Filename… Issue… Still usable for…",
          title: "Known issues",
        },
        {
          body: "Mark the brief item or reshoot request the file satisfies. Do not label usage as approved unless the separate approval record confirms it.",
          critical: true,
          id: "handoff-manifest-status",
          noteLabel: "Brief match and approval record",
          notePlaceholder:
            "Brief item… Creative status… Usage record owner/location…",
          title: "Brief match and status",
        },
      ],
      title: "3. Upload manifest",
    },
    {
      description:
        "Use a filename that stays useful after files leave the delivery folder.",
      id: "handoff-naming",
      items: [
        {
          body: "Pattern: app_creator_role_concept_take_version.ext. Use short lowercase tokens and one separator consistently.",
          id: "handoff-name-pattern",
          noteLabel: "My approved pattern",
          notePlaceholder: "app_creator_role_concept_take_version.ext",
          title: "Filename pattern",
        },
        {
          body: "Example: tempolist_maya_opening_forgetful_take02_v1.mov. The name identifies the app, person, source role, concept, take, and version.",
          id: "handoff-name-example",
          title: "Complete filename example",
        },
        {
          body: "Never reuse a filename for a replacement. Increase the take or version and write the replaced filename in the manifest.",
          id: "handoff-name-replacement",
          title: "Replacement-file rule",
        },
      ],
      title: "4. Naming example",
    },
    {
      description:
        "Copy these questions into the handoff. They identify missing information; they do not grant or verify rights.",
      id: "handoff-usage",
      items: [
        {
          body: "List every person, recognizable private location, third-party logo, artwork, screen, or voice included in the files.",
          critical: true,
          id: "handoff-usage-people",
          noteLabel: "People and third-party material",
          notePlaceholder: "People shown… Locations… Logos/art/voices…",
          title: "Who and what appears",
        },
        {
          body: "State whether the proposed use includes organic posts, paid media, creator-handle ads, raw footage, edited derivatives, or still frames.",
          id: "handoff-usage-scope",
          noteLabel: "Proposed use to confirm",
          notePlaceholder:
            "Organic… Paid… Creator handle… Raw footage… Derivatives…",
          title: "Proposed usage types",
        },
        {
          body: "Write the channels, regions, proposed start date, and proposed usage period that the appropriate people still need to confirm.",
          id: "handoff-usage-term",
          noteLabel: "Channels, regions, and proposed term",
          notePlaceholder: "Channels… Regions… Start… Proposed term…",
          title: "Placement details",
        },
        {
          body: "Name where the signed or written approval record is stored and who owns the final review. Do not attach private contracts to a broadly shared media folder.",
          critical: true,
          id: "handoff-usage-record",
          noteLabel: "Approval record owner",
          notePlaceholder: "Owner… Secure location… Review status…",
          title: "Approval-record handoff",
        },
      ],
      title: "5. Usage-information request",
    },
    {
      description: "Use this neutral format when the folder is incomplete.",
      id: "handoff-missing-files",
      items: [
        {
          body: "Message opening: “Thanks for the handoff. We matched the folder against the approved brief and could not find the items below.”",
          id: "handoff-missing-opening",
          title: "Missing-file note opening",
        },
        {
          body: "List each brief item, expected count, folder checked, and closest filename found. Ask whether it is unavailable, renamed, or still uploading.",
          id: "handoff-missing-list",
          noteLabel: "Missing-file details",
          notePlaceholder:
            "Brief item | Expected | Folder checked | Closest file | Question",
          title: "Exact missing-file list",
        },
        {
          body: "Message close: “Please reply with the filename or confirm it is unavailable. We will not assume a different clip is an approved replacement.”",
          id: "handoff-missing-close",
          title: "Missing-file note close",
        },
      ],
      title: "6. Missing-file note",
    },
    {
      description:
        "Request a replacement by naming the instruction and observable issue, not by giving vague performance feedback.",
      id: "handoff-reshoot",
      items: [
        {
          body: "Message opening: “We need one replacement take for the item below. The request is based on the approved capture direction, not ad performance.”",
          id: "handoff-reshoot-opening",
          title: "Reshoot request opening",
        },
        {
          body: "Identify the original filename, brief instruction, observable issue, and what should remain unchanged in the replacement.",
          id: "handoff-reshoot-detail",
          noteLabel: "Replacement details",
          notePlaceholder:
            "Original file… Brief instruction… Observed issue… Keep unchanged… Replace with…",
          title: "Specific replacement direction",
        },
        {
          body: "Ask the creator to confirm feasibility and a revised delivery date before recording. Record any agreed scope or fee change in the appropriate agreement, not this kit.",
          id: "handoff-reshoot-confirmation",
          noteLabel: "Confirmation",
          notePlaceholder:
            "Feasible: …\nRevised delivery: …\nAgreement owner: …",
          title: "Feasibility and timing",
        },
      ],
      title: "7. Reshoot request template",
    },
  ],
} satisfies GuidedResourceDefinition;
