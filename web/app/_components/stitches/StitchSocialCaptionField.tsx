"use client";

import { Copy } from "lucide-react";
import { Button } from "@/app/_components/ui/Button";

type StitchSocialCaptionFieldProps = {
  copyMessage: string | null;
  socialCaption: string;
  onChange: (socialCaption: string) => void;
  onCopy: () => void;
};

export function StitchSocialCaptionField({
  copyMessage,
  socialCaption,
  onChange,
  onCopy,
}: StitchSocialCaptionFieldProps) {
  return (
    <div className="grid gap-3">
      <label className="block">
        <span className="text-sm font-semibold text-text-primary">
          Caption and hashtags
        </span>
        <textarea
          value={socialCaption}
          rows={5}
          className="mt-2 min-h-28 w-full resize-y rounded-lg border border-border bg-white px-3 py-2 text-sm leading-6 text-text-primary outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/15"
          placeholder="Write a caption and 3-5 hashtags for this stitch."
          onChange={(event) => onChange(event.currentTarget.value)}
        />
      </label>
      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          icon={<Copy aria-hidden className="h-4 w-4" />}
          disabled={!socialCaption.trim()}
          onClick={onCopy}
        >
          Copy
        </Button>
      </div>
      {copyMessage ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
          {copyMessage}
        </p>
      ) : null}
    </div>
  );
}
