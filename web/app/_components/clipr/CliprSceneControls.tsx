import { Image as ImageIcon } from "lucide-react";
import { avatarSceneControlMaxLength } from "@/lib/clipstitchr/constants/avatarSceneControlMaxLength";

type CliprSceneControlsProps = {
  location: string;
  outfit: string;
  pose: string;
  onLocationChange: (location: string) => void;
  onOutfitChange: (outfit: string) => void;
  onPoseChange: (pose: string) => void;
};

export function CliprSceneControls({
  location,
  outfit,
  pose,
  onLocationChange,
  onOutfitChange,
  onPoseChange,
}: CliprSceneControlsProps) {
  return (
    <section className="lg:col-span-2">
      <div className="mb-3 flex items-center gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface-muted text-accent">
          <ImageIcon aria-hidden className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-accent-dark">Avatar</p>
          <h2 className="mt-0.5 text-base font-bold text-text-primary">
            Scene
          </h2>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <label>
          <span className="text-sm font-semibold text-text-primary">
            Background
          </span>
          <input
            type="text"
            value={location}
            maxLength={avatarSceneControlMaxLength}
            placeholder="Auto"
            className="mt-1 h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent"
            onChange={(event) => onLocationChange(event.currentTarget.value)}
          />
        </label>
        <label>
          <span className="text-sm font-semibold text-text-primary">
            Pose or action
          </span>
          <input
            type="text"
            value={pose}
            maxLength={avatarSceneControlMaxLength}
            placeholder="Auto"
            className="mt-1 h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent"
            onChange={(event) => onPoseChange(event.currentTarget.value)}
          />
        </label>
        <label>
          <span className="text-sm font-semibold text-text-primary">
            Outfit
          </span>
          <input
            type="text"
            value={outfit}
            maxLength={avatarSceneControlMaxLength}
            placeholder="Auto"
            className="mt-1 h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent"
            onChange={(event) => onOutfitChange(event.currentTarget.value)}
          />
        </label>
      </div>
    </section>
  );
}
