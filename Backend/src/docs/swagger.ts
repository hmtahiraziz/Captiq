import { timingSafeEqual } from 'node:crypto';
import type { Express, NextFunction, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { env } from '../config/env.js';
import { openApiDocument } from './openapi.js';

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}

/**
 * HTTP Basic Auth gate for interactive docs and the raw OpenAPI document.
 */
function docsBasicAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header?.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Captiq API Docs", charset="UTF-8"');
    res.status(401).json({
      success: false,
      error: { message: 'Authentication required' },
    });
    return;
  }

  let decoded: string;
  try {
    decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
  } catch {
    res.setHeader('WWW-Authenticate', 'Basic realm="Captiq API Docs", charset="UTF-8"');
    res.status(401).json({
      success: false,
      error: { message: 'Invalid authorization header' },
    });
    return;
  }

  const separator = decoded.indexOf(':');
  const username = separator === -1 ? decoded : decoded.slice(0, separator);
  const password = separator === -1 ? '' : decoded.slice(separator + 1);

  const userOk = safeEqual(username, env.SWAGGER_USER);
  const passOk = safeEqual(password, env.SWAGGER_PASSWORD);

  if (!userOk || !passOk) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Captiq API Docs", charset="UTF-8"');
    res.status(401).json({
      success: false,
      error: { message: 'Invalid username or password' },
    });
    return;
  }

  next();
}

/**
 * Mounts interactive Swagger UI at `/api/docs` and the raw OpenAPI document at `/api/docs.json`.
 * Both require HTTP Basic Auth (`SWAGGER_USER` / `SWAGGER_PASSWORD`).
 */
export function mountApiDocs(app: Express): void {
  const document = openApiDocument as unknown as swaggerUi.JsonObject;

  app.get('/api/docs.json', docsBasicAuth, (_req, res) => {
    res.json(document);
  });

  app.use(
    '/api/docs',
    docsBasicAuth,
    swaggerUi.serve,
    swaggerUi.setup(document, {
      customSiteTitle: 'Captiq AI API Docs',
      customCss: '.swagger-ui .topbar { display: none }',
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        tryItOutEnabled: true,
        docExpansion: 'list',
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    }),
  );
}
