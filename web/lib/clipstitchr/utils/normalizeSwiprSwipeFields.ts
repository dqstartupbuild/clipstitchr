const SWIPE_CAPTION_MAX_LENGTH = 2200;
const SWIPE_DESCRIPTION_MAX_LENGTH = 4000;
const SWIPE_HASHTAG_MAX_COUNT = 12;
const SWIPE_HASHTAG_MAX_LENGTH = 64;
const SWIPE_NAME_MAX_LENGTH = 120;
const SWIPE_PRODUCT_CONTEXT_MAX_LENGTH = 2000;
const SWIPE_PRODUCT_NAME_MAX_LENGTH = 120;
const SWIPE_RATIONALE_MAX_LENGTH = 500;
const SWIPE_SOCIAL_CAPTION_MAX_LENGTH = 5000;

type NormalizeSwiprSwipeFieldsInput = {
  caption?: string;
  description?: string;
  hashtags?: string[];
  name: string;
  productContext: string;
  productName: string;
  rationale?: string;
  socialCaption?: string;
};

function normalizeRequiredText(value: string, maxLength: number) {
  return value.trim().slice(0, maxLength);
}

function normalizeOptionalText(value: string | undefined, maxLength: number) {
  const text = value?.trim().slice(0, maxLength) ?? "";

  return text || undefined;
}

function normalizeHashtags(hashtags: string[] | undefined) {
  const normalizedHashtags =
    hashtags
      ?.map((hashtag) => hashtag.trim().slice(0, SWIPE_HASHTAG_MAX_LENGTH))
      .filter(Boolean)
      .slice(0, SWIPE_HASHTAG_MAX_COUNT) ?? [];

  return normalizedHashtags.length ? normalizedHashtags : undefined;
}

export function normalizeSwiprSwipeFields(
  input: NormalizeSwiprSwipeFieldsInput,
) {
  return {
    caption: normalizeOptionalText(input.caption, SWIPE_CAPTION_MAX_LENGTH),
    description: normalizeOptionalText(
      input.description,
      SWIPE_DESCRIPTION_MAX_LENGTH,
    ),
    hashtags: normalizeHashtags(input.hashtags),
    name: normalizeRequiredText(input.name, SWIPE_NAME_MAX_LENGTH),
    productContext: normalizeRequiredText(
      input.productContext,
      SWIPE_PRODUCT_CONTEXT_MAX_LENGTH,
    ),
    productName: normalizeRequiredText(
      input.productName,
      SWIPE_PRODUCT_NAME_MAX_LENGTH,
    ),
    rationale: normalizeOptionalText(input.rationale, SWIPE_RATIONALE_MAX_LENGTH),
    socialCaption: normalizeOptionalText(
      input.socialCaption,
      SWIPE_SOCIAL_CAPTION_MAX_LENGTH,
    ),
  };
}
