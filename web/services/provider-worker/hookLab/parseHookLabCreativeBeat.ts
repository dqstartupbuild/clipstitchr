import type { HookLabCreativeBeat } from "@/lib/clipstitchr/types/HookLabCreativeBeat";
import { getHookLabOptionalParsedString } from "./getHookLabOptionalParsedString";
import { getHookLabOptionalSeconds } from "./getHookLabOptionalSeconds";
import { getHookLabParsedObject } from "./getHookLabParsedObject";
import { getHookLabParsedString } from "./getHookLabParsedString";
import { getHookLabParsedStringArray } from "./getHookLabParsedStringArray";

export function parseHookLabCreativeBeat(value: unknown): HookLabCreativeBeat {
  const beat = getHookLabParsedObject(value);
  const rawBeats = Array.isArray(beat.beats) ? beat.beats : [];
  const beats = rawBeats.slice(0, 16).flatMap((entry) => {
    const action = getHookLabParsedObject(entry);
    const description = getHookLabParsedString(action.description, "", 400);
    const approximateStartSeconds = getHookLabOptionalSeconds(
      action.approximateStartSeconds,
    );
    const approximateEndSeconds = getHookLabOptionalSeconds(
      action.approximateEndSeconds,
    );

    return description
      ? [
          {
            description,
            ...(approximateStartSeconds === undefined
              ? {}
              : { approximateStartSeconds }),
            ...(approximateEndSeconds === undefined
              ? {}
              : { approximateEndSeconds }),
          },
        ]
      : [];
  });

  return {
    beats: beats.length
      ? beats
      : [{ description: "A clear opening reaction establishes the idea." }],
    ...(getHookLabOptionalParsedString(beat.bodyGesture)
      ? { bodyGesture: getHookLabOptionalParsedString(beat.bodyGesture) }
      : {}),
    ...(getHookLabOptionalParsedString(beat.cameraMovement)
      ? { cameraMovement: getHookLabOptionalParsedString(beat.cameraMovement) }
      : {}),
    emotionalTurn: getHookLabParsedString(
      beat.emotionalTurn,
      "Curiosity turns into recognition.",
      500,
    ),
    ...(getHookLabOptionalParsedString(beat.facialExpression)
      ? { facialExpression: getHookLabOptionalParsedString(beat.facialExpression) }
      : {}),
    ...(getHookLabOptionalParsedString(beat.framing)
      ? { framing: getHookLabOptionalParsedString(beat.framing) }
      : {}),
    genericObjects: getHookLabParsedStringArray(beat.genericObjects),
    mustNotCopy: Array.from(
      new Set([
        "Source creator identity or likeness",
        "Watermarks, usernames, logos, audio, or music",
        ...getHookLabParsedStringArray(beat.mustNotCopy),
      ]),
    ),
    openingVisualState: getHookLabParsedString(
      beat.openingVisualState,
      "A creator begins in a clear, natural vertical frame.",
      500,
    ),
    ...(getHookLabOptionalParsedString(beat.pacing)
      ? { pacing: getHookLabOptionalParsedString(beat.pacing) }
      : {}),
    payoff: getHookLabParsedString(
      beat.payoff,
      "The visual makes the overlay feel earned.",
      500,
    ),
    ...(getHookLabOptionalParsedString(beat.shotSize)
      ? { shotSize: getHookLabOptionalParsedString(beat.shotSize) }
      : {}),
    ...(getHookLabOptionalParsedString(beat.transitionIntoDemo)
      ? {
          transitionIntoDemo: getHookLabOptionalParsedString(
            beat.transitionIntoDemo,
          ),
        }
      : {}),
  };
}
