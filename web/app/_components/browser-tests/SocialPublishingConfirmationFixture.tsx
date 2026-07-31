"use client";

import { useState } from "react";
import { Button } from "@/app/_components/ui/Button";
import { ConfirmActionDialog } from "@/app/_components/ui/ConfirmActionDialog";

export function SocialPublishingConfirmationFixture() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("No action taken.");

  return (
    <section
      className="rounded-lg bg-surface p-4 sm:p-6"
      aria-labelledby="browser-confirmation-workflow"
    >
      <h2
        id="browser-confirmation-workflow"
        className="text-xl font-bold text-text-primary"
      >
        Destructive action confirmation
      </h2>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        Verify that account and schedule actions ask before making a change.
      </p>
      <div className="mt-4">
        <Button
          type="button"
          size="sm"
          variant="danger"
          onClick={() => setIsOpen(true)}
        >
          Review confirmation
        </Button>
      </div>
      <p className="mt-3 text-sm font-semibold text-text-secondary" role="status">
        {message}
      </p>
      <ConfirmActionDialog
        confirmLabel="Confirm action"
        description="This verifies the shared confirmation used by connected accounts and scheduled posts."
        isLoading={false}
        open={isOpen}
        title="Continue with this action?"
        onConfirm={() => {
          setMessage("Action confirmed.");
          setIsOpen(false);
        }}
        onOpenChange={setIsOpen}
      />
    </section>
  );
}
