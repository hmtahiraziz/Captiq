import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  index,
  integer,
  date,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  consentVersion: varchar('consent_version', { length: 32 }),
  consentedAt: timestamp('consented_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: varchar('token_hash', { length: 64 }).notNull().unique(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('refresh_tokens_user_id_idx').on(table.userId)],
);

export const passwordResetTokens = pgTable(
  'password_reset_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: varchar('token_hash', { length: 64 }).notNull().unique(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    usedAt: timestamp('used_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('password_reset_tokens_user_id_idx').on(table.userId),
    index('password_reset_tokens_expires_at_idx').on(table.expiresAt),
  ],
);

export const scans = pgTable(
  'scans',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    imageUrl: text('image_url').notNull(),
    cloudinaryPublicId: varchar('cloudinary_public_id', { length: 512 }).notNull(),
    caption: text('caption').notNull(),
    model: varchar('model', { length: 64 }).notNull().default('gpt-4o-mini'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('scans_user_id_created_at_idx').on(table.userId, table.createdAt)],
);

export const messages = pgTable(
  'messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    scanId: uuid('scan_id')
      .notNull()
      .references(() => scans.id, { onDelete: 'cascade' }),
    role: varchar('role', { length: 16 }).notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('messages_scan_id_created_at_idx').on(table.scanId, table.createdAt)],
);

/** Per-user daily AI usage counters (UTC date). */
export const aiUsageDaily = pgTable(
  'ai_usage_daily',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    usageDate: date('usage_date').notNull(),
    scanCount: integer('scan_count').notNull().default(0),
    messageCount: integer('message_count').notNull().default(0),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.usageDate] }),
    index('ai_usage_daily_user_id_idx').on(table.userId),
  ],
);

export type User = typeof users.$inferSelect;
export type Scan = typeof scans.$inferSelect;
export type Message = typeof messages.$inferSelect;

export const usersRelations = relations(users, ({ many }) => ({
  refreshTokens: many(refreshTokens),
  passwordResetTokens: many(passwordResetTokens),
  scans: many(scans),
  aiUsageDaily: many(aiUsageDaily),
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id],
  }),
}));

export const scansRelations = relations(scans, ({ one, many }) => ({
  user: one(users, {
    fields: [scans.userId],
    references: [users.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  scan: one(scans, {
    fields: [messages.scanId],
    references: [scans.id],
  }),
}));

export const aiUsageDailyRelations = relations(aiUsageDaily, ({ one }) => ({
  user: one(users, {
    fields: [aiUsageDaily.userId],
    references: [users.id],
  }),
}));

/** Shared rate-limit buckets for multi-instance deployments. */
export const rateLimitBuckets = pgTable(
  'rate_limit_buckets',
  {
    key: varchar('key', { length: 255 }).primaryKey(),
    hits: integer('hits').notNull().default(0),
    resetAt: timestamp('reset_at', { withTimezone: true }).notNull(),
  },
  (table) => [index('rate_limit_buckets_reset_at_idx').on(table.resetAt)],
);
