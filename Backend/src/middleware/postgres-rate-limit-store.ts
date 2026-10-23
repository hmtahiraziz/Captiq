import { sql } from 'drizzle-orm';
import type {
  ClientRateLimitInfo,
  IncrementResponse,
  Options,
  Store,
} from 'express-rate-limit';
import { db } from '../db/client.js';

/**
 * Shared rate-limit store backed by Neon/Postgres for multi-instance deploys.
 * Falls back gracefully if the table is missing (caller should use MemoryStore).
 */
export class PostgresRateLimitStore implements Store {
  prefix = 'rl:';
  windowMs = 60_000;

  init(options: Options): void {
    this.windowMs = options.windowMs;
  }

  private bucketKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async get(key: string): Promise<ClientRateLimitInfo | undefined> {
    const bucket = this.bucketKey(key);
    const result = await db.execute(sql`
      SELECT hits, reset_at FROM rate_limit_buckets WHERE key = ${bucket} LIMIT 1
    `);
    const rows = Array.isArray(result) ? result : [];
    const row = rows[0] as { hits?: number; reset_at?: string | Date } | undefined;

    if (!row?.reset_at) {
      return undefined;
    }

    const resetTime = new Date(row.reset_at);
    if (resetTime.getTime() <= Date.now()) {
      return undefined;
    }

    return {
      totalHits: Number(row.hits ?? 0),
      resetTime,
    };
  }

  async increment(key: string): Promise<IncrementResponse> {
    const bucket = this.bucketKey(key);
    const resetAt = new Date(Date.now() + this.windowMs);

    const result = await db.execute(sql`
      INSERT INTO rate_limit_buckets (key, hits, reset_at)
      VALUES (${bucket}, 1, ${resetAt.toISOString()}::timestamptz)
      ON CONFLICT (key) DO UPDATE
      SET
        hits = CASE
          WHEN rate_limit_buckets.reset_at <= NOW() THEN 1
          ELSE rate_limit_buckets.hits + 1
        END,
        reset_at = CASE
          WHEN rate_limit_buckets.reset_at <= NOW() THEN EXCLUDED.reset_at
          ELSE rate_limit_buckets.reset_at
        END
      RETURNING hits, reset_at
    `);

    const rows = Array.isArray(result) ? result : [];
    const row = rows[0] as { hits?: number; reset_at?: string | Date };

    return {
      totalHits: Number(row?.hits ?? 1),
      resetTime: row?.reset_at ? new Date(row.reset_at) : resetAt,
    };
  }

  async decrement(key: string): Promise<void> {
    const bucket = this.bucketKey(key);
    await db.execute(sql`
      UPDATE rate_limit_buckets
      SET hits = GREATEST(hits - 1, 0)
      WHERE key = ${bucket}
    `);
  }

  async resetKey(key: string): Promise<void> {
    const bucket = this.bucketKey(key);
    await db.execute(sql`DELETE FROM rate_limit_buckets WHERE key = ${bucket}`);
  }
}
