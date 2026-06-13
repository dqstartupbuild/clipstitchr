"use client";

import { useState } from "react";
import { StitchSocialCaptionField } from "@/app/_components/stitches/StitchSocialCaptionField";
import { Panel } from "@/app/_components/ui/Panel";

type StitchrSocialCaptionPanelProps = {
  socialCaption: string;
  onChange: (socialCaption: string) => void;
};

export function StitchrSocialCaptionPanel({
  socialCaption,
  onChange,
}: StitchrSocialCaptionPanelProps) {
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  return (
    <Panel className="p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-text-primary">Caption</h2>
      </div>
      <StitchSocialCaptionField
        copyMessage={copyMessage}
        socialCaption={socialCaption}
        onChange={(nextSocialCaption) => {
          setCopyMessage(null);
          onChange(nextSocialCaption);
        }}
        onCopyError={() => setCopyMessage("Could not copy that caption.")}
        onCopySuccess={() => setCopyMessage("Copied.")}
      />
    </Panel>
  );
}
