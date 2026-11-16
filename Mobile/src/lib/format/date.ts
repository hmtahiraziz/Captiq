function sameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatClock(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Absolute date + time (settings, older detail views). */
export function formatScanDate(iso: string): string {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Compact relative label for history cards: Today · 2:14 PM, Yesterday, Mon, etc. */
export function formatRelativeScanDate(iso: string): string {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const now = new Date();
  const time = formatClock(date);

  if (sameCalendarDay(date, now)) {
    return `Today · ${time}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (sameCalendarDay(date, yesterday)) {
    return `Yesterday · ${time}`;
  }

  const daysAgo = Math.floor((now.getTime() - date.getTime()) / (24 * 60 * 60 * 1000));

  if (daysAgo >= 0 && daysAgo < 7) {
    const weekday = date.toLocaleDateString(undefined, { weekday: 'short' });
    return `${weekday} · ${time}`;
  }

  const sameYear = date.getFullYear() === now.getFullYear();

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' as const }),
  });
}

export function isScanFromToday(iso: string): boolean {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return sameCalendarDay(date, new Date());
}

export function formatMemberSince(iso: string): string {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return 'Recently joined';
  }

  return date.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
}
