import Image from "next/image";

type CaseStudyFeatureImageProps = {
  alt: string;
  caption: string;
  src: string;
};

export function CaseStudyFeatureImage({
  alt,
  caption,
  src,
}: CaseStudyFeatureImageProps) {
  return (
    <figure className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
      <Image
        src={src}
        alt={alt}
        width={1200}
        height={675}
        className="aspect-video w-full object-cover"
        loading="eager"
        preload={false}
        sizes="(min-width: 1024px) 72rem, 100vw"
      />
      <figcaption className="px-4 py-3 text-sm text-text-tertiary">
        {caption}
      </figcaption>
    </figure>
  );
}
