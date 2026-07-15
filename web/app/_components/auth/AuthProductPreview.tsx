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
    <figure className="auth-product-preview">
      <div className="auth-product-image">
        <Image
          src="/mockups/clipstitchr-product-mockup.png"
          alt="ClipStitchr dashboard preview"
          width={1536}
          height={1024}
          className="h-full min-h-64 w-full object-cover object-left-top"
          sizes="(min-width: 1024px) 44vw, 100vw"
          priority
        />
      </div>
      <figcaption>
        {featureLabels.map(({ icon: Icon, label }, index) => (
          <div key={label}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <Icon aria-hidden />
            <strong>{label}</strong>
          </div>
        ))}
      </figcaption>
    </figure>
  );
}
