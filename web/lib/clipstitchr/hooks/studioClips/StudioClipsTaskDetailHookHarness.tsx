import { useStudioClipsTaskDetail } from "./useStudioClipsTaskDetail";

type StudioClipsTaskDetailHookHarnessProps = {
  taskId: string;
};

export function StudioClipsTaskDetailHookHarness({
  taskId,
}: StudioClipsTaskDetailHookHarnessProps) {
  const detail = useStudioClipsTaskDetail("product_1", taskId);

  return (
    <output>
      {detail.task?.id ?? (detail.isLoading ? "loading" : "empty")}
    </output>
  );
}
