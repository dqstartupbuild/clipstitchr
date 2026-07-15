const generatedTextAiSlopPatterns = [
  /\bgame[ -]?changer\b/i,
  /\b(?:unlock|unlocks|unlocking|unlocked) (?:growth|potential|possibilities|the power|your)\b/i,
  /\blevel up\b/i,
  /\bwork smarter\b/i,
  /\bseamless(?:ly)?\b/i,
  /\brevolutionary\b/i,
  /\bcutting-edge\b/i,
  /\bsupercharge\b/i,
  /\b(?:delve|delves|delved|delving|dive|dives|dived|diving) into\b/i,
  /\bever-evolving\b/i,
  /\bin today(?:'|\u2019)?s (?:fast-paced |digital )?(?:world|landscape)\b/i,
  /\bwhether you(?:'|\u2019)?re\b/i,
  /\bmore than just\b/i,
  /\bnot just\b[^.!?]{0,100}\b(?:it(?:'|\u2019)?s|but)\b/i,
  /\bhere(?:'|\u2019)?s the thing\b/i,
  /\bpowerful solution\b/i,
  /\btransform your\b/i,
];

export function getGeneratedTextHasAiSlop(text: string) {
  return generatedTextAiSlopPatterns.some((pattern) => pattern.test(text));
}
