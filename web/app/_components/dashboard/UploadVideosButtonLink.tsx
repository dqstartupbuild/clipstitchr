"use client";

import { UploadCloud } from "lucide-react";
import { usePathname } from "next/navigation";
import { SecondaryButtonLink } from "@/app/_components/SecondaryButtonLink";
import { UPLOAD_CONTROLS_HREF } from "@/lib/clipr/constants/uploadControlsHref";
import { dispatchShowUploadControlsEvent } from "@/lib/clipr/utils/dispatchShowUploadControlsEvent";

export function UploadVideosButtonLink() {
  const pathname = usePathname();

  return (
    <SecondaryButtonLink
      href={UPLOAD_CONTROLS_HREF}
      icon={<UploadCloud aria-hidden className="h-4 w-4" />}
      onClick={() => {
        if (pathname === "/dashboard/uploads") {
          dispatchShowUploadControlsEvent();
        }
      }}
    >
      Upload
    </SecondaryButtonLink>
  );
}
