import type { HookLabIdeaVariantStatus } from "@/lib/clipstitchr/types/HookLabIdeaVariantStatus";

export function getHookLabIdeaVariantStatusLabel(
  status: HookLabIdeaVariantStatus,
) {
  switch (status) {
    case "queued":
      return "Waiting to start";
    case "writing":
      return "Writing the hook";
    case "creating_opening":
      return "Creating the opening";
    case "finalizing":
      return "Putting the Stitch together";
    case "completed":
      return "Ready to review";
    case "failed":
      return "This version couldn’t finish";
  }
}
