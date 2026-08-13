import type { StudioStitchProviderCapability } from "../../types/studioStitch/StudioStitchProviderCapability";
import type { StudioStitchSegmentRole } from "../../types/studioStitch/StudioStitchSegmentRole";
import type { StudioStitchValidationIssue } from "../../types/studioStitch/StudioStitchValidationIssue";
import { addStudioStitchValidationIssue } from "./addStudioStitchValidationIssue";
import { addStudioStitchUnexpectedKeyIssues } from "./addStudioStitchUnexpectedKeyIssues";
import { countStudioStitchWords } from "./countStudioStitchWords";
import { isStudioStitchAssetRef } from "./isStudioStitchAssetRef";
import { isStudioStitchClassicHookFamily } from "./isStudioStitchClassicHookFamily";
import { isStudioStitchFrameAligned } from "./isStudioStitchFrameAligned";
import { isFiniteStudioStitchNumber } from "./isFiniteStudioStitchNumber";
import { isStudioStitchJsonSafe } from "./isStudioStitchJsonSafe";
import { isStudioStitchRecord } from "./isStudioStitchRecord";
import { isStudioStitchTalkingHookFamily } from "./isStudioStitchTalkingHookFamily";
import { STUDIO_STITCH_CANVAS } from "./studioStitchCanvas";
import { STUDIO_STITCH_RECIPE_VERSION } from "./studioStitchRecipeVersion";
import { STUDIO_STITCH_SAFE_AREA } from "./studioStitchSafeArea";
import { validateStudioStitchWordTimingSequence } from "./validateStudioStitchWordTimingSequence";
import { validateStudioStitchBoundedString } from "./validateStudioStitchBoundedString";
import { validateStudioStitchClaimIds } from "./validateStudioStitchClaimIds";

const segmentRoles = new Set<StudioStitchSegmentRole>([
  "reactionHook",
  "reactionContext",
  "reactionBridge",
  "reactionSupport",
  "demoSetup",
  "demoProof",
  "cutaway",
  "ctaReaction",
]);
const providerCapabilities = new Set<StudioStitchProviderCapability>([
  "reactionFootage",
  "demoIntelligence",
  "voiceWordTimings",
  "mediaRendering",
]);

