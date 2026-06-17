import { getCliprJsonText } from "@/lib/clipstitchr/server/getCliprJsonText";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { SwiprGeneratedSlideshow } from "@/lib/clipstitchr/types/SwiprGeneratedSlideshow";
import { createSwiprPostDescriptionFallback } from "@/lib/clipstitchr/utils/createSwiprPostDescriptionFallback";
import { createSwiprSocialCaption } from "@/lib/clipstitchr/utils/createSwiprSocialCaption";
import { normalizeSwiprPostDescription } from "@/lib/clipstitchr/utils/normalizeSwiprPostDescription";
import { sanitizeCliprGeneratedText } from "@/lib/clipstitchr/utils/sanitizeCliprGeneratedText";

function normalizeSlide(value: unknown) {
  return typeof value === "string"
    ? value.trim().replace(/\s+/g, " ").slice(0, 120)
    : "";
}

function normalizeHashtag(value: unknown) {
  const text =
    typeof value === "string"
      ? value
          .trim()
          .replace(/^#+/g, "")
          .replace(/[^a-z0-9]/gi, "")
          .toLowerCase()
      : "";

  return text ? `#${text}` : "";
}

function normalizeHashtags(value: unknown) {
  return Array.isArray(value)
    ? value.map(normalizeHashtag).filter(Boolean).slice(0, 5)
    : [];
}

function createFallbackSlide(index: number) {
  const slides = [
    "This is where it starts",
    "The easy answer misses the point",
    "The real fix is smaller",
    "Make it easier to repeat",
    "Save this for later",
  ];

  return slides[index % slides.length];
}

function normalizeSlides(value: unknown, slideCount: number) {
  const rawSlides = Array.isArray(value) ? value : [];
  const slides = rawSlides.map(normalizeSlide).filter(Boolean).slice(0, slideCount);

  while (slides.length < slideCount) {
    slides.push(createFallbackSlide(slides.length));
  }

  return slides;
}

export function parseSwiprGeneratedSlideshows({
  count,
  outputText,
  product,
  slideCount,
}: {
  count: number;
  outputText: string;
  product: ProductProfile;
  slideCount: number;
}): SwiprGeneratedSlideshow[] {
  const parsed = JSON.parse(getCliprJsonText(outputText)) as {
    slideshows?: unknown;
  };
  const rawSlideshows = Array.isArray(parsed.slideshows)
    ? parsed.slideshows
    : [];

  return rawSlideshows
    .slice(0, count)
    .map((entry): SwiprGeneratedSlideshow => {
      const slideshow =
        entry && typeof entry === "object"
          ? (entry as Record<string, unknown>)
          : {};
      const slides = normalizeSlides(slideshow.slides, slideCount);
      const hook = sanitizeCliprGeneratedText(
        typeof slideshow.hook === "string" ? slideshow.hook : slides[0],
        slides[0],
      );

      const caption = sanitizeCliprGeneratedText(
        typeof slideshow.caption === "string" ? slideshow.caption : "",
        hook,
      );
      const hashtags = normalizeHashtags(slideshow.hashtags);
      const description = normalizeSwiprPostDescription({
        fallback: createSwiprPostDescriptionFallback({
          caption,
          product,
          slides,
        }),
        value: slideshow.description,
      });

      return {
        caption,
        description,
        hashtags,
        hook,
        rationale: sanitizeCliprGeneratedText(
          typeof slideshow.rationale === "string" ? slideshow.rationale : "",
          "Generated from the saved product context.",
        ),
        slides,
        socialCaption: createSwiprSocialCaption({
          caption,
          description,
          hashtags,
        }),
      };
    });
}
