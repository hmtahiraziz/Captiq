import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit, { MemoryStore } from 'express-rate-limit';
import { env } from './config/env.js';
import { mountApiDocs } from './docs/swagger.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { PostgresRateLimitStore } from './middleware/postgres-rate-limit-store.js';
import { logger } from './utils/logger.js';

const app = express();

app.set('trust proxy', 1);

app.use(
  helmet({
    hsts:
      env.NODE_ENV === 'production'
        ? { maxAge: 15552000, includeSubDomains: true, preload: false }
        : false,
    contentSecurityPolicy: false,
  }),
);

if (env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    const proto = req.header('x-forwarded-proto');
    if (proto && proto !== 'https') {
      res.redirect(301, `https://${req.header('host')}${req.originalUrl}`);
      return;
    }
    next();
  });
}

app.use(compression());
app.use(
  cors({
    origin: env.corsOrigins,
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const rateLimitStore =
  env.NODE_ENV === 'production' ? new PostgresRateLimitStore() : new MemoryStore();

if (env.NODE_ENV === 'production') {
  logger.info('Using Postgres rate-limit store');
}

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: env.NODE_ENV === 'production' ? 200 : 1000,
    standardHeaders: true,
    legacyHeaders: false,
    store: rateLimitStore,
  }),
);

app.use('/api', routes);

mountApiDocs(app);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
