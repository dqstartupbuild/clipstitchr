import type { ChangeEvent } from "react";

type LocalSafeZoneImagePickerProps = {
  errorMessage: string | null;
  file: File | null;
  onFile: (file: File | null) => void;
};

export function LocalSafeZoneImagePicker({
  errorMessage,
  file,
  onFile,
}: LocalSafeZoneImagePickerProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onFile(event.target.files?.[0] ?? null);
  };

  return (
    <div className="marketing-card p-6">
      <label
        className="grid gap-3 text-sm font-bold text-text-primary"
        htmlFor="safe-zone-frame"
      >
        Add a screenshot or video frame
        <input
          accept="image/jpeg,image/png,image/webp"
          className="block w-full rounded-lg border border-border bg-white px-3 py-3 text-sm font-medium text-text-secondary file:mr-3 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-2 file:font-bold file:text-white"
          id="safe-zone-frame"
          onChange={handleChange}
          type="file"
        />
      </label>
      <p className="mt-3 text-sm leading-6 text-text-secondary">
        JPG, PNG, or WebP up to 20 MB. The image stays in this browser tab and
        is shown through a temporary local URL.
      </p>
      {file ? (
        <p className="mt-3 text-sm font-semibold text-text-primary">
          Previewing: {file.name}
        </p>
      ) : null}
      {errorMessage ? (
        <p
          className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
