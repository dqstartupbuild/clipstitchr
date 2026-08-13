import { createStudioEditorProjectFromVideoSource } from "@/lib/clipstitchr/media/studioEditor/createStudioEditorProjectFromVideoSource";
import type { StudioEditorMediaSourceDescriptor } from "@/lib/clipstitchr/types/studioEditor/StudioEditorMediaSourceDescriptor";
import { createId } from "@/lib/clipstitchr/utils/createId";

export function createStudioEditorBriefHandoffProject({
  briefTitle,
  productId,
  source,
}: {
  briefTitle: string;
  productId: string;
  source: StudioEditorMediaSourceDescriptor;
}) {
  const project = createStudioEditorProjectFromVideoSource(productId, source);
  const title = briefTitle.trim() || "Research brief";

  return {
    ...project,
    id: `brief-${createId()}`,
    name: `${title}${/\bedit$/i.test(title) ? "" : " edit"}`.slice(0, 200),
  };
}
