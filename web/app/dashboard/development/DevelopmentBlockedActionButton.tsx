"use client";

import { useState } from "react";
import { Button } from "@/app/_components/ui/Button";

type DevelopmentBlockedActionButtonProps = {
  children: string;
  message?: string;
  variant?: "primary" | "secondary" | "subtle" | "danger";
};

export function DevelopmentBlockedActionButton({
  children,
  message = "This action is paused in Development preview. Sign in normally to use live services.",
  variant = "secondary",
}: DevelopmentBlockedActionButtonProps) {
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        type="button"
        variant={variant}
        onClick={() => setBlockedMessage(message)}
      >
        {children}
      </Button>
      {blockedMessage ? (
        <p className="max-w-md text-sm leading-5 text-amber-800" role="status">
          {blockedMessage}
        </p>
      ) : null}
    </div>
  );
}
