import type { Doc } from "../_generated/dataModel";

export function hasStudioEditorStitchObject(
  stitch: Doc<"stitchCards">,
): stitch is Doc<"stitchCards"> & {
  stitchObject: NonNullable<Doc<"stitchCards">["stitchObject"]>;
} {
  return stitch.stitchObject !== undefined;
}
