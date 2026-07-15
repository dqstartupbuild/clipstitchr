"use client";

import {
  ChevronDown,
  ImagePlus,
  MonitorPlay,
  UploadCloud,
  Video,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/app/_components/ui/Button";
import { UPLOAD_CONTROLS_HASH } from "@/lib/clipstitchr/constants/uploadControlsHash";
import {
  UPLOAD_CONTROLS_SEARCH_PARAM,
  UPLOAD_CONTROLS_SEARCH_PARAM_VALUE,
} from "@/lib/clipstitchr/constants/uploadControlsSearchParam";
import { trackPostHogEvent } from "@/lib/clipstitchr/analytics/trackPostHogEvent";
import { dispatchShowUploadControlsEvent } from "@/lib/clipstitchr/utils/dispatchShowUploadControlsEvent";

const uploadControlsSearch = `${UPLOAD_CONTROLS_SEARCH_PARAM}=${UPLOAD_CONTROLS_SEARCH_PARAM_VALUE}`;

const uploadDestinations = [
  {
    assetType: "ugc",
    description: "Creator hooks, reactions, b-roll, or anything you want up front.",
    href: `/dashboard/library?tab=ugc&${uploadControlsSearch}${UPLOAD_CONTROLS_HASH}`,
    icon: Video,
    label: "Hook/UGC clip",
    page: "/dashboard/library",
  },
  {
    assetType: "demo",
    description: "The app walkthrough or screen recording that comes after Hook/UGC.",
    href: `/dashboard/library?tab=demo&${uploadControlsSearch}${UPLOAD_CONTROLS_HASH}`,
    icon: MonitorPlay,
    label: "Product demo",
    page: "/dashboard/library",
  },
  {
    assetType: "photo",
    description: "Photos for making more Hook/UGC clips when the library is thin.",
    href: `/dashboard/library?tab=avatars&${uploadControlsSearch}${UPLOAD_CONTROLS_HASH}`,
    icon: ImagePlus,
    label: "Avatar photo",
    page: "/dashboard/library",
  },
] as const;

export function UploadDestinationMenuButton() {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={menuRef} className="relative">
      <Button
        type="button"
        variant="secondary"
        icon={<UploadCloud aria-hidden className="h-4 w-4" />}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onClick={() => {
          if (!isOpen) {
            trackPostHogEvent("upload_menu_opened", {
              page_path: pathname,
            });
          }

          setIsOpen((currentValue) => !currentValue);
        }}
      >
        Upload
        <ChevronDown aria-hidden className="h-4 w-4 text-text-tertiary" />
      </Button>
      {isOpen ? (
        <>
          <button
            type="button"
            aria-label="Close upload menu"
            className="fixed inset-0 z-40 cursor-default bg-transparent"
            onClick={() => setIsOpen(false)}
          />
          <div
            role="dialog"
            aria-label="Choose upload type"
            className="dashboard-upload-menu absolute right-0 top-12 z-50 w-[min(21rem,calc(100vw-2rem))] rounded-lg border border-border bg-surface p-2 shadow-2xl shadow-black/30"
          >
            <p className="px-2 py-2 text-xs font-bold uppercase text-text-tertiary">
              Upload
            </p>
            <div className="flex flex-col gap-1">
              {uploadDestinations.map((destination) => {
                const Icon = destination.icon;

                return (
                  <button
                    key={destination.href}
                    type="button"
                    className="dashboard-upload-option flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    onClick={() => {
                      trackPostHogEvent("upload_destination_selected", {
                        asset_type: destination.assetType,
                        destination: destination.href,
                        page_path: pathname,
                      });
                      setIsOpen(false);
                      router.push(destination.href);

                      if (pathname === destination.page) {
                        dispatchShowUploadControlsEvent(destination.assetType);
                      }
                    }}
                  >
                    <span className="dashboard-upload-option-icon mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-surface-muted text-accent-dark">
                      <Icon aria-hidden className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-text-primary">
                        {destination.label}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-text-secondary">
                        {destination.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
