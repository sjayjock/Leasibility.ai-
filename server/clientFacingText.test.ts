import { describe, expect, it } from "vitest";
import { polishClientFacingText } from "../shared/clientFacingText";

describe("polishClientFacingText", () => {
  it("removes alarming parser and software-failure phrasing from report copy", () => {
    const raw = "PARSER REVIEW REQUIRED: Needs Review. This indicates input ambiguity, not a software failure.";

    const polished = polishClientFacingText(raw);

    expect(polished).toContain("Planning confidence note");
    expect(polished).toContain("Planning Review");
    expect(polished).toContain("confirm field conditions");
    expect(polished).not.toMatch(/PARSER REVIEW REQUIRED/i);
    expect(polished).not.toMatch(/\bNeeds Review\b/i);
    expect(polished).not.toMatch(/software failure/i);
  });

  it("returns an empty string for absent optional report fields", () => {
    expect(polishClientFacingText(null)).toBe("");
    expect(polishClientFacingText(undefined)).toBe("");
  });
});
