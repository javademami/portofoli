// Helpers shared by the blog API routes.

export function cleanText(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// Uses the given slug when present, otherwise the title. Falls back to a random slug
// when the title has no ASCII letters (for example a Persian-only title).
export function makeSlug(title: string, given?: unknown): string {
  const base = typeof given === "string" && given.trim() ? slugify(given) : slugify(title);
  return base || `post-${Date.now().toString(36)}`;
}
