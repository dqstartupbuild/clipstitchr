import type { HookLabFormatDna } from "@/lib/clipstitchr/types/HookLabFormatDna";

function readString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function readStringArray(value: unknown) {
  return Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 20)
    : [];
}

export function parseHookLabFormatDna(value: unknown): HookLabFormatDna {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Hook Lab analysis did not include reusable format DNA.");
  }

  const format = value as Record<string, unknown>;
  const productFirstAppearsAtSeconds = Number(
    format.productFirstAppearsAtSeconds,
  );
  const firstPayoffAtSeconds = Number(format.firstPayoffAtSeconds);

  return {
    adObviousness: readString(format.adObviousness, "Not clearly identified."),
    confidence: readString(
      format.confidence,
      "The structure is observed; intent and likely effect are inferred.",
    ),
    ctaStyle: readString(format.ctaStyle, "No clear CTA style."),
    doNotCopy: readStringArray(format.doNotCopy),
    editRhythm: readString(format.editRhythm, "Edit rhythm not identified."),
    firstPayoff: readString(
      format.firstPayoff,
      "The first taste of the payoff was not identified.",
    ),
    ...(Number.isFinite(firstPayoffAtSeconds) && firstPayoffAtSeconds >= 0
      ? { firstPayoffAtSeconds }
      : {}),
    hookPattern: readString(format.hookPattern, "Hook pattern not identified."),
    inferences: readStringArray(format.inferences),
    observedEvidence: readStringArray(format.observedEvidence),
    openingQuestion: readString(
      format.openingQuestion,
      "No unresolved opening question was identified.",
    ),
    openingVisual: readString(
      format.openingVisual,
      "Opening visual not identified.",
    ),
    ...(Number.isFinite(productFirstAppearsAtSeconds) &&
    productFirstAppearsAtSeconds >= 0
      ? { productFirstAppearsAtSeconds }
      : {}),
    productRole: readString(format.productRole, "absent"),
    proofDevice: readString(format.proofDevice, "no clear proof"),
    replicationFormula: readString(
      format.replicationFormula,
      "Keep the opening mechanism and beat order while writing original copy.",
    ),
    retentionDevice: readString(
      format.retentionDevice,
      "No clear retention device was identified.",
    ),
    signatureDevice: readString(
      format.signatureDevice,
      "No single signature device was identified.",
    ),
    soundOffSummary: readString(
      format.soundOffSummary,
      "The sound-off opening could not be determined.",
    ),
    storyBeats: readStringArray(format.storyBeats),
    storyFramework: readString(
      format.storyFramework,
      "Story framework not identified.",
    ),
    version: "format-dna-v1",
  };
}
