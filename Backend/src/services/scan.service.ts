import crypto from 'node:crypto';
import sharp from 'sharp';
import { and, desc, eq, lt } from 'drizzle-orm';
import { db } from '../db/client.js';
import { messages, scans, users } from '../db/schema.js';
import {
  deleteScanImage,
  getSignedImageUrl,
  getThumbnailUrl,
  uploadScanImage,
} from './cloudinary.service.js';
import { answerAboutImage, defaultVisionModel, generateCaption } from './openai.service.js';
import {
  assertMessageQuotaAvailable,
  assertScanQuotaAvailable,
  consumeMessageQuota,
  consumeScanQuota,
} from './quota.service.js';
import { ForbiddenError, NotFoundError, ValidationError } from '../utils/errors.js';
import { assertValidImageBuffer, MAX_INPUT_PIXELS } from '../utils/image.js';
import { CURRENT_CONSENT_VERSION } from '../constants/consent.js';
import type { ListScansQuery } from '../schemas/scan.schema.js';

async function assertAiConsent(userId: string): Promise<void> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { consentVersion: true },
  });

  if (!user || user.consentVersion !== CURRENT_CONSENT_VERSION) {
    throw new ForbiddenError(
      'Please accept the AI processing consent before scanning.',
    );
  }
}

const MAX_IMAGE_DIMENSION = 1024;

function isPixelLimitError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  const message = error.message.toLowerCase();
  return (
    message.includes('pixel limit') ||
    message.includes('input image exceeds') ||
    message.includes('limitinputpixels')
  );
}

export async function resizeImage(buffer: Buffer): Promise<Buffer> {
  try {
    return await sharp(buffer, { limitInputPixels: MAX_INPUT_PIXELS })
      .rotate()
      .resize({
        width: MAX_IMAGE_DIMENSION,
        height: MAX_IMAGE_DIMENSION,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toBuffer();
  } catch (error) {
    if (isPixelLimitError(error)) {
      throw new ValidationError(
        'This photo is too large to process. Try a smaller image or capture again at a lower resolution.',
      );
    }
    throw error;
  }
}

export interface ScanResponse {
  id: string;
  caption: string;
  imageUrl: string;
  thumbnailUrl: string;
  model: string;
  createdAt: Date;
}

function toScanResponse(scan: typeof scans.$inferSelect): ScanResponse {
  return {
    id: scan.id,
    caption: scan.caption,
    imageUrl: getSignedImageUrl(scan.cloudinaryPublicId),
    thumbnailUrl: getThumbnailUrl(scan.cloudinaryPublicId),
    model: scan.model,
    createdAt: scan.createdAt,
  };
}

export async function createScan(userId: string, imageBuffer: Buffer): Promise<ScanResponse> {
  assertValidImageBuffer(imageBuffer);
  await assertAiConsent(userId);
  await assertScanQuotaAvailable(userId);

  const scanId = crypto.randomUUID();
  const resized = await resizeImage(imageBuffer);
  const { publicId } = await uploadScanImage(resized, userId, scanId);

  let caption: string;

  try {
    const signedForAi = getSignedImageUrl(publicId, 10 * 60);
    caption = await generateCaption(signedForAi);
  } catch (error) {
    await deleteScanImage(publicId).catch(() => undefined);
    throw error;
  }

  try {
    const [scan] = await db
      .insert(scans)
      .values({
        id: scanId,
        userId,
        imageUrl: publicId,
        cloudinaryPublicId: publicId,
        caption,
        model: defaultVisionModel,
      })
      .returning();

    if (!scan) {
      await deleteScanImage(publicId).catch(() => undefined);
      throw new Error('Failed to save scan');
    }

    await consumeScanQuota(userId);
    return toScanResponse(scan);
  } catch (error) {
    await deleteScanImage(publicId).catch(() => undefined);
    throw error;
  }
}

export async function getScanById(userId: string, scanId: string): Promise<ScanResponse> {
  const scan = await db.query.scans.findFirst({
    where: and(eq(scans.id, scanId), eq(scans.userId, userId)),
  });

  if (!scan) {
    throw new NotFoundError('Scan not found');
  }

  return toScanResponse(scan);
}

export async function listScans(userId: string, query: ListScansQuery) {
  const conditions = [eq(scans.userId, userId)];

  if (query.cursor) {
    const cursorScan = await db.query.scans.findFirst({
      where: and(eq(scans.id, query.cursor), eq(scans.userId, userId)),
      columns: { createdAt: true },
    });

    if (cursorScan) {
      conditions.push(lt(scans.createdAt, cursorScan.createdAt));
    }
  }

  const rows = await db.query.scans.findMany({
    where: and(...conditions),
    orderBy: [desc(scans.createdAt)],
    limit: query.limit + 1,
  });

  const hasMore = rows.length > query.limit;
  const items = hasMore ? rows.slice(0, query.limit) : rows;
  const nextCursor = hasMore ? items[items.length - 1]?.id ?? null : null;

  return {
    items: items.map(toScanResponse),
    nextCursor,
    hasMore,
  };
}

export async function deleteScan(userId: string, scanId: string): Promise<void> {
  const scan = await db.query.scans.findFirst({
    where: and(eq(scans.id, scanId), eq(scans.userId, userId)),
  });

  if (!scan) {
    throw new NotFoundError('Scan not found');
  }

  await deleteScanImage(scan.cloudinaryPublicId).catch(() => undefined);
  await db.delete(scans).where(and(eq(scans.id, scanId), eq(scans.userId, userId)));
}

export async function getScanMessages(userId: string, scanId: string) {
  const scan = await db.query.scans.findFirst({
    where: and(eq(scans.id, scanId), eq(scans.userId, userId)),
  });

  if (!scan) {
    throw new NotFoundError('Scan not found');
  }

  return db.query.messages.findMany({
    where: eq(messages.scanId, scanId),
    orderBy: [messages.createdAt],
    columns: { id: true, role: true, content: true, createdAt: true },
  });
}

export async function sendScanMessage(userId: string, scanId: string, content: string) {
  await assertAiConsent(userId);
  await assertMessageQuotaAvailable(userId);

  const scan = await db.query.scans.findFirst({
    where: and(eq(scans.id, scanId), eq(scans.userId, userId)),
  });

  if (!scan) {
    throw new NotFoundError('Scan not found');
  }

  const history = await db.query.messages.findMany({
    where: eq(messages.scanId, scanId),
    orderBy: [messages.createdAt],
    columns: { role: true, content: true },
  });

  const recentHistory = history.slice(-10).map((msg) => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
  }));

  const [userMessage] = await db
    .insert(messages)
    .values({
      scanId,
      role: 'user',
      content,
    })
    .returning({
      id: messages.id,
      role: messages.role,
      content: messages.content,
      createdAt: messages.createdAt,
    });

  if (!userMessage) {
    throw new Error('Failed to save user message');
  }

  try {
    const signedForAi = getSignedImageUrl(scan.cloudinaryPublicId, 10 * 60);
    const assistantContent = await answerAboutImage(signedForAi, recentHistory, content);

    const [assistantMessage] = await db
      .insert(messages)
      .values({
        scanId,
        role: 'assistant',
        content: assistantContent,
      })
      .returning({
        id: messages.id,
        role: messages.role,
        content: messages.content,
        createdAt: messages.createdAt,
      });

    if (!assistantMessage) {
      throw new Error('Failed to save assistant message');
    }

    await consumeMessageQuota(userId);
    return { userMessage, assistantMessage };
  } catch (error) {
    await db.delete(messages).where(eq(messages.id, userMessage.id)).catch(() => undefined);
    throw error;
  }
}
