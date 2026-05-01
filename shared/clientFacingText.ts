export function polishClientFacingText(value: string | null | undefined) {
  return (value ?? "")
    .replace(/PARSER REVIEW REQUIRED/gi, "Planning confidence note")
    .replace(/\bNeeds Review\b/gi, "Planning Review")
    .replace(
      /This indicates input ambiguity, not a software failure\.?/gi,
      "This indicates areas where a project team should confirm field conditions before final pricing or construction decisions."
    )
    .replace(/not a software failure/gi, "a field-verification item");
}
