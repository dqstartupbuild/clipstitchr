export function formatTikTokPrivacyLevel(value: string) {
  const labels: Record<string, string> = {
    FOLLOWER_OF_CREATOR: "Followers",
    MUTUAL_FOLLOW_FRIENDS: "Friends you follow back",
    PUBLIC_TO_EVERYONE: "Everyone",
    SELF_ONLY: "Only me",
  };
  return labels[value] ?? value.replaceAll("_", " ").toLowerCase();
}
