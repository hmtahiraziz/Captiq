import crypto from 'node:crypto';
import sharp from 'sharp';
import { and, desc, eq, lt } from 'drizzle-orm';
import { db } from '../db/client.js';
import { messages, scans } from '../db/schema.js';
import { deleteScanImage, getThumbnailUrl, uploadScanImage } from './cloudinary.service.js';
import { answerAboutImage, defaultVisionModel, generateCaption } from './openai.service.js';
import { NotFoundError } from '../utils/errors.js';
import type { ListScansQuery } from '../schemas/scan.schema.js';

const MAX_IMAGE_DIMENSION = 1024;

export async function resizeImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .rotate()
    .resize({
      width: MAX_IMAGE_DIMENSION,
      height: MAX_IMAGE_DIMENSION,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: 85 })
    .toBuffer();
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
    imageUrl: scan.imageUrl,
    thumbnailUrl: getThumbnailUrl(scan.cloudinaryPublicId),
    model: scan.model,
    createdAt: scan.createdAt,
  };
}

export async function createScan(userId: string, imageBuffer: Buffer): Promise<ScanResponse> {
  const scanId = crypto.randomUUID();
  const resized = await resizeImage(imageBuffer);
  const { secureUrl, publicId } = await uploadScanImage(resized, userId, scanId);
  const caption = await generateCaption(secureUrl);

  const [scan] = await db
    .insert(scans)
    .values({
      id: scanId,
      userId,
      imageUrl: secureUrl,
      cloudinaryPublicId: publicId,
      caption,
      model: defaultVisionModel,
    })
    .returning();

  if (!scan) {
    await deleteScanImage(publicId).catch(() => undefined);
    throw new Error('Failed to save scan');
  }

  return toScanResponse(scan);
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
      where: eq(scans.id, query.cursor),
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

  await db.delete(scans).where(eq(scans.id, scanId));
  await deleteScanImage(scan.cloudinaryPublicId).catch(() => undefined);
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

  const assistantContent = await answerAboutImage(scan.imageUrl, recentHistory, content);

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

  return { userMessage, assistantMessage };
}
