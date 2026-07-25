import type { RawCliprHookTemplate } from "@/lib/clipstitchr/types/RawCliprHookTemplate";

const selfCalloutOpeners = [
  "not me",
  "me, apparently,",
  "POV: you are",
  "the way I am",
  "okay, I am",
  "I fear I am",
  "somehow I am",
  "caught myself",
  "why am I",
  "tell me why I am",
];

const selfCalloutDiscoveries = [
  "realizing {{habit}} was making {{problem}} harder",
  "finding out {{workflow}} did not need to feel this confusing",
  "discovering {{pain_point}} was not the real starting point",
  "learning {{thing}} matters less than having a clear next step",
  "admitting {{habit}} kept replacing a real plan",
  "watching the {{habit}} excuse disappear in real time",
  "seeing how much guessing was hiding inside {{workflow}}",
  "finding a simpler way through {{problem}}",
  "realizing {{workflow}} became way more complicated than necessary",
  "losing the excuse that {{problem}} was impossible to fix",
];

const selfCalloutStyleKeys = [
  "vulnerable_reveal",
  "cold_open_story",
  "direct_diagnosis",
] as const;

const reluctantDiscoveryOpeners = [
  "wait, so",
  "hold on, so",
  "you're telling me",
  "so you're saying",
  "okay, apparently",
  "why did nobody tell me",
  "am I really just finding out",
  "not me discovering",
  "the way I just learned",
  "I fear",
];

const reluctantDiscoveries = [
  "{{workflow}} can actually start this simply",
  "{{problem}} does not require another restart",
  "{{habit}} was never the same as having a plan",
  "{{pain_point}} can have a clear next step",
  "{{thing}} was not the part I needed more of",
  "{{topic}} can meet me where I am right now",
  "{{workflow}} can stop feeling like a guessing game",
  "{{problem}} gets less intimidating when the next step is visible",
  "{{habit}} was the reason progress felt random",
  "{{topic}} did not need a perfect setup after all",
];

const reluctantDiscoveryStyleKeys = [
  "mystery_gap",
  "pattern_break",
  "test_drive",
] as const;

const expectationOpeners = [
  "I expected",
  "I genuinely thought",
  "me thinking",
  "POV: you assume",
  "not me assuming",
  "the way I thought",
  "apparently I believed",
  "I was fully convinced",
  "tell me why I thought",
  "I fear I assumed",
];

const expectationReversals = [
  "{{topic}} had to feel harder than this",
  "{{workflow}} needed a complicated setup",
  "{{pain_point}} meant I was bad at {{topic}}",
  "{{thing}} mattered more than a repeatable plan",
  "{{habit}} counted as a real system",
  "{{problem}} required starting over",
  "more motivation mattered more than a clear next step",
  "guessing through {{topic}} was completely normal",
  "a better {{workflow}} would feel overwhelming",
  "{{topic}} only worked for people already ahead",
];

const expectationStyleKeys = [
  "anti_advice",
  "identity_challenge",
  "pattern_break",
] as const;

const sourcePatterns = [
  ...selfCalloutOpeners.flatMap((opener) =>
    selfCalloutDiscoveries.map((discovery) => `${opener} ${discovery}`),
  ),
  ...reluctantDiscoveryOpeners.flatMap((opener) =>
    reluctantDiscoveries.map((discovery) => `${opener} ${discovery}`),
  ),
  ...expectationOpeners.flatMap((opener) =>
    expectationReversals.map((reversal) => `${opener} ${reversal}`),
  ),
];

export const rawUgcDiscoveryHookTemplates: RawCliprHookTemplate[] =
  sourcePatterns.map((template, index) => {
    const styleKey =
      index < 100
        ? selfCalloutStyleKeys[index % selfCalloutStyleKeys.length]
        : index < 200
          ? reluctantDiscoveryStyleKeys[
              index % reluctantDiscoveryStyleKeys.length
            ]
          : expectationStyleKeys[index % expectationStyleKeys.length];

    return {
      allowedPurposes: ["stitchr"],
      source: "ugc_discovery_patterns",
      styleKey,
      template,
      templateId: `UGD-${String(index + 1).padStart(3, "0")}`,
    };
  });
