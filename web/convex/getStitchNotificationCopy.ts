type StitchNotificationInput = {
  demoClipName: string;
  name: string;
  ugcClipName: string;
};

export function getStitchNotificationCopy({
  demoClipName,
  name,
  ugcClipName,
}: StitchNotificationInput) {
  return {
    title: "Stitch is ready",
    preview: `${name} is saved in your Stitches.`,
    message: `Your Stitch "${name}" is ready. It combines "${ugcClipName}" with "${demoClipName}" and is saved in your Stitches.`,
  };
}
