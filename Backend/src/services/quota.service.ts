import { sql } from 'drizzle-orm';
import { db } from '../db/client.js';
import { env } from '../config/env.js';
import { TooManyRequestsError } from '../utils/errors.js';

function utcDateString(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export type QuotaUsage = {
  usageDate: string;
  scansUsed: number;
  scansLimit: number;
  scansRemaining: number;
  messagesUsed: number;
  messagesLimit: number;
  messagesRemaining: number;
};

function asCount(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function pickField(row: Record<string, unknown> | undefined, ...keys: string[]): unknown {
  if (!row) {
    return undefined;
  }

  for (const key of keys) {
    if (key in row) {
      return row[key];
    }
  }

  const lowerMap = Object.fromEntries(
    Object.entries(row).map(([k, v]) => [k.toLowerCase(), v]),
  );

  for (const key of keys) {
    const found = lowerMap[key.toLowerCase()];
    if (found !== undefined) {
      return found;
    }
  }

  return undefined;
}

function rowsFromExecute(result: unknown): Record<string, unknown>[] {
  if (Array.isArray(result)) {
    return result as Record<string, unknown>[];
  }

  if (result && typeof result === 'object' && 'rows' in result) {
    const rows = (result as { rows: unknown }).rows;
    return Array.isArray(rows) ? (rows as Record<string, unknown>[]) : [];
  }

  return [];
}

async function countTodayScans(userId: string, usageDate: string): Promise<number> {
  const result = await db.execute(sql`
    SELECT COUNT(*)::int AS count
    FROM scans
    WHERE user_id = ${userId}::uuid
      AND (created_at AT TIME ZONE 'UTC')::date = ${usageDate}::date
  `);

  return asCount(pickField(rowsFromExecute(result)[0], 'count', 'COUNT'));
}

async function countTodayFollowUps(userId: string, usageDate: string): Promise<number> {
  const result = await db.execute(sql`
    SELECT COUNT(*)::int AS count
    FROM messages m
    INNER JOIN scans s ON s.id = m.scan_id
    WHERE s.user_id = ${userId}::uuid
      AND m.role = 'user'
      AND (m.created_at AT TIME ZONE 'UTC')::date = ${usageDate}::date
  `);

  return asCount(pickField(rowsFromExecute(result)[0], 'count', 'COUNT'));
}

async function syncDailyUsage(
  userId: string,
  usageDate: string,
  scansUsed: number,
  messagesUsed: number,
): Promise<void> {
  await db.execute(sql`
    INSERT INTO ai_usage_daily (user_id, usage_date, scan_count, message_count)
    VALUES (${userId}::uuid, ${usageDate}::date, ${scansUsed}, ${messagesUsed})
    ON CONFLICT (user_id, usage_date)
    DO UPDATE SET
      scan_count = EXCLUDED.scan_count,
      message_count = EXCLUDED.message_count
  `);
}

export async function getQuotaUsage(userId: string): Promise<QuotaUsage> {
  const usageDate = utcDateString();
  const scansLimit = env.OPENAI_DAILY_SCAN_CAP;
  const messagesLimit = env.OPENAI_DAILY_MESSAGE_CAP;

  const [scansUsed, messagesUsed] = await Promise.all([
    countTodayScans(userId, usageDate),
    countTodayFollowUps(userId, usageDate),
  ]);

  await syncDailyUsage(userId, usageDate, scansUsed, messagesUsed);

  return {
    usageDate,
    scansUsed,
    scansLimit,
    scansRemaining: Math.max(0, scansLimit - scansUsed),
    messagesUsed,
    messagesLimit,
    messagesRemaining: Math.max(0, messagesLimit - messagesUsed),
  };
}

/** Ensure a new scan is allowed based on today's successful scans. */
export async function assertScanQuotaAvailable(userId: string): Promise<void> {
  const usageDate = utcDateString();
  const cap = env.OPENAI_DAILY_SCAN_CAP;
  const used = await countTodayScans(userId, usageDate);

  if (used >= cap) {
    throw new TooManyRequestsError(
      `Daily scan limit of ${cap} reached. Try again tomorrow.`,
      'SCAN_QUOTA_EXCEEDED',
    );
  }
}

/** Sync counters after a scan was saved successfully. */
export async function consumeScanQuota(userId: string): Promise<void> {
  const usageDate = utcDateString();
  const cap = env.OPENAI_DAILY_SCAN_CAP;
  const scansUsed = await countTodayScans(userId, usageDate);
  const messagesUsed = await countTodayFollowUps(userId, usageDate);

  if (scansUsed > cap) {
    throw new TooManyRequestsError(
      `Daily scan limit of ${cap} reached. Try again tomorrow.`,
      'SCAN_QUOTA_EXCEEDED',
    );
  }

  await syncDailyUsage(userId, usageDate, scansUsed, messagesUsed);
}

/** Ensure a new follow-up is allowed based on today's successful user messages. */
export async function assertMessageQuotaAvailable(userId: string): Promise<void> {
  const usageDate = utcDateString();
  const cap = env.OPENAI_DAILY_MESSAGE_CAP;
  const used = await countTodayFollowUps(userId, usageDate);

  if (used >= cap) {
    throw new TooManyRequestsError(
      `Daily message limit of ${cap} reached. Try again tomorrow.`,
      'MESSAGE_QUOTA_EXCEEDED',
    );
  }
}

/** Sync counters after a follow-up reply was saved successfully. */
export async function consumeMessageQuota(userId: string): Promise<void> {
  const usageDate = utcDateString();
  const cap = env.OPENAI_DAILY_MESSAGE_CAP;
  const scansUsed = await countTodayScans(userId, usageDate);
  const messagesUsed = await countTodayFollowUps(userId, usageDate);

  if (messagesUsed > cap) {
    throw new TooManyRequestsError(
      `Daily message limit of ${cap} reached. Try again tomorrow.`,
      'MESSAGE_QUOTA_EXCEEDED',
    );
  }

  await syncDailyUsage(userId, usageDate, scansUsed, messagesUsed);
}
