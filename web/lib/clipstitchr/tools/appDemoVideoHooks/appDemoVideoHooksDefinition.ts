import type { CollectionResourceDefinition } from "@/lib/clipstitchr/tools/resources/CollectionResourceDefinition";
import { appDemoVideoHooks } from "@/lib/clipstitchr/tools/appDemoVideoHooks/appDemoVideoHooks";
import { appDemoVideoHooksFaqs } from "@/lib/clipstitchr/tools/appDemoVideoHooks/appDemoVideoHooksFaqs";

export const appDemoVideoHooksDefinition: CollectionResourceDefinition = {
  emptyMessage:
    "No hooks match that search yet. Try a simpler phrase or a different angle.",
  faqs: appDemoVideoHooksFaqs,
  guideParagraphs: [
    "Pick a hook that matches what your demo can show in the first few seconds. The opening visual matters as much as the words, so each example includes a practical handoff into the app.",
    "Replace the bracketed details with plain language your customer would use. Keep the claim check beside the hook while you write so the opening stays honest and easy to support.",
    "Choose a small set of meaningfully different angles, then keep the rest of the ad steady while you test. ClipStitchr remains the paid step for organizing footage and producing finished variations.",
  ],
  guideTitle: "Choose a hook your demo can actually prove.",
  items: appDemoVideoHooks,
  resourceKey: "100-app-demo-video-hooks",
  searchPlaceholder: "Search pain, demo, objection, proof...",
};
