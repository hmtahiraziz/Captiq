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
