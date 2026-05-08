import { STITCHES_STORE_NAME } from "@/lib/clipstitchr/constants/objectStoreNames";
import { getObjectStore } from "@/lib/clipstitchr/storage/getObjectStore";
import { requestToPromise } from "@/lib/clipstitchr/storage/requestToPromise";

export async function deleteStitch(id: string) {
  const { store } = await getObjectStore(STITCHES_STORE_NAME, "readwrite");
  await requestToPromise(store.delete(id));
}
