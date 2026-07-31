"use client";

import { useState } from "react";
import { SocialPublishingAcceptanceComposeDialog } from "./SocialPublishingAcceptanceComposeDialog";
import { Button } from "@/app/_components/ui/Button";

export function SocialPublishingComposeFixture() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <section
      className="rounded-lg bg-surface p-4 sm:p-6"
      aria-labelledby="browser-compose-workflow"
    >
      <h2
        id="browser-compose-workflow"
        className="text-xl font-bold text-text-primary"
      >
        Compose and publish
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
        Exercise the same account, platform, consent, and scheduling controls
        used by the dashboard without contacting TikTok or Instagram.
      </p>
      <div className="mt-4">
        <Button
          type="button"
          onClick={() => {
            setMessage(null);
            setIsOpen(true);
          }}
        >
          Open compose workflow
        </Button>
      </div>
      {message ? (
        <p className="mt-3 text-sm font-semibold text-emerald-300" role="status">
          {message}
        </p>
      ) : null}
      {isOpen ? (
        <SocialPublishingAcceptanceComposeDialog
          onClose={() => setIsOpen(false)}
          onComplete={() => {
            setMessage("Acceptance post is ready for its selected schedule.");
            setIsOpen(false);
          }}
        />
      ) : null}
    </section>
  );
}
