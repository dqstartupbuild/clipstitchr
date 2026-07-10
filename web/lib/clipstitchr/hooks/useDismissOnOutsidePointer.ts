import { useEffect, type RefObject } from "react";

type UseDismissOnOutsidePointerOptions = {
  containerRef: RefObject<HTMLElement | null>;
  isEnabled: boolean;
  onDismiss: () => void;
};

export function useDismissOnOutsidePointer({
  containerRef,
  isEnabled,
  onDismiss,
}: UseDismissOnOutsidePointerOptions) {
  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (
        !(target instanceof Node) ||
        containerRef.current?.contains(target)
      ) {
        return;
      }

      onDismiss();
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [containerRef, isEnabled, onDismiss]);
}
