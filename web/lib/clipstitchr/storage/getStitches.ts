import { STITCHES_STORE_NAME } from "@/lib/clipstitchr/constants/objectStoreNames";
import { getObjectStore } from "@/lib/clipstitchr/storage/getObjectStore";
import { requestToPromise } from "@/lib/clipstitchr/storage/requestToPromise";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";

export async function getStitches() {
  const { store } = await getObjectStore(STITCHES_STORE_NAME, "readonly");
  const stitches = await requestToPromise<Stitch[]>(store.getAll());

  return stitches.sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );
}
