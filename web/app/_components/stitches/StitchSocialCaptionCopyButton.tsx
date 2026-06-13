"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/app/_components/ui/Button";
import { IconButton } from "@/app/_components/ui/IconButton";

type StitchSocialCaptionCopyButtonProps = {
  socialCaption: string;
  variant?: "button" | "icon";
  onCopyError?: () => void;
  onCopySuccess?: () => void;
};

const copiedDurationMs = 1500;

export function StitchSocialCaptionCopyButton({
  socialCaption,
  variant = "button",
  onCopyError,
  onCopySuccess,
}: StitchSocialCaptionCopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trimmedCaption = socialCaption.trim();
  const icon = isCopied ? (
    <Check aria-hidden className="h-4 w-4" />
  ) : (
    <Copy aria-hidden className="h-4 w-4" />
  );
  const handleCopy = () => {
    const clipboard = globalThis.navigator?.clipboard;

    if (!trimmedCaption || !clipboard) {
      onCopyError?.();
      return;
    }

    void clipboard
      .writeText(trimmedCaption)
      .then(() => {
        onCopySuccess?.();
        setIsCopied(true);

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          setIsCopied(false);
          timeoutRef.current = null;
        }, copiedDurationMs);
      })
      .catch(() => {
        onCopyError?.();
      });
  };

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    },
    [],
  );

  if (variant === "icon") {
    return (
      <IconButton
        type="button"
        label={isCopied ? "Caption copied" : "Copy caption and hashtags"}
        icon={icon}
        disabled={!trimmedCaption}
        onClick={handleCopy}
      />
    );
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="secondary"
      icon={icon}
      disabled={!trimmedCaption}
      onClick={handleCopy}
    >
      {isCopied ? "Copied" : "Copy"}
    </Button>
  );
}
