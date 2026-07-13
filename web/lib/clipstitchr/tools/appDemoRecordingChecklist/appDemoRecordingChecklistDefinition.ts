import type { GuidedResourceDefinition } from "@/lib/clipstitchr/tools/resources/GuidedResourceDefinition";

export const appDemoRecordingChecklistDefinition = {
  completionLabel: "Product demo recording preflight",
  estimatedMinutes: 12,
  faqs: [
    {
      answer:
        "Yes. Each setup check explains what to confirm for a phone, desktop capture, mirrored device, or emulator when the advice differs.",
      question: "Does this work for more than phone screen recordings?",
    },
    {
      answer:
        "No. It is a preparation checklist. It does not open, inspect, repair, record, normalize, or export a media file.",
      question: "Does this page check my finished recording?",
    },
    {
      answer:
        "No. The checklist is available immediately and can be copied or downloaded. The optional mailing-list form does not receive your checklist notes.",
      question: "Will the checklist be emailed to me?",
    },
    {
      answer:
        "Use the local Product Demo Readiness Checker after recording, then bring approved source footage into a paid ClipStitchr workspace for organization and production.",
      question: "What should I do after recording?",
    },
  ],
  guideParagraphs: [
    "A clean app demo is easier to understand and much easier to reuse. Decide the one action and payoff first, then prepare safe sample data and a stable recording environment before you press record.",
    "The checklist works across capture methods. Follow the phone guidance when recording directly on a device, and the desktop or emulator guidance when the pointer, browser chrome, scaling, or simulator frame could distract from the app.",
    "An unchecked Must check item is a blocker even when the progress percentage looks high. Fix privacy exposure, unreadable screens, unsupported claims, missing payoff, and broken files before handing footage to an editor.",
  ],
  guideTitle: "Record a demo that stays clear after the handoff",
  resourceKey: "app-demo-recording-checklist",
  sections: [
    {
      description:
        "Confirm the method, safe account, and exact action before recording. Unchecked Must check items block the handoff.",
      id: "demo-plan",
      items: [
        {
          body: "Name whether you will record on a phone, desktop, mirrored device, or emulator, plus the orientation and target placement.",
          id: "demo-capture-method",
          noteLabel: "My capture setup",
          notePlaceholder:
            "Method: …\nDevice/browser: …\nOrientation: …\nTarget placement: …",
          title: "Choose one capture method",
        },
        {
          body: "Write the single user action and visible payoff this clip must show. Remove extra screens that do not help that story.",
          critical: true,
          id: "demo-action-payoff",
          noteLabel: "Action and payoff",
          notePlaceholder: "Start on… Do… End when the viewer can see…",
          title: "Define the action and payoff",
        },
        {
          body: "Use a demo account with safe names, images, messages, balances, locations, and notifications. Never rely on cropping to hide private data later.",
          critical: true,
          id: "demo-safe-data",
          noteLabel: "Safe sample data prepared",
          notePlaceholder:
            "Account… Sample names/data… Private areas to avoid…",
          title: "Prepare privacy-safe data",
        },
        {
          body: "Confirm the flow works from the chosen starting screen without login prompts, permissions, empty states, expired links, or unfinished setup.",
          critical: true,
          id: "demo-rehearse-flow",
          title: "Rehearse the complete flow",
        },
        {
          body: "List the product statements this demo visually supports and remove any caption or narration that promises more than the recording proves.",
          critical: true,
          id: "demo-claim-match",
          noteLabel: "Supported statement",
          notePlaceholder: "The recording visibly supports… It does not prove…",
          title: "Match the demo to an honest claim",
        },
      ],
      title: "1. Plan the recording",
    },
    {
      description:
        "Make the screen readable and remove capture-method distractions before the first take.",
      id: "demo-setup",
      items: [
        {
          body: "Turn on Do Not Disturb. On a phone, hide notification previews; on desktop, close chat, email, calendars, and system pop-ups.",
          critical: true,
          id: "demo-notifications",
          title: "Block notifications and interruptions",
        },
        {
          body: "Use the app theme with the clearest contrast. Raise text size enough to read on a phone preview without breaking the layout.",
          critical: true,
          id: "demo-readability",
          title: "Check text size and contrast",
        },
        {
          body: "Phone: lock portrait and use native resolution. Desktop or emulator: set a stable portrait viewport and avoid stretched scaling or unnecessary device chrome.",
          id: "demo-orientation-resolution",
          title: "Lock orientation and clean scaling",
        },
        {
          body: "Phone: show deliberate taps and swipes. Desktop or emulator: use a visible, steady pointer and keep it away from the payoff after the action.",
          id: "demo-input-cues",
          title: "Make taps or pointer movement understandable",
        },
        {
          body: "Charge the device, free local storage, close heavy apps and background tabs, and disable battery-saving behavior that could lower frame rate.",
          id: "demo-device-stability",
          title: "Prepare a stable recording device",
        },
      ],
      title: "2. Clean the capture setup",
    },
    {
      description:
        "Capture one simple sequence with enough room for an editor to use it in several openings.",
      id: "demo-record",
      items: [
        {
          body: "Begin with one to two seconds of a still, useful starting screen before the first tap, swipe, or pointer move.",
          id: "demo-clean-start",
          title: "Hold a clean starting frame",
        },
        {
          body: "Move at a pace a first-time viewer can follow. Pause briefly after meaningful state changes instead of racing through taps.",
          id: "demo-gesture-pace",
          title: "Use a readable gesture pace",
        },
        {
          body: "Keep the main action visible. Avoid covering key controls with a finger, pointer, keyboard, tooltip, or recording control.",
          critical: true,
          id: "demo-unblocked-action",
          title: "Keep the action unobstructed",
        },
        {
          body: "Let the successful result stay on screen long enough to recognize it without narration or captions.",
          critical: true,
          id: "demo-payoff-hold",
          title: "Hold on the payoff",
        },
        {
          body: "Record a second clean take and one alternate pace or starting screen. Do not edit the takes together before delivery.",
          id: "demo-alternate-takes",
          title: "Capture clean alternate takes",
        },
      ],
      title: "3. Record the usable sequence",
    },
    {
      description:
        "Open the actual file and confirm the editor receives an original, clearly named source clip.",
      id: "demo-handoff",
      items: [
        {
          body: "Play every take from beginning to end. Confirm video motion, orientation, readable details, and any intended source audio survive outside the recording app.",
          critical: true,
          id: "demo-playback-check",
          title: "Watch the exported source file",
        },
        {
          body: "Deliver the original full-resolution recording without baked-in captions, music, borders, filters, watermarks, or a social-platform download.",
          critical: true,
          id: "demo-clean-original",
          title: "Keep one clean original",
        },
        {
          body: "Use a filename that identifies app, flow, take, orientation, and version. Add a note naming the start screen, action, payoff, and any known limitation.",
          id: "demo-handoff-note",
          noteLabel: "Filename and handoff note",
          notePlaceholder:
            "Filename: app_flow_take01_916_v1.mov\nStart… Action… Payoff… Known limitation…",
          title: "Label the demo for handoff",
        },
      ],
      title: "4. Verify the handoff",
    },
  ],
} satisfies GuidedResourceDefinition;
