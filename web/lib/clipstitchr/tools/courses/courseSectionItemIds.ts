import type { CourseKey } from "./CourseKey";

export const courseSectionItemIds = {
  "five-day-app-content-sprint": [
    ["ugc-inventory", "demo-inventory", "proof-inventory", "asset-status", "sprint-outcome"],
    ["audience", "problem", "action", "payoff", "claim-boundary"],
    ["concept-problem", "concept-demo", "concept-objection", "concept-outcome", "concept-identity"],
    ["capture-list", "clean-takes", "separate-sources", "naming", "owners"],
    ["publish-order", "test-order", "evidence", "review", "next-asset"],
  ],
  "ugc-to-app-ad-mini-course": [
    ["l1-example", "l1-exercise", "l1-rationale", "l1-check"],
    ["l2-example", "l2-exercise", "l2-rationale", "l2-check"],
    ["l3-example", "l3-exercise", "l3-rationale", "l3-check"],
    ["l4-example", "l4-exercise", "l4-rationale", "l4-check"],
    ["l5-example", "l5-exercise", "l5-rationale", "l5-check"],
  ],
  "app-creative-testing-system-workshop": [
    ["testing-purpose", "out-of-scope"],
    ["variable-order", "control-rule"],
    ["role-map", "stop-authority"],
    ["asset-naming", "cell-naming"],
    ["evidence-contract", "uncertainty-rule"],
    ["review-cadence", "asset-flow"],
    ["charter-draft", "charter-owner"],
  ],
} as const satisfies Record<CourseKey, readonly (readonly string[])[]>;
