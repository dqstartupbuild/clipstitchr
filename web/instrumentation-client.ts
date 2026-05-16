import posthog from "posthog-js";

const postHogProjectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;

if (postHogProjectToken) {
  posthog.init(postHogProjectToken, {
    api_host: "/ingest",
    ui_host: "https://us.posthog.com",
    defaults: "2026-01-30",
    autocapture: {
      dom_event_allowlist: ["click", "change", "submit"],
      element_allowlist: ["a", "button", "form", "input", "select", "textarea"],
      element_attribute_ignorelist: [
        "aria-label",
        "placeholder",
        "title",
        "value",
      ],
    },
    capture_exceptions: true,
    capture_pageleave: true,
    capture_pageview: false,
    capture_performance: true,
    disable_scroll_properties: false,
    mask_all_text: true,
    mask_personal_data_properties: true,
    opt_out_capturing_by_default: true,
    opt_out_persistence_by_default: true,
    person_profiles: "identified_only",
    debug: process.env.NODE_ENV === "development",
  });
}
