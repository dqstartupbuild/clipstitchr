const poseKeywordPattern =
  /\b(?:action|activity|arms? (?:at|by|crossed|relaxed)|body position|crossed arms|crouching|facing|gesture|gesturing|hands? (?:at|clasped|holding|near|on|raised)|head tilted|holding|kneeling|leaning|looking (?:at|off|toward)|pose|posing|posture|running|shoulders? angled|sitting|stance|standing|tilted|turned|walking)\b/i;
const poseStartPattern =
  /^(?:(?:and|with)\s+)?(?:a\s+)?(?:relaxed\s+)?(?:action|activity|arms?\b|body position|crossed arms|crouching|facing|gesture|gesturing|hands?\b|head tilted|holding|kneeling|leaning|looking\b|pose|posing|posture|running|shoulders?\b|sitting|stance|standing|tilted|turned|walking)\b/i;

function cleanDescriptionClause(clause: string) {
  return clause.trim().replace(/\s+/g, " ");
}

function cleanPoseClause(clause: string) {
  return cleanDescriptionClause(clause).replace(/^(?:and|with)\s+/i, "");
}

function removeTerminalPosePhrase(clause: string) {
  const terminalPoseMatch = clause.match(
    /^(.+?)\s+(?:and|with)\s+((?:a\s+)?(?:action|activity|arms?\b|body position|crossed arms|crouching|facing|gesture|gesturing|hands?\b|head tilted|holding|kneeling|leaning|looking\b|pose|posing|posture|running|shoulders?\b|sitting|stance|standing|tilted|turned|walking)\b.+)$/i,
  );

  if (!terminalPoseMatch) {
    return {
      identityClause: clause,
    };
  }

  const poseClause = terminalPoseMatch[2]?.trim() ?? "";

  if (!poseKeywordPattern.test(poseClause)) {
    return {
      identityClause: clause,
    };
  }

  return {
    identityClause: terminalPoseMatch[1]?.trim() ?? "",
    poseClause,
  };
}

export function splitAvatarDescriptionPoseDetails(description: string) {
  const clauses = description
    .trim()
    .split(/\s*(?:,|;|\n)+\s*/)
    .map(cleanDescriptionClause)
    .filter(Boolean);
  const identityClauses: string[] = [];
  const poseClauses: string[] = [];

  for (const clause of clauses) {
    if (poseStartPattern.test(clause)) {
      poseClauses.push(cleanPoseClause(clause));
      continue;
    }

    const { identityClause, poseClause } = removeTerminalPosePhrase(clause);

    if (poseClause) {
      poseClauses.push(cleanPoseClause(poseClause));
    }

    if (poseKeywordPattern.test(identityClause)) {
      poseClauses.push(cleanPoseClause(identityClause));
      continue;
    }

    identityClauses.push(identityClause);
  }

  return {
    avatarDescription: identityClauses.join(", "),
    poseDescription: poseClauses.join(", "),
  };
}
