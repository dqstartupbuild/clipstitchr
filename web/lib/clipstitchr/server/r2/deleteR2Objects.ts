import { deleteR2Object } from "@/lib/clipstitchr/server/r2/deleteR2Object";

export async function deleteR2Objects(keys: string[]) {
  await Promise.all(keys.map((key) => deleteR2Object(key)));
}
