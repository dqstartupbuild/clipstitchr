type PhotoNotificationInput = {
  avatarId?: string;
  name: string;
};

export function getPhotoNotificationCopy({
  avatarId,
  name,
}: PhotoNotificationInput) {
  if (avatarId) {
    return {
      title: "Avatar photo is ready",
      preview: `${name} is saved with your avatar photos.`,
      message: `Your avatar photo "${name}" is ready and saved with your avatar photos.`,
    };
  }

  return {
    title: "Photo upload is ready",
    preview: `${name} is saved in your photo library.`,
    message: `Your photo "${name}" finished uploading and is saved in your photo library.`,
  };
}
