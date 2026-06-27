import { fetchPostBridgeAnalytics } from "@/lib/clipstitchr/client/fetchPostBridgeAnalytics";
import { fetchPostBridgePosts } from "@/lib/clipstitchr/client/fetchPostBridgePosts";

export const fetchPostBridgeDashboard = async () => {
  const [posts, analytics] = await Promise.all([
    fetchPostBridgePosts(),
    fetchPostBridgeAnalytics(),
  ]);

  return { analytics, posts };
};
