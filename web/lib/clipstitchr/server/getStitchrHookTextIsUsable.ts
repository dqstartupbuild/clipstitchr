const explanationDependencyPattern =
  /\b(this is why|here'?s why|let me explain|before I explain|what nobody tells|the reason|here'?s how|let me show you)\b/i;
const marketingVoicePattern =
  /\b(built for|designed for|helps you|the (easier|smarter|better) way|all-in-one|complete solution|finally comes with|everything you need)\b/i;
const emptyCuriosityPattern =
  /^(wait for it|you need to see this|this changes everything|watch this|the visible change)[.!]?$/i;
const vagueOpeningPattern = /^(this|that|it)\b/i;
const creatorPerspectivePattern =
  /\b(i|i'm|i've|i'd|me|my|mine|pov|wait|okay|apparently|somehow|turns out|you'?re telling me|not me|why did nobody|tell me why|the way|so|in fact)\b/i;

export function getStitchrHookTextIsUsable(text: string) {
  const normalizedText = text.trim();
  const wordCount = normalizedText.split(/\s+/).filter(Boolean).length;

  return (
    wordCount >= 3 &&
    wordCount <= 14 &&
    creatorPerspectivePattern.test(normalizedText) &&
    !explanationDependencyPattern.test(normalizedText) &&
    !marketingVoicePattern.test(normalizedText) &&
    !emptyCuriosityPattern.test(normalizedText) &&
    !vagueOpeningPattern.test(normalizedText)
  );
}
