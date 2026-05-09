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
import { dispatchShowUploadControlsEvent } from "@/lib/clipstitchr/utils/dispatchShowUploadControlsEvent";

const uploadControlsSearch = `${UPLOAD_CONTROLS_SEARCH_PARAM}=${UPLOAD_CONTROLS_SEARCH_PARAM_VALUE}`;

const uploadDestinations = [
  {
    assetType: "ugc",
    description: "Creator hooks, reactions, b-roll, and social proof.",
    href: `/dashboard/uploads?tab=ugc&${uploadControlsSearch}${UPLOAD_CONTROLS_HASH}`,
    icon: Video,
    label: "UGC clip",
    page: "/dashboard/uploads",
  },
  {
    assetType: "demo",
    description: "Product walkthroughs, screen recordings, and demos.",
    href: `/dashboard/uploads?tab=demo&${uploadControlsSearch}${UPLOAD_CONTROLS_HASH}`,
    icon: MonitorPlay,
    label: "Demo video",
    page: "/dashboard/uploads",
  },
  {
    assetType: "photo",
    description: "Avatar source photos for Swapr and AI photo generation.",
    href: `/dashboard/avatars?${uploadControlsSearch}${UPLOAD_CONTROLS_HASH}`,
    icon: ImagePlus,
    label: "Avatar photo",
    page: "/dashboard/avatars",
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
        className="bg-white"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
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
            className="absolute right-0 top-12 z-50 w-[min(20rem,calc(100vw-2rem))] rounded-lg border border-border bg-white p-2 shadow-xl shadow-slate-900/10"
          >
            <p className="px-2 py-2 text-xs font-bold uppercase tracking-wide text-text-tertiary">
              Upload
            </p>
            <div className="flex flex-col gap-1">
              {uploadDestinations.map((destination) => {
                const Icon = destination.icon;

                return (
                  <button
                    key={destination.href}
                    type="button"
                    className="flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    onClick={() => {
                      setIsOpen(false);
                      router.push(destination.href);

                      if (pathname === destination.page) {
                        dispatchShowUploadControlsEvent(destination.assetType);
                      }
                    }}
                  >
                    <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
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
