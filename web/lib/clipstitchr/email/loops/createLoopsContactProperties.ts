import type { ContactProperties } from "loops";
import type { LoopsContactProjection } from "./LoopsContactProjection";
import { loopsContactSource } from "./loopsContactSource";

export function createLoopsContactProperties(
  projection: LoopsContactProjection,
): ContactProperties {
  return {
    source: loopsContactSource,
    contactName: projection.contactName,
    firstTool: projection.firstTool,
    latestTool: projection.latestTool,
    leadSegment: projection.leadSegment,
    leadStage: projection.leadStage,
  };
}
