export type FaqItem = { question: string; answer: string };

function parseArray(value: unknown): unknown[] {
  let arr: unknown = value;
  if (typeof value === "string") {
    try {
      arr = JSON.parse(value);
    } catch {
      return [];
    }
  }
  return Array.isArray(arr) ? arr : [];
}

export function toGallery(value: unknown): string[] {
  return parseArray(value)
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter((v) => /^https?:\/\//.test(v))
    .slice(0, 20);
}

export function toFaq(value: unknown): FaqItem[] {
  return parseArray(value)
    .map((v) => {
      const o = (v ?? {}) as Record<string, unknown>;
      return {
        question: typeof o.question === "string" ? o.question.trim().slice(0, 300) : "",
        answer: typeof o.answer === "string" ? o.answer.trim().slice(0, 2000) : "",
      };
    })
    .filter((f) => f.question && f.answer)
    .slice(0, 30);
}