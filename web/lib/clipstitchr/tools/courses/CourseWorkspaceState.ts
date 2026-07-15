import type { CourseProgressItemState } from "@/lib/clipstitchr/tools/courses/CourseProgressItemState";

export type CourseWorkspaceState = Readonly<{
  activatedAt?: number;
  availableSectionCount: number;
  hasAccess: boolean;
  hasSession: boolean;
  progressItems: readonly CourseProgressItemState[];
}>;
