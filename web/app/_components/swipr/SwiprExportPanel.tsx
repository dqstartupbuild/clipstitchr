import { Download } from "lucide-react";
import { Button } from "@/app/_components/ui/Button";
import { Panel } from "@/app/_components/ui/Panel";
import { ProgressBar } from "@/app/_components/ui/ProgressBar";
import type { SwiprExportStatus } from "@/lib/clipstitchr/types/SwiprExportStatus";
import { getSwiprExportMessage } from "@/lib/clipstitchr/utils/getSwiprExportMessage";

type SwiprExportPanelProps = {
  status: SwiprExportStatus;
  progress: number;
  error: string | null;
  isDisabled: boolean;
  onExport: () => void;
};

export function SwiprExportPanel({
  status,
  progress,
  error,
  isDisabled,
  onExport,
}: SwiprExportPanelProps) {
  const isRendering = status === "rendering";

  return (
    <Panel className="p-5">
      <div className="mb-4">
        <p className="text-sm font-semibold text-accent-dark">Export</p>
        <h2 className="mt-1 text-lg font-bold text-text-primary">
          Download ZIP
        </h2>
      </div>
      <div className="flex flex-col gap-4">
        <ProgressBar value={progress} />
        <p className="text-sm font-semibold text-text-secondary">
          {error ?? getSwiprExportMessage(status)}
        </p>
        <Button
          type="button"
          icon={<Download aria-hidden className="h-4 w-4" />}
          isLoading={isRendering}
          disabled={isDisabled}
          onClick={onExport}
        >
          Export carousel
        </Button>
      </div>
    </Panel>
  );
}
