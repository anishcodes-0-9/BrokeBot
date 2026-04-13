const SECTION_BREAKS = [
  "about us",
  "benefits",
  "perks",
  "why join us",
  "company overview",
  "equal opportunity",
  "eeo statement",
  "diversity and inclusion",
  "privacy notice",
];

function normalizeWhitespace(value: string): string {
  return value
    .replace(/\r/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .trim();
}

export function cleanJobDescription(input: string, maxLength = 3000): string {
  let text = input
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\n{3,}/g, "\n\n");

  const lower = text.toLowerCase();
  let cutoff = text.length;

  for (const marker of SECTION_BREAKS) {
    const index = lower.indexOf(marker);
    if (index !== -1) {
      cutoff = Math.min(cutoff, index);
    }
  }

  text = text.slice(0, cutoff);
  text = normalizeWhitespace(text);

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trim()}...`;
}
