import 'dotenv/config';
import app from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

const SHUTDOWN_TIMEOUT_MS = 15_000;

const server = app.listen(env.PORT, () => {
  logger.info(`Server running on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
});

function shutdown(signal: string) {
  logger.info(`${signal} received — shutting down`);

  const forceTimer = setTimeout(() => {
    logger.error('Shutdown timed out — forcing exit');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);
  forceTimer.unref();

  server.close((err) => {
    clearTimeout(forceTimer);
    if (err) {
      logger.error({ err }, 'Error during HTTP shutdown');
      process.exit(1);
    }
    logger.info('HTTP server closed');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
