"use client";

import { ArrowLeft, Wand2 } from "lucide-react";
import { Button } from "@/app/_components/ui/Button";
import { SecondaryButtonLink } from "@/app/_components/SecondaryButtonLink";

type CreateVideoHeaderProps = {
  canCreate: boolean;
  isCreating: boolean;
  onCreate: () => void;
};

export function CreateVideoHeader({
  canCreate,
  isCreating,
  onCreate,
}: CreateVideoHeaderProps) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <SecondaryButtonLink
          href="/dashboard"
          icon={<ArrowLeft aria-hidden className="h-4 w-4" />}
        >
          Dashboard
        </SecondaryButtonLink>
        <h1 className="mt-5 text-3xl font-bold text-text-primary">
          Create Video
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
          Select one normalized UGC clip and one normalized demo video.
        </p>
      </div>
      <Button
        type="button"
        disabled={!canCreate}
        isLoading={isCreating}
        icon={<Wand2 aria-hidden className="h-4 w-4" />}
        onClick={onCreate}
      >
        Create Video
      </Button>
    </header>
  );
}
