export function getGeneratedAvatarPhotoName({
  index,
  location,
  sourceName,
}: {
  index: number;
  location: string;
  sourceName: string;
}) {
  const trimmedLocation = location.trim();

  if (trimmedLocation) {
    return `${sourceName} - ${trimmedLocation} ${index}`;
  }

  return `${sourceName} - Avatar Photo ${index}`;
}
