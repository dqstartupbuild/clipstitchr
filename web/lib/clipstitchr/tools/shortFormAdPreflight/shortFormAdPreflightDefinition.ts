import type { GuidedResourceDefinition } from "@/lib/clipstitchr/tools/resources/GuidedResourceDefinition";

export const shortFormAdPreflightDefinition = {
  completionLabel: "Short-form ad preflight",
  estimatedMinutes: 10,
  faqs: [
    {
      answer:
        "No. It is an honest self-review. The page does not open or inspect your video, listen to audio, check a destination, or verify a rights record.",
      question: "Does this checklist automatically inspect my ad?",
    },
    {
      answer:
        "No checklist can promise approval. Platform rules, account status, landing-page behavior, targeting, and the ad itself can all affect review.",
      question: "Will completing it guarantee platform approval?",
    },
    {
      answer:
        "Treat every unchecked item labeled Must check as a blocker, even if the percentage is high. The page reports completion only; it never declares an ad approved or safe.",
      question: "What if I have a high score but a blocker is unchecked?",
    },
    {
      answer:
        "No. You can copy or download the checklist immediately. The optional mailing-list form does not receive the video, answers, notes, or report.",
      question: "Is the result gated by email?",
    },
  ],
  guideParagraphs: [
    "Run preflight on the actual final file and the actual destination, not an earlier edit. Watch once with sound, once muted, and once on a small phone screen so captions, gestures, proof, and the CTA must stand on their own.",
    "A percentage is not permission. Any unchecked Must check item blocks a ready decision because unsupported claims, exposed private data, missing rights information, broken destinations, and unusable playback cannot be averaged away.",
    "This checklist prepares a human review. ClipStitchr remains the paid workspace for organizing approved source clips and producing finished app-ad variants; this resource does not inspect, edit, export, or publish media.",
  ],
  guideTitle: "Run one honest review before an ad leaves your team",
  resourceKey: "short-form-ad-preflight-checklist",
  sections: [
    {
      description:
        "The opening should make one understandable promise and move naturally into the app.",
      id: "preflight-story",
      items: [
        {
          body: "The first spoken or written line names a recognizable problem, desire, or situation without needing the caption below the post.",
          id: "preflight-hook",
          noteLabel: "Opening line",
          notePlaceholder: "The viewer hears or reads…",
          title: "Hook is clear on first contact",
        },
        {
          body: "The opening visual supports the same idea as the hook instead of showing unrelated lifestyle footage or a delayed product reveal.",
          id: "preflight-visual-bridge",
          title: "Opening visual matches the hook",
        },
        {
          body: "The app demo shows the action and visible result described by the ad. It does not skip the step that makes the payoff believable.",
          critical: true,
          id: "preflight-demo-proof",
          title: "Demo proves the product moment",
        },
        {
          body: "Every section earns its place. Repetition, long pauses, setup chatter, and a second competing promise have been removed or deliberately retained.",
          id: "preflight-pacing",
          title: "Story has one useful pace",
        },
      ],
      title: "1. Hook, visual, demo, and pace",
    },
    {
      description:
        "Check what the ad says, what evidence supports it, and what a reasonable viewer could misunderstand.",
      id: "preflight-proof",
      items: [
        {
          body: "Each factual statement has a named current source such as the product, an approved study, or documented customer evidence.",
          critical: true,
          id: "preflight-proof-source",
          noteLabel: "Claim and evidence source",
          notePlaceholder: "Claim… Source… Owner… Last checked…",
          title: "Proof source is documented",
        },
        {
          body: "Testimonials and creator experiences are presented as that person's experience, not converted into a result every user should expect.",
          critical: true,
          id: "preflight-testimonial-context",
          title: "Experience is not framed as a guarantee",
        },
        {
          body: "The ad avoids unsupported superlatives, guaranteed outcomes, fake urgency, hidden conditions, and comparisons the evidence does not support.",
          critical: true,
          id: "preflight-claim-language",
          title: "Claim wording stays inside the evidence",
        },
        {
          body: "Before-and-after, money, health, safety, privacy, or sensitive-category statements received the appropriate internal review for this campaign.",
          critical: true,
          id: "preflight-sensitive-review",
          noteLabel: "Review owner and record",
          notePlaceholder: "Reviewer… Decision… Record location…",
          title: "Sensitive claims received human review",
        },
      ],
      title: "2. Proof and claim safety",
    },
    {
      description:
        "The ad should still make sense when audio is unavailable and should tell the viewer what happens next.",
      id: "preflight-comprehension",
      items: [
        {
          body: "The CTA names one next action that matches the campaign objective, such as learn more, install, start a paid plan, or view pricing.",
          id: "preflight-cta",
          noteLabel: "Exact CTA",
          notePlaceholder: "The viewer is asked to…",
          title: "CTA asks for one action",
        },
        {
          body: "The destination continues the same offer, app, audience, and expectation. The ad does not promise a free account when the destination sells a paid product.",
          critical: true,
          id: "preflight-message-match",
          title: "CTA and destination match",
        },
        {
          body: "Captions accurately represent spoken words, use readable contrast, break at natural phrases, and do not cover the product action.",
          id: "preflight-captions",
          title: "Captions are accurate and readable",
        },
        {
          body: "Voice is understandable without sudden level changes. Music and effects do not mask speech, distort the app sound, or create a false product cue.",
          id: "preflight-audio",
          title: "Audio supports comprehension",
        },
      ],
      title: "3. CTA, captions, and audio",
    },
    {
      description:
        "Watch the final file on a small screen and confirm the key information survives the placement.",
      id: "preflight-frame",
      items: [
        {
          body: "The intended short-form placement uses a deliberate vertical frame without accidental stretching, sideways rotation, or important content outside the crop.",
          id: "preflight-framing",
          title: "Vertical framing is intentional",
        },
        {
          body: "Hook text, captions, product controls, proof, and CTA avoid conservative top, bottom, and side obstruction areas for the intended placement.",
          id: "preflight-safe-zones",
          title: "Key content avoids interface obstruction",
        },
        {
          body: "The actual delivered file plays from beginning to end with expected orientation, picture, audio, timing, and readable resolution on a second device or player.",
          critical: true,
          id: "preflight-playback",
          title: "Final-file playback succeeds",
        },
        {
          body: "The first frame is deliberate and the final frame holds long enough to understand the CTA without ending on a glitch, black frame, or accidental gesture.",
          id: "preflight-boundary-frames",
          title: "First and final frames are useful",
        },
      ],
      title: "4. Framing and playback",
    },
    {
      description:
        "These are blockers. Completion cannot verify permission or a live destination, so a responsible person must check each record directly.",
      id: "preflight-publish",
      items: [
        {
          body: "The team has a current approval record for every creator, person, voice, location, logo, artwork, and source clip used in the intended channels, regions, and period.",
          critical: true,
          id: "preflight-rights",
          noteLabel: "Approval record owner and location",
          notePlaceholder: "Owner… Secure record location… Scope checked…",
          title: "Usage information is confirmed",
        },
        {
          body: "Music, sound effects, fonts, stock assets, templates, and app-store or third-party marks are approved for this exact paid or organic use.",
          critical: true,
          id: "preflight-third-party-assets",
          title: "Third-party assets are cleared",
        },
        {
          body: "No personal notifications, account identifiers, payment details, private messages, access tokens, real customer data, or unapproved faces remain visible or audible.",
          critical: true,
          id: "preflight-privacy",
          title: "Private information is absent",
        },
        {
          body: "A person opens the final URL or store destination on mobile, confirms it loads, and verifies the app, offer, pricing expectation, and required disclosures match the ad.",
          critical: true,
          id: "preflight-destination",
          noteLabel: "Destination checked",
          notePlaceholder: "URL… Checked by… Date… Offer shown…",
          title: "Destination works and matches",
        },
      ],
      title: "5. Rights, privacy, and destination blockers",
    },
  ],
} satisfies GuidedResourceDefinition;
