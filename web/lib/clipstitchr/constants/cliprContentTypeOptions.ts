import type { CliprContentTypeOption } from "@/lib/clipstitchr/types/CliprContentTypeOption";

export const cliprContentTypeOptions: CliprContentTypeOption[] = [
  {
    id: "avatar-talking-head",
    label: "Avatar Talking Head",
    description: "A full-script avatar clip with the selected avatar voice.",
  },
  {
    id: "b-roll-reel",
    label: "B-roll Reel",
    description: "Avatar or niche-relevant action shots without speech.",
  },
  {
    id: "text-shot",
    label: "Text Shot",
    description: "One visual with editable text timed over the hook.",
  },
  {
    id: "voiceover-reel",
    label: "Voiceover Reel",
    description: "Avatar-voice narration over generated niche footage.",
  },
  {
    id: "product-video",
    label: "Product Video",
    description: "Product-specific visuals drawn from saved product details.",
  },
  {
    id: "value-video",
    label: "Value Video",
    description: "Audience-building education with a soft close.",
  },
  {
    id: "problem-solution",
    label: "Problem/Solution",
    description: "Shows the audience problem, reframe, and better path.",
  },
  {
    id: "objection-handler",
    label: "Objection Handler",
    description: "Addresses one common hesitation or misconception.",
  },
  {
    id: "how-to",
    label: "How-To",
    description: "A concise tutorial-style clip with generated scenes.",
  },
  {
    id: "soft-cta",
    label: "Soft CTA",
    description: "A useful clip with a gentle final prompt.",
  },
];
