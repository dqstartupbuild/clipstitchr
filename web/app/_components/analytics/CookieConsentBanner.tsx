type CookieConsentBannerProps = {
  onAcceptAll: () => void;
  onEssentialsOnly: () => void;
};

export function CookieConsentBanner({
  onAcceptAll,
  onEssentialsOnly,
}: CookieConsentBannerProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] border-t border-border bg-white px-4 py-3 shadow-[0_-10px_24px_rgba(15,23,42,0.08)] sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <p className="text-sm font-bold text-text-primary">
            ClipStitchr uses cookies
          </p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Required cookies keep the app working. Optional analytics and
            marketing cookies help measure attribution and improve growth.
          </p>
        </div>
        <div className="grid gap-2 sm:w-72 sm:grid-cols-2">
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-accent px-4 text-sm font-bold text-white transition-colors hover:bg-accent-dark"
            onClick={onAcceptAll}
          >
            Accept
          </button>
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-white px-4 text-sm font-bold text-text-primary transition-colors hover:border-accent"
            onClick={onEssentialsOnly}
          >
            Essentials only
          </button>
        </div>
      </div>
    </div>
  );
}
