"use client";

import { openCookiePreferencesEventName } from "@/lib/clipstitchr/analytics/openCookiePreferencesEventName";

export function CookiePreferencesButton() {
  const handleClick = () => {
    window.dispatchEvent(new Event(openCookiePreferencesEventName));
  };

  return (
    <button type="button" className="btn-secondary" onClick={handleClick}>
      Manage cookies
    </button>
  );
}
