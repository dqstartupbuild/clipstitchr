type HookLabLiveRegionProps = {
  message: string | null;
};

export function HookLabLiveRegion({ message }: HookLabLiveRegionProps) {
  return (
    <p aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </p>
  );
}
