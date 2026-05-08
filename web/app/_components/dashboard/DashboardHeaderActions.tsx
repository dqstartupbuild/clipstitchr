import { Scissors } from "lucide-react";
import { PrimaryButtonLink } from "@/app/_components/PrimaryButtonLink";
import { UploadVideosButtonLink } from "@/app/_components/dashboard/UploadVideosButtonLink";

export function DashboardHeaderActions() {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <UploadVideosButtonLink />
      <PrimaryButtonLink
        href="/dashboard/stitchr"
        icon={<Scissors aria-hidden className="h-4 w-4" />}
      >
        Stitchr
      </PrimaryButtonLink>
    </div>
  );
}
