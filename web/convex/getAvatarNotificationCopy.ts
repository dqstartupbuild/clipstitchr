type AvatarNotificationInput = {
  name: string;
};

export function getAvatarNotificationCopy({ name }: AvatarNotificationInput) {
  return {
    title: "Avatar is ready",
    preview: `${name} is saved in your avatars.`,
    message: `Your avatar "${name}" is ready. You can use it with this product for Clipr and Swapr.`,
  };
}
