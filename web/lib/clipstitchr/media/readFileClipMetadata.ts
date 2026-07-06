import { createMediaInput } from "@/lib/clipstitchr/media/createMediaInput";
import { getClipMetadata } from "@/lib/clipstitchr/media/getClipMetadata";

export async function readFileClipMetadata(file: File) {
  const input = createMediaInput(file);

  try {
    return await getClipMetadata(input);
  } finally {
    input.dispose();
  }
}
