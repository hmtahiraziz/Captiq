import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../config/env.js';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

let transporter: Transporter | null = null;

function getFromAddress(): string {
  return env.EMAIL_FROM ?? env.SMTP_USER ?? 'Captiq AI <noreply@captiq.ai>';
}

function getTransporter(): Transporter {
  if (transporter) {
    return transporter;
  }

  if (!env.isSmtpConfigured || !env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    throw new AppError(503, 'Email delivery is not configured');
  }

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  return transporter;
}

function buildPasswordResetHtml(code: string): string {
  return `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1b1b26;">
      <h1 style="color: #422cd8; font-size: 24px;">Reset your password</h1>
      <p style="font-size: 16px; line-height: 24px; color: #474555;">
        We received a request to reset the password for your Captiq AI account.
        Enter this code in the app. It expires in 15 minutes.
      </p>
      <p style="margin: 32px 0; text-align: center;">
        <span style="display: inline-block; background: #f3f0ff; color: #422cd8; font-size: 32px; font-weight: 700; letter-spacing: 8px; padding: 16px 24px; border-radius: 16px;">
          ${code}
        </span>
      </p>
      <p style="font-size: 14px; line-height: 20px; color: #777587;">
        If you did not request this, you can safely ignore this email.
      </p>
    </div>
  `;
}

function buildPasswordResetText(code: string): string {
  return [
    'Reset your Captiq AI password',
    '',
    'We received a request to reset the password for your Captiq AI account.',
    `Your reset code is: ${code}`,
    '',
    'This code expires in 15 minutes.',
    'If you did not request this, you can safely ignore this email.',
  ].join('\n');
}

function friendlySmtpMessage(error: unknown): string {
  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  if (
    message.includes('invalid login') ||
    message.includes('authentication') ||
    message.includes('eauth') ||
    message.includes('username and password')
  ) {
    return 'Unable to send email. Check SMTP_USER and SMTP_PASS (use an app password for Gmail).';
  }

  if (
    message.includes('getaddrinfo') ||
    message.includes('enotfound') ||
    message.includes('econnrefused') ||
    message.includes('etimedout') ||
    message.includes('connection')
  ) {
    return 'Unable to reach the mail server. Check SMTP_HOST and SMTP_PORT.';
  }

  return 'Unable to send password reset email right now. Please try again later.';
}

export async function sendPasswordResetEmail(
  email: string,
  code: string,
): Promise<void> {
  if (!env.isSmtpConfigured) {
    if (env.NODE_ENV === 'production') {
      throw new AppError(503, 'Email delivery is not configured');
    }

    // Dev/test only: never log the reset code.
    logger.info(
      { recipientDomain: email.includes('@') ? email.split('@')[1] : 'unknown' },
      'Password reset email skipped — configure SMTP_HOST, SMTP_USER, and SMTP_PASS to send mail',
    );
    return;
  }

  const from = getFromAddress();

  try {
    const info = await getTransporter().sendMail({
      from,
      to: email,
      subject: 'Your Captiq AI reset code',
      text: buildPasswordResetText(code),
      html: buildPasswordResetHtml(code),
    });

    logger.info(
      {
        messageId: info.messageId,
        recipientDomain: email.includes('@') ? email.split('@')[1] : 'unknown',
      },
      'Password reset email sent',
    );
  } catch (error) {
    logger.error(
      {
        err: error instanceof Error ? error.message : String(error),
        from,
        smtpHost: env.SMTP_HOST,
        recipientDomain: email.includes('@') ? email.split('@')[1] : 'unknown',
      },
      'Failed to send password reset email',
    );

    throw new AppError(502, friendlySmtpMessage(error), 'EMAIL_DELIVERY_FAILED');
  }
}
