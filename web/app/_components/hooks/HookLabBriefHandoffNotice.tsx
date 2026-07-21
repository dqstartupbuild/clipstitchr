import type { HookLabCreativeBrief } from "@/lib/clipstitchr/types/HookLabCreativeBrief";

export function HookLabBriefHandoffNotice({
  brief,
  isLoading,
}: {
  brief: HookLabCreativeBrief | null;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <p className="rounded-lg bg-surface-muted p-4 text-sm text-text-secondary">
        Loading your Hook Lab brief…
      </p>
    );
  }

  if (!brief) {
    return null;
  }

  return (
    <section className="rounded-lg bg-surface-muted p-4" aria-label="Hook Lab brief">
      <p className="text-sm font-bold text-text-primary">
        Hook Lab brief: {brief.brief.directionName}
      </p>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        {brief.brief.openingVisual} Review the loaded direction, choose your
        media, then create when it feels right.
      </p>
    </section>
  );
}
