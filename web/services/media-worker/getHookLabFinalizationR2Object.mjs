import { getHookLabFinalizationNumber } from "./getHookLabFinalizationNumber.mjs";
import { getHookLabFinalizationString } from "./getHookLabFinalizationString.mjs";

export function getHookLabFinalizationR2Object(value, label) {
  if (!value || typeof value !== "object") {
    throw new Error(`Missing ${label}.`);
  }

  return {
    contentType: getHookLabFinalizationString(
      value.contentType,
      `${label} content type`,
    ),
    key: getHookLabFinalizationString(value.key, `${label} key`),
    size: getHookLabFinalizationNumber(value.size, `${label} size`),
  };
}
