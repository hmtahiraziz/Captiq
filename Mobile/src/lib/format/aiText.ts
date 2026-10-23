/**
 * Normalizes AI-generated text for plain mobile display
 * (strips markdown symbols that render literally in React Native Text).
 */
export function formatAiText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '• ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Short title from the first sentence / line of a caption. */
export function captionTitle(text: string, maxLength = 52): string {
  const formatted = formatAiText(text);

  if (!formatted) {
    return 'Untitled scan';
  }

  const first =
    formatted.split(/[.!?\n]/).map((part) => part.trim()).find(Boolean) ?? formatted;

  if (first.length <= maxLength) {
    return first;
  }

  return `${first.slice(0, maxLength - 1).trimEnd()}…`;
}

export function splitAiParagraphs(text: string): string[] {
  const formatted = formatAiText(text);

  if (!formatted) {
    return [];
  }

  return formatted
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}
