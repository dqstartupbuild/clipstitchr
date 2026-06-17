"use client";

import { StitchSocialCaptionCopyButton } from "@/app/_components/stitches/StitchSocialCaptionCopyButton";

type SwiprSocialCaptionFieldProps = {
  copyMessage: string | null;
  socialCaption: string;
  onChange: (socialCaption: string) => void;
  onCopyError: () => void;
  onCopySuccess: () => void;
};

export function SwiprSocialCaptionField({
  copyMessage,
  socialCaption,
  onChange,
  onCopyError,
  onCopySuccess,
}: SwiprSocialCaptionFieldProps) {
  return (
    <div className="grid gap-3">
      <label className="block">
        <span className="text-sm font-semibold text-text-primary">
          Caption, description, and hashtags
        </span>
        <textarea
          value={socialCaption}
          rows={10}
          className="mt-2 min-h-64 w-full resize-y rounded-lg border border-border bg-white px-3 py-2 text-sm leading-6 text-text-primary outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/15"
          placeholder="Add the caption, a longer post description, and hashtags here."
          onChange={(event) => onChange(event.currentTarget.value)}
        />
      </label>
      <div className="flex justify-end">
        <StitchSocialCaptionCopyButton
          socialCaption={socialCaption}
          onCopyError={onCopyError}
          onCopySuccess={onCopySuccess}
        />
      </div>
      {copyMessage ? (
        <p className="rounded-md border border-purple-200 bg-purple-50 px-2 py-1 text-xs font-semibold text-accent-dark">
          {copyMessage}
        </p>
      ) : null}
    </div>
  );
}
