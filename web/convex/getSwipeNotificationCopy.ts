type SwipeNotificationInput = {
  name: string;
  productName: string;
};

export function getSwipeNotificationCopy({
  name,
  productName,
}: SwipeNotificationInput) {
  return {
    title: "Swipe is ready",
    preview: `${name} is saved for ${productName}.`,
    message: `Your Swipe "${name}" is ready for ${productName}. You can review it from the Swipr page or your library.`,
  };
}
