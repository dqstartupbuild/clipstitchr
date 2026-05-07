import { UploadCloud } from "lucide-react";
import { SecondaryButtonLink } from "@/app/_components/SecondaryButtonLink";

export function DashboardHeader() {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm font-semibold text-accent-dark">Workspace</p>
        <h1 className="mt-2 text-3xl font-bold text-text-primary">
          Clipr Dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
          Normalize UGC clips and product demos locally, then combine them into
          downloadable 9:16 videos.
        </p>
      </div>
      <SecondaryButtonLink
        href="#upload-panel"
        icon={<UploadCloud aria-hidden className="h-4 w-4" />}
      >
        Upload Videos
      </SecondaryButtonLink>
    </header>
  );
}