export function validateStudioStitchRecipeV1(
  value: unknown,
): StudioStitchValidationIssue[] {
  const issues: StudioStitchValidationIssue[] = [];
  const add = addStudioStitchValidationIssue.bind(null, issues);
  const finite = isFiniteStudioStitchNumber;
  const boundedString = validateStudioStitchBoundedString.bind(
    null,
    issues,
  ) as (
    candidate: unknown,
    path: string,
    maximum?: number,
  ) => candidate is string;
  const validateClaimIds = validateStudioStitchClaimIds.bind(null, issues);

  if (!isStudioStitchJsonSafe(value)) {
    return [
      {
        path: "$",
        code: "not_json_safe",
        message:
          "Studio Stitch recipes may contain only finite JSON values without cycles.",
      },
    ];
  }
  if (!isStudioStitchRecord(value)) {
    return [
      {
        path: "$",
        code: "invalid_recipe",
        message: "Expected a Studio Stitch recipe object.",
      },
    ];
  }
  addStudioStitchUnexpectedKeyIssues(
    value,
    "$",
    [
      "recipeVersion",
      "id",
      "productId",
      "pipeline",
      "durationSeconds",
      "canvas",
      "safeArea",
      "grounding",
      "hook",
      "segments",
      "textOverlays",
      "transitions",
      "music",
      "cta",
      "providerRequirements",
      "availability",
      "voice",
      "captions",
    ],
    issues,
  );
  if (value.recipeVersion !== STUDIO_STITCH_RECIPE_VERSION) {
    add(
      "recipeVersion",
      "unsupported_version",
      "Expected Studio Stitch recipe version 1.",
    );
  }
  boundedString(value.id, "id", 240);
  boundedString(value.productId, "productId", 240);
  const pipeline =
    value.pipeline === "classicReel" || value.pipeline === "talkingVideo"
      ? value.pipeline
      : null;
  if (pipeline === null) {
    add(
      "pipeline",
      "invalid_pipeline",
      "Expected classicReel or talkingVideo.",
    );
  }
  const durationSeconds = finite(value.durationSeconds)
    ? value.durationSeconds
    : 0;
  const durationValid =
    pipeline === "classicReel"
      ? durationSeconds >= 7 && durationSeconds <= 15
      : pipeline === "talkingVideo"
        ? durationSeconds >= 20 && durationSeconds <= 30
        : false;
  if (!durationValid || !isStudioStitchFrameAligned(durationSeconds)) {
    add(
      "durationSeconds",
      "invalid_duration",
      "Recipe duration must be in its pipeline range and frame-aligned.",
    );
  }

  if (!isStudioStitchRecord(value.canvas)) {
    add("canvas", "invalid_canvas", "Expected a canvas object.");
  } else {
    addStudioStitchUnexpectedKeyIssues(
      value.canvas,
      "canvas",
      ["widthPixels", "heightPixels", "framesPerSecond", "aspectRatio"],
      issues,
    );
    for (const [field, expected] of Object.entries(STUDIO_STITCH_CANVAS)) {
      if (value.canvas[field] !== expected) {
        add(
          `canvas.${field}`,
          "invalid_canvas_value",
          "Canvas must use the version-one 1080x1920 at 30fps contract.",
        );
      }
    }
  }
  if (!isStudioStitchRecord(value.safeArea)) {
    add("safeArea", "invalid_safe_area", "Expected a safe-area object.");
  } else {
    addStudioStitchUnexpectedKeyIssues(
      value.safeArea,
      "safeArea",
      ["leftPixels", "topPixels", "rightPixels", "bottomPixels"],
      issues,
    );
    for (const [field, expected] of Object.entries(STUDIO_STITCH_SAFE_AREA)) {
      if (value.safeArea[field] !== expected) {
        add(
          `safeArea.${field}`,
          "invalid_safe_area_value",
          "Safe area must use the version-one universal green zone.",
        );
      }
    }
  }

  const claimIds = new Set<string>();
  if (!isStudioStitchRecord(value.grounding)) {
    add("grounding", "invalid_grounding", "Expected product grounding.");
  } else {
    addStudioStitchUnexpectedKeyIssues(
      value.grounding,
      "grounding",
      ["productId", "productName", "claims"],
      issues,
    );
    if (value.grounding.productId !== value.productId) {
      add(
        "grounding.productId",
        "product_mismatch",
        "Grounding product ID must match the recipe product ID.",
      );
    }
    boundedString(value.grounding.productName, "grounding.productName", 500);
    if (
      !Array.isArray(value.grounding.claims) ||
      value.grounding.claims.length < 1 ||
      value.grounding.claims.length > 100
    ) {
      add(
        "grounding.claims",
        "invalid_claims",
        "Expected 1 through 100 grounding claims.",
      );
    } else {
      value.grounding.claims.forEach((claim, index) => {
        const path = `grounding.claims[${index}]`;
        if (!isStudioStitchRecord(claim)) {
          add(path, "invalid_claim", "Expected a grounding claim object.");
          return;
        }
        addStudioStitchUnexpectedKeyIssues(
          claim,
          path,
          ["id", "text", "source"],
          issues,
        );
        if (boundedString(claim.id, `${path}.id`, 240)) {
          if (claimIds.has(claim.id)) {
            add(`${path}.id`, "duplicate_claim_id", "Claim IDs must be unique.");
          }
          claimIds.add(claim.id);
        }
        boundedString(claim.text, `${path}.text`, 4_000);
        if (!isStudioStitchRecord(claim.source)) {
          add(`${path}.source`, "invalid_claim_source", "Expected claim provenance.");
          return;
        }
        addStudioStitchUnexpectedKeyIssues(
          claim.source,
          `${path}.source`,
          ["kind", "field", "sourceIndex"],
          issues,
        );
        const productFields = new Set([
          "name",
          "productDetails",
          "audienceDetails",
          "emotionalNarrative",
          "inferredProblem",
          "inferredPainPoints",
        ]);
        const validProductSource =
          claim.source.kind === "productProfile" &&
          typeof claim.source.field === "string" &&
          productFields.has(claim.source.field) &&
          (claim.source.field === "inferredPainPoints"
            ? Number.isInteger(claim.source.sourceIndex) &&
              (claim.source.sourceIndex as number) >= 0
            : claim.source.sourceIndex === null);
        const validBriefSource =
          claim.source.kind === "hookLabCreativeBrief" &&
          claim.source.field === "productProof" &&
          claim.source.sourceIndex === null;
        if (!validProductSource && !validBriefSource) {
          add(
            `${path}.source`,
            "invalid_claim_source",
            "Claim provenance must identify an allowed source field.",
          );
        }
      });
    }
  }

  if (!isStudioStitchRecord(value.hook)) {
    add("hook", "invalid_hook", "Expected a hook plan.");
  } else {
    addStudioStitchUnexpectedKeyIssues(
      value.hook,
      "hook",
      ["family", "text", "groundingClaimIds"],
      issues,
    );
    const familyValid =
      (pipeline === "classicReel" &&
        isStudioStitchClassicHookFamily(value.hook.family)) ||
      (pipeline === "talkingVideo" &&
        isStudioStitchTalkingHookFamily(value.hook.family));
    if (!familyValid) {
      add(
        "hook.family",
        "invalid_hook_family",
        "Hook family must be supported by the selected pipeline.",
      );
    }
    boundedString(value.hook.text, "hook.text", 500);
    validateClaimIds(
      value.hook.groundingClaimIds,
      "hook.groundingClaimIds",
      claimIds,
    );
  }

  const segmentIds = new Set<string>();
  const segmentValues: Record<string, unknown>[] = [];
  const expectedRoles: readonly StudioStitchSegmentRole[] | null =
    pipeline === "classicReel"
      ? null
      : pipeline === "talkingVideo"
        ? [
            "reactionHook",
            "reactionContext",
            "reactionBridge",
            "demoSetup",
            "demoProof",
            "reactionSupport",
            "ctaReaction",
          ]
        : null;
  if (
    !Array.isArray(value.segments) ||
    value.segments.length < 2 ||
    value.segments.length > 7
  ) {
    add("segments", "invalid_segments", "Expected 2 through 7 segments.");
  } else {
    let expectedStart = 0;
    value.segments.forEach((segment, index) => {
      const path = `segments[${index}]`;
      if (!isStudioStitchRecord(segment)) {
        add(path, "invalid_segment", "Expected a segment object.");
        return;
      }
      segmentValues.push(segment);
      addStudioStitchUnexpectedKeyIssues(
        segment,
        path,
        [
          "id",
          "order",
          "role",
          "source",
          "sourceDurationSeconds",
          "sourceOffsetSeconds",
          "playbackRate",
          "timelineStartSeconds",
          "timelineDurationSeconds",
          "fit",
          "audio",
          "creatorContinuityKey",
        ],
        issues,
      );
      if (boundedString(segment.id, `${path}.id`, 240)) {
        if (segmentIds.has(segment.id)) {
          add(`${path}.id`, "duplicate_segment_id", "Segment IDs must be unique.");
        }
        segmentIds.add(segment.id);
      }
      if (segment.order !== index) {
        add(`${path}.order`, "invalid_order", "Segment order must match its index.");
      }
      if (
        typeof segment.role !== "string" ||
        !segmentRoles.has(segment.role as StudioStitchSegmentRole)
      ) {
        add(`${path}.role`, "invalid_segment_role", "Segment role is not supported.");
      }
      if (expectedRoles && segment.role !== expectedRoles[index]) {
        add(
          `${path}.role`,
          "invalid_pipeline_sequence",
          "Talking video segments must follow the reaction/demo cadence.",
        );
      }
      if (pipeline === "classicReel") {
        const expectedRole = index === 0 ? "reactionHook" : index === 1 ? "demoProof" : "cutaway";
        if (segment.role !== expectedRole) {
          add(
            `${path}.role`,
            "invalid_pipeline_sequence",
            "Classic reels must sequence reaction, demo, then optional cutaways.",
          );
        }
      }
      if (!isStudioStitchAssetRef(segment.source)) {
        add(`${path}.source`, "invalid_source", "Expected a durable asset reference.");
      }
      const sourceDuration = finite(segment.sourceDurationSeconds)
        ? segment.sourceDurationSeconds
        : 0;
      const sourceOffset = finite(segment.sourceOffsetSeconds)
        ? segment.sourceOffsetSeconds
        : -1;
      const playbackRate = finite(segment.playbackRate) ? segment.playbackRate : 0;
      const timelineStart = finite(segment.timelineStartSeconds)
        ? segment.timelineStartSeconds
        : -1;
      const timelineDuration = finite(segment.timelineDurationSeconds)
        ? segment.timelineDurationSeconds
        : 0;
      if (sourceDuration <= 0 || sourceDuration > 86_400) {
        add(`${path}.sourceDurationSeconds`, "invalid_source_duration", "Source duration must be positive.");
      }
      if (
        sourceOffset < 0 ||
        sourceOffset >= sourceDuration ||
        !isStudioStitchFrameAligned(sourceOffset)
      ) {
        add(`${path}.sourceOffsetSeconds`, "invalid_source_offset", "Source offset must be frame-aligned inside the source.");
      }
      if (playbackRate < 0.25 || playbackRate > 4) {
        add(`${path}.playbackRate`, "invalid_playback_rate", "Playback rate must be between 0.25 and 4.");
      }
      if (
        timelineDuration <= 0 ||
        !isStudioStitchFrameAligned(timelineDuration) ||
        timelineStart < 0 ||
        !isStudioStitchFrameAligned(timelineStart)
      ) {
        add(path, "not_frame_aligned", "Segment timeline values must be positive frame units.");
      }
      if (Math.abs(timelineStart - expectedStart) > 1e-6) {
        add(`${path}.timelineStartSeconds`, "timeline_gap", "Segments must form one contiguous timeline.");
      }
      if (sourceOffset + timelineDuration * playbackRate > sourceDuration + 1e-6) {
        add(path, "source_overrun", "Segment playback exceeds its source asset.");
      }
      expectedStart = timelineStart + timelineDuration;
      if (segment.fit !== "cover" && segment.fit !== "contain") {
        add(`${path}.fit`, "invalid_fit", "Expected cover or contain.");
      }
      if (segment.audio !== "muted" && segment.audio !== "source") {
        add(`${path}.audio`, "invalid_audio", "Expected muted or source audio.");
      }
      if (
        segment.creatorContinuityKey !== null &&
        !boundedString(segment.creatorContinuityKey, `${path}.creatorContinuityKey`, 240)
      ) {
        return;
      }
    });
    if (Math.abs(expectedStart - durationSeconds) > 1e-6) {
      add("segments", "duration_mismatch", "Segments must fill the recipe duration exactly.");
    }
    if (pipeline === "talkingVideo" && value.segments.length !== 7) {
      add("segments", "invalid_segment_count", "Talking videos require exactly seven segments.");
    }
    if (pipeline === "classicReel" && value.segments.length > 5) {
      add("segments", "invalid_segment_count", "Classic reels support at most three cutaways.");
    }
    if (pipeline === "talkingVideo") {
      const reactionKeys = segmentValues
        .filter((segment) =>
          ["reactionHook", "reactionContext", "reactionBridge", "reactionSupport", "ctaReaction"].includes(
            typeof segment.role === "string" ? segment.role : "",
          ),
        )
        .map((segment) => segment.creatorContinuityKey);
      if (
        reactionKeys.length !== 5 ||
        typeof reactionKeys[0] !== "string" ||
        reactionKeys[0].trim().length === 0 ||
        reactionKeys.some((key) => key !== reactionKeys[0])
      ) {
        add(
          "segments",
          "creator_continuity_mismatch",
          "Talking reaction beats must use one creator continuity key.",
        );
      }
    }
  }

  const overlayIds = new Set<string>();
  const captionOverlayIds: string[] = [];
  const overlays = new Map<string, Record<string, unknown>>();
  if (
    !Array.isArray(value.textOverlays) ||
    value.textOverlays.length < 2 ||
    value.textOverlays.length > 500
  ) {
    add("textOverlays", "invalid_overlays", "Expected 2 through 500 text overlays.");
  } else {
    value.textOverlays.forEach((overlay, index) => {
      const path = `textOverlays[${index}]`;
      if (!isStudioStitchRecord(overlay)) {
        add(path, "invalid_overlay", "Expected a text overlay object.");
        return;
      }
      addStudioStitchUnexpectedKeyIssues(
        overlay,
        path,
        ["id", "role", "text", "startSeconds", "endSeconds", "centerXPixels", "centerYPixels", "style", "emphasis", "groundingClaimIds"],
        issues,
      );
      if (boundedString(overlay.id, `${path}.id`, 240)) {
        if (overlayIds.has(overlay.id)) {
          add(`${path}.id`, "duplicate_overlay_id", "Overlay IDs must be unique.");
        }
        overlayIds.add(overlay.id);
        overlays.set(overlay.id, overlay);
        if (overlay.role === "caption") {
          captionOverlayIds.push(overlay.id);
        }
      }
      if (!["hook", "supporting", "caption", "cta"].includes(typeof overlay.role === "string" ? overlay.role : "")) {
        add(`${path}.role`, "invalid_overlay_role", "Overlay role is not supported.");
      }
      boundedString(overlay.text, `${path}.text`, 1_000);
      if (
        !finite(overlay.startSeconds) ||
        !finite(overlay.endSeconds) ||
        overlay.startSeconds < 0 ||
        overlay.endSeconds <= overlay.startSeconds ||
        overlay.endSeconds > durationSeconds + 1e-6
      ) {
        add(path, "invalid_overlay_timing", "Overlay timing must be inside the recipe duration.");
      }
      if (
        !finite(overlay.centerXPixels) ||
        !finite(overlay.centerYPixels) ||
        overlay.centerXPixels < STUDIO_STITCH_SAFE_AREA.leftPixels ||
        overlay.centerXPixels > STUDIO_STITCH_SAFE_AREA.rightPixels ||
        overlay.centerYPixels < STUDIO_STITCH_SAFE_AREA.topPixels ||
        overlay.centerYPixels > STUDIO_STITCH_SAFE_AREA.bottomPixels
      ) {
        add(path, "outside_safe_area", "Overlay center must stay inside the universal green zone.");
      }
      if (typeof overlay.emphasis !== "boolean") {
        add(`${path}.emphasis`, "invalid_boolean", "Expected a boolean.");
      }
      validateClaimIds(overlay.groundingClaimIds, `${path}.groundingClaimIds`, claimIds);
      if (!isStudioStitchRecord(overlay.style)) {
        add(`${path}.style`, "invalid_text_style", "Expected a text style object.");
      } else {
        addStudioStitchUnexpectedKeyIssues(
          overlay.style,
          `${path}.style`,
          ["fontFamily", "fontWeight", "fontSizePixels", "color", "backgroundColor", "outlineColor", "outlineWidthPixels", "textAlign", "maxWidthPixels"],
          issues,
        );
        if (
          overlay.style.fontFamily !== "TikTok Sans" ||
          ![500, 700, 900].includes(finite(overlay.style.fontWeight) ? overlay.style.fontWeight : -1) ||
          !finite(overlay.style.fontSizePixels) ||
          overlay.style.fontSizePixels <= 0 ||
          overlay.style.textAlign !== "center" ||
          !finite(overlay.style.maxWidthPixels) ||
          overlay.style.maxWidthPixels <= 0
        ) {
          add(`${path}.style`, "invalid_text_style", "Text style values are outside the version-one contract.");
        }
        for (const field of ["color", "backgroundColor", "outlineColor"] as const) {
          const color = overlay.style[field];
          if (typeof color !== "string" || !/^#(?:[\da-fA-F]{6}|[\da-fA-F]{8})$/.test(color)) {
            add(`${path}.style.${field}`, "invalid_color", "Expected a six- or eight-digit hex color.");
          }
        }
        if (!finite(overlay.style.outlineWidthPixels) || overlay.style.outlineWidthPixels < 0 || overlay.style.outlineWidthPixels > 30) {
          add(`${path}.style.outlineWidthPixels`, "invalid_outline", "Outline width must be from 0 through 30 pixels.");
        }
      }
      if (overlay.role === "caption") {
        const wordCount = typeof overlay.text === "string" ? countStudioStitchWords(overlay.text) : 0;
        if (wordCount < 1 || wordCount > 3) {
          add(path, "invalid_caption_phrase", "Caption phrases must contain one through three words.");
        }
        if (
          finite(overlay.startSeconds) &&
          finite(overlay.endSeconds) &&
          overlay.endSeconds - overlay.startSeconds > 1.15 + 1e-6
        ) {
          add(path, "caption_too_long", "Caption phrases may span no more than 1.1 seconds plus cue padding.");
        }
      }
    });
  }

  if (!Array.isArray(value.transitions) || value.transitions.length !== Math.max(0, segmentValues.length - 1)) {
    add("transitions", "invalid_transitions", "Expected one transition between every adjacent segment.");
  } else {
    value.transitions.forEach((transition, index) => {
      const path = `transitions[${index}]`;
      if (!isStudioStitchRecord(transition)) {
        add(path, "invalid_transition", "Expected a transition object.");
        return;
      }
      addStudioStitchUnexpectedKeyIssues(
        transition,
        path,
        ["id", "fromSegmentId", "toSegmentId", "kind", "durationSeconds"],
        issues,
      );
      boundedString(transition.id, `${path}.id`, 240);
      if (
        transition.fromSegmentId !== segmentValues[index]?.id ||
        transition.toSegmentId !== segmentValues[index + 1]?.id
      ) {
        add(path, "invalid_transition_chain", "Transitions must connect adjacent segments.");
      }
      if (!["cut", "crossfade", "dipToBlack"].includes(typeof transition.kind === "string" ? transition.kind : "")) {
        add(`${path}.kind`, "invalid_transition_kind", "Transition kind is not supported.");
      }
      if (
        !finite(transition.durationSeconds) ||
        transition.durationSeconds < 0 ||
        transition.durationSeconds > 1 ||
        (transition.kind === "cut" && transition.durationSeconds !== 0)
      ) {
        add(`${path}.durationSeconds`, "invalid_transition_duration", "Cut duration must be zero; other transitions may be at most one second.");
      }
    });
  }

  if (!isStudioStitchRecord(value.music)) {
    add("music", "invalid_music", "Expected a music plan.");
  } else {
    addStudioStitchUnexpectedKeyIssues(
      value.music,
      "music",
      ["state", "source", "volume", "targetLufs", "fadeInSeconds", "fadeOutSeconds", "loopToDuration"],
      issues,
    );
    const enabled = value.music.state === "enabled";
    const omitted = value.music.state === "omitted";
    if (!enabled && !omitted) {
      add("music.state", "invalid_music_state", "Expected enabled or omitted.");
    }
    if ((enabled && !isStudioStitchAssetRef(value.music.source)) || (omitted && value.music.source !== null)) {
      add("music.source", "invalid_music_source", "Music source must match the music state.");
    }
    if (!finite(value.music.volume) || value.music.volume < 0 || value.music.volume > 1) {
      add("music.volume", "invalid_volume", "Music volume must be between 0 and 1.");
    }
    if (value.music.targetLufs !== null && !finite(value.music.targetLufs)) {
      add("music.targetLufs", "invalid_lufs", "Target LUFS must be finite or null.");
    }
    for (const field of ["fadeInSeconds", "fadeOutSeconds"] as const) {
      if (!finite(value.music[field]) || value.music[field] < 0 || value.music[field] > durationSeconds) {
        add(`music.${field}`, "invalid_fade", "Music fades must fit inside the recipe duration.");
      }
    }
    if (typeof value.music.loopToDuration !== "boolean") {
      add("music.loopToDuration", "invalid_boolean", "Expected a boolean.");
    }
  }

  if (!isStudioStitchRecord(value.cta)) {
    add("cta", "invalid_cta", "Expected a CTA plan.");
  } else {
    addStudioStitchUnexpectedKeyIssues(
      value.cta,
      "cta",
      ["text", "startSeconds", "endSeconds", "overlayId", "groundingClaimIds"],
      issues,
    );
    boundedString(value.cta.text, "cta.text", 500);
    boundedString(value.cta.overlayId, "cta.overlayId", 240);
    validateClaimIds(value.cta.groundingClaimIds, "cta.groundingClaimIds", claimIds);
    const overlay = typeof value.cta.overlayId === "string" ? overlays.get(value.cta.overlayId) : undefined;
    if (
      !overlay ||
      overlay.role !== "cta" ||
      overlay.text !== value.cta.text ||
      overlay.startSeconds !== value.cta.startSeconds ||
      overlay.endSeconds !== value.cta.endSeconds
    ) {
      add("cta", "cta_overlay_mismatch", "CTA plan must match its referenced CTA overlay.");
    }
  }

  const requirementCapabilities: StudioStitchProviderCapability[] = [];
  const blockingCapabilities: StudioStitchProviderCapability[] = [];
  const expectedCapabilities: readonly StudioStitchProviderCapability[] =
    pipeline === "talkingVideo"
      ? ["reactionFootage", "demoIntelligence", "voiceWordTimings", "mediaRendering"]
      : ["reactionFootage", "demoIntelligence", "mediaRendering"];
  const expectedPurpose = {
    reactionFootage: "sourceReactionFootage",
    demoIntelligence: "selectDemoMoments",
    voiceWordTimings: "generateVoiceWithWordTimings",
    mediaRendering: "renderRecipe",
  } as const;
  if (!Array.isArray(value.providerRequirements) || value.providerRequirements.length !== expectedCapabilities.length) {
    add("providerRequirements", "invalid_provider_requirements", "Provider requirements must cover every pipeline capability once.");
  } else {
    value.providerRequirements.forEach((requirement, index) => {
      const path = `providerRequirements[${index}]`;
      if (!isStudioStitchRecord(requirement)) {
        add(path, "invalid_provider_requirement", "Expected a provider requirement object.");
        return;
      }
      addStudioStitchUnexpectedKeyIssues(
        requirement,
        path,
        ["capability", "requiredFor", "state", "providerId", "reason", "satisfiedByInput", "blocking"],
        issues,
      );
      const capability = typeof requirement.capability === "string" && providerCapabilities.has(requirement.capability as StudioStitchProviderCapability)
        ? (requirement.capability as StudioStitchProviderCapability)
        : null;
      if (capability === null || capability !== expectedCapabilities[index] || requirementCapabilities.includes(capability)) {
        add(`${path}.capability`, "invalid_provider_capability", "Provider capabilities must be unique and in canonical order.");
      } else {
        requirementCapabilities.push(capability);
        if (requirement.requiredFor !== expectedPurpose[capability]) {
          add(`${path}.requiredFor`, "invalid_provider_purpose", "Provider purpose does not match its capability.");
        }
      }
      if (!["available", "unavailable", "unknown"].includes(typeof requirement.state === "string" ? requirement.state : "")) {
        add(`${path}.state`, "invalid_provider_state", "Provider state is not supported.");
      }
      for (const field of ["providerId", "reason"] as const) {
        if (requirement[field] !== null) {
          boundedString(requirement[field], `${path}.${field}`, 1_000);
        }
      }
      if (typeof requirement.satisfiedByInput !== "boolean" || typeof requirement.blocking !== "boolean") {
        add(path, "invalid_provider_flags", "Provider requirement flags must be boolean.");
      } else {
        const expectedBlocking = !requirement.satisfiedByInput && requirement.state !== "available";
        if (requirement.blocking !== expectedBlocking) {
          add(`${path}.blocking`, "invalid_provider_blocking", "Blocking must reflect input satisfaction and provider state.");
        }
        if (requirement.blocking && capability !== null) {
          blockingCapabilities.push(capability);
        }
      }
    });
  }
  if (!isStudioStitchRecord(value.availability)) {
    add("availability", "invalid_availability", "Expected recipe availability.");
  } else {
    addStudioStitchUnexpectedKeyIssues(
      value.availability,
      "availability",
      ["state", "unavailableCapabilities"],
      issues,
    );
    const expectedState = blockingCapabilities.length === 0 ? "ready" : "unavailable";
    if (value.availability.state !== expectedState) {
      add("availability.state", "availability_mismatch", "Availability must reflect blocking provider requirements.");
    }
    if (
      !Array.isArray(value.availability.unavailableCapabilities) ||
      JSON.stringify(value.availability.unavailableCapabilities) !== JSON.stringify(blockingCapabilities)
    ) {
      add("availability.unavailableCapabilities", "availability_mismatch", "Unavailable capabilities must match blocking requirements.");
    }
  }

  if (pipeline === "classicReel") {
    if (value.voice !== null) {
      add("voice", "unexpected_voice", "Classic reel recipes do not contain a voice plan.");
    }
    if (value.captions !== null) {
      add("captions", "unexpected_captions", "Classic reel recipes do not contain a caption plan.");
    }
  }
  if (pipeline === "talkingVideo") {
    if (!isStudioStitchRecord(value.voice)) {
      add("voice", "invalid_voice", "Talking video recipes require a voice plan.");
    } else {
      addStudioStitchUnexpectedKeyIssues(
        value.voice,
        "voice",
        ["voiceId", "voiceName", "modelId", "script", "speed", "stability", "similarityBoost", "style", "speakerBoost", "targetDurationSeconds", "rawDurationSeconds", "tempoFactor", "timingState", "sourceWordTimings", "timelineWordTimings", "groundingClaimIds", "targetWordCountMinimum", "targetWordCountMaximum", "actualWordCount"],
        issues,
      );
      boundedString(value.voice.voiceId, "voice.voiceId", 240);
      boundedString(value.voice.voiceName, "voice.voiceName", 240);
      boundedString(value.voice.modelId, "voice.modelId", 240);
      const voiceScript = value.voice.script;
      const scriptValid = boundedString(voiceScript, "voice.script", 8_000);
      if (!finite(value.voice.speed) || value.voice.speed < 0.5 || value.voice.speed > 2) {
        add("voice.speed", "invalid_voice_setting", "Voice speed must be between 0.5 and 2.");
      }
      for (const field of ["stability", "similarityBoost", "style"] as const) {
        if (!finite(value.voice[field]) || value.voice[field] < 0 || value.voice[field] > 1) {
          add(`voice.${field}`, "invalid_voice_setting", "Voice setting must be between 0 and 1.");
        }
      }
      if (value.voice.speakerBoost !== true || value.voice.targetDurationSeconds !== durationSeconds) {
        add("voice", "invalid_voice_contract", "Voice must use speaker boost and match recipe duration.");
      }
      validateClaimIds(value.voice.groundingClaimIds, "voice.groundingClaimIds", claimIds);
      const rawDuration = finite(value.voice.rawDurationSeconds) ? value.voice.rawDurationSeconds : null;
      const tempoFactor = finite(value.voice.tempoFactor) ? value.voice.tempoFactor : null;
      issues.push(
        ...validateStudioStitchWordTimingSequence(
          value.voice.sourceWordTimings,
          "voice.sourceWordTimings",
          rawDuration,
        ),
        ...validateStudioStitchWordTimingSequence(
          value.voice.timelineWordTimings,
          "voice.timelineWordTimings",
          durationSeconds,
        ),
      );
      const sourceCount = Array.isArray(value.voice.sourceWordTimings) ? value.voice.sourceWordTimings.length : -1;
      const timelineCount = Array.isArray(value.voice.timelineWordTimings) ? value.voice.timelineWordTimings.length : -2;
      if (value.voice.timingState === "provided") {
        if (rawDuration === null || rawDuration <= 0 || tempoFactor === null || tempoFactor <= 0 || sourceCount < 1 || sourceCount !== timelineCount) {
          add("voice", "invalid_provided_timings", "Provided timing state requires matching source and fitted word timings.");
        }
      } else if (value.voice.timingState === "pendingProvider") {
        if (sourceCount !== 0 || timelineCount !== 0) {
          add("voice", "invalid_pending_timings", "Pending timing state cannot contain word timings.");
        }
      } else {
        add("voice.timingState", "invalid_timing_state", "Expected provided or pendingProvider.");
      }
      if (
        value.voice.targetWordCountMinimum !== Math.ceil(durationSeconds * 2.5) ||
        value.voice.targetWordCountMaximum !== Math.floor(durationSeconds * 2.75) ||
        (scriptValid && value.voice.actualWordCount !== countStudioStitchWords(voiceScript))
      ) {
        add("voice", "invalid_word_count_contract", "Voice word counts must match the duration and script.");
      }
    }
    if (!isStudioStitchRecord(value.captions)) {
      add("captions", "invalid_captions", "Talking video recipes require a caption plan.");
    } else {
      addStudioStitchUnexpectedKeyIssues(
        value.captions,
        "captions",
        ["state", "timingContract", "cueOverlayIds"],
        issues,
      );
      const expectedCaptionState =
        isStudioStitchRecord(value.voice) && value.voice.timingState === "provided"
          ? "ready"
          : "pendingWordTimings";
      if (value.captions.state !== expectedCaptionState) {
        add("captions.state", "caption_state_mismatch", "Caption state must match voice timing readiness.");
      }
      if (!isStudioStitchRecord(value.captions.timingContract)) {
        add("captions.timingContract", "invalid_caption_contract", "Expected a caption timing contract.");
      } else {
        const contract = value.captions.timingContract;
        addStudioStitchUnexpectedKeyIssues(
          contract,
          "captions.timingContract",
          ["providerOutput", "sourceTimebase", "fitRule", "phraseMaximumWords", "phraseMaximumDurationSeconds", "breakOnPunctuation", "cueEndPaddingSeconds", "captionCutoffSeconds"],
          issues,
        );
        if (
          contract.providerOutput !== "wordTimings" ||
          contract.sourceTimebase !== "secondsFromVoiceStart" ||
          contract.fitRule !== "divideByTempoFactor" ||
          contract.phraseMaximumWords !== 3 ||
          contract.phraseMaximumDurationSeconds !== 1.1 ||
          contract.breakOnPunctuation !== true ||
          contract.cueEndPaddingSeconds !== 0.05 ||
          contract.captionCutoffSeconds !== durationSeconds - 4
        ) {
          add("captions.timingContract", "invalid_caption_contract", "Caption contract does not match version-one timing rules.");
        }
      }
      if (!Array.isArray(value.captions.cueOverlayIds) || JSON.stringify(value.captions.cueOverlayIds) !== JSON.stringify(captionOverlayIds)) {
        add("captions.cueOverlayIds", "caption_overlay_mismatch", "Caption cue IDs must match caption overlays in timeline order.");
      }
    }
  }
  return issues;
}
