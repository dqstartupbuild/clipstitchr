import type { AppAdHookRewritePattern } from "@/lib/clipstitchr/tools/appAdHookRewriter/AppAdHookRewritePattern";

export const appAdHookRewritePatterns: AppAdHookRewritePattern[] = [
  {
    direction: "clearer",
    label: "Clearer",
    note: "Test when the current line needs a more obvious link to the product moment.",
    template: "{{source}}: watch how {{app}} handles {{problem}}",
  },
  {
    direction: "shorter",
    label: "Shorter",
    note: "Test when the first shot moves quickly and the overlay needs less reading time.",
    template: "{{source}} — {{app}} in action",
  },
  {
    direction: "audience-first",
    label: "Audience-first",
    note: "Test when recognition matters more than introducing the app immediately.",
    template: "{{audience}}: {{source}} with {{app}}",
  },
  {
    direction: "problem-first",
    label: "Problem-first",
    note: "Test when the footage opens on a frustration the viewer already knows.",
    template: "Still dealing with {{problem}}? Start with {{source}}",
  },
  {
    direction: "outcome-led",
    label: "Outcome-led",
    note: "Test when the demo visibly moves toward the result the viewer wants.",
    template: "{{source}} for {{outcome}}",
  },
  {
    direction: "pattern-break",
    label: "Pattern break",
    note: "Test when the opening visual can support a gentle change of perspective.",
    template: "You may know {{source}} — now watch the workflow",
  },
];
