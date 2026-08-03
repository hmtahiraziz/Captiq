const MODEL_LABELS: Record<string, string> = {
  'gpt-4o-mini': 'GPT-4o Mini',
  'gpt-4o': 'GPT-4o',
  'gpt-4-vision-preview': 'GPT-4 Vision',
};

export function formatModelLabel(model: string): string {
  const normalized = model.trim().toLowerCase();

  if (MODEL_LABELS[normalized]) {
    return MODEL_LABELS[normalized];
  }

  return model
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
