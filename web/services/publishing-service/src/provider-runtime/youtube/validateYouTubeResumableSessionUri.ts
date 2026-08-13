import { ProviderRuntimeError } from "../errors/ProviderRuntimeError.js";

export const validateYouTubeResumableSessionUri = (value: string): string => {
  try {
    const url = new URL(value);
    const keys = [...url.searchParams.keys()];
    const uploadId = url.searchParams.get("upload_id");
    const uploadType = url.searchParams.get("uploadType");
    const part = url.searchParams.get("part");
    const notifySubscribers = url.searchParams.get("notifySubscribers");
    if (
      url.protocol !== "https:" ||
      url.host !== "www.googleapis.com" ||
      url.username.length > 0 ||
      url.password.length > 0 ||
      url.pathname !== "/upload/youtube/v3/videos" ||
      url.hash.length > 0 ||
      uploadId === null ||
      uploadId.length < 1 ||
      uploadId.length > 1_024 ||
      (uploadType !== null && uploadType !== "resumable") ||
      (part !== null && part !== "id,snippet,status") ||
      (notifySubscribers !== null && notifySubscribers !== "true") ||
      keys.some(
        (key) =>
          key !== "upload_id" &&
          key !== "uploadType" &&
          key !== "part" &&
          key !== "notifySubscribers",
      ) ||
      url.searchParams.getAll("upload_id").length !== 1 ||
      url.searchParams.getAll("uploadType").length > 1 ||
      url.searchParams.getAll("part").length > 1 ||
      url.searchParams.getAll("notifySubscribers").length > 1
    ) {
      throw new TypeError("Invalid session URI");
    }
    return url.toString();
  } catch {
    throw new ProviderRuntimeError("youtube", "invalid_response");
  }
};
