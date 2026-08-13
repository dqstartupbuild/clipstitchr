import { PublishingPosts } from "@/app/_components/publishing/posts/PublishingPosts";
import { readPublishingPostIdSearchParam } from "@/lib/clipstitchr/publishing/client/readPublishingPostIdSearchParam";
import { readPublishingPostStatusSearchParam } from "@/lib/clipstitchr/publishing/client/readPublishingPostStatusSearchParam";

type PublishingPostsPageProps = {
  searchParams?: Promise<{
    id?: string | string[];
    status?: string | string[];
  }>;
};

export default async function PublishingPostsPage({
  searchParams = Promise.resolve({}),
}: PublishingPostsPageProps = {}) {
  const { id, status } = await searchParams;
  return (
    <PublishingPosts
      initialPostId={readPublishingPostIdSearchParam(id)}
      initialStatus={readPublishingPostStatusSearchParam(status)}
    />
  );
}
