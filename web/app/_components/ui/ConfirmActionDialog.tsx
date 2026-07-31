"use client";

import { Dialog } from "@base-ui/react/dialog";
import { Button } from "@/app/_components/ui/Button";

type ConfirmActionDialogProps = {
  confirmLabel: string;
  description: string;
  isLoading: boolean;
  open: boolean;
  title: string;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
};

export function ConfirmActionDialog({
  confirmLabel,
  description,
  isLoading,
  open,
  title,
  onConfirm,
  onOpenChange,
}: ConfirmActionDialogProps) {
  return (
    <Dialog.Root
      disablePointerDismissal={isLoading}
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isLoading) {
          onOpenChange(nextOpen);
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Viewport className="dashboard-dialog-viewport">
          <Dialog.Popup
            className="w-full max-w-md rounded-lg border border-border bg-white p-5"
            role="alertdialog"
          >
            <Dialog.Title className="text-balance text-xl font-bold text-text-primary">
              {title}
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-pretty text-sm leading-6 text-text-secondary">
              {description}
            </Dialog.Description>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <Dialog.Close
                className="ui-button inline-flex min-h-10 items-center justify-center rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-text-primary transition-colors hover:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isLoading}
              >
                Keep it
              </Dialog.Close>
              <Button
                isLoading={isLoading}
                type="button"
                variant="danger"
                onClick={onConfirm}
              >
                {confirmLabel}
              </Button>
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
