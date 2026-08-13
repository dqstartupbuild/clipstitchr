import { handleStudioStitchRunLifecycleRequest } from "@/lib/clipstitchr/server/studio/stitch/handleStudioStitchRunLifecycleRequest";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { readonly params: Promise<{ readonly id: string }> },
) {
  return await handleStudioStitchRunLifecycleRequest(
    "retry",
    request,
    context,
  );
}
