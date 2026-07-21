import type { HookLabPost } from "@/lib/clipstitchr/types/HookLabPost";

export function HookLabPostCopySummary({ post }: { post: HookLabPost }) {
  if (!post.analysis) {
    return null;
  }

  const caption = post.analysis.caption?.trim() || post.sourceText?.trim();
  const onScreenText =
    post.analysis.onScreenText?.filter(Boolean) ??
    Array.from(
      new Set(
        post.analysis.timeline.flatMap((entry) =>
          entry.onScreenText ? [entry.onScreenText] : [],
        ),
      ),
    );

  return (
    <section aria-labelledby="hook-lab-report-copy">
      <h3
        className="text-xl font-bold text-text-primary"
        id="hook-lab-report-copy"
      >
        Words used in the post
      </h3>
      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        <div>
          <h4 className="font-bold text-text-primary">Caption</h4>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-text-secondary">
            {caption || "No caption was available."}
          </p>
        </div>
        <div>
          <h4 className="font-bold text-text-primary">On-screen text</h4>
          {onScreenText.length ? (
            <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm leading-6 text-text-secondary">
              {onScreenText.map((text, index) => (
                <li key={`${index}-${text}`}>{text}</li>
              ))}
            </ol>
          ) : (
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              No clear on-screen text was found.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
