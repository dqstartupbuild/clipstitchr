type CookieConsentBannerProps = {
  onAcceptAll: () => void;
  onEssentialsOnly: () => void;
};

export function CookieConsentBanner({
  onAcceptAll,
  onEssentialsOnly,
}: CookieConsentBannerProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] border-t border-border bg-white px-4 py-2.5 shadow-[0_-10px_24px_rgba(15,23,42,0.08)] sm:px-6 sm:py-3">
      <div className="mx-auto grid max-w-6xl gap-2.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="min-w-0">
          <p className="text-sm font-bold text-text-primary">
            ClipStitchr uses cookies
          </p>
          <p className="mt-1.5 max-w-full text-sm leading-5 text-text-secondary">
            Required cookies keep ClipStitchr working. Optional cookies help us
            understand what is helpful.
          </p>
        </div>
        <div className="grid min-w-0 gap-2 sm:w-72 sm:grid-cols-2">
          <button
            type="button"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-accent px-4 text-sm font-bold text-white transition-colors hover:bg-accent-dark sm:h-10"
            onClick={onAcceptAll}
          >
            Accept
          </button>
          <button
            type="button"
            className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-white px-4 text-sm font-bold text-text-primary transition-colors hover:border-accent sm:h-10"
            onClick={onEssentialsOnly}
          >
            Essentials only
          </button>
        </div>
      </div>
    </div>
  );
}
