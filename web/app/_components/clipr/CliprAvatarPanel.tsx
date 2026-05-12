import { UserRound } from "lucide-react";
import { SelectInput } from "@/app/_components/ui/SelectInput";
import type { Avatar } from "@/lib/clipstitchr/types/Avatar";
import type { PhotoAssetMetadata } from "@/lib/clipstitchr/types/PhotoAssetMetadata";

type CliprAvatarPanelProps = {
  avatars: Avatar[];
  photos: PhotoAssetMetadata[];
  selectedAvatarId: string;
  onChange: (avatarId: string) => void;
};

export function CliprAvatarPanel({
  avatars,
  photos,
  selectedAvatarId,
  onChange,
}: CliprAvatarPanelProps) {
  const avatarOptions = avatars.map((avatar) => {
    const photoCount = photos.filter((photo) => photo.avatarId === avatar.id).length;

    return {
      label: `${avatar.name} (${photoCount})`,
      value: avatar.id,
    };
  });

  return (
    <section>
      <div className="mb-3 flex items-center gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface-muted text-accent">
          <UserRound aria-hidden className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-accent-dark">Avatar</p>
          <h2 className="mt-0.5 text-base font-bold text-text-primary">
            Character
          </h2>
        </div>
      </div>
      <SelectInput
        label="Avatar"
        value={selectedAvatarId}
        options={avatarOptions}
        disabled={!avatarOptions.length}
        onChange={(event) => onChange(event.target.value)}
      />
      {!avatarOptions.length ? (
        <p className="mt-3 rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm font-semibold text-text-secondary">
          Add avatar photos before generating a Clip.
        </p>
      ) : null}
    </section>
  );
}
