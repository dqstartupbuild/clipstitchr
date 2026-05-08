import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

export function getDefinedR2Objects(
  objects: Array<R2ObjectReference | undefined>,
) {
  return objects.filter((object): object is R2ObjectReference => Boolean(object));
}
