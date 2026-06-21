/* eslint-disable @next/next/no-img-element */

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
    <figure className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
      <img src={src} alt={alt} className="aspect-video w-full object-cover" />
      <figcaption className="px-4 py-3 text-sm text-text-tertiary">
        {caption}
      </figcaption>
    </figure>
  );
}
