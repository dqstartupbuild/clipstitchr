import { getBlogImageR2KeyFromRoutePath } from "@/lib/clipstitchr/server/blog/getBlogImageR2KeyFromRoutePath";
import { readBlogImageObject } from "@/lib/clipstitchr/server/blog/readBlogImageObject";
import { toBlogImageResponseBody } from "@/lib/clipstitchr/server/blog/toBlogImageResponseBody";

export const runtime = "nodejs";

type BlogImageRouteProps = {
  params: Promise<{ path: string[] }>;
};

export async function GET(_request: Request, { params }: BlogImageRouteProps) {
  try {
    const { path } = await params;
    const key = getBlogImageR2KeyFromRoutePath(path);
    const image = await readBlogImageObject(key);

    return new Response(toBlogImageResponseBody(image.body), {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": image.contentType,
      },
    });
  } catch {
    return Response.json({ error: "Blog image not found." }, { status: 404 });
  }
}
