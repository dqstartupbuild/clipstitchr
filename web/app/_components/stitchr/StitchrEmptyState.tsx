import { UploadCloud } from "lucide-react";
import { SecondaryButtonLink } from "@/app/_components/SecondaryButtonLink";
import { Panel } from "@/app/_components/ui/Panel";
import { UPLOAD_CONTROLS_HREF } from "@/lib/clipstitchr/constants/uploadControlsHref";

export function StitchrEmptyState() {
  return (
    <Panel className="p-8 text-center">
      <UploadCloud aria-hidden className="mx-auto h-10 w-10 text-accent" />
      <h2 className="mt-4 text-xl font-bold text-text-primary">
        Upload at least one UGC and one demo video.
      </h2>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-text-secondary">
        Add both clip types to your library, then come back to create your
        first ad variant.
      </p>
      <SecondaryButtonLink href={UPLOAD_CONTROLS_HREF} className="mt-5">
        Go to Library
      </SecondaryButtonLink>
    </Panel>
  );
}
