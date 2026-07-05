import Image from "next/image";
import { Images, Library, Scissors, UserRound } from "lucide-react";

const featureLabels = [
  {
    icon: Library,
    label: "Library",
  },
  {
    icon: Scissors,
    label: "Hook/UGC + demo Stitches",
  },
  {
    icon: Images,
    label: "Swipr carousel tools",
  },
  {
    icon: UserRound,
    label: "Avatar-made clips",
  },
];

export function AuthProductPreview() {
  return (
    <div className="mt-10 overflow-hidden rounded-lg border border-border bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="border-b border-border bg-surface-elevated p-5 lg:border-b-0 lg:border-r">
          <p className="text-xs font-semibold uppercase text-text-tertiary">
            Inside ClipStitchr
          </p>
          <div className="mt-4 grid gap-3">
            {featureLabels.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-text-primary"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent-dark">
                  <Icon aria-hidden className="h-4 w-4" />
                </span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative min-h-64 bg-[#f8fafc] p-3">
          <Image
            src="/mockups/clipstitchr-product-mockup.png"
            alt="ClipStitchr dashboard preview"
            width={1536}
            height={1024}
            className="h-full min-h-64 w-full rounded-md object-cover object-left-top"
            sizes="(min-width: 1024px) 44vw, 100vw"
            priority
          />
        </div>
      </div>
    </div>
  );
}
