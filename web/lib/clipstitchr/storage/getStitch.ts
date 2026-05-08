import { STITCHES_STORE_NAME } from "@/lib/clipstitchr/constants/objectStoreNames";
import { getObjectStore } from "@/lib/clipstitchr/storage/getObjectStore";
import { requestToPromise } from "@/lib/clipstitchr/storage/requestToPromise";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";

export async function getStitch(id: string) {
  const { store } = await getObjectStore(STITCHES_STORE_NAME, "readonly");

  return requestToPromise<Stitch | undefined>(store.get(id));
}
