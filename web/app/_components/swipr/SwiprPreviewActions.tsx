import { Download, Save } from "lucide-react";
import { Button } from "@/app/_components/ui/Button";
import { ProgressBar } from "@/app/_components/ui/ProgressBar";
import type { SwiprExportStatus } from "@/lib/clipstitchr/types/SwiprExportStatus";
import { getSwiprExportMessage } from "@/lib/clipstitchr/utils/getSwiprExportMessage";

type SwiprPreviewActionsProps = {
  saveMessage: string | null;
  isSaveDisabled: boolean;
  isSaving: boolean;
  exportStatus: SwiprExportStatus;
  exportProgress: number;
  exportError: string | null;
  isExportDisabled: boolean;
  onSave: () => void;
  onExport: () => void;
};

export function SwiprPreviewActions({
  saveMessage,
  isSaveDisabled,
  isSaving,
  exportStatus,
  exportProgress,
  exportError,
  isExportDisabled,
  onSave,
  onExport,
}: SwiprPreviewActionsProps) {
  const isRendering = exportStatus === "rendering";
  const exportMessage = exportError ?? getSwiprExportMessage(exportStatus);
  const shouldShowProgress = exportStatus !== "idle" || Boolean(exportError);

  return (
    <div className="grid gap-2 sm:justify-items-end">
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end">
        <Button
          type="button"
          className="w-full sm:w-auto"
          size="sm"
          icon={<Save aria-hidden className="h-4 w-4" />}
          isLoading={isSaving}
          disabled={isSaveDisabled}
          onClick={onSave}
        >
          Save
        </Button>
        <Button
          type="button"
          className="w-full sm:w-auto"
          variant="secondary"
          size="sm"
          icon={<Download aria-hidden className="h-4 w-4" />}
          isLoading={isRendering}
          disabled={isExportDisabled}
          onClick={onExport}
        >
          Download
        </Button>
      </div>
      <div className="grid max-w-72 gap-2 text-xs font-semibold text-text-secondary sm:text-right">
        {shouldShowProgress ? <ProgressBar value={exportProgress} /> : null}
        {saveMessage ? <p>{saveMessage}</p> : null}
        <p>{exportMessage}</p>
      </div>
    </div>
  );
}
