import { describe, expect, it } from "vitest";
import { cleanJobDescription } from "../lib/jd-cleaner.js";

describe("job description cleaner", () => {
  it("strips html and boilerplate markers", () => {
    const cleaned = cleanJobDescription(`
      <div>We are hiring a frontend engineer.</div>
      <p>Must know React and TypeScript.</p>
      <section>Benefits: great snacks and insurance.</section>
    `);

    expect(cleaned).toContain("We are hiring a frontend engineer.");
    expect(cleaned).toContain("Must know React and TypeScript.");
    expect(cleaned).not.toContain("<div>");
    expect(cleaned.toLowerCase()).not.toContain("benefits");
  });

  it("truncates long descriptions", () => {
    const longText = "a".repeat(5000);
    const cleaned = cleanJobDescription(longText, 1000);

    expect(cleaned.length).toBeLessThanOrEqual(1003);
    expect(cleaned.endsWith("...")).toBe(true);
  });
});
