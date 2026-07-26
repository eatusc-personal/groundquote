import type { DocumentChunk } from "./types";

const DEFAULT_SIZE = 900;
const DEFAULT_OVERLAP = 140;

function clean(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function splitLongSection(section: string, maxSize: number) {
  if (section.length <= maxSize) return [section];

  const sentences = section.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [section];
  const pieces: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    if (trimmed.length > maxSize) {
      if (current) {
        pieces.push(current);
        current = "";
      }
      for (let start = 0; start < trimmed.length; start += maxSize) {
        pieces.push(trimmed.slice(start, start + maxSize).trim());
      }
      continue;
    }

    const candidate = current ? `${current} ${trimmed}` : trimmed;
    if (candidate.length > maxSize && current) {
      pieces.push(current);
      current = trimmed;
    } else {
      current = candidate;
    }
  }

  if (current) pieces.push(current);
  return pieces;
}

function overlapTail(text: string, overlap: number) {
  if (text.length <= overlap) return text;
  const tail = text.slice(-overlap);
  const firstSpace = tail.indexOf(" ");
  return firstSpace >= 0 ? tail.slice(firstSpace + 1) : tail;
}

export function chunkDocument(
  input: string,
  maxSize = DEFAULT_SIZE,
  overlap = DEFAULT_OVERLAP,
): DocumentChunk[] {
  const text = clean(input);
  if (!text) return [];

  const sections = text
    .split(/\n\s*\n/)
    .flatMap((section) => splitLongSection(section.trim(), maxSize))
    .filter(Boolean);

  const chunks: string[] = [];
  let current = "";

  for (const section of sections) {
    const candidate = current ? `${current}\n\n${section}` : section;
    if (candidate.length <= maxSize) {
      current = candidate;
      continue;
    }

    if (current) chunks.push(current);
    const tail = current ? overlapTail(current, overlap) : "";
    current =
      tail && `${tail}\n\n${section}`.length <= maxSize
        ? `${tail}\n\n${section}`
        : section;
  }

  if (current) chunks.push(current);

  return chunks.map((text, index) => ({ index, text }));
}
