"use client";

import { useEffect, useState } from "react";
import { SHOW_UPLOAD_CONTROLS_EVENT_NAME } from "@/lib/clipstitchr/constants/showUploadControlsEventName";
import { getHasUploadControlsHash } from "@/lib/clipstitchr/utils/getHasUploadControlsHash";

export function useShowUploadControls() {
  const [showUploadControls, setShowUploadControls] = useState(false);

  useEffect(() => {
    const syncShowUploadControls = () => {
      setShowUploadControls(getHasUploadControlsHash(window.location.hash));
    };
    const showUploadControlsFromEvent = () => {
      setShowUploadControls(true);
    };

    syncShowUploadControls();
    window.addEventListener("hashchange", syncShowUploadControls);
    window.addEventListener(
      SHOW_UPLOAD_CONTROLS_EVENT_NAME,
      showUploadControlsFromEvent,
    );

    return () => {
      window.removeEventListener("hashchange", syncShowUploadControls);
      window.removeEventListener(
        SHOW_UPLOAD_CONTROLS_EVENT_NAME,
        showUploadControlsFromEvent,
      );
    };
  }, []);

  return showUploadControls;
}
