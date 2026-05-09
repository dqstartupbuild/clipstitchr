"use client";

import { useEffect, useState } from "react";
import { HIDE_UPLOAD_CONTROLS_EVENT_NAME } from "@/lib/clipstitchr/constants/hideUploadControlsEventName";
import { SHOW_UPLOAD_CONTROLS_EVENT_NAME } from "@/lib/clipstitchr/constants/showUploadControlsEventName";
import { getHasUploadControlsHash } from "@/lib/clipstitchr/utils/getHasUploadControlsHash";
import { getHasUploadControlsSearchParam } from "@/lib/clipstitchr/utils/getHasUploadControlsSearchParam";

export function useShowUploadControls() {
  const [showUploadControls, setShowUploadControls] = useState(false);

  useEffect(() => {
    const syncShowUploadControls = () => {
      setShowUploadControls(
        getHasUploadControlsHash(window.location.hash) ||
          getHasUploadControlsSearchParam(window.location.search),
      );
    };
    const showUploadControlsFromEvent = () => {
      setShowUploadControls(true);
    };
    const hideUploadControlsFromEvent = () => {
      setShowUploadControls(false);
    };

    syncShowUploadControls();
    window.addEventListener("hashchange", syncShowUploadControls);
    window.addEventListener("popstate", syncShowUploadControls);
    window.addEventListener(
      HIDE_UPLOAD_CONTROLS_EVENT_NAME,
      hideUploadControlsFromEvent,
    );
    window.addEventListener(
      SHOW_UPLOAD_CONTROLS_EVENT_NAME,
      showUploadControlsFromEvent,
    );

    return () => {
      window.removeEventListener("hashchange", syncShowUploadControls);
      window.removeEventListener("popstate", syncShowUploadControls);
      window.removeEventListener(
        HIDE_UPLOAD_CONTROLS_EVENT_NAME,
        hideUploadControlsFromEvent,
      );
      window.removeEventListener(
        SHOW_UPLOAD_CONTROLS_EVENT_NAME,
        showUploadControlsFromEvent,
      );
    };
  }, []);

  return showUploadControls;
}
