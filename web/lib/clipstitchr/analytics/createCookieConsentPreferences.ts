import type { CookieConsentPreferences } from "@/lib/clipstitchr/analytics/CookieConsentPreferences";
import { cookieConsentVersion } from "@/lib/clipstitchr/analytics/cookieConsentVersion";

type CreateCookieConsentPreferencesOptions = {
  analytics: boolean;
  marketing: boolean;
};

export function createCookieConsentPreferences({
  analytics,
  marketing,
}: CreateCookieConsentPreferencesOptions): CookieConsentPreferences {
  return {
    version: cookieConsentVersion,
    necessary: true,
    analytics,
    marketing,
    updatedAt: new Date().toISOString(),
  };
}
