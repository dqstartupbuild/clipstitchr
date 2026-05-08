import { readR2JsonResponse } from "@/lib/clipstitchr/client/r2/readR2JsonResponse";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

export async function deleteObjectsFromR2(objects: R2ObjectReference[]) {
  const keys = objects.map((object) => object.key);

  if (!keys.length) {
    return;
  }

  const response = await fetch("/api/r2/delete-objects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ keys }),
  });

  await readR2JsonResponse(response);
}
