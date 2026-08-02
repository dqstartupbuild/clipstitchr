import { handlePublishingMediaRoute } from "@/app/api/publishing/media/[token]/handlePublishingMediaRoute";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export { handlePublishingMediaRoute as GET, handlePublishingMediaRoute as HEAD };
