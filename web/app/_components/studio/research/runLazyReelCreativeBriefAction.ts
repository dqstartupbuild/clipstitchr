import type { Dispatch, SetStateAction } from "react";

export async function runLazyReelCreativeBriefAction(
  id: string,
  action: string,
  work: () => Promise<unknown>,
  setBusy: Dispatch<
    SetStateAction<{ action: string; id: string } | null>
  >,
  setError: Dispatch<SetStateAction<string | null>>,
) {
  setError(null);
  setBusy({ action, id });

  try {
    await work();
  } catch (actionError) {
    setError(
      actionError instanceof Error
        ? actionError.message
        : "The brief could not be updated.",
    );
  } finally {
    setBusy(null);
  }
}
