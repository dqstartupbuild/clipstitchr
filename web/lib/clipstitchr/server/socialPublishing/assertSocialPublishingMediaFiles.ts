import { assertSocialPublishingMediaFile } from "@/lib/clipstitchr/server/socialPublishing/assertSocialPublishingMediaFile";

export function assertSocialPublishingMediaFiles(files: File[]) {
  if (!files.length) {
    throw new Error("Choose media before scheduling.");
  }

  for (const file of files) {
    assertSocialPublishingMediaFile(file);
  }
}
