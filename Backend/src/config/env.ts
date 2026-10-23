import 'dotenv/config';
import { z } from 'zod';

const optionalNonEmpty = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().min(1).optional(),
);

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(3001),
    DATABASE_URL: z.string().min(1).startsWith('postgresql'),
    JWT_ACCESS_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    OPENAI_API_KEY: z.string().min(1),
    CLOUDINARY_CLOUD_NAME: z.string().min(1),
    CLOUDINARY_API_KEY: z.string().min(1),
    CLOUDINARY_API_SECRET: z.string().min(1),
    /** Comma-separated origins. `*` allowed only outside production. */
    CORS_ORIGIN: z.string().default('*'),
    RESEND_API_KEY: optionalNonEmpty,
    EMAIL_FROM: optionalNonEmpty,
    /** Max AI scan captions per user per UTC day */
    OPENAI_DAILY_SCAN_CAP: z.coerce.number().int().min(1).max(1000).default(20),
    /** Max follow-up AI messages per user per UTC day */
    OPENAI_DAILY_MESSAGE_CAP: z.coerce.number().int().min(1).max(5000).default(50),
    /** OpenAI HTTP timeout in ms */
    OPENAI_TIMEOUT_MS: z.coerce.number().int().min(5000).max(120000).default(45000),
    /** HTTP Basic Auth for Swagger UI (/api/docs) and OpenAPI JSON */
    SWAGGER_USER: z.string().min(1).default('admin'),
    SWAGGER_PASSWORD: z.string().min(1).default('admin'),
  })
  .superRefine((data, ctx) => {
    const isProd = data.NODE_ENV === 'production';

    if (isProd) {
      if (data.SWAGGER_PASSWORD === 'admin' || data.SWAGGER_USER === 'admin') {
        ctx.addIssue({
          code: 'custom',
          path: ['SWAGGER_PASSWORD'],
          message:
            'Set non-default SWAGGER_USER and SWAGGER_PASSWORD in production (not "admin")',
        });
      }

      if (data.CORS_ORIGIN.trim() === '*' || data.CORS_ORIGIN.trim() === '') {
        ctx.addIssue({
          code: 'custom',
          path: ['CORS_ORIGIN'],
          message: 'CORS_ORIGIN must be an explicit allow-list in production (not *)',
        });
      }

      if (!data.RESEND_API_KEY) {
        ctx.addIssue({
          code: 'custom',
          path: ['RESEND_API_KEY'],
          message: 'RESEND_API_KEY is required in production',
        });
      }

      if (!data.EMAIL_FROM) {
        ctx.addIssue({
          code: 'custom',
          path: ['EMAIL_FROM'],
          message: 'EMAIL_FROM is required in production',
        });
      }

      const dbUrl = data.DATABASE_URL.toLowerCase();
      if (!dbUrl.includes('sslmode=require') && !dbUrl.includes('sslmode=verify-full')) {
        ctx.addIssue({
          code: 'custom',
          path: ['DATABASE_URL'],
          message: 'DATABASE_URL must include sslmode=require (or verify-full) in production',
        });
      }
    }
  });

export type Env = z.infer<typeof envSchema> & {
  corsOrigins: string[] | true;
};

function parseCorsOrigins(raw: string, nodeEnv: Env['NODE_ENV']): string[] | true {
  const trimmed = raw.trim();

  if (trimmed === '*') {
    if (nodeEnv === 'production') {
      throw new Error('CORS_ORIGIN=* is not allowed in production');
    }
    return true;
  }

  const origins = trimmed
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.length === 0) {
    throw new Error('CORS_ORIGIN must list at least one origin');
  }

  return origins;
}

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Environment validation failed');
  }

  const data = parsed.data;

  return {
    ...data,
    corsOrigins: parseCorsOrigins(data.CORS_ORIGIN, data.NODE_ENV),
  };
}

export const env = loadEnv();
